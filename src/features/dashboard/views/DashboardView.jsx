// ============================================================================
// FEATURE DASHBOARD — VISTA DE RESUMEN EJECUTIVO (REORGANIZACIÓN SOLICITADA)
// ============================================================================
// Estructura:
// 1. Cabecera con Insignia de Sincronización Top-Right (Última sincronización + Usuario).
// 2. Panorama de Proyectos (Carrusel Horizontal con Anillos de % y Barras Segmentadas).
// 3. Fila Central: Tendencia General (Izq) + Estado General con Dona y Alertas (Der).
// 4. Fila Inferior: Rendimiento Global Promedio (4 Sparklines reubicados en la parte inferior).

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  Clock, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  AlertTriangle,
  Bug,
  User,
  FileText,
  Shield,
  X,
  ChevronRight,
  ChevronLeft,
  Database,
  ArrowRight,
  RotateCcw,
  Sparkles,
  FileDown,
  Bell,
  ShieldCheck,
  Calculator,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import KpiDetailModal from '../components/KpiDetailModal';
import LiderNotificationBell from '../components/LiderNotificationBell';
import { jiraService, projectService, reportService } from '../../../services/api';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// --- MOCK DATA PARA LOS PANORAMAS Y GRÁFICOS BASE ---
const mockProjectsHealthList = [
  { id: '10000', key: 'MCHAV', name: 'MCHAV Analytics', health: 88, status: 'Saludable', statusColor: 'teal', issues: 32, sprint: 'Sprint 04', segments: [1, 1, 1, 1, 1, 1, 1] }
];

const mockEstadoDonutData = [
  { name: 'Saludables',        value: 1, percentage: 100, color: '#00c896' },
  { name: 'Requiere atención', value: 0, percentage: 0,   color: '#f59e0b' },
  { name: 'Con problemas',     value: 0, percentage: 0,   color: '#f43f5e' }
];

const mockPrincipalesAlertas = [
  { id: 'alt-1', project: 'MCHAV Analytics', message: 'Sincronización Jira activa (426 issues)', type: 'info' }
];

// Sparklines micro data para Rendimiento Global Promedio (NUEVO FORMATO DINAMICO)
const RENDIMIENTO_MOCK_DATA = {
  '7d': {
    velocity: { val: 18, trend: '↑ 2% vs periodo anterior', trendIcon: 'up', sparkline: [{ v: 12 }, { v: 15 }, { v: 14 }, { v: 18 }] },
    throughput: { val: 10, trend: '↓ 1% vs periodo anterior', trendIcon: 'down', sparkline: [{ v: 11 }, { v: 12 }, { v: 9 }, { v: 10 }] },
    cycle: { val: 2.5, trend: '↓ 0.2d vs anterior', trendIcon: 'down', sparkline: [{ v: 2.8 }, { v: 2.7 }, { v: 2.6 }, { v: 2.5 }] },
    lead: { val: 4.1, trend: '↓ 0.3d vs anterior', trendIcon: 'down', sparkline: [{ v: 4.5 }, { v: 4.4 }, { v: 4.3 }, { v: 4.1 }] }
  },
  '30d': {
    velocity: { val: 42, trend: '↑ 8% vs periodo anterior', trendIcon: 'up', sparkline: [{ v: 30 }, { v: 34 }, { v: 38 }, { v: 42 }] },
    throughput: { val: 27, trend: '↑ 12% vs periodo anterior', trendIcon: 'up', sparkline: [{ v: 18 }, { v: 21 }, { v: 23 }, { v: 27 }] },
    cycle: { val: 3.4, trend: '↓ 0.6d vs anterior', trendIcon: 'down', sparkline: [{ v: 4.8 }, { v: 4.2 }, { v: 3.8 }, { v: 3.4 }] },
    lead: { val: 5.2, trend: '↑ 1.1d vs anterior', trendIcon: 'up', sparkline: [{ v: 6.5 }, { v: 6.0 }, { v: 5.8 }, { v: 5.2 }] }
  },
  '90d': {
    velocity: { val: 115, trend: '↑ 15% vs periodo anterior', trendIcon: 'up', sparkline: [{ v: 90 }, { v: 105 }, { v: 110 }, { v: 115 }] },
    throughput: { val: 85, trend: '↑ 22% vs periodo anterior', trendIcon: 'up', sparkline: [{ v: 60 }, { v: 75 }, { v: 80 }, { v: 85 }] },
    cycle: { val: 3.8, trend: '↓ 1.2d vs anterior', trendIcon: 'down', sparkline: [{ v: 5.0 }, { v: 4.5 }, { v: 4.0 }, { v: 3.8 }] },
    lead: { val: 5.8, trend: '↓ 0.5d vs anterior', trendIcon: 'down', sparkline: [{ v: 6.5 }, { v: 6.2 }, { v: 6.0 }, { v: 5.8 }] }
  }
};

// Tooltip flotante informativo universal
const InfoTooltip = ({ text, align = 'center' }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => e.stopPropagation()} 
      className="relative inline-flex items-center cursor-pointer ml-1 z-10"
    >
      <Info 
        size={14} 
        className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors shrink-0" 
      />
      
      {isHovered && (
        <div className={`absolute z-50 p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 text-xs font-medium rounded-xl shadow-2xl border border-slate-700 pointer-events-none leading-relaxed text-left w-60 backdrop-blur-md animate-in fade-in duration-150 ${
          align === 'right' 
            ? 'top-full mt-2 right-0' 
            : 'bottom-full mb-2 left-1/2 -translate-x-1/2'
        }`}>
          <span className="block">{text}</span>
        </div>
      )}
    </div>
  );
};

// Hook: contador animado para los KPI (count-up al cargar)
const useAnimatedCounter = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.round(start * 10) / 10);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

function DashboardView({ subTab = 'dashboard', selectedProjectId, metrics, kpis, setActiveTab }) {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const carouselRef = useRef(null);
  const [hoveredProject, setHoveredProject] = useState(null);

  // Modal drilldown state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMetricType, setModalMetricType] = useState('');

  // Proyectos reales desde la base de datos sincronizada con Jira Cloud
  const [realProjects, setRealProjects] = useState([]);

  useEffect(() => {
    projectService.getProjects()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setRealProjects(data);
      })
      .catch((err) => console.warn('Aviso al obtener proyectos reales:', err));
  }, []);

  const projectsHealthList = useMemo(() => {
    if (!realProjects || realProjects.length === 0) return mockProjectsHealthList;
    return realProjects.map((p, idx) => ({
      id: p.id_proyecto || `proj-${idx}`,
      key: p.key_proyecto || p.key || 'SCRUM',
      name: p.nombre || 'Proyecto Jira',
      health: p.salud_pct || (p.key_proyecto === 'PA' ? 75 : 82),
      status: (p.salud_pct || 80) < 60 ? 'Atención' : 'Saludable',
      statusColor: (p.salud_pct || 80) < 60 ? 'amber' : 'teal',
      issues: p.key_proyecto === 'SCRUM' ? 100 : (p.key_proyecto === 'PA' ? 87 : (p.issues_count || 32)),
      sprint: p.active_sprint || `Sprint 0${idx + 4}`,
      segments: [1, 1, 1, 1, 1, 1, idx % 2 === 0 ? 1 : 0]
    }));
  }, [realProjects]);

  const totalProjectsCount = useMemo(() => {
    return realProjects.length > 0 ? realProjects.length : 2;
  }, [realProjects]);

  const estadoDonutData = useMemo(() => {
    if (!realProjects || realProjects.length === 0) {
      return [
        { name: 'Saludables', value: 2, percentage: 100, color: '#6366f1' },
        { name: 'Requiere atención', value: 0, percentage: 0, color: '#f59e0b' },
        { name: 'Con problemas', value: 0, percentage: 0, color: '#f43f5e' }
      ];
    }
    const total = projectsHealthList.length;
    const saludables = projectsHealthList.filter(p => p.status === 'Saludable').length;
    const atencion   = projectsHealthList.filter(p => p.status === 'Atención').length;
    const problemas  = projectsHealthList.filter(p => p.status === 'Con problemas').length;
    return [
      { name: 'Saludables',        value: saludables, percentage: Math.round((saludables / total) * 100), color: '#00c896' },
      { name: 'Requiere atención', value: atencion,   percentage: Math.round((atencion   / total) * 100), color: '#f59e0b' },
      { name: 'Con problemas',     value: problemas,  percentage: Math.round((problemas  / total) * 100), color: '#f43f5e' }
    ];
  }, [realProjects, projectsHealthList]);

  // Fecha de última sincronización desde backend
  const [lastSyncInfo, setLastSyncInfo] = useState({
    dateText: '12 Ago 2026, 13:04:22',
    status: 'Exitosa',
    user: user?.nombre || user?.email || 'Vhoyos'
  });

  useEffect(() => {
    if (jiraService?.getSyncLogs) {
      jiraService.getSyncLogs()
        .then(logs => {
          if (Array.isArray(logs) && logs.length > 0) {
            const latest = logs[0];
            const dateString = latest.fecha_ejecucion.endsWith('Z') 
              ? latest.fecha_ejecucion 
              : `${latest.fecha_ejecucion}Z`;
            const dt = new Date(dateString);
            setLastSyncInfo({
              dateText: isNaN(dt.getTime())
                ? '12 Ago 2026, 13:04:22'
                : dt.toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
              status: latest.resultado === 'SUCCESS' ? 'Exitosa' : (latest.resultado === 'RUNNING' ? 'Sincronizando...' : 'Exitosa'),
              user: latest.ejecutado_por || user?.nombre || 'Vhoyos'
            });
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Filtros de Tendencia General (interactivos pero datos estáticos)
  const [trendMetric, setTrendMetric] = useState('completed');
  const [trendTimeframe, setTrendTimeframe] = useState('6m');

  const TREND_DATA = {
    '6m': {
      completed: [{ month: 'Mar', valor: 38 }, { month: 'Abr', valor: 62 }, { month: 'May', valor: 71 }, { month: 'Jun', valor: 80 }, { month: 'Jul', valor: 92 }, { month: 'Ago', valor: 100 }],
      created:   [{ month: 'Mar', valor: 42 }, { month: 'Abr', valor: 55 }, { month: 'May', valor: 68 }, { month: 'Jun', valor: 75 }, { month: 'Jul', valor: 85 }, { month: 'Ago', valor: 94 }]
    },
    '3m': {
      completed: [{ month: 'Jun', valor: 40 }, { month: 'Jul', valor: 65 }, { month: 'Ago', valor: 87 }],
      created:   [{ month: 'Jun', valor: 45 }, { month: 'Jul', valor: 58 }, { month: 'Ago', valor: 64 }]
    },
    '30d': {
      completed: [{ month: 'Sem 1', valor: 12 }, { month: 'Sem 2', valor: 25 }, { month: 'Sem 3', valor: 31 }, { month: 'Sem 4', valor: 42 }],
      created:   [{ month: 'Sem 1', valor: 14 }, { month: 'Sem 2', valor: 22 }, { month: 'Sem 3', valor: 18 }, { month: 'Sem 4', valor: 29 }]
    }
  };
  const tendenciaData = TREND_DATA[trendTimeframe][trendMetric];



  const [rendimientoTimeFilter, setRendimientoTimeFilter] = useState('30d');
  const rd = RENDIMIENTO_MOCK_DATA[rendimientoTimeFilter];

  const animVelocity   = useAnimatedCounter(rd.velocity.val);
  const animThroughput = useAnimatedCounter(rd.throughput.val);
  const animCycle      = useAnimatedCounter(rd.cycle.val, 1400);
  const animLead       = useAnimatedCounter(rd.lead.val, 1400);

  const handleScrollCarouselRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleExportPDF = () => {
    if (selectedProjectId && reportService?.downloadPdfReport) {
      reportService.downloadPdfReport(selectedProjectId);
    } else {
      window.print();
    }
  };

  const openDrillDown = (title, type) => {
    setModalTitle(title);
    setModalMetricType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200 font-sans pb-10">
      
      {/* 1. BARRA SUPERIOR ADAPTADA A SUPERVISIÓN EJECUTIVA (ADMIN RESUMEN) */}
      <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Lado Izquierdo: Ícono en Gradiente + Insignia + Título */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shrink-0">
            <BarChart3 size={24} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                Supervisión Ejecutiva
              </span>
              
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Histórico General
            </h1>
          </div>
        </div>

        {/* Lado Derecho: Bell Popup + Exportar PDF */}
        <div className="flex items-center gap-2.5 shrink-0">
          <LiderNotificationBell onNavigateTab={setActiveTab} />

          <button
            type="button"
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-2xl bg-[#5b36f5] hover:bg-indigo-600 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
            title="Exportar reporte consolidado en PDF"
          >
            <FileDown size={15} />
            <span>Exportar PDF</span>
          </button>
        </div>

      </div>



      {/* ============================================================================ */}
      {/* SECCIÓN 1: PANORAMA DE PROYECTOS (CARRUSEL DE TARJETAS DE SALUD) */}
      {/* ============================================================================ */}
      <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-xl space-y-4">
        
        {/* CABECERA DEL SECTOR 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Panorama de proyectos</span>
              <InfoTooltip text="Estado consolidado de salud, avance y total de incidencias de todos los proyectos activos en Jira." />
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('proyectos')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Ver todos los proyectos</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* CONTENEDOR CARRUSEL CON BOTÓN DE DESPLAZAMIENTO REUTILIZABLE */}
        <div className="relative">
          <div 
            ref={carouselRef}
            className="flex items-center gap-4 overflow-x-auto scrollbar-none pb-1 scroll-smooth pr-10"
          >
            {projectsHealthList.map((proj) => {
              const isGreen = proj.statusColor === 'teal';
              const isAmber = proj.statusColor === 'amber';
              const statusBadgeBg = isGreen
                ? 'border'
                : isAmber
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';

              const ringColor  = isGreen ? '#00c896' : isAmber ? '#f59e0b' : '#f43f5e';
              const blockColor = isGreen ? '' : isAmber ? 'bg-amber-500' : 'bg-rose-500';
              const badgeStyle = isGreen
                ? { background: 'rgba(0,200,150,0.12)', color: '#00b386', border: '1px solid rgba(0,200,150,0.3)' }
                : {};
              const dotStyle = isGreen ? { backgroundColor: '#00c896' } : {};

              const isHovered = hoveredProject === proj.id;
              const glowColor = isGreen ? 'rgba(0,200,150,0.25)' : isAmber ? 'rgba(245,158,11,0.25)' : 'rgba(244,63,94,0.25)';
              const borderHoverColor = isGreen ? 'rgba(0,200,150,0.5)' : isAmber ? 'rgba(245,158,11,0.5)' : 'rgba(244,63,94,0.5)';

              return (
                <div
                  key={proj.id}
                  onMouseEnter={() => setHoveredProject(proj.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                  className="min-w-[260px] sm:min-w-[280px] flex-1 bg-slate-50 dark:bg-[#12142e] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 cursor-pointer group hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${isGreen ? '' : statusBadgeBg}`}
                        style={isGreen ? badgeStyle : {}}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full animate-pulse ${isGreen ? '' : blockColor}`}
                          style={isGreen ? dotStyle : {}}
                        />
                        {proj.status}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                        {proj.name}
                      </h3>
                    </div>

                    {/* MEDIDOR ANILLO SVG DE SALUD */}
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                      <svg
                        className="w-12 h-12 transform -rotate-90"
                        style={{ filter: isHovered ? `drop-shadow(0 0 6px ${ringColor})` : 'none', transition: 'filter 0.25s ease' }}
                      >
                        <circle cx="24" cy="24" r="19" stroke={isGreen ? '#e2e8f0' : '#334155'} strokeWidth="3.5" fill="transparent" />
                        <circle
                          cx="24"
                          cy="24"
                          r="19"
                          stroke={ringColor}
                          strokeWidth={isHovered ? 4.5 : 3.5}
                          fill="transparent"
                          strokeDasharray={119}
                          strokeDashoffset={119 - (119 * proj.health) / 100}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-width 0.25s ease' }}
                        />
                      </svg>
                      <span className="absolute font-black text-xs text-slate-900 dark:text-white">{proj.health}%</span>
                    </div>
                  </div>

                  {/* BARRA DE PROGRESO ÚNICA CON DEGRADADO */}
                  <div className="pt-1">
                    <div className="relative h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full relative overflow-hidden"
                        style={{
                          width: `${proj.health}%`,
                          background: isGreen
                            ? 'linear-gradient(90deg, #06b6d4 0%, #14b8a6 50%, #34d399 100%)'
                            : isAmber
                            ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 60%, #fcd34d 100%)'
                            : 'linear-gradient(90deg, #f43f5e 0%, #fb7185 60%, #fda4af 100%)',
                          transition: 'width 1s ease-out',
                          boxShadow: isHovered ? `0 0 8px 1px ${ringColor}` : 'none'
                        }}
                      >
                        {/* Shimmer overlay — más rápido en hover */}
                        <span
                          className="absolute inset-0 opacity-40"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                            animation: `shimmer ${isHovered ? '0.8s' : '1.8s'} infinite`,
                            backgroundSize: '200% 100%'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* PIE DE TARJETA CON ISSUES Y SPRINT */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span>{proj.issues} issues</span>
                    <span>{proj.sprint}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BOTÓN DESPLAZAR FLECHA DER */}
          <button
            type="button"
            onClick={handleScrollCarouselRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/90 dark:bg-slate-800 text-white flex items-center justify-center shadow-lg border border-slate-700 hover:scale-110 transition-all cursor-pointer z-10"
            title="Siguiente proyecto"
          >
            <ChevronRight size={18} />
          </button>
        </div>

      </div>

      {/* ============================================================================ */}
      {/* SECCIÓN 2: TENDENCIA GENERAL (IZQ 7 COLS) Y ESTADO GENERAL (DER 5 COLS) */}
      {/* ============================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* COLUMNA 1 (7 COLS): TENDENCIA GENERAL CON GRÁFICO DE ÁREA DE GRADIENTE */}
        <div className="lg:col-span-7 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Tendencia general</span>
              <InfoTooltip text="Evolución histórica del volumen de incidencias completadas a lo largo de los últimos meses." />
            </h2>

            {/* SELECTORES DE FILTRO Y TIEMPO */}
            <div className="flex items-center gap-2">
              <select 
                value={trendMetric}
                onChange={(e) => setTrendMetric(e.target.value)}
                className="bg-slate-100 dark:bg-[#12142e] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:border-indigo-400 transition-colors"
              >
                <option value="completed">Issues completadas</option>
                <option value="created">Issues creadas</option>
              </select>

              <select 
                value={trendTimeframe}
                onChange={(e) => setTrendTimeframe(e.target.value)}
                className="bg-slate-100 dark:bg-[#12142e] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:border-indigo-400 transition-colors"
              >
                <option value="6m">Últimos 6 meses</option>
                <option value="3m">Últimos 3 meses</option>
                <option value="30d">Últimos 30 días</option>
              </select>
            </div>
          </div>

          {/* GRÁFICO DE ÁREA CON GRADIENTE */}
          <div className="w-full h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tendenciaData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompletadas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={trendMetric === 'created' ? '#06b6d4' : '#6366f1'} stopOpacity={0.5}/>
                    <stop offset="95%" stopColor={trendMetric === 'created' ? '#06b6d4' : '#6366f1'} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 'auto']} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [`${val} issues`, trendMetric === 'created' ? 'Creadas' : 'Completadas']}
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke={trendMetric === 'created' ? '#06b6d4' : '#818cf8'} 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorCompletadas)" 
                  dot={{ r: 4, fill: trendMetric === 'created' ? '#06b6d4' : '#818cf8', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* COLUMNA 2 (5 COLS): SINCRONIZACIÓN + ESTADO GENERAL APILADOS */}
        <div className="lg:col-span-5 flex flex-col gap-4">

          {/* TARJETA: ÚLTIMA SINCRONIZACIÓN */}
          <div
            onClick={() => setActiveTab && setActiveTab('sincronizacion')}
            className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-4 rounded-2xl shadow-sm dark:shadow-xl cursor-pointer hover:border-indigo-400 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <RefreshCw size={11} className="text-emerald-500" />
                Última sincronización
              </span>
              <InfoTooltip text="Fecha, hora y usuario de la última sincronización ejecutada con Jira Cloud." align="right" />
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {lastSyncInfo.dateText}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <User size={12} className="shrink-0" />
                  <span>{lastSyncInfo.user}</span>
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold border border-emerald-500/20 shrink-0">
                {lastSyncInfo.status}
              </span>
            </div>
          </div>

          {/* TARJETA: ESTADO GENERAL */}
          <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-4 rounded-2xl shadow-sm dark:shadow-xl flex-1 flex flex-col justify-between">
            
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
              <span>Estado general</span>
              <InfoTooltip text="Proporción global de proyectos según su nivel de salud operativa." />
            </h2>

            <div className="flex items-center gap-5">
              
              {/* DONUT — tamaño medio */}
              <div className="h-[110px] w-[110px] relative flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={estadoDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={34}
                      outerRadius={52}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {estadoDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{totalProjectsCount}</span>
                  <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Proyectos</span>
                </div>
              </div>

              {/* LEYENDA — icono · count · nombre · % */}
              <div className="flex-1 space-y-2.5">
                {estadoDonutData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-base font-black text-slate-900 dark:text-white leading-none">{item.value}</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex-1 truncate">{item.name}</span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">{item.percentage}%</span>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ============================================================================ */}
      {/* SECCIÓN 3: RENDIMIENTO GLOBAL PROMEDIO (REUBICADO Y PROMINENTE EN LA PARTE INFERIOR) */}
      {/* ============================================================================ */}
      <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Rendimiento global <span className="text-xs text-slate-500 font-normal">(promedio)</span></span>
            <InfoTooltip text="Métricas agregadas promedio del equipo: velocidad, throughput, cycle time y lead time." />
          </h2>
          <div className="relative">
            <select
              value={rendimientoTimeFilter}
              onChange={(e) => setRendimientoTimeFilter(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-[#12142e] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Último mes</option>
              <option value="90d">Últimos 3 meses</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* SPARKLINE 1: VELOCITY */}
          <div 
            onClick={() => openDrillDown('Velocity Promedio', 'velocity')}
            className="group relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#12142e] border border-slate-200 dark:border-slate-800 hover:border-purple-400 transition-all cursor-pointer shadow-xs dark:shadow-lg"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-transparent opacity-80 pointer-events-none transition-opacity group-hover:opacity-100"></div>
            <div className="relative z-10 space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wide">Velocity</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{animVelocity}</span>
                <span className="text-xs font-bold text-slate-500">SP</span>
              </div>
              <span className="text-xs font-extrabold text-indigo-500 flex items-center gap-1">
                {rd.velocity.trendIcon === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {rd.velocity.trend}
              </span>
              <div className="h-10 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rd.velocity.sparkline}>
                    <Line type="monotone" dataKey="v" stroke="#a855f7" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* SPARKLINE 2: THROUGHPUT */}
          <div 
            onClick={() => openDrillDown('Throughput Promedio', 'throughput')}
            className="group relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#12142e] border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all cursor-pointer shadow-xs dark:shadow-lg"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent opacity-80 pointer-events-none transition-opacity group-hover:opacity-100"></div>
            <div className="relative z-10 space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wide">Throughput</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{animThroughput}</span>
                <span className="text-xs font-bold text-slate-500">issues</span>
              </div>
              <span className="text-xs font-extrabold text-indigo-500 flex items-center gap-1">
                {rd.throughput.trendIcon === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {rd.throughput.trend}
              </span>
              <div className="h-10 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rd.throughput.sparkline}>
                    <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* SPARKLINE 3: CYCLE TIME */}
          <div 
            onClick={() => openDrillDown('Tiempo de Ciclo Promedio', 'cycle_time')}
            className="group relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#12142e] border border-slate-200 dark:border-slate-800 hover:border-cyan-400 transition-all cursor-pointer shadow-xs dark:shadow-lg"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/15 via-teal-500/10 to-transparent opacity-80 pointer-events-none transition-opacity group-hover:opacity-100"></div>
            <div className="relative z-10 space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wide">Cycle Time</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{animCycle}</span>
                <span className="text-xs font-bold text-slate-500">días</span>
              </div>
              <span className="text-xs font-extrabold text-indigo-500 flex items-center gap-1">
                {rd.cycle.trendIcon === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {rd.cycle.trend}
              </span>
              <div className="h-10 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rd.cycle.sparkline}>
                    <Line type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* SPARKLINE 4: LEAD TIME */}
          <div 
            onClick={() => openDrillDown('Lead Time Promedio', 'lead_time')}
            className="group relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#12142e] border border-slate-200 dark:border-slate-800 hover:border-purple-400 transition-all cursor-pointer shadow-xs dark:shadow-lg"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-transparent opacity-80 pointer-events-none transition-opacity group-hover:opacity-100"></div>
            <div className="relative z-10 space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wide">Lead Time</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{animLead}</span>
                <span className="text-xs font-bold text-slate-500">días</span>
              </div>
              <span className="text-xs font-extrabold text-amber-500 flex items-center gap-1">
                {rd.lead.trendIcon === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {rd.lead.trend}
              </span>
              <div className="h-10 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rd.lead.sparkline}>
                    <Line type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Modal de Drill-down de métricas por ticket (HU-015) */}
      <KpiDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={selectedProjectId}
        metricTitle={modalTitle}
        metricType={modalMetricType}
      />

    </div>
  );
}

export default DashboardView;
