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

// Tooltip flotante informativo
const InfoTooltip = ({ text }) => (
  <div className="group relative inline-block cursor-help ml-1 z-30">
    <Info size={13} className="text-slate-400 hover:text-indigo-500 transition-colors" />
    <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-905 dark:bg-slate-900 text-slate-100 dark:text-slate-100 text-[11px] rounded-xl shadow-2xl border border-slate-800 pointer-events-none leading-snug">
      {text}
    </div>
  </div>
);

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

function DashboardView({ subTab = 'dashboard', selectedProjectId, metrics, kpis }) {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false); // Estado de animación del botón de refresco
  const [showActiveToast, setShowActiveToast] = useState(true);
  
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
            className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm flex items-center justify-center"
            title="Actualizar datos del sprint"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-indigo-500' : ''} />
          </button>
        </div>
      </div>

      {/* 2. FILA DE 4 TARJETAS KPI SUPERIORES (INTERACTIVAS CON DRILL-DOWN HU-015) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Puntos Entregados (SP) */}
        <div 
          onClick={() => {
            setDrilldownKey('points');
            openDrillDown('Puntos Entregados (Velocity)', 'velocity');
          }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 hover:border-purple-500/60 dark:hover:border-purple-500/60 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide">
              <Zap size={14} className="text-purple-500 dark:text-purple-400 shrink-0" />
              <span>Puntos Entregados</span>
            </div>
            <InfoTooltip text="Suma de Story Points (SP) de las tareas finalizadas en este sprint. Haz clic para ver el desglose por ticket (HU-015)." />
          </div>
          <div className="flex items-baseline justify-between mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {kpis && kpis.length > 0 ? kpis[kpis.length - 1].velocity_total_sp : 30}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">SP</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              🔍 Ver detalle
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-purple-600 dark:text-purple-400 font-extrabold">
            <span>Ver desglose de tickets Jira</span>
            <Search size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 2: Tareas Completadas */}
        <div 
          onClick={() => {
            setDrilldownKey('completed');
            openDrillDown('Tareas Completadas (Throughput)', 'throughput');
          }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 hover:border-teal-500/60 dark:hover:border-teal-500/60 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide">
              <CheckCircle2 size={14} className="text-teal-500 dark:text-teal-400 shrink-0" />
              <span>Tareas Completadas</span>
            </div>
            <InfoTooltip text="Cantidad de tareas completadas en relación al total planificado. Haz clic para ver la lista de tickets (HU-015)." />
          </div>
          <div className="flex items-baseline justify-between mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {kpis && kpis.length > 0 ? kpis[kpis.length - 1].throughput_issues : 10}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">tickets</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1">
              🔍 Ver detalle
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-teal-600 dark:text-teal-400 font-extrabold">
            <span>Ver desglose de tickets Jira</span>
            <Search size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 3: Tiempo de Ciclo */}
        <div 
          onClick={() => {
            setDrilldownKey('cycle');
            openDrillDown('Tiempo de Ciclo Promedio', 'cycle_time');
          }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/60 dark:hover:border-amber-500/60 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide">
              <Clock size={14} className="text-amber-500 dark:text-amber-400 shrink-0" />
              <span>Tiempo de Ciclo</span>
            </div>
            <InfoTooltip text="Días promedio que tarda una tarea en completarse desde que inicia desarrollo (HU-012/HU-015)." />
          </div>
          <div className="flex items-baseline justify-between mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {kpis && kpis.length > 0 ? kpis[kpis.length - 1].cycle_time_promedio_dias : 4.2}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">días</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              🔍 Ver detalle
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-amber-600 dark:text-amber-400 font-extrabold">
            <span>Ver desglose de tickets Jira</span>
            <Search size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* KPI 4: Lead Time Promedio */}
        <div 
          onClick={() => {
            setDrilldownKey('retrabajo');
            openDrillDown('Lead Time Promedio', 'lead_time');
          }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 hover:border-cyan-500/60 dark:hover:border-cyan-500/60 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide">
              <Clock size={14} className="text-cyan-500 dark:text-cyan-400 shrink-0" />
              <span>Lead Time Promedio</span>
            </div>
            <InfoTooltip text="Días promedio desde la creación de la incidencia hasta su resolución final (HU-012/HU-015)." />
          </div>
          <div className="flex items-baseline justify-between mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {kpis && kpis.length > 0 ? kpis[kpis.length - 1].lead_time_promedio_dias : 6.8}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">días</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
              🔍 Ver detalle
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-cyan-600 dark:text-cyan-400 font-extrabold">
            <span>Ver desglose de tickets Jira</span>
            <Search size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

      </div>

      {/* 3. FILA MEDIA: GRÁFICAS DE VELOCIDAD Y BURNDOWN (CON ESPACIADO MODERNO Y BORDE SLEEK) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfica 1: Velocidad por Sprint */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-xl space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Velocidad por Sprint</h3>
              <InfoTooltip text="Evolución del rendimiento en Story Points a lo largo de los sprints finalizados." />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Evolución del rendimiento en story points</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mockSprintVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="sprint" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Bar dataKey="sp" fill="#6366f1" radius={[4, 4, 0, 0]} name="Story Points" barSize={32} />
                <Line type="monotone" dataKey="promedio" stroke="#10b981" strokeWidth={3} dot={false} name="Promedio histórico" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 2: Progreso de Tareas (Burndown) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Progreso de tareas (Burndown)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Esfuerzo restante en story points vs. ideal</p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockBurndownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="real" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} name="REAL" />
                <Line type="monotone" dataKey="ideal" stroke="#10b981" strokeDasharray="4 4" strokeWidth={2} dot={false} name="IDEAL" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium pt-1 flex items-center gap-1.5">
            ✨ Avance óptimo. El ritmo real de quemado coincide casi a la perfección con la línea ideal de entrega.
          </p>
        </div>

      </div>

      {/* 4. FILA INFERIOR: SALUD DEL SPRINT Y DISTRIBUCIÓN DE TRABAJO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bloque Salud del Sprint */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-xl space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Salud del sprint</h3>
              <InfoTooltip text="Salud calculada sobre bugs críticos y cuellos de botella detectados." />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Salud calculada sobre bugs críticos y cuellos de botella</p>
          </div>

          {/* Anillo de Medición Circular de Salud */}
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

          {/* Alertas de Incidencias Críticas */}
          <div className="space-y-2 pt-1">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-slate-300 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-500 dark:text-amber-400 shrink-0" />
              <span><strong>PA-112:</strong> Bug crítico asignado a <strong>Stephany Leon</strong> requiere atención inmediata.</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-slate-300 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-500 dark:text-amber-400 shrink-0" />
              <span><strong>PA-111:</strong> Tarea demorada (5.8d en curso). Sugerencia: revisar con <strong>Carlos Perez</strong> en la Daily.</span>
            </div>
          </div>
        </div>

        {/* Bloque Gráfica de Dona: Distribución del Trabajo */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Distribución del trabajo</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Por tipo de incidencia, sprint actual</p>
          </div>

          {/* GRÁFICA DE DONA DE RECHARTS CON LEYENDA E INTERACTIVIDAD JS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-2">
            
            {/* Gráfica de Dona con Centro Total */}
            <div className="h-48 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
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

            {/* Leyenda y Porcentajes de la Dona */}
            <div className="space-y-3">
              {mockDistributionData.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <div className="flex items-center gap-1.5">
                        <IconComponent size={14} className="text-slate-500 dark:text-slate-400" />
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

      </div>

      {/* 5. MODAL DE DRILL-DOWN DE INCIDENCIAS (HU-015) */}
      {drilldownKey && activeDrilldown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left max-h-[85vh] flex flex-col">
            
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {activeDrilldown.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeDrilldown.description}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setDrilldownKey(null); setDrilldownSearch(''); }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Fila de Estadísticas y Buscador */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-black">
                  Valor KPI: {activeDrilldown.kpiValue}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {filteredDrilldownIssues.length} incidencias listadas
                </span>
              </div>

              {/* Buscador interno */}
              <div className="relative min-w-[220px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por ticket, título o desarrollador..."
                  value={drilldownSearch}
                  onChange={(e) => setDrilldownSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
            </div>

            {/* Tabla de Incidencias Trazables */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden overflow-y-auto flex-1 shadow-inner">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4">Clave Ticket</th>
                    <th className="py-3 px-4">Título / Historia</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Estado</th>
                    {drilldownKey === 'points' && <th className="py-3 px-4 text-center">SP</th>}
                    {drilldownKey === 'cycle' && <th className="py-3 px-4 text-center">Tiempo Ciclo</th>}
                    <th className="py-3 px-4">Asignado</th>
                    <th className="py-3 px-4">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-200 font-medium">
                  {filteredDrilldownIssues.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        No se encontraron tickets con el filtro de búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredDrilldownIssues.map((iss) => (
                      <tr key={iss.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <span>{iss.key}</span>
                          <ExternalLink size={11} className="opacity-60" />
                        </td>
                        <td className="py-3 px-4 max-w-[280px] truncate font-bold text-slate-900 dark:text-slate-100">
                          {iss.title}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            iss.type === 'Bug' 
                              ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30'
                              : 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-500/30'
                          }`}>
                            {iss.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            iss.status === 'Done'
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : iss.status === 'In Progress'
                              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            {iss.status}
                          </span>
                        </td>
                        {drilldownKey === 'points' && (
                          <td className="py-3 px-4 text-center font-extrabold text-purple-600 dark:text-purple-400">
                            {iss.sp} SP
                          </td>
                        )}
                        {drilldownKey === 'cycle' && (
                          <td className="py-3 px-4 text-center font-extrabold text-amber-600 dark:text-amber-400">
                            {iss.cycleTime}
                          </td>
                        )}
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {iss.assignee}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                          {iss.date}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pie del Modal */}
            <div className="flex justify-end pt-1 shrink-0">
              <button
                onClick={() => { setDrilldownKey(null); setDrilldownSearch(''); }}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Cerrar Desglose
              </button>
            </div>

          </div>
        </div>
      )}

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
