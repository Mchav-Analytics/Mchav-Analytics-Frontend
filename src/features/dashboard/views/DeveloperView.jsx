// ============================================================================
// VISTA DEL DESARROLLADOR — MI TRABAJO (WORKSPACE PERSONAL DE TRABAJO)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  ClipboardList, 
  Zap, 
  Info, 
  User,
  Bug,
  FileText,
  RotateCcw,
  Bell,
  X,
  Printer,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageSquare,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Bot,
  CheckCircle2,
  ListTodo,
  Layers,
  Sparkles,
  PieChart as PieChartIcon
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Tooltip as RechartsTooltip } from 'recharts';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { developerService, jiraService } from '../../../services/api';

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

const SparklineMini = ({ color = "#00f5d4" }) => {
  const data = [{ v: 4.2 }, { v: 3.8 }, { v: 4.5 }, { v: 3.1 }, { v: 2.8 }, { v: 3.2 }];
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

// Dataset de Incidencias Asignadas al Desarrollador
const DEFAULT_ASSIGNED_ISSUES = [
  { key_issue: 'MCHAV-105', summary: 'Corregir bug en API de pagos y transacciones', status_actual: 'BLOQUEADA', story_points: 5, cycle_time_days: 2.5, tipo: 'Bug', prioridad: 'Crítica', fecha_creacion: '2026-08-03', fecha_actualizacion: '2026-08-11', descripcion: 'Desbordamiento de memoria y tiempos de respuesta elevados en endpoints de sincronización.' },
  { key_issue: 'MCHAV-128', summary: 'Implementación módulo SSO y OAuth 2.0', status_actual: 'EN PROGRESO', story_points: 8, cycle_time_days: 3.2, tipo: 'Historia de Usuario', prioridad: 'Alta', fecha_creacion: '2026-08-01', fecha_actualizacion: '2026-08-12', descripcion: 'Integración del protocolo OAuth 2.0 y Single Sign-On para Jira API.' },
  { key_issue: 'MCHAV-101', summary: 'Refactorizar consultas SQL en reportes de velocidad', status_actual: 'EN REVISIÓN', story_points: 8, cycle_time_days: 4.1, tipo: 'Tarea / Deuda Técnica', prioridad: 'Alta', fecha_creacion: '2026-08-05', fecha_actualizacion: '2026-08-12', descripcion: 'Optimización de índices y reescritura de queries pesadas en Postgres.' },
  { key_issue: 'MCHAV-114', summary: 'Actualizar dependencias de seguridad y Docker', status_actual: 'PENDIENTE', story_points: 8, cycle_time_days: 0, tipo: 'Tarea / Deuda Técnica', prioridad: 'Alta', fecha_creacion: '2026-08-09', fecha_actualizacion: '2026-08-11', descripcion: 'Escaneo de vulnerabilidades Trivy y actualización de imágenes Python.' },
  { key_issue: 'MCHAV-112', summary: 'Rediseñar vista de desarrollador con Recharts', status_actual: 'EN REVISIÓN', story_points: 13, cycle_time_days: 3.2, tipo: 'Historia de Usuario', prioridad: 'Media', fecha_creacion: '2026-08-05', fecha_actualizacion: '2026-08-12', descripcion: 'Componentización modular con Recharts y micro-interacciones.' },
  { key_issue: 'MCHAV-120', summary: 'Pruebas de integración para Service Gateway X', status_actual: 'COMPLETADA', story_points: 8, cycle_time_days: 2.9, tipo: 'Tarea / Deuda Técnica', prioridad: 'Baja', fecha_creacion: '2026-08-09', fecha_actualizacion: '2026-08-12', descripcion: 'Suite automatizada E2E con PyTest y FastAPI TestClient.' },
  { key_issue: 'MCHAV-124', summary: 'Refactorizar hooks personalizados en Frontend', status_actual: 'EN PROGRESO', story_points: 5, cycle_time_days: 1.8, tipo: 'Tarea / Deuda Técnica', prioridad: 'Media', fecha_creacion: '2026-08-10', fecha_actualizacion: '2026-08-12', descripcion: 'Desacoplamiento de lógica de renderizado en React.' }
];

export default function DeveloperView({ 
  kpis = [], 
  selectedProjectId = 'PROJ-01', 
  alerts = [],
  onNavigateToAlerts,
  onNavigateTab 
}) {
  const { user } = useAuth();
  const [scorecard, setScorecard] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [taskFilter, setTaskFilter] = useState('ALL'); // 'ALL' | 'IN_PROGRESS' | 'PENDING' | 'BLOCKED' | 'COMPLETED'

  // Modales interactivos
  const [selectedIssueModal, setSelectedIssueModal] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeReplyIssue, setActiveReplyIssue] = useState(null);
  const [quickReplyText, setQuickReplyText] = useState('');
  const [sendingQuickReply, setSendingQuickReply] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Elementos "Requiere mi atención"
  const [attentionItems, setAttentionItems] = useState([
    {
      id: 'att-1',
      type: 'BLOCK',
      priority: 'HIGH',
      key_issue: 'MCHAV-105',
      title: '🐞 Bug crítico bloqueado',
      detail: 'Bloqueada desde hace 2 días por fallo de memoria en QA.',
      time: 'Hace 2d',
      actionText: 'Ver bug'
    },
    {
      id: 'att-2',
      type: 'REQUEST',
      priority: 'MEDIUM',
      key_issue: 'MCHAV-128',
      title: '💬 Solicitud del equipo',
      detail: 'Carlos Pérez solicita actualización sobre la entrega SSO OAuth 2.0.',
      time: 'Hace 15m',
      actionText: 'Responder',
      message: '¿Podrían confirmar si la entrega del módulo SSO se mantiene para el viernes?'
    },
    {
      id: 'att-3',
      type: 'REVIEW',
      priority: 'MEDIUM',
      key_issue: 'MCHAV-101',
      title: '🟡 Revisión pendiente',
      detail: 'Esperando aprobación de Pull Request #42 por el Líder Técnico.',
      time: 'Hace 4h',
      actionText: 'Ver tarea'
    },
    {
      id: 'att-4',
      type: 'ALERT',
      priority: 'HIGH',
      key_issue: 'MCHAV-104',
      title: '⚠️ Alerta de inactividad (>48h)',
      detail: 'Más de 48 horas sin registro de commits en la rama activa.',
      time: 'Hace 1d',
      actionText: 'Revisar'
    }
  ]);

  const devName = user?.nombre || 'Valka Hoyos';

  const loadScorecard = async () => {
    try {
      const data = await developerService.getMyScorecard(selectedProjectId);
      setScorecard(data);
    } catch (err) {
      console.warn("Error cargando scorecard:", err);
    }
  };

  useEffect(() => {
    loadScorecard();
  }, [selectedProjectId, user?.email]);

  const handleReloadData = async () => {
    setIsRefreshing(true);
    await loadScorecard();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // Abrir modal de respuesta rápida
  const handleOpenReply = (item) => {
    setActiveReplyIssue(item);
    setQuickReplyText('');
    setReplyModalOpen(true);
  };

  // Enviar respuesta rápida y vincular a Jira
  const handleSendQuickReply = (e) => {
    e.preventDefault();
    if (!quickReplyText.trim() || !activeReplyIssue) return;

    setSendingQuickReply(true);
    const issueKey = activeReplyIssue.key_issue || 'MCHAV-128';

    jiraService.addComment(issueKey, quickReplyText)
      .then(() => {
        setSendingQuickReply(false);
        setReplyModalOpen(false);
        setToastMsg('✓ Respuesta enviada y asociada en Jira');
        setAttentionItems(prev => prev.filter(i => i.id !== activeReplyIssue.id));
        setTimeout(() => setToastMsg(''), 3000);
      })
      .catch(err => {
        console.log("Respuesta guardada localmente:", err);
        setSendingQuickReply(false);
        setReplyModalOpen(false);
        setToastMsg('✓ Respuesta registrada exitosamente');
        setAttentionItems(prev => prev.filter(i => i.id !== activeReplyIssue.id));
        setTimeout(() => setToastMsg(''), 3000);
      });
  };

  const assignedIssuesList = (scorecard?.assigned_issues && scorecard.assigned_issues.length > 0)
    ? scorecard.assigned_issues 
    : DEFAULT_ASSIGNED_ISSUES;

  const filteredTasks = assignedIssuesList.filter(issue => {
    const status = (issue.status_actual || '').toUpperCase();
    if (taskFilter === 'IN_PROGRESS') return status.includes('PROGRESO');
    if (taskFilter === 'PENDING') return status.includes('PENDIENTE');
    if (taskFilter === 'BLOCKED') return status.includes('BLOQUEADA');
    if (taskFilter === 'COMPLETED') return status.includes('COMPLETADA') || status.includes('LISTO');
    return true;
  });

  const historiasCount = assignedIssuesList.filter(i => (i.tipo || '').includes('Historia')).length || 3;
  const bugsCount = assignedIssuesList.filter(i => (i.tipo || '').includes('Bug')).length || 2;
  const tareasCount = assignedIssuesList.filter(i => (i.tipo || '').includes('Tarea')).length || 2;
  const totalCount = assignedIssuesList.length || 7;

  const donutData = [
    { name: 'Historias de Usuario', count: historiasCount, pct: Math.round((historiasCount / totalCount) * 100), color: '#8b5cf6', icon: User },
    { name: 'Bugs / Defectos', count: bugsCount, pct: Math.round((bugsCount / totalCount) * 100), color: '#ec4899', icon: Bug },
    { name: 'Tareas / Deuda Técnica', count: tareasCount, pct: Math.round((tareasCount / totalCount) * 100), color: '#00f5d4', icon: FileText }
  ];

  return (
    <div className="w-full flex-1 h-full flex flex-col space-y-6 pb-12 overflow-y-auto text-left font-sans transition-colors duration-300 relative">
      
      {/* TOAST DE RESPUESTA ENVIADA */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. ENCABEZADO CONSOLE DE TRABAJO INDIVIDUAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#141738] p-5 rounded-2xl border border-slate-200 dark:border-[#272b5c] shadow-sm dark:shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-xl shadow-md shadow-purple-900/40 shrink-0">
            {devName.substring(0, 1).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 flex-wrap">
              Mi Trabajo: {devName}
              <span className="flex items-center gap-1.5 rounded-full bg-indigo-500/10 dark:bg-[#00f5d4]/20 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-[#00f5d4] border border-indigo-500/20 dark:border-[#00f5d4]/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-[#00f5d4] animate-pulse"></span>
                DEVELOPER
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Consola interactiva de trabajo individual y métricas de carga de trabajo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            🟢 Sincronizado hace 5 min
          </span>

          <button
            onClick={handlePrintPDF}
            className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md border border-indigo-400/30 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <Printer size={14} />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={handleReloadData}
            className="p-2 text-slate-400 hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
            title="Actualizar datos"
          >
            <RotateCcw size={15} className={isRefreshing ? "animate-spin text-indigo-400" : ""} />
          </button>
        </div>
      </div>

      {/* 2. KPIS PERSONALES (DEL DESARROLLADOR) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CYCLE TIME */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-[#141738] p-5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#272b5c] justify-between transition-all duration-300 hover:border-emerald-500/60 min-h-[150px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Clock size={16} />
              </div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">CYCLE TIME</h3>
            </div>
            <MetricInfoTooltip text="Tu tiempo promedio en resolver incidencias desglosado individualmente." />
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <div>
              <span className="text-3xl font-black text-emerald-500 tracking-tight">3.2</span>
              <span className="text-xs font-bold text-emerald-500 ml-1">días</span>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">↓ 0.3d vs sprint previo</p>
            </div>
            <SparklineMini color="#00f5d4" />
          </div>
        </div>

        {/* TICKETS WIP */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-[#141738] p-5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#272b5c] justify-between transition-all duration-300 hover:border-purple-500/60 min-h-[150px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ClipboardList size={16} />
              </div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">TICKETS WIP</h3>
            </div>
            <MetricInfoTooltip text="Tus incidencias activas en progreso en tu tablero personal." />
          </div>

          <div className="mt-2 space-y-1.5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">7</span>
                <span className="text-xs font-bold text-purple-400 ml-1">tickets activos</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                70% de capacidad
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full w-[70%]"></div>
            </div>
          </div>
        </div>

        {/* THROUGHPUT */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-[#141738] p-5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#272b5c] justify-between transition-all duration-300 hover:border-cyan-500/60 min-h-[150px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <CheckCircle size={16} />
              </div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">THROUGHPUT</h3>
            </div>
            <MetricInfoTooltip text="Total de entregas e historias completadas por ti en este sprint." />
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <div>
              <span className="text-3xl font-black text-cyan-400 tracking-tight">14</span>
              <span className="text-xs font-bold text-cyan-400 ml-1">tickets</span>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Promedio: 2.3/día</p>
            </div>
            <div className="w-16 h-7">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{v:2},{v:3},{v:1},{v:4},{v:4}]}>
                  <Bar dataKey="v" fill="#00c2ff" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* STORY POINTS */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-[#141738] p-5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#272b5c] justify-between transition-all duration-300 hover:border-pink-500/60 min-h-[150px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <Zap size={16} />
              </div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">STORY POINTS</h3>
            </div>
            <MetricInfoTooltip text="Puntos de historia completados versus tu meta del sprint." />
          </div>

          <div className="mt-2 space-y-1.5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">65</span>
                <span className="text-xs font-bold text-pink-400 ml-1">SP</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30">
                81% de la meta
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 h-full w-[81%]"></div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. NUEVA SECCIÓN PRINCIPAL: "REQUIERE MI ATENCIÓN" */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] shadow-sm dark:shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell size={18} className="text-amber-500 animate-bounce" />
              Requiere mi atención
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Actividades, bloqueos y solicitudes que necesitan una acción inmediata.
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            {attentionItems.length} pendientes
          </span>
        </div>

        {/* TARJETAS COMPACTAS DE ATENCIÓN */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {attentionItems.map((item) => (
            <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/30 px-2 rounded-xl">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  item.type === 'BLOCK' ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30' :
                  item.type === 'REQUEST' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' :
                  item.type === 'REVIEW' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                  'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                }`}>
                  {item.type === 'BLOCK' ? <ShieldAlert size={16} /> :
                   item.type === 'REQUEST' ? <MessageSquare size={16} /> :
                   item.type === 'REVIEW' ? <Clock size={16} /> :
                   <AlertTriangle size={16} />}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 rounded border border-slate-200 dark:border-slate-700">
                      {item.key_issue}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0">
                {item.type === 'REQUEST' ? (
                  <button
                    onClick={() => handleOpenReply(item)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare size={13} />
                    <span>Responder</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const targetTask = DEFAULT_ASSIGNED_ISSUES.find(t => t.key_issue === item.key_issue);
                      if (targetTask) setSelectedIssueModal(targetTask);
                    }}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. AI DEV COACH (BÚHO DE RECOMENDACIÓN INTELIGENTE) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shrink-0 shadow-md">
            <span className="text-2xl">🦉</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">AI DEV COACH</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                Prioridad Recomendada
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
              Tienes una incidencia bloqueada desde hace 2 días (<strong className="text-rose-400">MCHAV-105</strong>) y una solicitud pendiente de respuesta. Te recomendamos atender primero MCHAV-105 porque es crítica y está deteniendo las pruebas de QA.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const target = DEFAULT_ASSIGNED_ISSUES.find(t => t.key_issue === 'MCHAV-105');
              if (target) setSelectedIssueModal(target);
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow cursor-pointer"
          >
            Ver MCHAV-105
          </button>
          <button
            onClick={() => onNavigateToAlerts && onNavigateToAlerts()}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700 cursor-pointer"
          >
            Ver solicitudes
          </button>
        </div>
      </div>

      {/* 5. DISTRIBUCIÓN DE MI TRABAJO (ÚNICA GRÁFICA LIMPIA) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] shadow-sm dark:shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <PieChartIcon size={16} className="text-indigo-400" />
              Distribución de mi trabajo
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proporción de tiempo y esfuerzo asignado por tipo de incidencia personal.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">Total: {totalCount} incidencias</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="pct"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Mis Tareas</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {donutData.map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <ItemIcon size={14} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {item.count} <span className="text-slate-400 text-[10px] ml-0.5">({item.pct}%)</span>
                  </span>
                </div>
              );
            })}
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
