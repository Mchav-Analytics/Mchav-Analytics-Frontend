// ============================================================================
// FEATURE DASHBOARD — VISTA DEL ADMINISTRADOR (DISEÑO MEJORADO Y ESPACIADO)
// ============================================================================
// Vista con 4 KPIs superiores, Velocidad por Sprint, Burndown,
// Salud del Sprint (75% Estable) y Gráfica de Dona interactiva. Adaptada a temas y espaciados limpios.

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Info, 
  TrendingDown, 
  TrendingUp, 
  RefreshCw, 
  AlertTriangle,
  Bug,
  User,
  FileText,
  Shield,
  X,
  FileDown,
  Printer,
  Search,
  ExternalLink,
  Layers
} from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import KpiDetailModal from '../components/KpiDetailModal';
import { reportService } from '../../../services/api';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// Datos mock estables para los gráficos de Velocidad por Sprint y Burndown
const mockSprintVelocity = [
  { sprint: 'Sprint SP_1', sp: 32, promedio: 31 },
  { sprint: 'Sprint SP_2', sp: 38, promedio: 35 },
  { sprint: 'Sprint SP_3', sp: 50, promedio: 41 },
  { sprint: 'Sprint SP_4', sp: 46, promedio: 42 }
];

const mockBurndownData = [
  { day: 'D1', real: 42, ideal: 42 },
  { day: 'D2', real: 38, ideal: 37 },
  { day: 'D3', real: 34, ideal: 33 },
  { day: 'D4', real: 28, ideal: 28 },
  { day: 'D5', real: 23, ideal: 23 },
  { day: 'D6', real: 18, ideal: 18 },
  { day: 'D7', real: 13, ideal: 13 },
  { day: 'D8', real: 9, ideal: 9 },
  { day: 'D9', real: 4, ideal: 4 },
  { day: 'D10', real: 0, ideal: 0 }
];

// Datos para la Gráfica de Dona de Distribución del Trabajo
const mockDistributionData = [
  { name: 'Historias de Usuario', value: 11, percentage: 79, color: '#8b5cf6', icon: User },
  { name: 'Bugs y Defectos', value: 3, percentage: 21, color: '#ec4899', icon: Bug },
  { name: 'Tareas / Deuda Técnica', value: 0, percentage: 0, color: '#64748b', icon: FileText }
];

// Tooltip flotante informativo que aparece ÚNICAMENTE al pasar el cursor sobre el ícono (i)
const InfoTooltip = ({ text, align = 'center' }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => e.stopPropagation()} 
      className="relative inline-flex items-center cursor-pointer ml-1.5 z-10"
    >
      <Info 
        size={14} 
        className="text-slate-400 dark:text-slate-400 hover:text-cyan-400 dark:hover:text-cyan-300 transition-colors shrink-0" 
      />
      
      {isHovered && (
        <div className={`absolute z-50 p-3 bg-slate-950/95 backdrop-blur-md text-slate-100 text-xs font-medium rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.9)] border border-slate-700/80 pointer-events-none leading-relaxed text-left w-64 animate-in fade-in duration-150 ${
          align === 'right' 
            ? 'top-full mt-2.5 right-0' 
            : 'bottom-full mb-2.5 left-1/2 -translate-x-1/2'
        }`}>
          <span className="block">{text}</span>
          {align === 'right' ? (
            <div className="absolute bottom-full right-3 -mb-px w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-slate-950/95" />
          ) : (
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-950/95" />
          )}
        </div>
      )}
    </div>
  );
};

// Datos de Drill-down de incidencias por KPI (HU-015)
const mockKpiDrilldownData = {
  points: {
    title: 'Puntos Entregados (Velocity - HU-011)',
    kpiValue: '30 Story Points',
    description: 'Historias de usuario y tareas completadas en el sprint actual (Sprint SP_4).',
    issues: [
      { key: 'MCHAV-101', title: 'Autenticación mediante OAuth 2.0 y JWT', type: 'Historia', status: 'Done', sp: 8, assignee: 'Camilo Corredor', date: '2026-08-02' },
      { key: 'MCHAV-104', title: 'Crear componentes de gráficos Recharts', type: 'Historia', status: 'Done', sp: 5, assignee: 'Heidy Lozano', date: '2026-08-03' },
      { key: 'MCHAV-105', title: 'Servicio REST para cálculo de Velocity', type: 'Historia', status: 'Done', sp: 5, assignee: 'Andrés Alcalá', date: '2026-08-03' },
      { key: 'MCHAV-108', title: 'Configuración de Dockerfile y Compose', type: 'Tarea', status: 'Done', sp: 8, assignee: 'Valentina Hoyos', date: '2026-08-04' },
      { key: 'MCHAV-110', title: 'Filtro global por rango de fechas', type: 'Historia', status: 'Done', sp: 4, assignee: 'Michael Salamanca', date: '2026-08-04' }
    ]
  },
  completed: {
    title: 'Tareas Completadas (Throughput)',
    kpiValue: '10 de 14 Incidencias (71%)',
    description: 'Incidencias resueltas exitosamente durante el ciclo del sprint.',
    issues: [
      { key: 'MCHAV-101', title: 'Autenticación mediante OAuth 2.0 y JWT', type: 'Historia', status: 'Done', sp: 8, assignee: 'Camilo Corredor', date: '2026-08-02' },
      { key: 'MCHAV-102', title: 'Integración API v3 de Jira Cloud', type: 'Historia', status: 'Done', sp: 5, assignee: 'Andrés Alcalá', date: '2026-08-02' },
      { key: 'MCHAV-103', title: 'Diseño de la base de datos PostgreSQL', type: 'Tarea', status: 'Done', sp: 3, assignee: 'Valentina Hoyos', date: '2026-08-02' },
      { key: 'MCHAV-104', title: 'Crear componentes de gráficos Recharts', type: 'Historia', status: 'Done', sp: 5, assignee: 'Heidy Lozano', date: '2026-08-03' },
      { key: 'MCHAV-105', title: 'Servicio REST para cálculo de Velocity', type: 'Historia', status: 'Done', sp: 5, assignee: 'Andrés Alcalá', date: '2026-08-03' },
      { key: 'MCHAV-106', title: 'Implementar sanitización de consultas JQL', type: 'Tarea', status: 'Done', sp: 3, assignee: 'Michael Salamanca', date: '2026-08-03' },
      { key: 'MCHAV-107', title: 'Maquetación de la Consola JQL', type: 'Historia', status: 'Done', sp: 3, assignee: 'Heidy Lozano', date: '2026-08-03' },
      { key: 'MCHAV-108', title: 'Configuración de Dockerfile y Compose', type: 'Tarea', status: 'Done', sp: 8, assignee: 'Valentina Hoyos', date: '2026-08-04' },
      { key: 'MCHAV-109', title: 'Pruebas unitarias en Backend con Pytest', type: 'Tarea', status: 'Done', sp: 3, assignee: 'Michael Salamanca', date: '2026-08-04' },
      { key: 'MCHAV-110', title: 'Filtro global por rango de fechas', type: 'Historia', status: 'Done', sp: 4, assignee: 'Michael Salamanca', date: '2026-08-04' }
    ]
  },
  cycle: {
    title: 'Tiempo de Ciclo Promedio (Cycle Time - HU-012)',
    kpiValue: '4.2 Días Promedio',
    description: 'Tiempo transcurrido desde que la tarea entra en desarrollo ("In Progress") hasta su resolución.',
    issues: [
      { key: 'MCHAV-101', title: 'Autenticación mediante OAuth 2.0 y JWT', type: 'Historia', status: 'Done', cycleTime: '3.5d', assignee: 'Camilo Corredor', date: '2026-08-02' },
      { key: 'MCHAV-104', title: 'Crear componentes de gráficos Recharts', type: 'Historia', status: 'Done', cycleTime: '4.8d', assignee: 'Heidy Lozano', date: '2026-08-03' },
      { key: 'MCHAV-105', title: 'Servicio REST para cálculo de Velocity', type: 'Historia', status: 'Done', cycleTime: '4.0d', assignee: 'Andrés Alcalá', date: '2026-08-03' },
      { key: 'MCHAV-108', title: 'Configuración de Dockerfile y Compose', type: 'Tarea', status: 'Done', cycleTime: '5.2d', assignee: 'Valentina Hoyos', date: '2026-08-04' },
      { key: 'MCHAV-110', title: 'Filtro global por rango de fechas', type: 'Historia', status: 'Done', cycleTime: '3.5d', assignee: 'Michael Salamanca', date: '2026-08-04' }
    ]
  },
  retrabajo: {
    title: 'Tasa de Retrabajo / Defectos (Bugs)',
    kpiValue: '21% (3 Bugs en Sprint)',
    description: 'Relación de incidencias de tipo Bug reportadas frente al volumen del sprint.',
    issues: [
      { key: 'MCHAV-112', title: 'Error de desbordamiento en tooltip de Recharts', type: 'Bug', status: 'In Progress', severity: 'Alta', assignee: 'Heidy Lozano', date: '2026-08-03' },
      { key: 'MCHAV-114', title: 'Fallo de timeout en token OAuth de Jira', type: 'Bug', status: 'Done', severity: 'Crítica', assignee: 'Camilo Corredor', date: '2026-08-02' },
      { key: 'MCHAV-115', title: 'Reintentos infinitos en worker ETL en segundo plano', type: 'Bug', status: 'To Do', severity: 'Media', assignee: 'Valentina Hoyos', date: '2026-08-04' }
    ]
  }
};

// Datos de Bugs y Cuellos de Botella para el modo enfocado de Salud del Sprint
const mockSprintBugsList = [
  { key: 'PA-112', summary: 'Bug crítico en pasarela de pagos durante checkout', status: 'En Curso', assignee: 'Stephany Leon', severity: 'Crítica' },
  { key: 'PA-111', summary: 'Tarea demorada en homologación de roles de usuario', status: 'En Curso', assignee: 'Carlos Perez', severity: 'Alta' },
  { key: 'PA-108', summary: 'Falla de renderizado en modal de reporte en Safari', status: 'Por Hacer', assignee: 'Ana Martinez', severity: 'Media' },
  { key: 'PA-104', summary: 'Error 500 al exportar listado masivo a formato CSV', status: 'En Revisión', assignee: 'David Gomez', severity: 'Alta' },
  { key: 'PA-99',  summary: 'Inconsistencia de decimales en cálculo de tiempo', status: 'Por Hacer', assignee: 'Stephany Leon', severity: 'Baja' },
  { key: 'PA-94',  summary: 'Timeout intermitente al sincronizar webhooks con Jira', status: 'En Curso', assignee: 'Carlos Perez', severity: 'Crítica' }
];

function DashboardView({ subTab = 'dashboard', selectedProjectId, metrics, kpis }) {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false); // Estado de animación del botón de refresco
  const [showActiveToast, setShowActiveToast] = useState(true);
  
  // Estado para el modo enfocado de Bugs de Salud del Sprint (Backdrop blur)
  const [isBugsFocused, setIsBugsFocused] = useState(false);
  const [bugsPage, setBugsPage] = useState(1);
  const [bugsSearch, setBugsSearch] = useState('');

  // Estado para el modal de drill-down de KPI (HU-015)
  const [drilldownKey, setDrilldownKey] = useState(null);
  const [drilldownSearch, setDrilldownSearch] = useState('');

  // Estado para el Modal de Drill-down por API (HU-015)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMetricType, setModalMetricType] = useState('all');

  const openDrillDown = (title, metricType) => {
    setModalTitle(title);
    setModalMetricType(metricType);
    setIsModalOpen(true);
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Crítica':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'Alta':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Media':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const bugsPageSize = 4;
  const filteredBugs = useMemo(() => {
    const q = bugsSearch.trim().toLowerCase();
    if (!q) return mockSprintBugsList;
    return mockSprintBugsList.filter(b => 
      b.key.toLowerCase().includes(q) ||
      b.summary.toLowerCase().includes(q) ||
      b.assignee.toLowerCase().includes(q) ||
      b.severity.toLowerCase().includes(q)
    );
  }, [bugsSearch]);

  const totalBugsPages = Math.ceil(filteredBugs.length / bugsPageSize) || 1;
  const paginatedBugs = useMemo(() => {
    const start = (bugsPage - 1) * bugsPageSize;
    return filteredBugs.slice(start, start + bugsPageSize);
  }, [filteredBugs, bugsPage, bugsPageSize]);

  const isPending = user?.status === 'PENDING' && user?.rol === 'MANAGER';

  useEffect(() => {
    if (user?.rol === 'MANAGER' && !isPending) {
      setShowActiveToast(true);
      const timer = setTimeout(() => setShowActiveToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isPending, user?.rol]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Función para exportar reporte en PDF (HU-016)
  const handleExportPDF = () => {
    if (selectedProjectId && reportService?.downloadPdfReport) {
      reportService.downloadPdfReport(selectedProjectId);
    } else {
      window.print();
    }
  };

  // Estilo dinámico de Recharts Tooltip con variables CSS de tema
  const tooltipStyle = {
    backgroundColor: 'var(--bg-card)',
    borderColor: 'var(--border-color)',
    borderRadius: '12px',
    color: 'var(--text-main)',
    fontSize: '12px',
    boxShadow: 'var(--shadow-card)'
  };

  const activeDrilldown = drilldownKey ? mockKpiDrilldownData[drilldownKey] : null;

  const filteredDrilldownIssues = useMemo(() => {
    if (!activeDrilldown) return [];
    const q = drilldownSearch.trim().toLowerCase();
    if (!q) return activeDrilldown.issues;
    return activeDrilldown.issues.filter(
      iss => iss.key.toLowerCase().includes(q) ||
             iss.title.toLowerCase().includes(q) ||
             iss.assignee.toLowerCase().includes(q) ||
             iss.type.toLowerCase().includes(q)
    );
  }, [activeDrilldown, drilldownSearch]);

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      
      {/* CUADRO DE NOTIFICACIÓN DE ESTADO PENDIENTE PARA MANAGER */}
      {isPending && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 dark:border-amber-500/40 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0 mt-0.5">
              <Clock size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-amber-200">
                  ⏳ Estado: Pendiente de Asignación de Rol de Líder Técnico
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Tu solicitud ha sido enviada al Administrador. Una vez aprobada, tendrás acceso completo a la gestión de proyectos y tableros consolidados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TOAST FLOTANTE TEMPORAL DE ROL ACTIVADO (MÁNAGER) */}
      {!isPending && user?.rol === 'MANAGER' && showActiveToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 shadow-md flex items-center justify-between gap-3 text-emerald-900 dark:text-emerald-300 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold shrink-0">
              <Shield size={18} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold">🎉 ¡Rol Activado: Líder Técnico (MANAGER)!</h4>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">El Administrador te ha asignado el acceso a los tableros consolidados y métricas del equipo.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowActiveToast(false)}
            className="text-emerald-500 hover:text-emerald-700 p-1 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* 1. CABECERA: HISTÓRICO GENERAL, BOTÓN DE REFRESCO Y EXPORTACIÓN A PDF (HU-016) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-500 dark:text-indigo-400 font-extrabold flex items-center justify-center text-base border border-indigo-500/30 shadow-sm">
            M
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Histórico general
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Rendimiento consolidado del sprint actual</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón Exportar PDF (HU-016) */}
          <button
            onClick={handleExportPDF}
            className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
            title="Exportar reporte consolidado en PDF (HU-016)"
          >
            <FileDown size={16} />
            <span>Exportar PDF</span>
          </button>

          {/* Botón de Refrescar Datos */}
          <button
            onClick={handleRefresh}
            className="h-10 w-10 rounded-xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm flex items-center justify-center"
            title="Actualizar datos del sprint"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-indigo-500' : ''} />
          </button>
        </div>
      </div>

      {/* Overlay de fondo desenfocado (Backdrop Blur) cuando se activa la vista de bugs */}
      {isBugsFocused && (
        <div 
          onClick={() => setIsBugsFocused(false)}
          className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md z-40 transition-all duration-300 animate-in fade-in"
        />
      )}

      {/* 2. SECCIÓN SUPERIOR: SALUD DEL SPRINT Y DISTRIBUCIÓN / MODO BUGS FOCUSED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch relative">
        
        {/* Columna 1 (Izquierda): Salud del Sprint */}
        <div className={`p-5 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm dark:shadow-[0_8px_30px_rgba(25,28,61,0.5)] flex flex-col justify-between transition-all duration-300 ${
          isBugsFocused ? 'relative z-50 ring-2 ring-amber-500/60 shadow-2xl' : ''
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Salud del sprint</h3>
              {!isBugsFocused && (
                <InfoTooltip text="Evaluación general que mide si el equipo avanza a buen ritmo sin bloqueos o errores graves." />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Salud calculada sobre bugs críticos y cuellos de botella</p>
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500"
                  strokeDasharray="75, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white">75%</span>
                <span className="text-[10px] font-extrabold tracking-widest text-amber-500 dark:text-amber-400 uppercase">ESTABLE</span>
              </div>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-2">
              El sprint necesita seguimiento para evitar retrasos.
            </p>
          </div>

          {/* Botón Cargar Bugs / Ocultar Bugs */}
          <button
            onClick={() => {
              setIsBugsFocused(!isBugsFocused);
              setBugsPage(1);
            }}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 ${
              isBugsFocused 
                ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            <Bug size={15} />
            <span>{isBugsFocused ? 'Ocultar bugs' : 'Cargar bugs'}</span>
          </button>
        </div>

        {/* Si isBugsFocused es TRUE: Mostramos la Tabla de Bugs ocupando Columna 2 y 3 sin desenfoque */}
        {isBugsFocused ? (
          <div className="lg:col-span-2 relative z-50 p-5 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-2xl flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
            <div>
              {/* Header de la Tabla de Bugs */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Bug size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Bugs y Cuellos de Botella
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {filteredBugs.length} incidencias
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Listado de fallos del sprint actual</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Buscador de bugs */}
                  <div className="relative w-44">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      type="text"
                      placeholder="Buscar bug..."
                      value={bugsSearch}
                      onChange={(e) => {
                        setBugsSearch(e.target.value);
                        setBugsPage(1);
                      }}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Botón cerrar X */}
                  <button
                    onClick={() => setIsBugsFocused(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Cerrar vista de bugs"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Tabla de Bugs */}
              <div className="mt-3 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden min-h-[220px]">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 table-fixed">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
                    <tr className="h-9">
                      <th className="px-3 w-[90px]">Clave</th>
                      <th className="px-3">Resumen / Título</th>
                      <th className="px-3 w-[110px]">Estado</th>
                      <th className="px-3 w-[120px]">Asignado</th>
                      <th className="px-3 w-[90px] text-center">Severidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {paginatedBugs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No hay bugs que coincidan con la búsqueda.
                        </td>
                      </tr>
                    ) : (
                      paginatedBugs.map((bug) => (
                        <tr key={bug.key} className="h-10 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-3 font-bold text-amber-600 dark:text-amber-400 font-mono">
                            {bug.key}
                          </td>
                          <td className="px-3 font-semibold text-slate-900 dark:text-white truncate">
                            {bug.summary}
                          </td>
                          <td className="px-3">
                            <span className="px-2 py-0.5 border rounded-lg text-[10px] font-semibold inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                              {bug.status}
                            </span>
                          </td>
                          <td className="px-3 text-slate-600 dark:text-slate-300 truncate">
                            {bug.assignee}
                          </td>
                          <td className="px-3 text-center">
                            <span className={`px-2 py-0.5 border rounded-lg text-[10px] font-bold ${getSeverityBadge(bug.severity)}`}>
                              {bug.severity}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación de la Tabla de Bugs */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 mt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Página {bugsPage} de {totalBugsPages} ({filteredBugs.length} bugs)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={bugsPage === 1}
                  onClick={() => setBugsPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Anterior
                </button>
                <button
                  disabled={bugsPage >= totalBugsPages}
                  onClick={() => setBugsPage((p) => Math.min(totalBugsPages, p + 1))}
                  className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Columna 2 (Centro/Izquierda): Distribución del Trabajo */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm dark:shadow-[0_8px_30px_rgba(25,28,61,0.5)] flex flex-col justify-start gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Distribución del trabajo</h3>
                  <InfoTooltip text="Muestra en qué porcentaje se dividió el tiempo entre crear nuevas funciones, arreglar fallos o hacer mejoras técnicas." />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Por tipo de incidencia, sprint actual</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 mt-1">
                <div className="h-44 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {mockDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-xl font-black text-slate-900 dark:text-white">14</span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Incidencias</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {mockDistributionData.map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <div className="flex items-center gap-1.5">
                            <IconComponent size={13} className="text-slate-500 dark:text-slate-400" />
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {item.value} <span className="text-slate-500 dark:text-slate-400 text-[10px]">({item.percentage}%)</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Columna 3 (Derecha): Tarjetas KPI (Última Sincronización, Tiempo de Ciclo y Lead Time Promedio) */}
            <div className="flex flex-col gap-3 justify-between">
              
              {/* Tarjeta 1: Última Sincronización (Ubicada ARRIBA) */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm dark:shadow-[0_8px_30px_rgba(25,28,61,0.5)] hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                      <RefreshCw size={13} className="text-indigo-500 dark:text-indigo-400 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-extrabold">ÚLTIMA SINCRONIZACIÓN</span>
                    </div>
                    <InfoTooltip align="right" text="Fecha, hora y usuario responsable de la última actualización de datos desde Jira Cloud." />
                  </div>

                  <div className="mt-2.5 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        10 Ago 2026, 10:45 AM
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        Exitosa
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                      <User size={12} className="text-indigo-400 shrink-0" />
                      <span className="truncate">{user?.nombre || user?.email ? (user.nombre || user.email) : 'Valentina Hoyos'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI 2: Tiempo de Ciclo */}
              {(() => {
                const cycleTimeNum = kpis && kpis.length > 0 ? parseFloat(kpis[kpis.length - 1].cycle_time_promedio_dias) : 4.2;
                let colorClass = "text-emerald-500 dark:text-emerald-400";
                let bgBtnClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20";
                let borderClass = "border-emerald-200 dark:border-emerald-500/50";
                let shadowClass = "shadow-sm dark:shadow-[0_4px_20px_rgba(16,185,129,0.15)]";
                let statusText = "Óptimo";

                if (cycleTimeNum > 14) {
                  colorClass = "text-rose-500 dark:text-rose-400";
                  bgBtnClass = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20";
                  borderClass = "border-rose-200 dark:border-rose-500/50";
                  shadowClass = "shadow-sm dark:shadow-[0_4px_20px_rgba(244,63,94,0.15)]";
                  statusText = "Crítico";
                } else if (cycleTimeNum > 7) {
                  colorClass = "text-amber-500 dark:text-amber-400";
                  bgBtnClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20";
                  borderClass = "border-amber-200 dark:border-amber-500/50";
                  shadowClass = "shadow-sm dark:shadow-[0_4px_20px_rgba(245,158,11,0.15)]";
                  statusText = "En Riesgo";
                }

                return (
                  <div 
                    onClick={() => openDrillDown('Tiempo de Ciclo Promedio', 'cycle_time')}
                    className={`p-3.5 rounded-2xl bg-white dark:bg-[#191c3d] border ${borderClass} ${shadowClass} transition-all duration-200 flex flex-col justify-between relative group cursor-pointer hover:shadow-md`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                          <Clock size={13} className={`${colorClass} shrink-0`} />
                          <span className="text-slate-700 dark:text-slate-300 font-extrabold">TIEMPO DE CICLO</span>
                          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white dark:bg-[#191c3d] border ${borderClass} ${colorClass}`}>{statusText}</span>
                        </div>
                        <InfoTooltip align="right" text="Días promedio que tarda el equipo en terminar una tarea desde que empieza a trabajar en ella. Haz clic para ver el detalle." />
                      </div>

                      <div className="flex items-baseline justify-between mt-2.5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {cycleTimeNum}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">días</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border transition-all flex items-center gap-1 ${bgBtnClass}`}>
                          Ver detalle
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* KPI 3: Lead Time Promedio */}
              <div 
                onClick={() => openDrillDown('Lead Time Promedio', 'lead_time')}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] hover:border-cyan-500/60 dark:hover:border-cyan-500/60 shadow-sm dark:shadow-[0_8px_30px_rgba(25,28,61,0.5)] hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                      <Clock size={13} className="text-cyan-500 dark:text-cyan-400 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-extrabold">LEAD TIME PROMEDIO</span>
                    </div>
                    <InfoTooltip align="right" text="Días promedio que transcurren desde que se solicita o crea una tarea hasta su resolución final. Haz clic para ver el detalle." />
                  </div>

                  <div className="flex items-baseline justify-between mt-2.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {kpis && kpis.length > 0 ? kpis[kpis.length - 1].lead_time_promedio_dias : 6.8}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">días</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all flex items-center gap-1">
                      Ver detalle
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

      </div>

      {/* 3. SECCIÓN INFERIOR SEGÚN BOCETO: 2 COLUMNAS (VELOCIDAD POR SPRINT Y PROGRESO DE TAREAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Velocidad por Sprint */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm dark:shadow-[0_8px_30px_rgba(25,28,61,0.5)] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Velocidad por Sprint</h3>
              <InfoTooltip text="Muestra cuánto trabajo ha entregado el equipo en cada período para ver si el ritmo aumenta o se mantiene." />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Evolución del rendimiento en story points</p>
          </div>

          <div className="h-84 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mockSprintVelocity} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                <XAxis dataKey="sprint" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Bar dataKey="sp" fill="#6366f1" radius={[6, 6, 0, 0]} name="Story Points" barSize={36} />
                <Line type="monotone" dataKey="promedio" stroke="#10b981" strokeWidth={3} dot={false} name="Promedio histórico" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progreso de tareas (Burndown) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm dark:shadow-[0_8px_30px_rgba(25,28,61,0.5)] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Progreso de tareas (Burndown)</h3>
              <InfoTooltip text="Muestra cómo va disminuyendo el trabajo pendiente día a día comparado con la meta ideal de entrega." />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Esfuerzo restante en story points vs. ideal</p>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockBurndownData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="real" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5, fill: '#8b5cf6' }} name="REAL" />
                <Line type="monotone" dataKey="ideal" stroke="#10b981" strokeDasharray="4 4" strokeWidth={2} dot={false} name="IDEAL" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium pt-1 flex items-center gap-1.5">
            ✨ Avance óptimo. El ritmo real de quemado coincide casi a la perfección con la línea ideal de entrega.
          </p>
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
