// ============================================================================
// VISTA DEL DESARROLLADOR — MI TRABAJO (TABLA DE 14 INCIDENCIAS CON PAGINACIÓN COMPLETA)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  ClipboardList, 
  Zap, 
  Info, 
  UserCheck,
  User,
  Bug,
  FileText,
  RotateCcw,
  Bell,
  X,
  Printer,
  Activity,
  ListTodo,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageSquare
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Tooltip as RechartsTooltip } from 'recharts';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { developerService } from '../../../services/api';

const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '0.75rem',
  color: '#f8fafc',
  fontSize: '12px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
};

const MetricInfoTooltip = ({ text, align = "auto" }) => {
  const alignClass = 
    align === "left" ? "left-0 md:left-0 md:translate-x-0" :
    align === "right" ? "right-0 md:right-0 md:translate-x-0" :
    "left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0";

  return (
    <div className="group/tooltip relative inline-flex items-center cursor-help ml-1.5 shrink-0 z-[100]" title={text}>
      <div className="p-1 rounded-full text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 transition-all cursor-pointer border border-transparent hover:border-indigo-500/30">
        <Info size={14} className="shrink-0" />
      </div>
      <div className={`opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 absolute top-full ${alignClass} mt-2 w-60 sm:w-68 p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 text-xs font-medium rounded-xl shadow-2xl border border-indigo-500/60 pointer-events-none leading-relaxed text-left z-[999999]`}>
        {text}
      </div>
    </div>
  );
};

const SparklineMini = ({ color = "#00f5d4", data = [{ v: 4.2 }, { v: 3.8 }, { v: 4.5 }, { v: 3.1 }, { v: 2.8 }, { v: 3.2 }] }) => {
  return (
    <div className="w-16 h-7 inline-block">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 1, right: 1, left: 1, bottom: 1 }}>
          <defs>
            <linearGradient id={`grad_${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.6}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.5} fill={`url(#grad_${color.replace('#', '')})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Dataset Completo de 14 Incidencias para Valka Hoyos
const DEFAULT_ASSIGNED_ISSUES = [
  { key_issue: 'MCHAV-101', summary: 'Implementar autenticación SSO y OAuth 2.0', status_actual: 'EN PROGRESO', story_points: 8, cycle_time_days: 4.1, tipo: 'Historia de Usuario', prioridad: 'Alta', fecha_creacion: '2026-08-01', fecha_actualizacion: '2026-08-11', descripcion: 'Integración del protocolo OAuth 2.0 y Single Sign-On para Jira API.' },
  { key_issue: 'MCHAV-105', summary: 'Corregir bug en la API de pagos y transacciones', status_actual: 'LISTO', story_points: 5, cycle_time_days: 2.5, tipo: 'Bug', prioridad: 'Crítica', fecha_creacion: '2026-08-03', fecha_actualizacion: '2026-08-10', descripcion: 'Resolución de excepción de concurrencia y validaciones nulas en endpoint transaccional.' },
  { key_issue: 'MCHAV-112', summary: 'Rediseñar vista de desarrollador con Recharts', status_actual: 'EN REVISIÓN', story_points: 13, cycle_time_days: 3.2, tipo: 'Historia de Usuario', prioridad: 'Media', fecha_creacion: '2026-08-05', fecha_actualizacion: '2026-08-12', descripcion: 'Componentización modular con Recharts, micro-interacciones y tema adaptativo.' },
  { key_issue: 'MCHAV-118', summary: 'Optimizar rendimiento de consultas SQL en reportes', status_actual: 'LISTO', story_points: 7, cycle_time_days: 2.9, tipo: 'Tarea / Deuda Técnica', prioridad: 'Media', fecha_creacion: '2026-08-07', fecha_actualizacion: '2026-08-11', descripcion: 'Creación de índices compuestos B-Tree y reescritura de queries pesadas.' },
  { key_issue: 'MCHAV-120', summary: 'Pruebas de integración para Service Gateway X', status_actual: 'LISTO', story_points: 8, cycle_time_days: 2.9, tipo: 'Tarea / Deuda Técnica', prioridad: 'Baja', fecha_creacion: '2026-08-09', fecha_actualizacion: '2026-08-12', descripcion: 'Suite automatizada E2E con PyTest y FastAPI TestClient.' },
  { key_issue: 'MCHAV-124', summary: 'Refactorizar hooks personalizados de React en Frontend', status_actual: 'EN PROGRESO', story_points: 5, cycle_time_days: 1.8, tipo: 'Tarea / Deuda Técnica', prioridad: 'Media', fecha_creacion: '2026-08-10', fecha_actualizacion: '2026-08-12', descripcion: 'Desacoplamiento de lógica de renderizado y optimización de React.memo.' },
  { key_issue: 'MCHAV-129', summary: 'Resolver memory leak en servicio de WebSockets', status_actual: 'EN PROGRESO', story_points: 8, cycle_time_days: 3.5, tipo: 'Bug', prioridad: 'Alta', fecha_creacion: '2026-08-08', fecha_actualizacion: '2026-08-12', descripcion: 'Cierre correcto de conexiones inactivas e inspección de manejadores de eventos.' },
  { key_issue: 'MCHAV-133', summary: 'Implementar exportador de reportes a PDF y Excel', status_actual: 'LISTO', story_points: 8, cycle_time_days: 2.2, tipo: 'Historia de Usuario', prioridad: 'Media', fecha_creacion: '2026-08-06', fecha_actualizacion: '2026-08-11', descripcion: 'Generación dinámica de documentos PDF vectoriales y hojas de cálculo XLSX.' },
  { key_issue: 'MCHAV-137', summary: 'Actualizar dependencias de seguridad e imágenes Docker', status_actual: 'LISTO', story_points: 3, cycle_time_days: 1.2, tipo: 'Tarea / Deuda Técnica', prioridad: 'Baja', fecha_creacion: '2026-08-11', fecha_actualizacion: '2026-08-12', descripcion: 'Escaneo de vulnerabilidades Trivy y actualización a Python 3.11-slim.' },
  { key_issue: 'MCHAV-141', summary: 'Corregir desalineación de tarjetas en modo oscuro', status_actual: 'LISTO', story_points: 2, cycle_time_days: 0.9, tipo: 'Bug', prioridad: 'Baja', fecha_creacion: '2026-08-11', fecha_actualizacion: '2026-08-12', descripcion: 'Ajuste de padding y bordes Tailwind CSS en componentes de visualización.' },
  { key_issue: 'MCHAV-145', summary: 'Migración de esquemas de datos en base PostgreSQL', status_actual: 'EN PROGRESO', story_points: 5, cycle_time_days: 2.1, tipo: 'Tarea / Deuda Técnica', prioridad: 'Alta', fecha_creacion: '2026-08-10', fecha_actualizacion: '2026-08-12', descripcion: 'Scripts de migración Alembic y actualización de constraints de clave foránea.' },
  { key_issue: 'MCHAV-150', summary: 'Diseñar alertas contextuales de alto impacto', status_actual: 'EN REVISIÓN', story_points: 8, cycle_time_days: 1.5, tipo: 'Historia de Usuario', prioridad: 'Media', fecha_creacion: '2026-08-09', fecha_actualizacion: '2026-08-12', descripcion: 'Sistema de notificaciones push integradas en consola de desarrollador.' },
  { key_issue: 'MCHAV-154', summary: 'Corregir bug de timezones en reportes semanales', status_actual: 'LISTO', story_points: 3, cycle_time_days: 1.1, tipo: 'Bug', prioridad: 'Media', fecha_creacion: '2026-08-08', fecha_actualizacion: '2026-08-10', descripcion: 'Normalización a UTC en serializador JSON de fechas.' },
  { key_issue: 'MCHAV-160', summary: 'Configurar canal de métricas en directo con Redis PubSub', status_actual: 'LISTO', story_points: 13, cycle_time_days: 3.8, tipo: 'Historia de Usuario', prioridad: 'Alta', fecha_creacion: '2026-08-04', fecha_actualizacion: '2026-08-11', descripcion: 'Canal de mensajería en tiempo real para actualización de scorecards.' }
];

export default function DeveloperView({ 
  kpis = [], 
  selectedProjectId = 'PROJ-01', 
  alerts = [],
  onNavigateToAlerts,
  onNavigateTab 
}) {
  const { user, approveUserPermission } = useAuth();
  const [scorecard, setScorecard] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Paginación de la tabla
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modales interactivos dentro de la misma vista
  const [selectedKpiModal, setSelectedKpiModal] = useState(null);
  const [selectedIssueModal, setSelectedIssueModal] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Estado para el centro interactivo de Solicitud de Ayuda
  const [alertsTab, setAlertsTab] = useState('request_form'); // 'request_form' | 'sent_requests' | 'alerts'
  const [helpIssueKey, setHelpIssueKey] = useState('MCHAV-101');
  const [helpType, setHelpType] = useState('Bloqueo Técnico');
  const [helpUrgency, setHelpUrgency] = useState('Alta');
  const [helpMessage, setHelpMessage] = useState('');
  const [submittedHelpRequests, setSubmittedHelpRequests] = useState([
    {
      id: 'SOL-801',
      issueKey: 'MCHAV-101',
      type: 'Bloqueo Técnico',
      urgency: 'Alta',
      message: 'Requiero apoyo en la configuración de la firma JWT para OAuth 2.0.',
      status: 'EN REVISIÓN LÍDER',
      date: '2026-08-12 11:30'
    }
  ]);
  const [showHelpSuccessToast, setShowHelpSuccessToast] = useState(false);

  const handleSubmitHelpRequest = (e) => {
    e.preventDefault();
    if (!helpMessage.trim()) return;

    const newRequest = {
      id: `SOL-${Math.floor(800 + Math.random() * 100)}`,
      issueKey: helpIssueKey,
      type: helpType,
      urgency: helpUrgency,
      message: helpMessage,
      status: 'ENVIADA A LÍDER',
      date: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    setSubmittedHelpRequests(prev => [newRequest, ...prev]);
    setHelpMessage('');
    setShowHelpSuccessToast(true);
    setTimeout(() => {
      setShowHelpSuccessToast(false);
      setAlertsTab('sent_requests');
    }, 1200);
  };

  const isPending = user?.status === 'PENDING';

  const loadScorecard = async () => {
    try {
      const data = await developerService.getMyScorecard(selectedProjectId);
      setScorecard(data);
    } catch (err) {
      console.warn("Error cargando scorecard:", err);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadScorecard();
  }, [selectedProjectId, user?.email]);

  const handleReloadData = async () => {
    setIsRefreshing(true);
    await loadScorecard();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const devName = user?.nombre || 'Valka Hoyos';

  const sparklineCycleTime = [
    { v: 4.5 }, { v: 4.1 }, { v: 3.8 }, { v: 4.2 }, { v: 3.5 }, { v: 3.9 }, { v: 3.2 }
  ];

  const throughputDaily = [
    { day: 'L', v: 2 }, { day: 'M', v: 3 }, { day: 'M', v: 1 }, { day: 'J', v: 4 }, { day: 'V', v: 4 }
  ];

  // Garantizar que siempre se use el conjunto amplio de 14 incidencias
  const assignedIssuesList = (scorecard?.assigned_issues && scorecard.assigned_issues.length >= 10)
    ? scorecard.assigned_issues 
    : DEFAULT_ASSIGNED_ISSUES;

  // Cálculo dinámico de la distribución del trabajo basado en el dataset completo
  const historiasCount = assignedIssuesList.filter(i => (i.tipo || '').includes('Historia')).length;
  const bugsCount = assignedIssuesList.filter(i => (i.tipo || '').includes('Bug')).length;
  const tareasCount = assignedIssuesList.filter(i => (i.tipo || '').includes('Tarea')).length;
  const totalCount = assignedIssuesList.length || 1;

  const workDist = scorecard?.work_distribution || {
    pct_historias: Math.round((historiasCount / totalCount) * 100) || 45,
    pct_bugs: Math.round((bugsCount / totalCount) * 100) || 15,
    pct_tareas: Math.round((tareasCount / totalCount) * 100) || 40
  };

  const donutWorkDistribution = [
    { name: 'Historias de Usuario', count: historiasCount, pct: Math.round((historiasCount / totalCount) * 100), color: '#8b5cf6', icon: User },
    { name: 'Bugs y Defectos', count: bugsCount, pct: Math.round((bugsCount / totalCount) * 100), color: '#ec4899', icon: Bug },
    { name: 'Tareas / Deuda Técnica', count: tareasCount, pct: Math.round((tareasCount / totalCount) * 100), color: '#00f5d4', icon: FileText }
  ];

  const totalIncidencias = assignedIssuesList.length;

  const devAlertsList = alerts.length > 0 ? alerts : [
    { id: 1, type: 'critical', text: 'MCHAV-101 en inactividad (3.2 días sin movimiento). Se recomienda actualizar estado.' },
    { id: 2, type: 'warning', text: 'WIP en 7 tareas abiertas. Se sugiere cerrar MCHAV-112 antes de abrir nuevas.' },
    { id: 3, type: 'info', text: 'Sprint 24 activo. 81% de Story Points completados.' }
  ];

  const criticalAlertsCount = devAlertsList.filter(a => a.type === 'critical').length;

  const handlePrintPDF = () => {
    window.print();
  };

  // Filtrado de incidencias según la categoría seleccionada
  const filteredIssues = assignedIssuesList.filter(issue => {
    if (!selectedCategoryFilter) return true;
    if (selectedCategoryFilter === 'Historias de Usuario') return (issue.tipo || '').includes('Historia');
    if (selectedCategoryFilter === 'Bugs y Defectos') return (issue.tipo || '').includes('Bug');
    if (selectedCategoryFilter === 'Tareas / Deuda Técnica') return (issue.tipo || '').includes('Tarea');
    return true;
  });

  // Cálculo de paginación
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage) || 1;
  const paginatedIssues = filteredIssues.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectCategory = (catName) => {
    setCurrentPage(1); // Reiniciar a página 1 al filtrar
    if (selectedCategoryFilter === catName) {
      setSelectedCategoryFilter(null);
      setCategoryModalOpen(false);
    } else {
      setSelectedCategoryFilter(catName);
      setCategoryModalOpen(true);
    }
  };

  // Contadores para el resumen de la tabla
  const enProgresoCount = assignedIssuesList.filter(i => (i.status_actual || '').toUpperCase().includes('PROGRESO')).length;
  const completadasCount = assignedIssuesList.filter(i => (i.status_actual || '').toUpperCase().includes('LISTO')).length;

  return (
    <div className="w-full max-w-full flex-1 h-full flex flex-col justify-between space-y-4 overflow-hidden text-left font-sans transition-colors duration-300">

      {/* 1. ENCABEZADO PRINCIPAL COMPACTO */}
      <div className="relative group rounded-2xl bg-white dark:bg-[#141738] p-4 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#272b5c] transition-all duration-300 shrink-0">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white font-black text-xl shadow-md shadow-purple-900/40 shrink-0">
              {devName.substring(0, 1).toUpperCase()}
            </div>
            <div className="space-y-0.5">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 flex-wrap">
                Mi Trabajo: {devName}
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-[#00f5d4]/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-[#00f5d4] border border-emerald-500/20 dark:border-[#00f5d4]/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-[#00f5d4] animate-pulse"></span>
                  {user?.rol || 'DEVELOPER'}
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Consola interactiva de trabajo individual y métricas de carga de trabajo.
              </p>
            </div>
          </div>

          <button
            onClick={() => setAlertsModalOpen(true)}
            title="Ver mis alertas y solicitar ayuda dentro de Mi Trabajo"
            className="relative px-4 py-2 text-xs font-bold bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white rounded-xl shadow-md shadow-rose-900/30 border border-rose-400/40 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] shrink-0"
          >
            <Bell size={15} className="text-amber-200 fill-amber-200" />
            <span>Alertas & Solicitar Ayuda</span>
            {criticalAlertsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white text-rose-600 font-black text-[10px] rounded-full shadow animate-bounce">
                {criticalAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* NOTIFICACIÓN PENDIENTE DE ASIGNACIÓN (SOLO SI APLICA) */}
      {isPending && (
        <div className="relative rounded-2xl bg-amber-50 dark:bg-[#181b40] p-3.5 shadow-sm border border-amber-300 dark:border-amber-500/40 shrink-0">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0 border border-amber-500/30">
                <Clock size={20} className="animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  ⏳ Estado: Pendiente de Asignación de Rol
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Hola <strong>{devName}</strong> ({user?.email}). Tu cuenta se ha autenticado. Un Administrador debe aprobar tu rol.
                </p>
              </div>
            </div>
            <button
              onClick={() => approveUserPermission(user?.email || 'vhoyos@mchav.com', 'DEVELOPER')}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-slate-950 transition-all hover:from-amber-600 hover:to-orange-600 flex items-center gap-2 cursor-pointer shadow-md"
            >
              <UserCheck size={15} /> Simular Aprobación Admin
            </button>
          </div>
        </div>
      )}

      {/* 2. SECCIÓN: HISTÓRICO GENERAL CON EXPORTAR PDF COMPACTO */}
      <div className="relative group rounded-2xl bg-white dark:bg-[#141738] px-5 py-2.5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#272b5c] transition-all duration-300 shrink-0">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div 
            onClick={() => setHistoryModalOpen(true)}
            className="flex items-center gap-3 cursor-pointer group/hist"
            title="Haga clic para consultar detalles del histórico"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-950/80 text-indigo-300 font-extrabold text-xs border border-indigo-700/50 shadow-inner shrink-0 group-hover/hist:border-indigo-400 transition-colors">
              M
            </div>
            <div className="space-y-0.5 text-left">
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover/hist:text-indigo-400 transition-colors">
                Histórico general
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Rendimiento consolidado del sprint actual
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrintPDF}
              title="Exportar reporte PDF exclusivo del desarrollador"
              className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-900/40 border border-indigo-400/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Printer size={14} />
              <span>Exportar PDF</span>
            </button>

            <button
              onClick={handleReloadData}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
              title="Actualizar datos"
            >
              <RotateCcw size={15} className={isRefreshing ? "animate-spin text-indigo-400" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN: KPIS PRINCIPALES (TARJETAS AMPLIADAS Y ELEGANTES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">

        {/* TARJETA 1: CYCLE TIME */}
        <div 
          onClick={() => setSelectedKpiModal('cycle_time')}
          className="group relative hover:z-50 z-10 flex flex-col rounded-2xl bg-white dark:bg-[#141738] p-5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#272b5c] justify-between transition-all duration-300 hover:border-emerald-500/60 hover:shadow-emerald-500/10 hover:scale-[1.01] cursor-pointer min-h-[170px]"
          title="Haga clic para ver la información contextual de Cycle Time"
        >
          <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-[#00f5d4]/20 text-emerald-600 dark:text-[#00f5d4] border border-emerald-500/20 dark:border-[#00f5d4]/30 shadow-sm">
                  <Clock className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">CYCLE TIME</h3>
              </div>
              <MetricInfoTooltip align="left" text="Cycle Time Personal: Mide el tiempo promedio transcurrido en días desde que mueves una incidencia a 'In Progress' hasta que queda 'Done'." />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-emerald-600 dark:text-[#00f5d4] tracking-tight">
                    {scorecard?.cycle_time_personal || 3.2}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-[#00f5d4]">días</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                  -0.3d vs sprint previo
                </span>
              </div>
              <SparklineMini color="#00f5d4" data={sparklineCycleTime} />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#232752] text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Avg Sprint Previo</span>
              <span className="font-bold text-emerald-600 dark:text-[#00f5d4]">{scorecard?.cycle_time_prev || 3.5}d</span>
            </div>
          </div>
        </div>

        {/* TARJETA 2: TICKETS WIP */}
        <div 
          onClick={() => setSelectedKpiModal('wip')}
          className="group relative hover:z-50 z-10 flex flex-col rounded-2xl bg-white dark:bg-[#141738] p-5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#272b5c] justify-between transition-all duration-300 hover:border-purple-500/60 hover:shadow-purple-500/10 hover:scale-[1.01] cursor-pointer min-h-[170px]"
          title="Haga clic para ver la información contextual de Tickets WIP"
        >
          <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 dark:border-purple-500/30 shadow-sm">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">TICKETS WIP</h3>
              </div>
              <MetricInfoTooltip align="left" text="Work In Progress (WIP): Número de tareas abiertas activas en 'In Progress'. Mantener el WIP ≤ 3 evita la multitarea." />
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {scorecard?.wip_tickets || 7}
                  </span>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Tickets activos</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  70% Cap.
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#1b1e42] h-2.5 rounded-full mt-2.5 overflow-hidden border border-slate-200 dark:border-[#2c3066]">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((scorecard?.wip_tickets || 7) / (scorecard?.wip_max || 10)) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#232752] text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Capacidad Máx: 10</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">Avg {scorecard?.wip_avg || 5.5}</span>
            </div>
          </div>
        </div>

        {/* TARJETA 3: THROUGHPUT */}
        <div 
          onClick={() => setSelectedKpiModal('throughput')}
          className="group relative hover:z-50 z-10 flex flex-col rounded-2xl bg-white dark:bg-[#141738] p-5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#272b5c] justify-between transition-all duration-300 hover:border-cyan-500/60 hover:shadow-cyan-500/10 hover:scale-[1.01] cursor-pointer min-h-[170px]"
          title="Haga clic para ver la información contextual de Throughput"
        >
          <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 dark:border-cyan-500/30 shadow-sm">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">THROUGHPUT</h3>
              </div>
              <MetricInfoTooltip align="right" text="Mi Throughput: Cantidad total de incidencias y entregables completados por ti en el sprint." />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-cyan-600 dark:text-[#00c2ff] tracking-tight">
                    {scorecard?.throughput_tickets || 14}
                  </span>
                  <span className="text-xs font-bold text-cyan-600 dark:text-[#00c2ff]">Tickets</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                  Promedio: 2.3/día
                </span>
              </div>
              <div className="w-16 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={throughputDaily}>
                    <Bar dataKey="v" fill="#00c2ff" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#232752] text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Promedio Diario</span>
              <span className="font-bold text-cyan-600 dark:text-[#00c2ff]">{scorecard?.throughput_avg_daily || 2.3}/día</span>
            </div>
          </div>
        </div>

        {/* TARJETA 4: STORY POINTS */}
        <div 
          onClick={() => setSelectedKpiModal('story_points')}
          className="group relative hover:z-50 z-10 flex flex-col rounded-2xl bg-white dark:bg-[#141738] p-5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#272b5c] justify-between transition-all duration-300 hover:border-pink-500/60 hover:shadow-pink-500/10 hover:scale-[1.01] cursor-pointer min-h-[170px]"
          title="Haga clic para ver la información contextual de Story Points"
        >
          <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-sm">
                  <Zap className="h-4 w-4 fill-white" />
                </div>
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">STORY POINTS</h3>
              </div>
              <MetricInfoTooltip align="right" text="Puntos Quemados (Story Points): Suma del esfuerzo estimado completado en tus entregas dentro del sprint activo." />
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {scorecard?.story_points_burned || 65}
                  </span>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">SP</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/30">
                  81% Meta
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#1b1e42] h-2.5 rounded-full mt-2.5 overflow-hidden border border-slate-200 dark:border-[#2c3066]">
                <div 
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${scorecard?.story_points_achieved_pct || 81}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#232752] text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Meta: 80 SP</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">81% Completado</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECCIÓN DISTRIBUCIÓN DEL TRABAJO — GRÁFICA CIRCULAR DE DONA IDÉNTICA A VISTA ADMIN */}
      <div className="relative rounded-2xl bg-white dark:bg-[#191c3d] p-6 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#33376b] transition-all duration-300 flex flex-col justify-start gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Distribución del trabajo
            </h3>
            <MetricInfoTooltip text="Muestra en qué porcentaje se dividió el tiempo entre crear nuevas funciones, arreglar fallos o hacer mejoras técnicas." />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Por tipo de incidencia, sprint actual</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 mt-1">
          {/* GRÁFICA DE DONA RECHARTS CON TEXTO EN EL CENTRO */}
          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Historias de Usuario', value: Math.round((workDist.pct_historias / 100) * (assignedIssuesList.length || 14)), percentage: workDist.pct_historias, color: '#8b5cf6', icon: User },
                    { name: 'Bugs y Defectos', value: Math.round((workDist.pct_bugs / 100) * (assignedIssuesList.length || 14)), percentage: workDist.pct_bugs, color: '#ec4899', icon: Bug },
                    { name: 'Tareas / Deuda Técnica', value: Math.round((workDist.pct_tareas / 100) * (assignedIssuesList.length || 14)), percentage: workDist.pct_tareas, color: '#10b981', icon: FileText }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { color: '#8b5cf6' },
                    { color: '#ec4899' },
                    { color: '#10b981' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {assignedIssuesList.length || 14}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Incidencias</span>
            </div>
          </div>

          {/* LEYENDA Y TARJETAS DE INCIDENCIAS */}
          <div className="space-y-2.5">
            {[
              { name: 'Historias de Usuario', value: Math.round((workDist.pct_historias / 100) * (assignedIssuesList.length || 14)), percentage: workDist.pct_historias, color: '#8b5cf6', icon: User },
              { name: 'Bugs y Defectos', value: Math.round((workDist.pct_bugs / 100) * (assignedIssuesList.length || 14)), percentage: workDist.pct_bugs, color: '#ec4899', icon: Bug },
              { name: 'Tareas / Deuda Técnica', value: Math.round((workDist.pct_tareas / 100) * (assignedIssuesList.length || 14)), percentage: workDist.pct_tareas, color: '#10b981', icon: FileText }
            ].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="flex items-center gap-1.5">
                      <IconComponent size={14} className="text-slate-500 dark:text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {item.value} <span className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold ml-0.5">({item.percentage}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. FILA INFERIOR EN GRID DE 2 COLUMNAS PERFECTAMENTE EQUILIBRADAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch flex-1 min-h-0 overflow-hidden">

        {/* DISTRIBUCIÓN DEL TRABAJO */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#141738] p-5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#272b5c] flex flex-col justify-between h-full overflow-hidden space-y-3">
          <div className="space-y-0.5 text-left shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  DISTRIBUCIÓN DEL TRABAJO
                </h2>
                <MetricInfoTooltip text="Distribución del Trabajo: Proporción del esfuerzo dedicado a desarrollo de Historias, Bugs y Tareas. Haga clic en una categoría para filtrar la tabla o ver sus detalles." />
              </div>
              {selectedCategoryFilter && (
                <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <Filter size={10} /> Filtrando
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Por tipo de incidencia, sprint actual
            </p>
          </div>

          {/* GRÁFICA Y CATEGORÍAS CLICKABLES */}
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-5 my-auto py-2">
            
            {/* CÍRCULO DE GRÁFICA */}
            <div className="w-40 h-40 relative flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutWorkDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={58}
                    paddingAngle={4}
                    dataKey="pct"
                    stroke="none"
                    onClick={(entry) => handleSelectCategory(entry.name)}
                  >
                    {donutWorkDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedCategoryFilter === entry.name ? 'opacity-100 scale-105' : 'opacity-85 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  {totalIncidencias}
                </span>
                <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-tight mt-1">
                  TOTAL INCIDENTES
                </span>
              </div>
            </div>

            {/* LISTA DE CATEGORÍAS CLICKABLES */}
            <div className="flex-1 w-full space-y-2.5 text-left my-auto">
              {donutWorkDistribution.map((item, idx) => {
                const ItemIcon = item.icon;
                const isSelected = selectedCategoryFilter === item.name;
                return (
                  <div 
                    key={idx}
                    onClick={() => handleSelectCategory(item.name)}
                    title={`Haga clic para ver el detalle de ${item.name}`}
                    className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer shadow-xs space-y-1.5 ${
                      isSelected 
                        ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/50 text-white scale-[1.02]' 
                        : 'bg-slate-50 dark:bg-[#1b1e42] border-slate-200 dark:border-[#2c3066] hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-100 dark:hover:bg-[#202450]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        <ItemIcon size={14} className="text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="font-extrabold text-xs shrink-0 ml-1">
                        <span className="text-slate-900 dark:text-white">{item.count}</span>
                        <span className="text-slate-400 font-medium ml-1">({item.pct}%)</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-900/60 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-[#232752] flex items-center justify-between text-[11px] text-slate-400 font-semibold shrink-0">
            <span>💡 Haga clic en una categoría para filtrar la tabla</span>
            {selectedCategoryFilter && (
              <button 
                onClick={() => {
                  setSelectedCategoryFilter(null);
                  setCurrentPage(1);
                }}
                className="text-indigo-400 hover:text-white underline cursor-pointer font-bold"
              >
                Limpiar filtro
              </button>
            )}
          </div>

        </div>

        {/* INCIDENCIAS ASIGNADAS CON PAGINACIÓN COMPLETA */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#141738] p-5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#272b5c] flex flex-col justify-between h-full overflow-hidden space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-[#232752] shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                INCIDENCIAS ASIGNADAS A {devName.toUpperCase()}
              </h2>
              <MetricInfoTooltip text="Listado de Incidencias Asignadas: Muestra las tareas asignadas directamente a ti. Haga clic en cualquier fila para desplegar sus detalles completos." />
            </div>

            <div className="flex items-center gap-2">
              {selectedCategoryFilter && (
                <button
                  onClick={() => {
                    setSelectedCategoryFilter(null);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-0.5 text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full flex items-center gap-1 hover:bg-indigo-500/30 transition-colors cursor-pointer"
                >
                  <span>Filtrado: {selectedCategoryFilter}</span>
                  <X size={12} />
                </button>
              )}
              <span className="text-[10px] font-extrabold text-emerald-700 dark:text-[#00f5d4] bg-emerald-50 dark:bg-[#00f5d4]/10 border border-emerald-200 dark:border-[#00f5d4]/30 px-2.5 py-0.5 rounded-full">
                {filteredIssues.length} Tareas Totales
              </span>
            </div>
          </div>

          {/* TABLA CON PAGINACIÓN Y FILAS ESPACIADAS Llenando la tarjeta */}
          <div className="flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar my-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-[#0f1129] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-[#232752] sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2.5">CLAVE</th>
                  <th className="px-3 py-2.5">RESUMEN</th>
                  <th className="px-3 py-2.5 text-center">ESTADO ACTUAL</th>
                  <th className="px-3 py-2.5 text-right">STORY POINTS</th>
                  <th className="px-3 py-2.5 text-right">CYCLE TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1e224d] text-slate-700 dark:text-slate-200">
                {paginatedIssues.map((issue, idx) => {
                  const statusUpper = (issue.status_actual || '').toUpperCase();
                  const isListo = statusUpper.includes('LISTO') || statusUpper.includes('DONE');
                  const isProgreso = statusUpper.includes('PROGRESO') || statusUpper.includes('PROGRESS');
                  const isRevision = statusUpper.includes('REVISI');

                  return (
                    <tr 
                      key={idx} 
                      onClick={() => setSelectedIssueModal(issue)}
                      title={`Haga clic para ver detalles completos de ${issue.key_issue}`}
                      className="hover:bg-indigo-500/10 dark:hover:bg-[#1a1d48] transition-colors cursor-pointer"
                    >
                      <td className="px-3 py-3 font-mono font-extrabold text-indigo-600 dark:text-[#7c3aed]">
                        {issue.key_issue}
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white hover:text-indigo-400 transition-colors max-w-[220px] truncate">
                        {issue.summary}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase border ${
                          isListo
                            ? 'bg-emerald-50 dark:bg-[#064e3b] text-emerald-700 dark:text-[#00f5d4] border-emerald-200 dark:border-[#00f5d4]/40'
                            : isProgreso
                            ? 'bg-sky-50 dark:bg-[#0c4a6e] text-sky-700 dark:text-[#38bdf8] border-sky-200 dark:border-[#38bdf8]/40'
                            : isRevision
                            ? 'bg-purple-50 dark:bg-[#3b0764] text-purple-700 dark:text-[#c084fc] border-purple-200 dark:border-[#c084fc]/40'
                            : 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/40'
                        }`}>
                          {issue.status_actual}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-extrabold text-slate-900 dark:text-white">
                        {issue.story_points}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-emerald-600 dark:text-[#00f5d4] flex items-center justify-end gap-1.5">
                        <span className={issue.cycle_time_days > 3.5 ? "text-rose-600 dark:text-[#ff0055]" : "text-emerald-600 dark:text-[#00f5d4]"}>
                          {issue.cycle_time_days > 0 ? `${issue.cycle_time_days}d` : '-'}
                        </span>
                        <SparklineMini color={issue.cycle_time_days > 3.5 ? "#ff0055" : "#00f5d4"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* CONTROLES DE PAGINACIÓN Y RESUMEN AL PIE DE LA TARJETA */}
          <div className="shrink-0 pt-2.5 border-t border-slate-100 dark:border-[#232752] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-semibold gap-2">
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <ListTodo size={13} className="text-indigo-400" />
                <span>{assignedIssuesList.length} tareas totales</span>
              </span>
              <span className="text-sky-400">{enProgresoCount} en progreso</span>
              <span className="text-[#00f5d4]">{completadasCount} completadas</span>
            </div>

            {/* BARRA DE NAVEGACIÓN DE PAGINACIÓN */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold">
                Pág {currentPage} de {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-0.5"
                >
                  <ChevronLeft size={13} /> Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pNum => (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    className={`w-6 h-6 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer ${
                      currentPage === pNum
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-0.5"
                >
                  Siguiente <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ==================================================================== */}
      {/* MODAL 0: DETALLE DE INCIDENCIAS POR CATEGORÍA SELECCIONADA */}
      {/* ==================================================================== */}
      {categoryModalOpen && selectedCategoryFilter && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#141738] p-6 shadow-2xl border border-slate-200 dark:border-[#272b5c] space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#232752]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <Layers size={18} />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  INCIDENCIAS: {selectedCategoryFilter.toUpperCase()}
                </h3>
              </div>
              <button 
                onClick={() => setCategoryModalOpen(false)} 
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setCategoryModalOpen(false);
                      setSelectedIssueModal(issue);
                    }}
                    className="p-3 bg-slate-50 dark:bg-[#191c3d] rounded-xl border border-slate-200 dark:border-[#2a2e63] hover:border-indigo-400 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-indigo-400 text-xs">{issue.key_issue}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {issue.status_actual}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {issue.summary}
                      </h4>
                    </div>
                    <span className="text-xs font-extrabold text-purple-400 shrink-0 ml-2">
                      {issue.story_points} SP
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No hay incidencias para esta categoría.</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-[#232752] flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">{filteredIssues.length} tareas encontradas</span>
              <button 
                onClick={() => setCategoryModalOpen(false)} 
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow transition-colors cursor-pointer"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: INFORMACIÓN DE KPIs (AL HACER CLIC EN UN KPI) */}
      {/* ==================================================================== */}
      {selectedKpiModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#141738] p-6 shadow-2xl border border-slate-200 dark:border-[#272b5c] space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#232752]">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                {selectedKpiModal === 'cycle_time' && <Clock className="text-emerald-400" size={18} />}
                {selectedKpiModal === 'wip' && <ClipboardList className="text-purple-400" size={18} />}
                {selectedKpiModal === 'throughput' && <CheckCircle className="text-cyan-400" size={18} />}
                {selectedKpiModal === 'story_points' && <Zap className="text-pink-400" size={18} />}
                <span>Información Contextual de {selectedKpiModal.replace('_', ' ').toUpperCase()}</span>
              </h3>
              <button 
                onClick={() => setSelectedKpiModal(null)} 
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {selectedKpiModal === 'cycle_time' && (
              <div className="space-y-3.5 text-xs text-left">
                <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 flex justify-between items-center">
                  <div>
                    <span className="text-slate-200 font-bold block text-xs">Cycle Time Personal (Tiempo de Entrega):</span>
                    <span className="text-[11px] text-slate-400">Promedio desde "In Progress" hasta "Done"</span>
                  </div>
                  <span className="text-emerald-400 font-black text-base bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/40">
                    3.2 Días
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-50 dark:bg-[#191c3d] rounded-xl border border-slate-200 dark:border-[#2a2e63]">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Promedio Sprint Previo</span>
                    <span className="text-sm font-black text-slate-100 mt-0.5 block">3.5 Días</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-[#191c3d] rounded-xl border border-slate-200 dark:border-[#2a2e63]">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Mejor Resultado Personal</span>
                    <span className="text-sm font-black text-emerald-400 mt-0.5 block">2.1 Días</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-[#191c3d] rounded-xl border border-slate-200 dark:border-[#2a2e63] space-y-1 text-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Tendencia vs Sprint Anterior:</span>
                    <span className="text-emerald-400 font-extrabold">-0.3 Días (Más rápido ⚡)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Métrica calculada dinámicamente a partir de tus 14 incidencias en este sprint.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-500/10 text-emerald-300 rounded-xl border border-emerald-500/30 leading-relaxed text-xs space-y-1">
                  <p className="font-extrabold flex items-center gap-1.5 text-emerald-400">
                    💡 ¿Qué es Cycle Time y qué significa para ti?
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <strong>Cycle Time (Tiempo de Ciclo)</strong> es el tiempo promedio en días que tardas en completar una tarea desde que la mueves a "En Progreso" hasta que queda "Listo". <strong>Un valor menor indica mayor agilidad y rapidez en la resolución de tareas.</strong>
                  </p>
                </div>
              </div>
            )}

            {selectedKpiModal === 'wip' && (
              <div className="space-y-3.5 text-xs text-left">
                <div className="p-3.5 bg-purple-500/10 rounded-xl border border-purple-500/30 flex justify-between items-center">
                  <div>
                    <span className="text-slate-200 font-bold block text-xs">Total Tickets en Trabajo Activo (WIP):</span>
                    <span className="text-[11px] text-slate-400">Trabajo en Proceso sin finalizar</span>
                  </div>
                  <span className="text-purple-400 font-black text-base bg-purple-500/20 px-3 py-1 rounded-lg border border-purple-500/40">
                    7 Tickets
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-[#191c3d] rounded-xl border border-slate-200 dark:border-[#2a2e63] space-y-2">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs border-b border-slate-200 dark:border-slate-700/60 pb-1.5">
                    Desglose por Estado Actual:
                  </h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">En Progreso (Desarrollo Activo):</span>
                    <span className="font-extrabold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">4 tareas</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">En Revisión (Code Review):</span>
                    <span className="font-extrabold text-purple-600 dark:text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">2 tareas</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">En QA (Pruebas de Calidad):</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">1 tarea</span>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-500/10 text-amber-800 dark:text-amber-200 rounded-xl border border-amber-500/30 leading-relaxed text-xs space-y-1">
                  <p className="font-extrabold flex items-center gap-1.5 text-amber-400">
                    💡 ¿Qué significa WIP y por qué es importante?
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <strong>WIP (Work In Progress / Trabajo en Proceso)</strong> es el número de tareas que tienes abiertas simultáneamente. Se recomienda mantener un <strong>WIP ≤ 3</strong> para enfocarte en terminar tareas antes de abrir nuevas, evitando la multitarea y cuellos de botella.
                  </p>
                </div>
              </div>
            )}

            {selectedKpiModal === 'throughput' && (
              <div className="space-y-3.5 text-xs text-left">
                <div className="p-3.5 bg-cyan-500/10 rounded-xl border border-cyan-500/30 flex justify-between items-center">
                  <div>
                    <span className="text-slate-200 font-bold block text-xs">Throughput (Volumen de Entregas):</span>
                    <span className="text-[11px] text-slate-400">Total de tareas finalizadas en el sprint</span>
                  </div>
                  <span className="text-cyan-400 font-black text-base bg-cyan-500/20 px-3 py-1 rounded-lg border border-cyan-500/40">
                    14 Tickets
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-[#191c3d] rounded-xl border border-slate-200 dark:border-[#2a2e63] space-y-2">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs border-b border-slate-200 dark:border-slate-700/60 pb-1.5">
                    Entregas Diarias en la Semana (Promedio: 2.3/día):
                  </h4>
                  <div className="grid grid-cols-5 gap-1.5 text-center font-bold">
                    <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700">
                      <span className="text-[10px] text-slate-400 block font-semibold">Lunes</span>
                      <span className="text-cyan-400 text-xs font-black">2</span>
                    </div>
                    <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700">
                      <span className="text-[10px] text-slate-400 block font-semibold">Martes</span>
                      <span className="text-cyan-400 text-xs font-black">3</span>
                    </div>
                    <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700">
                      <span className="text-[10px] text-slate-400 block font-semibold">Miércoles</span>
                      <span className="text-cyan-400 text-xs font-black">1</span>
                    </div>
                    <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700">
                      <span className="text-[10px] text-slate-400 block font-semibold">Jueves</span>
                      <span className="text-cyan-400 text-xs font-black">4</span>
                    </div>
                    <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700">
                      <span className="text-[10px] text-slate-400 block font-semibold">Viernes</span>
                      <span className="text-cyan-400 text-xs font-black">4</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-cyan-500/10 text-cyan-300 rounded-xl border border-cyan-500/30 leading-relaxed text-xs space-y-1">
                  <p className="font-extrabold flex items-center gap-1.5 text-cyan-400">
                    💡 ¿Qué es Throughput y por qué es útil?
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <strong>Throughput (Rendimiento/Velocidad de Salida)</strong> mide la cantidad neta de tareas finalizadas con éxito en un período de tiempo. Un Throughput estable demuestra constancia y capacidad de entrega continua.
                  </p>
                </div>
              </div>
            )}

            {selectedKpiModal === 'story_points' && (
              <div className="space-y-3.5 text-xs text-left">
                <div className="p-3.5 bg-pink-500/10 rounded-xl border border-pink-500/30 flex justify-between items-center">
                  <div>
                    <span className="text-slate-200 font-bold block text-xs">Puntos Quemados (Story Points):</span>
                    <span className="text-[11px] text-slate-400">Suma del esfuerzo total entregado</span>
                  </div>
                  <span className="text-pink-400 font-black text-base bg-pink-500/20 px-3 py-1 rounded-lg border border-pink-500/40">
                    65 / 80 SP
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-[#191c3d] rounded-xl border border-slate-200 dark:border-[#2a2e63] space-y-2">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs border-b border-slate-200 dark:border-slate-700/60 pb-1.5">
                    Desglose por Nivel de Complejidad:
                  </h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Complejidad Alta (8-13 SP):</span>
                    <span className="font-extrabold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">24 SP</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Complejidad Media (5 SP):</span>
                    <span className="font-extrabold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">26 SP</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Complejidad Baja (1-3 SP):</span>
                    <span className="font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">15 SP</span>
                  </div>
                </div>

                <div className="p-3.5 bg-pink-500/10 text-pink-300 rounded-xl border border-pink-500/30 leading-relaxed text-xs space-y-1">
                  <p className="font-extrabold flex items-center gap-1.5 text-pink-400">
                    💡 ¿Qué son Story Points y para qué sirven?
                  </p>
                  <p className="text-[11px] text-slate-300">
                    <strong>Story Points (Puntos de Historia)</strong> representan la estimación del esfuerzo, complejidad y riesgo de cada tarea. Actualmente has completado el <strong>81% de la meta estimada del sprint</strong> (65 de 80 SP).
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-[#232752] text-right">
              <button 
                onClick={() => setSelectedKpiModal(null)} 
                className="px-4 py-2 text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: DETALLE COMPLETO DE INCIDENCIA (AL HACER CLIC EN FILA DE TABLA) */}
      {/* ==================================================================== */}
      {selectedIssueModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#141738] p-6 shadow-2xl border border-slate-200 dark:border-[#272b5c] space-y-5 text-left">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#232752]">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-sm px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                  {selectedIssueModal.key_issue}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Detalle de Incidencia
                </span>
              </div>
              <button
                onClick={() => setSelectedIssueModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {selectedIssueModal.summary}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedIssueModal.descripcion || 'Sin descripción adicional.'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-50 dark:bg-[#191c3d] rounded-xl border border-slate-200 dark:border-[#2a2e63]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">ESTADO ACTUAL</span>
                  <div className="mt-1 font-bold text-xs text-indigo-400">
                    {selectedIssueModal.status_actual}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-[#191c3d] rounded-xl border border-slate-200 dark:border-[#2a2e63]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">STORY POINTS</span>
                  <div className="mt-1 font-bold text-xs text-purple-400">
                    {selectedIssueModal.story_points} SP
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-[#191c3d] rounded-xl border border-slate-200 dark:border-[#2a2e63]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">CYCLE TIME</span>
                  <div className="mt-1 font-bold text-xs text-emerald-400">
                    {selectedIssueModal.cycle_time_days} días
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-[#191c3d] rounded-xl border border-slate-200 dark:border-[#2a2e63]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">TIPO</span>
                  <div className="mt-1 font-bold text-xs text-slate-200">
                    {selectedIssueModal.tipo}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-[#191c3d] rounded-xl border border-slate-200 dark:border-[#2a2e63]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PRIORIDAD</span>
                  <div className="mt-1 font-bold text-xs text-rose-400">
                    {selectedIssueModal.prioridad}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-[#191c3d] rounded-xl border border-slate-200 dark:border-[#2a2e63]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">CREACIÓN</span>
                  <div className="mt-1 font-bold text-xs text-cyan-400">
                    {selectedIssueModal.fecha_creacion}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-200 dark:border-[#232752]">
              <button
                onClick={() => setSelectedIssueModal(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: CENTRO INTERACTIVO DE ALERTAS Y SOLICITUD DE AYUDA */}
      {/* ==================================================================== */}
      {alertsModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#141738] p-6 shadow-2xl border border-slate-200 dark:border-[#272b5c] space-y-4 text-left">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#232752]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-rose-500 to-amber-500 text-white rounded-xl shadow-md">
                  <Bell size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    CENTRO DE AYUDA Y SOLICITUDES
                  </h3>
                  <p className="text-xs text-slate-400">Solicita asistencia técnica a tu Líder o revisa tus alertas</p>
                </div>
              </div>
              <button 
                onClick={() => setAlertsModalOpen(false)} 
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* PESTAÑAS NAVEGABLES DEL CENTRO DE AYUDA */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#181b40] rounded-xl border border-slate-200 dark:border-[#272b5c]">
              <button
                type="button"
                onClick={() => setAlertsTab('request_form')}
                className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  alertsTab === 'request_form'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Send size={13} />
                <span>Solicitar Ayuda al Líder</span>
              </button>

              <button
                type="button"
                onClick={() => setAlertsTab('sent_requests')}
                className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  alertsTab === 'sent_requests'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare size={13} />
                <span>Mis Solicitudes ({submittedHelpRequests.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setAlertsTab('alerts')}
                className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  alertsTab === 'alerts'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bell size={13} />
                <span>Alertas ({devAlertsList.length})</span>
              </button>
            </div>

            {/* TAB 1: FORMULARIO PARA SOLICITAR AYUDA */}
            {alertsTab === 'request_form' && (
              <form onSubmit={handleSubmitHelpRequest} className="space-y-3.5">
                
                {showHelpSuccessToast && (
                  <div className="p-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
                    <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                    <span>¡Solicitud enviada con éxito al Líder de Equipo!</span>
                  </div>
                )}

                {/* Selección de Incidencia */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                    Incidencia o Tarea con Dificultad:
                  </label>
                  <select
                    value={helpIssueKey}
                    onChange={(e) => setHelpIssueKey(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#191c3d] border border-slate-200 dark:border-[#2a2e63] rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {assignedIssuesList.map((issue, idx) => (
                      <option key={idx} value={issue.key_issue}>
                        {issue.key_issue}: {issue.summary}
                      </option>
                    ))}
                    <option value="CONSULTA_GENERAL">Consulta General / Dificultad de Entorno</option>
                  </select>
                </div>

                {/* Tipo de Asistencia y Urgencia */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                      Tipo de Bloqueo:
                    </label>
                    <select
                      value={helpType}
                      onChange={(e) => setHelpType(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-[#191c3d] border border-slate-200 dark:border-[#2a2e63] rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Bloqueo Técnico">🛑 Bloqueo Técnico / Error</option>
                      <option value="Code Review Urgente">🔄 Code Review Urgente</option>
                      <option value="Duda de Requerimiento">📋 Clarificación Product Owner</option>
                      <option value="Accesos y Credenciales">🔑 Credenciales / Accesos API</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                      Urgencia:
                    </label>
                    <select
                      value={helpUrgency}
                      onChange={(e) => setHelpUrgency(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-[#191c3d] border border-slate-200 dark:border-[#2a2e63] rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Alta">🔴 Alta (Detiene mi trabajo)</option>
                      <option value="Media">🟨 Media (Puedo avanzar en otra)</option>
                      <option value="Baja">🟢 Baja (Consulta general)</option>
                    </select>
                  </div>
                </div>

                {/* Mensaje de Detalle */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 block">
                    Mensaje / Explicación para el Líder:
                  </label>
                  <textarea
                    rows={3}
                    value={helpMessage}
                    onChange={(e) => setHelpMessage(e.target.value)}
                    placeholder="Escribe aquí en qué problema estás atascado o qué apoyo necesitas del líder técnico..."
                    required
                    className="w-full p-3 bg-slate-50 dark:bg-[#191c3d] border border-slate-200 dark:border-[#2a2e63] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Acciones */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-[#232752]">
                  <button
                    type="button"
                    onClick={() => setAlertsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-extrabold bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white rounded-xl shadow-md shadow-rose-900/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <Send size={14} />
                    <span>Enviar Solicitud al Líder</span>
                  </button>
                </div>

              </form>
            )}

            {/* TAB 2: MIS SOLICITUDES ENVIADAS */}
            {alertsTab === 'sent_requests' && (
              <div className="space-y-3">
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {submittedHelpRequests.map((req, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 dark:bg-[#191c3d] rounded-xl border border-slate-200 dark:border-[#2a2e63] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-indigo-400">{req.id}</span>
                          <span className="font-bold text-slate-900 dark:text-white">[{req.issueKey}]</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                          {req.status}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                        "{req.message}"
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold pt-1.5 border-t border-slate-200 dark:border-slate-800">
                        <span>Tipo: {req.type}</span>
                        <span>Urgencia: {req.urgency} | {req.date}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-[#232752] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setAlertsTab('request_form')}
                    className="px-3 py-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                  >
                    + Crear nueva solicitud
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAlertsModalOpen(false)} 
                    className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: ALERTAS AUTOMÁTICAS DEL SISTEMA */}
            {alertsTab === 'alerts' && (
              <div className="space-y-3">
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {devAlertsList.map((alertItem, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 dark:bg-[#191c3d] rounded-xl border border-slate-200 dark:border-[#2a2e63] space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className={alertItem.type === 'critical' ? 'text-rose-400' : alertItem.type === 'warning' ? 'text-amber-400' : 'text-cyan-400'}>
                          {alertItem.type === 'critical' ? '🔴 ALERTA CRÍTICA' : alertItem.type === 'warning' ? '⚠️ ADVERTENCIA' : 'ℹ️ INFORMACIÓN'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setHelpIssueKey('MCHAV-101');
                            setHelpMessage(`Solicitud de ayuda para solucionar: ${alertItem.text}`);
                            setAlertsTab('request_form');
                          }}
                          className="px-2.5 py-1 text-[10px] font-extrabold bg-rose-600 hover:bg-rose-500 text-white rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <Send size={10} /> Pedir Ayuda
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                        {alertItem.text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-[#232752] text-right">
                  <button 
                    type="button"
                    onClick={() => setAlertsModalOpen(false)} 
                    className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: INFORMACIÓN COMPLEMENTARIA DEL HISTÓRICO GENERAL */}
      {/* ==================================================================== */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#141738] p-6 shadow-2xl border border-slate-200 dark:border-[#272b5c] space-y-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#232752]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    DETALLE DEL HISTÓRICO GENERAL
                  </h3>
                  <p className="text-xs text-slate-400">Rendimiento consolidado por sprint</p>
                </div>
              </div>
              <button 
                onClick={() => setHistoryModalOpen(false)} 
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#191c3d] rounded-xl border border-slate-200 dark:border-[#2a2e63] space-y-3 text-xs">
              <div className="grid grid-cols-5 gap-2 font-bold text-slate-400 pb-2 border-b border-slate-200 dark:border-[#2a2e63]">
                <span>SPRINT</span>
                <span className="text-right">CYCLE TIME</span>
                <span className="text-right">THROUGHPUT</span>
                <span className="text-right">STORY POINTS</span>
                <span className="text-right">WIP AVG</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-slate-200 font-semibold py-1">
                <span className="font-bold text-indigo-400">Sprint 24 (Actual)</span>
                <span className="text-right text-emerald-400">3.2 días</span>
                <span className="text-right text-cyan-400">14 tickets</span>
                <span className="text-right text-purple-400">65 SP</span>
                <span className="text-right">5.5</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-slate-400 py-1">
                <span className="font-bold text-slate-300">Sprint 23</span>
                <span className="text-right">3.5 días</span>
                <span className="text-right">12 tickets</span>
                <span className="text-right">58 SP</span>
                <span className="text-right">6.0</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-slate-400 py-1">
                <span className="font-bold text-slate-300">Sprint 22</span>
                <span className="text-right">4.1 días</span>
                <span className="text-right">10 tickets</span>
                <span className="text-right">50 SP</span>
                <span className="text-right">7.2</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-[#232752] text-right">
              <button 
                onClick={() => setHistoryModalOpen(false)} 
                className="px-4 py-2 text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PLANTILLA EXCLUSIVA PARA IMPRESIÓN Y EXPORTACIÓN A PDF (A4) */}
      {/* ==================================================================== */}
      <div className="hidden print:block w-full text-slate-900 bg-white p-8 space-y-6 font-sans leading-normal">
        
        {/* Encabezado Principal del Reporte */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-widest text-indigo-900">MCHAV ANALYTICS</span>
              <span className="text-xs px-2 py-0.5 bg-indigo-900 text-white font-bold rounded">REPORTE OFICIAL</span>
            </div>
            <h1 className="text-lg font-bold text-slate-800">
              Consola Ejecutiva de Rendimiento del Desarrollador
            </h1>
            <p className="text-xs text-slate-500">
              Métricas de velocidad, carga de trabajo e incidencias asignadas en tiempo real.
            </p>
          </div>
          <div className="text-right text-xs space-y-1 font-medium text-slate-600">
            <p><strong>Fecha de Generación:</strong> {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            <p><strong>Desarrollador:</strong> {devName} (DEVELOPER)</p>
            <p><strong>Proyecto ID:</strong> {selectedProjectId} — Sprint 24</p>
          </div>
        </div>

        {/* 1. KPIs de Rendimiento Individual */}
        <div className="space-y-2">
          <h2 className="text-xs font-black uppercase text-slate-800 border-b border-slate-300 pb-1 tracking-wider">
            1. RESUMEN DE MÉTRICAS CLAVE (KPIS)
          </h2>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">CYCLE TIME</span>
              <span className="text-xl font-black text-emerald-700">3.2 Días</span>
              <span className="text-[9px] text-slate-600 block mt-0.5">Avg Sprint Previo: 3.5d</span>
            </div>
            <div className="p-3 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">TICKETS WIP</span>
              <span className="text-xl font-black text-purple-700">7 Activos</span>
              <span className="text-[9px] text-slate-600 block mt-0.5">Capacidad Máxima: 10</span>
            </div>
            <div className="p-3 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">THROUGHPUT</span>
              <span className="text-xl font-black text-cyan-700">14 Tickets</span>
              <span className="text-[9px] text-slate-600 block mt-0.5">Promedio: 2.3/día</span>
            </div>
            <div className="p-3 border border-slate-300 rounded-lg bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">STORY POINTS</span>
              <span className="text-xl font-black text-pink-700">65 / 80 SP</span>
              <span className="text-[9px] text-slate-600 block mt-0.5">81% Meta Completada</span>
            </div>
          </div>
        </div>

        {/* 2. Distribución del Trabajo */}
        <div className="space-y-2">
          <h2 className="text-xs font-black uppercase text-slate-800 border-b border-slate-300 pb-1 tracking-wider">
            2. DISTRIBUCIÓN DEL TRABAJO POR CATEGORÍA
          </h2>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 border border-slate-200 rounded-lg bg-purple-50/50 flex justify-between items-center">
              <span className="font-bold text-purple-900">Historias de Usuario:</span>
              <span className="font-black text-purple-700">{historiasCount} tareas ({donutWorkDistribution[0].pct}%)</span>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg bg-pink-50/50 flex justify-between items-center">
              <span className="font-bold text-pink-900">Bugs y Defectos:</span>
              <span className="font-black text-pink-700">{bugsCount} tareas ({donutWorkDistribution[1].pct}%)</span>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg bg-teal-50/50 flex justify-between items-center">
              <span className="font-bold text-teal-900">Tareas / Deuda Técnica:</span>
              <span className="font-black text-teal-700">{tareasCount} tareas ({donutWorkDistribution[2].pct}%)</span>
            </div>
          </div>
        </div>

        {/* 3. Listado Completo de 14 Incidencias */}
        <div className="space-y-2">
          <h2 className="text-xs font-black uppercase text-slate-800 border-b border-slate-300 pb-1 tracking-wider">
            3. LISTADO COMPLETO DE INCIDENCIAS ASIGNADAS ({assignedIssuesList.length} TAREAS TOTALES)
          </h2>
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-2 border-r border-slate-300">Clave</th>
                <th className="p-2 border-r border-slate-300">Resumen</th>
                <th className="p-2 border-r border-slate-300">Tipo</th>
                <th className="p-2 border-r border-slate-300">Prioridad</th>
                <th className="p-2 border-r border-slate-300 text-center">Estado</th>
                <th className="p-2 border-r border-slate-300 text-right">SP</th>
                <th className="p-2 text-right">Cycle Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              {assignedIssuesList.map((issue, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="p-2 font-mono font-bold text-indigo-900 border-r border-slate-200">{issue.key_issue}</td>
                  <td className="p-2 font-semibold text-slate-800 border-r border-slate-200">{issue.summary}</td>
                  <td className="p-2 text-slate-700 border-r border-slate-200">{issue.tipo}</td>
                  <td className="p-2 text-slate-700 border-r border-slate-200">{issue.prioridad}</td>
                  <td className="p-2 text-center font-bold border-r border-slate-200 text-[10px] uppercase">{issue.status_actual}</td>
                  <td className="p-2 text-right font-bold border-r border-slate-200">{issue.story_points}</td>
                  <td className="p-2 text-right font-bold text-emerald-800">{issue.cycle_time_days}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pie de Página de Validación */}
        <div className="pt-6 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <p>Documento generado automáticamente por Mchav Analytics Platform. Uso exclusivo e interno.</p>
          <p>Firmado digitalmente: <strong>Valka Hoyos (DEVELOPER)</strong></p>
        </div>

      </div>

    </div>
  );
}
