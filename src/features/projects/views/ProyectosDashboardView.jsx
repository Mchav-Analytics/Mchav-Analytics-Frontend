// ============================================================================
// FEATURE PROJECTS — DASHBOARD EJECUTIVO CON SELECTOR DINÁMICO POR PROYECTO
// ============================================================================
// Permite alternar entre el Resumen General (Todos los Proyectos) y el análisis individualizado
// de un proyecto específico, filtrando métricas, gráficas, tiempos de ciclo y actividades.

import React, { useState, useEffect, useMemo } from 'react';
import api, { projectService } from '../../../services/api';
import { useAuth } from '../../auth/context/AuthContext';
import LiderNotificationBell from '../../dashboard/components/LiderNotificationBell';
import {
  FolderKanban,
  CheckCircle2,
  TrendingUp,
  Clock,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar,
  Filter,
  Info,
  Sparkles,
  Plus,
  X,
  Activity,
  FileDown,
  UserPlus,
  Layers,
  BarChart3,
  PieChart as PieIcon,
  ListFilter,
  Check,
  Building2,
  Box
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';

// Tooltip explicativo genérico
const InfoTooltip = ({ text, align = "center" }) => {
  return (
    <div className="group/tooltip relative inline-flex items-center cursor-help ml-1.5 shrink-0 z-30">
      <div className="p-1 rounded-full text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
        <Info size={14} />
      </div>
      <div className={`absolute bottom-full mb-2 ${align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"} hidden group-hover/tooltip:block w-64 p-3 bg-slate-900/95 dark:bg-slate-950/95 text-slate-100 text-[11px] font-normal leading-relaxed rounded-xl shadow-2xl z-50 pointer-events-none text-left backdrop-blur-md border border-slate-700/80`}>
        {text}
        <div className={`absolute top-full ${align === "right" ? "right-3" : align === "left" ? "left-3" : "left-1/2 -translate-x-1/2"} border-4 border-transparent border-t-slate-900 dark:border-t-slate-950`}></div>
      </div>
    </div>
  );
};

// Tooltip flotante de gráficas
const EnrichedChartTooltip = ({ active, payload, label, unit = "incidencias", titlePrefix = "Información" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-[#11152a]/95 text-white border border-slate-700/80 rounded-2xl p-3.5 text-xs shadow-2xl backdrop-blur-md min-w-[200px] text-left space-y-2">
        <div className="font-extrabold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center justify-between">
          <span>{label ? `${titlePrefix}: ${label}` : titlePrefix}</span>
          <span className="text-[10px] text-indigo-400 font-mono">Jira Cloud</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5" style={{ color: item.color || item.fill }}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color || item.fill }} />
                {item.name || item.dataKey}:
              </span>
              <span className="font-extrabold text-slate-100">
                {item.value} <span className="text-[10px] text-slate-400 font-normal">{unit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Proyectos de referencia
const DEFAULT_PROJECT_ROWS = [
  { id: 'proj-1', key: 'PA', name: 'Plataforma Analytics', status: 'Activo', issuesCount: 324, velocity: 45.2, cycleTime: '2.8 días', progress: 75, lastSync: 'Hace 2 horas', color: '#8b5cf6' },
  { id: 'proj-2', key: 'MC', name: 'MCHAV Core', status: 'Activo', issuesCount: 278, velocity: 38.7, cycleTime: '3.1 días', progress: 68, lastSync: 'Hace 1 hora', color: '#3b82f6' },
  { id: 'proj-3', key: 'WD', name: 'Web Dashboard', status: 'Activo', issuesCount: 196, velocity: 32.1, cycleTime: '2.5 días', progress: 82, lastSync: 'Hace 3 horas', color: '#f97316' },
  { id: 'proj-4', key: 'AG', name: 'API Gateway', status: 'Activo', issuesCount: 156, velocity: 28.9, cycleTime: '3.7 días', progress: 61, lastSync: 'Hace 30 min', color: '#10b981' },
  { id: 'proj-5', key: 'MA', name: 'Mobile App', status: 'Pausado', issuesCount: 98, velocity: 12.4, cycleTime: '4.2 días', progress: 35, lastSync: 'Hace 5 horas', color: '#a855f7' },
  { id: 'proj-6', key: 'INF', name: 'Infraestructura', status: 'Activo', issuesCount: 67, velocity: 8.6, cycleTime: '2.1 días', progress: 91, lastSync: 'Hace 1 hora', color: '#06b6d4' },
];

// Evolución de Velocidad General vs Por Proyecto
const PROJECT_VELOCITY_MAP = {
  'proj-1': [
    { sprint: 'Sprint 12', SP: 42 }, { sprint: 'Sprint 13', SP: 55 }, { sprint: 'Sprint 14', SP: 50 }, { sprint: 'Sprint 15', SP: 68 }, { sprint: 'Sprint 16', SP: 72 }, { sprint: 'Sprint 17', SP: 65 }
  ],
  'proj-2': [
    { sprint: 'Sprint 12', SP: 35 }, { sprint: 'Sprint 13', SP: 48 }, { sprint: 'Sprint 14', SP: 42 }, { sprint: 'Sprint 15', SP: 52 }, { sprint: 'Sprint 16', SP: 58 }, { sprint: 'Sprint 17', SP: 54 }
  ],
  'proj-3': [
    { sprint: 'Sprint 12', SP: 48 }, { sprint: 'Sprint 13', SP: 52 }, { sprint: 'Sprint 14', SP: 45 }, { sprint: 'Sprint 15', SP: 38 }, { sprint: 'Sprint 16', SP: 50 }, { sprint: 'Sprint 17', SP: 46 }
  ],
  'proj-4': [
    { sprint: 'Sprint 12', SP: 28 }, { sprint: 'Sprint 13', SP: 40 }, { sprint: 'Sprint 14', SP: 35 }, { sprint: 'Sprint 15', SP: 32 }, { sprint: 'Sprint 16', SP: 42 }, { sprint: 'Sprint 17', SP: 38 }
  ],
  'proj-5': [
    { sprint: 'Sprint 12', SP: 15 }, { sprint: 'Sprint 13', SP: 18 }, { sprint: 'Sprint 14', SP: 12 }, { sprint: 'Sprint 15', SP: 10 }, { sprint: 'Sprint 16', SP: 14 }, { sprint: 'Sprint 17', SP: 12 }
  ],
  'proj-6': [
    { sprint: 'Sprint 12', SP: 10 }, { sprint: 'Sprint 13', SP: 12 }, { sprint: 'Sprint 14', SP: 8 }, { sprint: 'Sprint 15', SP: 9 }, { sprint: 'Sprint 16', SP: 11 }, { sprint: 'Sprint 17', SP: 9 }
  ]
};

const GENERAL_VELOCITY_DATA = [
  { sprint: 'Sprint 12', PA: 42, MC: 35, WD: 48, AG: 28 },
  { sprint: 'Sprint 13', PA: 55, MC: 48, WD: 52, AG: 40 },
  { sprint: 'Sprint 14', PA: 50, MC: 42, WD: 45, AG: 35 },
  { sprint: 'Sprint 15', PA: 68, MC: 52, WD: 38, AG: 32 },
  { sprint: 'Sprint 16', PA: 72, MC: 58, WD: 50, AG: 42 },
  { sprint: 'Sprint 17', PA: 65, MC: 54, WD: 46, AG: 38 },
];

export default function ProyectosDashboardView({ userProfile = null }) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('ALL'); // 'ALL' o id del proyecto
  const [dateRange, setDateRange] = useState('MAY_2024');
  const [sprintRange, setSprintRange] = useState('6_SPRINTS');
  const [pageSize, setPageSize] = useState(10);
  const [toastMsg, setToastMsg] = useState(null);

  // Proyectos reales backend
  const [realProjects, setRealProjects] = useState([]);

  useEffect(() => {
    projectService.getProjects()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p, idx) => ({
            id: p.id_proyecto || `proj-${idx + 1}`,
            key: p.key_proyecto || `PROJ-${idx + 1}`,
            name: p.nombre || `Proyecto ${idx + 1}`,
            status: (p.estado || '').toUpperCase() === 'INACTIVE' ? 'Pausado' : 'Activo',
            issuesCount: Math.floor(Math.random() * 200) + 100,
            velocity: (Math.random() * 30 + 15).toFixed(1),
            cycleTime: `${(Math.random() * 2 + 2).toFixed(1)} días`,
            progress: Math.floor(Math.random() * 40) + 60,
            lastSync: 'Hace momentos',
            color: ['#8b5cf6', '#3b82f6', '#f97316', '#10b981', '#a855f7', '#06b6d4'][idx % 6]
          }));
          setRealProjects(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const allProjectsList = useMemo(() => {
    return realProjects.length > 0 ? realProjects : DEFAULT_PROJECT_ROWS;
  }, [realProjects]);

  // Proyecto seleccionado (si no es 'ALL')
  const selectedProjectObj = useMemo(() => {
    if (selectedProjectId === 'ALL') return null;
    return allProjectsList.find(p => p.id === selectedProjectId) || null;
  }, [selectedProjectId, allProjectsList]);

  // Proyectos filtrados para la tabla
  const displayProjects = useMemo(() => {
    let list = allProjectsList;
    if (selectedProjectId !== 'ALL') {
      list = list.filter(p => p.id === selectedProjectId);
    }
    if (!searchTerm.trim()) return list;
    return list.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.key.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProjectsList, selectedProjectId, searchTerm]);

  // Cálculos dinámicos de Métricas (KPIs) según la selección
  const metrics = useMemo(() => {
    if (selectedProjectObj) {
      return {
        activeCountLabel: '1 Proyecto',
        activeSubtext: `Seleccionado: ${selectedProjectObj.name}`,
        totalIssues: selectedProjectObj.issuesCount,
        avgVelocity: `${selectedProjectObj.velocity}`,
        cycleTime: selectedProjectObj.cycleTime,
        lastSync: selectedProjectObj.lastSync,
        progress: selectedProjectObj.progress
      };
    }

    const totalIssues = allProjectsList.reduce((acc, p) => acc + (p.issuesCount || 0), 0);
    const avgVelocity = (allProjectsList.reduce((acc, p) => acc + parseFloat(p.velocity || 0), 0) / (allProjectsList.length || 1)).toFixed(1);
    const activeCount = allProjectsList.filter(p => p.status === 'Activo').length;

    return {
      activeCountLabel: `${activeCount}`,
      activeSubtext: `De ${allProjectsList.length} proyectos en total`,
      totalIssues: totalIssues > 0 ? totalIssues.toLocaleString() : '1,248',
      avgVelocity: `${avgVelocity}`,
      cycleTime: '3.2 días',
      lastSync: 'Hace 2 horas',
      progress: 75
    };
  }, [selectedProjectObj, allProjectsList]);

  // Datos del Gráfico Donut de Estados según la selección
  const statusDistributionData = useMemo(() => {
    if (selectedProjectObj) {
      const tot = selectedProjectObj.issuesCount;
      const todo = Math.round(tot * 0.25);
      const inProg = Math.round(tot * 0.38);
      const review = Math.round(tot * 0.18);
      const done = Math.round(tot * 0.17);
      const blocked = tot - (todo + inProg + review + done);

      return [
        { name: 'To Do', value: todo, percentage: `${Math.round((todo/tot)*100)}%`, color: '#3b82f6' },
        { name: 'In Progress', value: inProg, percentage: `${Math.round((inProg/tot)*100)}%`, color: '#06b6d4' },
        { name: 'In Review', value: review, percentage: `${Math.round((review/tot)*100)}%`, color: '#f97316' },
        { name: 'Done', value: done, percentage: `${Math.round((done/tot)*100)}%`, color: '#10b981' },
        { name: 'Blocked', value: Math.max(0, blocked), percentage: `${Math.round((Math.max(0, blocked)/tot)*100)}%`, color: '#ef4444' },
      ];
    }
    return [
      { name: 'To Do', value: 342, percentage: '27.4%', color: '#3b82f6' },
      { name: 'In Progress', value: 456, percentage: '36.5%', color: '#06b6d4' },
      { name: 'In Review', value: 234, percentage: '18.8%', color: '#f97316' },
      { name: 'Done', value: 198, percentage: '15.9%', color: '#10b981' },
      { name: 'Blocked', value: 18, percentage: '1.4%', color: '#ef4444' },
    ];
  }, [selectedProjectObj]);

  // Datos del Gráfico de Barras según selección
  const topProjectsBarData = useMemo(() => {
    if (selectedProjectObj) {
      return [
        { name: 'Historias de Usuario', value: Math.round(selectedProjectObj.issuesCount * 0.55), color: selectedProjectObj.color },
        { name: 'Tareas / Subtareas', value: Math.round(selectedProjectObj.issuesCount * 0.30), color: '#3b82f6' },
        { name: 'Bugs / Defectos', value: Math.round(selectedProjectObj.issuesCount * 0.15), color: '#ef4444' },
      ];
    }
    return [
      { name: 'Plataforma Analytics', value: 324, color: '#8b5cf6' },
      { name: 'MCHAV Core', value: 278, color: '#3b82f6' },
      { name: 'Web Dashboard', value: 196, color: '#f97316' },
      { name: 'API Gateway', value: 156, color: '#10b981' },
      { name: 'Mobile App', value: 98, color: '#a855f7' },
    ];
  }, [selectedProjectObj]);

  // Datos del Gráfico de Evolución de Velocidad según selección
  const velocityEvolutionData = useMemo(() => {
    if (selectedProjectObj && PROJECT_VELOCITY_MAP[selectedProjectObj.id]) {
      return PROJECT_VELOCITY_MAP[selectedProjectObj.id];
    }
    return GENERAL_VELOCITY_DATA;
  }, [selectedProjectObj]);

  // Actividades Recientes filtradas
  const recentActivities = useMemo(() => {
    if (selectedProjectObj) {
      return [
        { id: 1, type: 'SYNC', title: 'Sincronización completada', project: selectedProjectObj.name, time: 'Hace 2 horas', iconBg: 'bg-emerald-500/15 text-emerald-500' },
        { id: 2, type: 'ISSUE', title: 'Nueva incidencia asignada', project: `${selectedProjectObj.name} • ${selectedProjectObj.key}-104`, time: 'Hace 3 horas', iconBg: 'bg-purple-500/15 text-purple-500' },
        { id: 3, type: 'SPRINT', title: 'Sprint actualizado', project: `${selectedProjectObj.name} • Sprint Activo`, time: 'Hace 5 horas', iconBg: 'bg-amber-500/15 text-amber-500' }
      ];
    }
    return [
      { id: 1, type: 'SYNC', title: 'Sincronización completada', project: 'Plataforma Analytics', time: 'Hace 2 horas', iconBg: 'bg-emerald-500/15 text-emerald-500' },
      { id: 2, type: 'ISSUE', title: 'Nueva incidencia creada', project: 'MCHAV Core • BUG-1234', time: 'Hace 3 horas', iconBg: 'bg-purple-500/15 text-purple-500' },
      { id: 3, type: 'SPRINT', title: 'Sprint finalizado', project: 'Web Dashboard • Sprint 16', time: 'Hace 5 horas', iconBg: 'bg-amber-500/15 text-amber-500' },
      { id: 4, type: 'SYNC', title: 'Sincronización completada', project: 'API Gateway', time: 'Hace 6 horas', iconBg: 'bg-emerald-500/15 text-emerald-500' },
    ];
  }, [selectedProjectObj]);

  const handleSyncNow = () => {
    setSyncing(true);
    setToastMsg(selectedProjectObj ? `Sincronizando ${selectedProjectObj.name}...` : 'Iniciando sincronización de todos los proyectos...');
    setTimeout(() => {
      setSyncing(false);
      setToastMsg('¡Métricas actualizadas con éxito desde Jira!');
      setTimeout(() => setToastMsg(null), 4000);
    }, 1800);
  };

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in duration-200 pb-12">
      
      {/* Toast Notificación */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900/95 dark:bg-slate-950/95 text-white border border-emerald-500/50 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-top-3">
          <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold">{toastMsg}</span>
          <button type="button" onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white ml-2">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── HEADER CON BOTÓN SELECTOR DE PROYECTO ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] p-5 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 uppercase tracking-wider">
              Control Ejecutivo Agile
            </span>
            {selectedProjectObj ? (
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-500/20 flex items-center gap-1">
                <Box size={13} /> {selectedProjectObj.name} ({selectedProjectObj.key})
              </span>
            ) : (
              <span className="text-xs text-slate-400">• Resumen General (Todos los Proyectos)</span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {selectedProjectObj ? `Proyecto: ${selectedProjectObj.name}` : 'Proyectos & Métricas de Rendimiento'}
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            {selectedProjectObj
              ? `Analizando el rendimiento, velocidad y ciclo del proyecto ${selectedProjectObj.name} (${selectedProjectObj.key}).`
              : 'Gestiona y analiza el rendimiento consolidado de todos tus proyectos sincronizados con Jira Cloud.'
            }
          </p>
        </div>

        {/* CONTROLES Y BOTÓN DE SELECCIÓN DE PROYECTO */}
        <div className="flex flex-wrap items-center gap-3">
          <LiderNotificationBell />

          {/* 🎯 BOTÓN DE SELECCIÓN DE PROYECTO (SELECT DROPDOWN DESTACADO) */}
          <div className="relative">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#1a2138] border border-slate-200 dark:border-[#2c3757] rounded-2xl shadow-xs">
              <span className="pl-2.5 text-slate-400">
                <Box size={16} className="text-indigo-500" />
              </span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="h-8 pr-8 bg-transparent text-xs font-extrabold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                  🌐 Resumen General (Todos los Proyectos)
                </option>
                {allProjectsList.map(p => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">
                    📦 {p.name} ({p.key})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de Rango de Fecha */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-10 pl-3.5 pr-8 rounded-xl bg-slate-50 dark:bg-[#1a2138] border border-slate-200 dark:border-[#2c3757] text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
            >
              <option value="MAY_2024">01 May 2024 - 31 May 2024</option>
              <option value="JUN_2024">01 Jun 2024 - 30 Jun 2024</option>
              <option value="LAST_90">Últimos 90 días</option>
            </select>
          </div>

          {/* Botón Sincronizar */}
          <button
            type="button"
            onClick={handleSyncNow}
            disabled={syncing}
            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all active:scale-95 disabled:opacity-60"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Sincronizando...' : '+ Sincronizar ahora'}</span>
          </button>
        </div>
      </div>

      {/* BANNER INFORMATIVO SI UN PROYECTO ESTÁ SELECCIONADO */}
      {selectedProjectObj && (
        <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
            <span className="font-bold text-indigo-950 dark:text-indigo-200">
              Viendo métricas filtradas del proyecto: <strong>{selectedProjectObj.name}</strong> ({selectedProjectObj.key})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedProjectId('ALL')}
            className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-extrabold cursor-pointer transition-all flex items-center gap-1 shadow-xs"
          >
            <span>Ver Resumen General</span>
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── FILA 1: 5 TARJETAS KPIS CON DATOS DINÁMICOS SEGÚN EL PROYECTO ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Proyectos Activos / Estado */}
        <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] p-4.5 rounded-2xl shadow-xs flex items-center justify-between hover:border-emerald-500/50 transition-all">
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Proyectos Activos</span>
              <InfoTooltip text="Estado del desarrollo del proyecto actualmente seleccionado o total de proyectos activos." />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.activeCountLabel}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block truncate max-w-[130px]">
              {metrics.activeSubtext}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <FolderKanban size={20} />
          </div>
        </div>

        {/* Card 2: Incidencias Totales */}
        <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] p-4.5 rounded-2xl shadow-xs flex items-center justify-between hover:border-purple-500/50 transition-all">
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Incidencias Totales</span>
              <InfoTooltip text="Suma de Historias, Tareas y Bugs registrados para la selección actual." />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.totalIssues}
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold flex items-center gap-1">
              ↑ 18.5% <span className="text-slate-400 font-normal">vs periodo anterior</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center border border-purple-500/20 shrink-0">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Card 3: Velocidad Promedio */}
        <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] p-4.5 rounded-2xl shadow-xs flex items-center justify-between hover:border-blue-500/50 transition-all">
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Velocidad Promedio</span>
              <InfoTooltip text="Promedio de Puntos de Historia (Story Points) completados por Sprint." />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.avgVelocity}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">Puntos por sprint (SP)</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center border border-blue-500/20 shrink-0">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Card 4: Tiempo Ciclo Promedio */}
        <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] p-4.5 rounded-2xl shadow-xs flex items-center justify-between hover:border-amber-500/50 transition-all">
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Tiempo Ciclo Promedio</span>
              <InfoTooltip text="Días promedio para completar una tarea desde que inicia en desarrollo." />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.cycleTime}
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1">
              ↑ 8.1% <span className="text-slate-400 font-normal">vs periodo anterior</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Clock size={20} />
          </div>
        </div>

        {/* Card 5: Última Sincronización */}
        <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] p-4.5 rounded-2xl shadow-xs flex items-center justify-between hover:border-cyan-500/50 transition-all">
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Última Sync</span>
              <InfoTooltip text="Fecha y hora de la última sincronización con Jira." />
            </div>
            <div className="text-base font-black text-slate-900 dark:text-white leading-tight">{metrics.lastSync}</div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">31 May 2024, 08:30 AM</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center border border-cyan-500/20 shrink-0">
            <RefreshCw size={20} />
          </div>
        </div>

      </div>

      {/* ── FILA 2: TABLA RESUMEN DE PROYECTOS (A TODO LO LARGO) ── */}
      <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
        
        {/* Header Tabla */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {selectedProjectObj ? `Detalle del Proyecto: ${selectedProjectObj.name}` : 'Resumen de Proyectos'}
            </h3>
            <InfoTooltip text="Métricas consolidadas de incidencias, velocidad, tiempo de ciclo y nivel de avance por proyecto." />
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar proyecto..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#1a2138] border border-slate-200 dark:border-[#2c3757] text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition-all"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Tabla de Proyectos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="pb-3 pr-2">
                  <span className="flex items-center">
                    Proyecto
                    <InfoTooltip text="Nombre oficial y clave de Jira." align="left" />
                  </span>
                </th>
                <th className="pb-3 px-2">Clave</th>
                <th className="pb-3 px-2">
                  <span className="flex items-center">
                    Estado
                    <InfoTooltip text="Estado del desarrollo: Activo o Pausado." />
                  </span>
                </th>
                <th className="pb-3 px-2 text-right">
                  <span className="flex items-center justify-end">
                    Incidencias
                    <InfoTooltip text="Total de incidencias asignadas." />
                  </span>
                </th>
                <th className="pb-3 px-2 text-right">
                  <span className="flex items-center justify-end">
                    Velocidad
                    <InfoTooltip text="Puntos de Historia por Sprint." />
                  </span>
                </th>
                <th className="pb-3 px-2 text-right">
                  <span className="flex items-center justify-end">
                    T. Ciclo
                    <InfoTooltip text="Días promedio para entrega de tareas." />
                  </span>
                </th>
                <th className="pb-3 px-2 min-w-[100px]">
                  <span className="flex items-center">
                    Progreso
                    <InfoTooltip text="Porcentaje de avance estimado." />
                  </span>
                </th>
                <th className="pb-3 px-2 text-right">Última Sync</th>
                <th className="pb-3 pl-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
              {displayProjects.map((proj) => (
                <tr 
                  key={proj.id} 
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedProjectId === proj.id 
                      ? 'bg-indigo-50/80 dark:bg-indigo-500/10 font-bold' 
                      : 'hover:bg-slate-50/70 dark:hover:bg-slate-900/40'
                  }`}
                >
                  
                  {/* Proyecto */}
                  <td className="py-3 pr-2 font-extrabold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-md text-[10px] font-black text-white flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: proj.color || '#8b5cf6' }}
                      >
                        {proj.key.substring(0, 2)}
                      </div>
                      <span className="truncate max-w-[130px] sm:max-w-[160px]">{proj.name}</span>
                    </div>
                  </td>

                  {/* Clave */}
                  <td className="py-3 px-2 font-bold text-slate-400 dark:text-slate-500">
                    {proj.key}
                  </td>

                  {/* Estado */}
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                      proj.status === 'Activo'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${proj.status === 'Activo' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      {proj.status}
                    </span>
                  </td>

                  {/* Incidencias */}
                  <td className="py-3 px-2 text-right font-bold text-slate-800 dark:text-slate-200">
                    {proj.issuesCount}
                  </td>

                  {/* Velocidad */}
                  <td className="py-3 px-2 text-right font-bold text-slate-800 dark:text-slate-200">
                    {proj.velocity} <span className="text-[10px] text-slate-400 font-normal">SP</span>
                  </td>

                  {/* Tiempo de Ciclo */}
                  <td className="py-3 px-2 text-right font-semibold text-slate-500 dark:text-slate-400">
                    {proj.cycleTime}
                  </td>

                  {/* Barra de Progreso */}
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${proj.progress < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400">{proj.progress}%</span>
                    </div>
                  </td>

                  {/* Última Sync */}
                  <td className="py-3 px-2 text-right text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    {proj.lastSync}
                  </td>

                  {/* Botón Seleccionar */}
                  <td className="py-3 pl-2 text-center">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectId(selectedProjectId === proj.id ? 'ALL' : proj.id);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                        selectedProjectId === proj.id 
                          ? 'bg-indigo-600 text-white shadow-xs' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/20'
                      }`}
                    >
                      {selectedProjectId === proj.id ? 'Viendo' : 'Ver'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Mostrando {displayProjects.length} proyectos</span>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronLeft size={14} />
              </button>
              <button type="button" className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </button>
              <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── FILA 3: EVOLUCIÓN DE VELOCIDAD (A TODO LO LARGO - FULL WIDTH) ── */}
      <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
        
        {/* Header Gráfico */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {selectedProjectObj ? `Evolución de Velocidad: ${selectedProjectObj.name}` : 'Evolución de Velocidad'}
            </h3>
            <InfoTooltip text="Tendencia histórica de Puntos de Historia (Story Points) entregados en cada sprint a lo largo del tiempo." />
          </div>

          <select
            value={sprintRange}
            onChange={(e) => setSprintRange(e.target.value)}
            className="h-8 px-2.5 rounded-xl bg-slate-50 dark:bg-[#1a2138] border border-slate-200 dark:border-[#2c3757] text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="6_SPRINTS">Últimos 6 sprints</option>
            <option value="12_SPRINTS">Últimos 12 sprints</option>
          </select>
        </div>

        {/* Gráfico de Líneas Full Width con Ejes X/Y estructurados */}
        <div className="h-80 sm:h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {selectedProjectObj ? (
              <LineChart data={velocityEvolutionData} margin={{ top: 15, right: 30, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis 
                  dataKey="sprint" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  dy={8}
                  label={{ value: 'Ciclos de Desarrollo (Sprints)', position: 'insideBottom', offset: -22, fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  domain={[0, 100]}
                  dx={-8}
                  label={{ value: 'Puntos de Historia (SP)', angle: -90, position: 'insideLeft', offset: -2, fill: '#64748b', fontSize: 11, fontWeight: 700, style: { textAnchor: 'middle' } }}
                />
                <RechartsTooltip content={<EnrichedChartTooltip unit="Puntos (SP)" titlePrefix="Sprint" />} />
                <Line type="monotone" dataKey="SP" stroke={selectedProjectObj.color || '#8b5cf6'} strokeWidth={3.5} dot={{ r: 6, fill: selectedProjectObj.color || '#8b5cf6' }} activeDot={{ r: 8 }} name={selectedProjectObj.name} />
              </LineChart>
            ) : (
              <LineChart data={velocityEvolutionData} margin={{ top: 15, right: 30, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis 
                  dataKey="sprint" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false}
                  dy={8}
                  label={{ value: 'Ciclos de Desarrollo (Sprints)', position: 'insideBottom', offset: -22, fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  domain={[0, 100]}
                  dx={-8}
                  label={{ value: 'Puntos de Historia (SP)', angle: -90, position: 'insideLeft', offset: -2, fill: '#64748b', fontSize: 11, fontWeight: 700, style: { textAnchor: 'middle' } }}
                />
                <RechartsTooltip content={<EnrichedChartTooltip unit="Puntos (SP)" titlePrefix="Sprint" />} />
                <Line type="monotone" dataKey="PA" stroke="#8b5cf6" strokeWidth={3.5} dot={{ r: 5, fill: '#8b5cf6' }} activeDot={{ r: 7 }} name="Plataforma Analytics" />
                <Line type="monotone" dataKey="MC" stroke="#3b82f6" strokeWidth={3.5} dot={{ r: 5, fill: '#3b82f6' }} activeDot={{ r: 7 }} name="MCHAV Core" />
                <Line type="monotone" dataKey="WD" stroke="#f97316" strokeWidth={3.5} dot={{ r: 5, fill: '#f97316' }} activeDot={{ r: 7 }} name="Web Dashboard" />
                <Line type="monotone" dataKey="AG" stroke="#10b981" strokeWidth={3.5} dot={{ r: 5, fill: '#10b981' }} activeDot={{ r: 7 }} name="API Gateway" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Leyenda Abajo */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400">
          {selectedProjectObj ? (
            <span className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedProjectObj.color || '#8b5cf6' }}></span> 
              Velocidad acumulada de {selectedProjectObj.name} ({selectedProjectObj.key})
            </span>
          ) : (
            <>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#8b5cf6]"></span> Plataforma Analytics</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span> MCHAV Core</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#f97316]"></span> Web Dashboard</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#10b981]"></span> API Gateway</span>
            </>
          )}
        </div>

      </div>

      {/* ── FILA 3: DISTRIBUCIÓN DE ESTADOS (1/3) + TOP INCIDENCIAS/TIPOS (1/3) + ACTIVIDAD RECIENTE (1/3) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* COLUMNA 1: DISTRIBUCIÓN DE ESTADOS (DONUT CHART DINÁMICO) */}
        <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Distribución de Estados
              </h3>
              <InfoTooltip text="Desglose del volumen de trabajo según su estado actual en el flujo de Jira." />
            </div>
            <PieIcon size={16} className="text-indigo-500" />
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Donut Chart */}
            <div className="h-48 w-44 relative flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusDistributionData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<EnrichedChartTooltip unit="tareas" titlePrefix="Estado" />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedProjectObj ? selectedProjectObj.issuesCount : '1,248'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Incidencias</span>
              </div>
            </div>

            {/* Leyenda Derecha */}
            <div className="space-y-2 flex-1 text-xs font-semibold">
              {statusDistributionData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {item.value} <span className="text-slate-400 font-medium text-[10px]">({item.percentage})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA 2: TOP PROYECTOS / DESGLOSE POR TIPO DE TAREA */}
        <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {selectedProjectObj ? `Desglose: ${selectedProjectObj.key}` : 'Top Proyectos por Incidencias'}
              </h3>
              <InfoTooltip text="Muestra el desglose de volumen de trabajo por proyecto o por tipo de tarea." />
            </div>
            <BarChart3 size={16} className="text-purple-500" />
          </div>

          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProjectsBarData} layout="vertical" margin={{ top: 5, right: 25, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.15} />
                <XAxis 
                  type="number" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  label={{ value: 'Total de Incidencias Registradas', position: 'insideBottom', offset: -14, fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  width={110} 
                />
                <RechartsTooltip content={<EnrichedChartTooltip unit="incidencias" titlePrefix="Item" />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                  {topProjectsBarData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COLUMNA 3: ACTIVIDAD RECIENTE FILTRADA */}
        <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Actividad Reciente
              </h3>
              <InfoTooltip text="Eventos de sincronización y movimientos de tareas en tiempo real." />
            </div>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-xs font-extrabold text-indigo-500 hover:text-indigo-400">
              Ver todas
            </a>
          </div>

          <div className="space-y-3.5">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-extrabold ${act.iconBg}`}>
                  {act.type === 'SYNC' ? <RefreshCw size={14} /> : act.type === 'SPRINT' ? <CheckCircle2 size={14} /> : 'MC'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                    {act.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {act.project}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
