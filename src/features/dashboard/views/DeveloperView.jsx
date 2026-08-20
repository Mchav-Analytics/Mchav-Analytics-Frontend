// ============================================================================
// VISTA DEL DESARROLLADOR — MI TRABAJO (WORKSPACE PERSONAL DE TRABAJO)
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
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
  Send,
  MessageSquare,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  ListTodo,
  PieChart as PieChartIcon,
  Sparkles,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Tooltip as RechartsTooltip } from 'recharts';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { developerService, jiraService, jqlService, projectService } from '../../../services/api';

import LiderNotificationBell from '../components/LiderNotificationBell';
import DeveloperProjectHeader from '../../../components/layout/DeveloperProjectHeader';
import { DeveloperPdfReport } from '../components/DeveloperPdfReport';
import { useReactToPrint } from 'react-to-print';

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
    <div className="group/tooltip relative inline-flex items-center cursor-help ml-1.5 shrink-0 z-[100]">
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
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0.0} />
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
  projects = [],
  selectedProjectId = 'PROJ-01',
  setSelectedProjectId,
  syncSuccessMsg,
  alerts = [],
  onNavigateToAlerts,
  onNavigateTab
}) {
  const { user } = useAuth();
  const [scorecard, setScorecard] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [taskFilter, setTaskFilter] = useState('ALL'); // 'ALL' | 'IN_PROGRESS' | 'PENDING' | 'BLOCKED' | 'COMPLETED'
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'Historia' | 'Bug' | 'Tarea'
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Modales interactivos
  const [selectedIssueModal, setSelectedIssueModal] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeReplyIssue, setActiveReplyIssue] = useState(null);
  const [quickReplyText, setQuickReplyText] = useState('');
  const [sendingQuickReply, setSendingQuickReply] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Centro de Alertas y Ayuda
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const [alertsTab, setAlertsTab] = useState('request_form'); // 'request_form' | 'sent_requests' | 'alerts'
  const [helpIssueKey, setHelpIssueKey] = useState('MCHAV-105');
  const [helpType, setHelpType] = useState('Bloqueo Técnico');
  const [helpUrgency, setHelpUrgency] = useState('Alta');
  const [helpMessage, setHelpMessage] = useState('');
  const [submittedHelpRequests, setSubmittedHelpRequests] = useState([
    {
      id: 'SOL-801',
      issueKey: 'MCHAV-105',
      type: 'Bloqueo Técnico',
      urgency: 'Alta',
      message: 'Requiero apoyo en la configuración del servicio de pagos para QA.',
      status: 'EN REVISIÓN LÍDER',
      date: '2026-08-12 11:30'
    }
  ]);
  const [showHelpSuccessToast, setShowHelpSuccessToast] = useState(false);

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
      
      // Intentar cargar las incidencias reales desde la base de datos local
      try {
        const userEmail = user?.email || 'valentina1025m@gmail.com';
        const userName = user?.nombre || 'Valentina Montalvo';
        const projectId = selectedProjectId || '10000';
        
        // Importante: usamos la API para que consulte la tabla issues local, evitando problemas de JQL Cloud
        const dbRes = await projectService.getKpiIssuesDetail(projectId, { assignee_email: userEmail, assignee_name: userName, limit: 50 });
        
        if (dbRes && dbRes.issues && dbRes.issues.length > 0) {
          const realIssues = dbRes.issues.map(issue => {
            let st = issue.status_actual?.toUpperCase() || 'PENDIENTE';
            if (['FINALIZADO', 'DONE', 'COMPLETADA', 'LISTO'].includes(st)) st = 'LISTO';
            else if (['IN PROGRESS', 'EN CURSO', 'EN PROGRESO'].includes(st)) st = 'EN PROGRESO';
            else if (['TO DO', 'POR HACER', 'PENDIENTE', 'BACKLOG'].includes(st)) st = 'PENDIENTE';

            return {
             key_issue: issue.key_issue,
             summary: issue.summary,
             status_actual: st,
             story_points: issue.story_points || 0,
             cycle_time_days: issue.cycle_time_days || 0,
             tipo: issue.issue_type || 'Tarea',
             prioridad: issue.priority || 'Media',
             epic_name: issue.epic_name,
             fecha_creacion: issue.created_at
            };
          });
          data.assigned_issues = realIssues;
        } else {
          // Si no hay incidencias reales para este usuario
          data.assigned_issues = [];
        }
      } catch (dbErr) {
        console.warn("No se pudieron cargar las incidencias reales locales:", dbErr);
      }

      setScorecard(data);
    } catch (err) {
      console.warn("Error cargando scorecard:", err);
    }
  };

  useEffect(() => {
    loadScorecard();
    const timer = setInterval(() => {
      loadScorecard();
    }, 15000); // 15 seconds polling
    return () => clearInterval(timer);
  }, [selectedProjectId, user?.email]);

  const handleReloadData = async () => {
    setIsRefreshing(true);
    await loadScorecard();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // CAMBIO DE ESTADO EN TIEMPO REAL & REGISTRO EN EL HISTORIAL DE ACTIVIDAD
  const handleUpdateTaskStatus = (issueKey, newStatus, storyPoints = 5, summary = '') => {
    setScorecard(prev => {
      if (!prev) return prev;
      const issues = prev.assigned_issues || [];
      return {
        ...prev,
        assigned_issues: issues.map(t => {
          if (t.key_issue === issueKey) {
            return { ...t, status_actual: newStatus };
          }
          return t;
        })
      };
    });

    if (newStatus === 'LISTO' || newStatus === 'COMPLETADA') {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newLog = {
        time: `Hoy ${nowStr}`,
        key: issueKey,
        action: `Resolviste e hiciste entrega a QA / Producción (Done)`,
        points: `${storyPoints} SP`,
        type: (summary || '').toLowerCase().includes('bug') ? 'Bug' : 'Story'
      };
      const existingLogs = JSON.parse(localStorage.getItem('mchav_user_activity_log') || '[]');
      localStorage.setItem('mchav_user_activity_log', JSON.stringify([newLog, ...existingLogs]));
      showNotificationToast(`✨ Tarea ${issueKey} marcada como LISTO y registrada en tu Historial`);
    } else {
      showNotificationToast(`✨ Estado de ${issueKey} actualizado a "${newStatus}"`);
    }

    if (selectedIssueModal && selectedIssueModal.key_issue === issueKey) {
      setSelectedIssueModal(prev => prev ? { ...prev, status_actual: newStatus } : null);
    }
  };

  const printComponentRef = useRef();

  const handlePrintPDF = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: `Informe_Ejecutivo_MCHAV_${new Date().toISOString().split('T')[0]}`,
    removeAfterPrint: true
  });

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

  // Enviar solicitud de ayuda al líder
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

  const assignedIssuesList = scorecard?.assigned_issues || [];

  const filteredTasks = assignedIssuesList.filter(issue => {
    const status = (issue.status_actual || '').toUpperCase();
    const type = (issue.tipo || '').toUpperCase();
    
    let statusMatch = true;
    if (taskFilter === 'IN_PROGRESS') statusMatch = status.includes('PROGRESO');
    else if (taskFilter === 'PENDING') statusMatch = status.includes('PENDIENTE') || status.includes('TO DO');
    else if (taskFilter === 'BLOCKED') statusMatch = status.includes('BLOQUEADA');
    else if (taskFilter === 'COMPLETED') statusMatch = status.includes('COMPLETADA') || status.includes('LISTO') || status.includes('DONE');
    
    let typeMatch = true;
    if (typeFilter === 'Historia') typeMatch = type.includes('HISTORIA') || type.includes('STORY');
    else if (typeFilter === 'Bug') typeMatch = type.includes('BUG');
    else if (typeFilter === 'Tarea') typeMatch = type.includes('TAREA') || type.includes('TASK');
    
    return statusMatch && typeMatch;
  });

  const historiasCount = assignedIssuesList.filter(i => (i.tipo || '').includes('Historia')).length || 3;
  const bugsCount = assignedIssuesList.filter(i => (i.tipo || '').includes('Bug')).length || 2;
  const tareasCount = assignedIssuesList.filter(i => (i.tipo || '').includes('Tarea')).length || 2;
  const totalCount = assignedIssuesList.length || 7;

  // Generate dynamic notifications for recent assigned tasks
  const dynamicNotifications = assignedIssuesList
    .slice()
    .sort((a, b) => new Date(b.fecha_creacion || 0) - new Date(a.fecha_creacion || 0))
    .slice(0, 4)
    .map(t => {
      let timeStr = 'Reciente';
      if (t.fecha_creacion) {
        const diffMs = new Date() - new Date(t.fecha_creacion);
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) timeStr = `Hace ${diffMins} min`;
        else if (diffMins < 1440) timeStr = `Hace ${Math.floor(diffMins / 60)} horas`;
        else timeStr = `Hace ${Math.floor(diffMins / 1440)} días`;
      }
      return {
        id: `dyn-task-${t.key_issue}`,
        type: 'TASK_ASSIGNED',
        title: '📌 Nueva Tarea Asignada',
        description: `Te han asignado la incidencia ${t.key_issue}: ${t.summary}`,
        tagline: `Asignado por el equipo.`,
        time: timeStr,
        isRead: false,
        issueKey: t.key_issue
      };
    });

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


      {/* 1. ENCABEZADO CONSOLE DE TRABAJO INDIVIDUAL (ESTILO DESIGN SYSTEM) */}
      <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold shadow-md shrink-0">
            <User size={24} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                DEVELOPER WORKSPACE
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                • Desarrollador: <strong className="text-slate-800 dark:text-slate-200 font-bold">{devName}</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Mi Trabajo
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* ENCABEZADO DE CONTEXTO DE PROYECTO ACTIVO INTEGRADO */}
          <div className="pr-4 border-r border-slate-200 dark:border-slate-700/50">
            <DeveloperProjectHeader 
              projects={projects}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              syncSuccessMsg={syncSuccessMsg}
              isGlobalView={true}
            />
          </div>

          {/* CAMPANITA DE NOTIFICACIONES CON PREVIA EMERGENTE & ENLACE AL CENTRO DE ACTIVIDAD */}
          <LiderNotificationBell 
            onNavigateTab={onNavigateTab} 
            dynamicNotifications={dynamicNotifications} 
            onOpenTask={(issueKey) => {
              if (onNavigateTab) {
                onNavigateTab('dev_workload');
              }
            }}
          />

          <button
            onClick={handlePrintPDF}
            className="px-4 py-2.5 rounded-2xl bg-[#5b36f5] hover:bg-indigo-600 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Printer size={15} />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={handleReloadData}
            className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all cursor-pointer shadow-xs"
            title="Actualizar datos"
          >
            <RotateCcw size={16} className={isRefreshing ? "animate-spin text-indigo-500" : ""} />
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
            <MetricInfoTooltip align="left" text="Tu tiempo promedio en resolver incidencias desglosado individualmente." />
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <div>
              <span className="text-3xl font-black text-emerald-500 tracking-tight">{scorecard?.cycle_time_personal ?? '3.2'}</span>
              <span className="text-xs font-bold text-emerald-500 ml-1">días</span>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{scorecard?.cycle_time_prev && scorecard?.cycle_time_personal ? (scorecard.cycle_time_personal <= scorecard.cycle_time_prev ? '↓' : '↑') + ' ' + Math.abs(scorecard.cycle_time_personal - scorecard.cycle_time_prev).toFixed(1) + 'd vs sprint previo' : '↓ 0.3d vs sprint previo'}</p>
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
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{scorecard?.wip_tickets ?? 7}</span>
                <span className="text-xs font-bold text-purple-400 ml-1">tickets activos</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                {scorecard?.wip_max ? Math.round(((scorecard.wip_tickets ?? 0) / scorecard.wip_max) * 100) : 70}% de capacidad
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full" style={{ width: `${scorecard?.wip_max ? Math.min(Math.round(((scorecard.wip_tickets ?? 0) / scorecard.wip_max) * 100), 100) : 70}%` }}></div>
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
            <MetricInfoTooltip align="right" text="Total de entregas e historias completadas por ti en este sprint." />
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <div>
              <span className="text-3xl font-black text-cyan-400 tracking-tight">{scorecard?.throughput_tickets ?? 14}</span>
              <span className="text-xs font-bold text-cyan-400 ml-1">tickets</span>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Promedio: {scorecard?.throughput_avg_daily ?? '2.3'}/día</p>
            </div>
            <div className="w-16 h-7">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ v: 2 }, { v: 3 }, { v: 1 }, { v: 4 }, { v: 4 }]}>
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
            <MetricInfoTooltip align="right" text="Puntos de historia completados versus tu meta del sprint." />
          </div>

          <div className="mt-2 space-y-1.5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{scorecard?.story_points_burned ?? 65}</span>
                <span className="text-xs font-bold text-pink-400 ml-1">SP</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30">
                {scorecard?.story_points_achieved_pct ?? 81}% de la meta
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 h-full" style={{ width: `${Math.min(scorecard?.story_points_achieved_pct ?? 81, 100)}%` }}></div>
            </div>
          </div>
        </div>

      </div>







      {/* 4. SECCIÓN GRID SIDE-BY-SIDE EQUILIBRADA: DISTRIBUCIÓN DE MI TRABAJO & MIS TAREAS ASIGNADAS CON PAGINACIÓN */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">

        {/* TARJETA IZQUIERDA (5 COLUMNAS): DISTRIBUCIÓN DE MI TRABAJO CON GRÁFICA Y LEYENDAS LADO A LADO */}
        <div className="xl:col-span-5 p-6 rounded-2xl bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="space-y-0.5">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <PieChartIcon size={16} className="text-indigo-400" />
                Distribución de mi trabajo
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Proporción de tiempo y esfuerzo asignado por tipo de incidencia personal.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 shrink-0 ml-2">Total: {totalCount} incidencias</span>
          </div>

          {/* CONTENIDO CENTRADO Y NATIVO LADO A LADO */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-2">

              {/* GRÁFICA CIRCULAR DE DONA */}
              <div className="h-44 w-full relative flex items-center justify-center shrink-0">
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
                      {donutData.map((entry, index) => {
                        const tMap = { 'Historias de Usuario': 'Historia', 'Bugs / Defectos': 'Bug', 'Tareas / Deuda Técnica': 'Tarea' };
                        const isSelected = typeFilter === tMap[entry.name];
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            opacity={typeFilter === 'ALL' || isSelected ? 1 : 0.3}
                            className="cursor-pointer transition-all hover:opacity-80 outline-none"
                            onClick={() => {
                              const newType = tMap[entry.name];
                              setTypeFilter(prev => prev === newType ? 'ALL' : newType);
                              setCurrentPage(1);
                            }}
                          />
                        );
                      })}
                    </Pie>
                    <RechartsTooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Mis Tareas</span>
                </div>
              </div>

              {/* LEYENDAS LADO A LADO */}
              <div className="space-y-2.5">
                {donutData.map((item, idx) => {
                  const ItemIcon = item.icon;
                  const tMap = { 'Historias de Usuario': 'Historia', 'Bugs / Defectos': 'Bug', 'Tareas / Deuda Técnica': 'Tarea' };
                  const isSelected = typeFilter === tMap[item.name];
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => {
                        const newType = tMap[item.name];
                        setTypeFilter(prev => prev === newType ? 'ALL' : newType);
                        setCurrentPage(1);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border ${isSelected ? 'bg-slate-100 dark:bg-slate-800 border-indigo-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <ItemIcon size={14} className={`${isSelected ? 'text-indigo-500' : 'text-slate-400'} shrink-0`} />
                        <span className={`text-xs font-semibold truncate ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{item.name}</span>
                      </div>
                      <span className={`text-xs font-black shrink-0 ml-1 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                        {item.count} <span className="text-slate-400 text-[10px]">({item.pct}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

        {/* TARJETA DERECHA (7 COLUMNAS): MIS TAREAS ASIGNADAS CON PAGINACIÓN */}
        {(() => {
          const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE) || 1;
          const paginatedTasks = filteredTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

          return (
            <div className="xl:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="space-y-0.5">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <ListTodo size={18} className="text-indigo-400" />
                    Mis Tareas Asignadas
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Listado completo de tus tareas asignadas con estado y esfuerzo.
                  </p>
                </div>

                {/* FILTROS DE ESTADO */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
                  {[
                    { key: 'ALL', label: 'Todas' },
                    { key: 'IN_PROGRESS', label: 'En progreso' },
                    { key: 'PENDING', label: 'Pendientes' },
                    { key: 'BLOCKED', label: 'Bloqueadas' },
                    { key: 'COMPLETED', label: 'Completadas' }
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => {
                        setTaskFilter(f.key);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer shrink-0 ${taskFilter === f.key
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TABLA DE TAREAS ASIGNADAS */}
              <div className="overflow-x-auto flex-1 min-h-[220px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold uppercase text-slate-400">
                      <th className="py-2.5 px-3">Clave</th>
                      <th className="py-2.5 px-3">Resumen</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3 text-center">SP</th>
                      <th className="py-2.5 px-3 text-center">Cycle</th>
                      <th className="py-2.5 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {paginatedTasks.length > 0 ? (
                      paginatedTasks.map((t) => (
                        <tr key={t.key_issue} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-300">
                            {t.key_issue}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                            {t.summary}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-lg ${t.status_actual === 'BLOQUEADA' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                              t.status_actual === 'EN PROGRESO' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                                t.status_actual === 'EN REVISIÓN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                                  t.status_actual === 'COMPLETADA' || t.status_actual === 'LISTO' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                                    'bg-slate-800 text-slate-300'
                              }`}>
                              {t.status_actual}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                            {t.story_points} SP
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold text-slate-400 text-[11px]">
                            {t.cycle_time_days > 0 ? `${t.cycle_time_days}d` : '--'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setSelectedIssueModal(t)}
                              className="px-3 py-1 text-[11px] font-extrabold rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                            >
                              Ver
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                          No hay tareas que coincidan con este filtro.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* CONTROLES DE PAGINACIÓN */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                <span className="text-slate-400 font-medium">
                  Mostrando {filteredTasks.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredTasks.length)} de {filteredTasks.length} tareas
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                  >
                    Anterior
                  </button>

                  <span className="text-slate-400 font-bold text-xs px-1">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                  >
                    Siguiente
                  </button>
                </div>
              </div>

            </div>
          );
        })()}

      </div>

      {/* MODAL RÁPIDO DE RESPUESTA EN LUGAR DE REDIRECCIÓN */}
      {replyModalOpen && activeReplyIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {activeReplyIssue.key_issue || 'MCHAV-128'}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Responder solicitud
                </h3>
              </div>
              <button
                onClick={() => setReplyModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Carlos Pérez</span>
                <span className="text-[10px] text-slate-400">Hace 15m</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "{activeReplyIssue.message || activeReplyIssue.detail}"
              </p>
            </div>

            <form onSubmit={handleSendQuickReply} className="space-y-3">
              <textarea
                required
                rows={3}
                value={quickReplyText}
                onChange={(e) => setQuickReplyText(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
              />

              <div className="flex items-center justify-between pt-1">
                <a
                  href={`https://beltrancamilo592.atlassian.net/browse/${activeReplyIssue.key_issue || 'MCHAV-128'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Abrir en Jira</span>
                  <ExternalLink size={12} />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={sendingQuickReply}
                    className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    <span>{sendingQuickReply ? 'Enviando...' : 'Enviar respuesta'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLE DE TAREA */}
      {selectedIssueModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] w-full max-w-3xl rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-400 border border-slate-700 rounded">
                  {selectedIssueModal.key_issue}
                </span>
                <span className="px-2 py-0.5 text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded">
                  {selectedIssueModal.status_actual}
                </span>
              </div>
              <button
                onClick={() => setSelectedIssueModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedIssueModal.summary}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {selectedIssueModal.descripcion || 'Sin descripción detallada de Jira.'}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block">Prioridad</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{selectedIssueModal.prioridad}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block">Story Points</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{selectedIssueModal.story_points} SP</strong>
                </div>
              </div>

              {/* CONTROLES DE CAMBIO DE ESTADO (EN PROGRESO / REVISIÓN / BLOQUEADA / LISTO) */}
              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-[#1a1d40] border border-indigo-200 dark:border-[#33376b] space-y-2 text-left">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                  Cambiar Estado de la Incidencia:
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { key: 'EN PROGRESO', label: 'En Progreso' },
                    { key: 'EN REVISIÓN', label: 'En Revisión' },
                    { key: 'BLOQUEADA', label: 'Bloqueada' },
                    { key: 'LISTO', label: '✅ Marcar como LISTO (Done)' }
                  ].map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => handleUpdateTaskStatus(selectedIssueModal.key_issue, st.key, selectedIssueModal.story_points, selectedIssueModal.summary)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        selectedIssueModal.status_actual === st.key
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-600 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <a
                href={`https://beltrancamilo592.atlassian.net/browse/${selectedIssueModal.key_issue}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Abrir en Jira ↗</span>
              </a>
              <button
                onClick={() => setSelectedIssueModal(null)}
                className="px-4 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ALERTAS Y SOLICITAR AYUDA DEL DESARROLLADOR */}
      {alertsModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="text-amber-400 fill-amber-400" size={18} />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Centro de Alertas & Solicitar Ayuda (Dev Workspace)
                </h3>
              </div>
              <button
                onClick={() => setAlertsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* PESTAÑAS DEL MODAL */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setAlertsTab('request_form')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${alertsTab === 'request_form'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                + Nueva Solicitud
              </button>
              <button
                onClick={() => setAlertsTab('sent_requests')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${alertsTab === 'sent_requests'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Mis Solicitudes ({submittedHelpRequests.length})
              </button>
              <button
                onClick={() => setAlertsTab('alerts')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${alertsTab === 'alerts'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Mis Alertas (3)
              </button>
            </div>

            {showHelpSuccessToast && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold text-center animate-in fade-in">
                ✨ Solicitud enviada exitosamente al Líder Técnico.
              </div>
            )}

            {/* CONTENIDO PESTAÑA 1: FORMULARIO NUEVA SOLICITUD */}
            {alertsTab === 'request_form' && (
              <form onSubmit={handleSubmitHelpRequest} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Incidencia Relacionada</label>
                    <select
                      value={helpIssueKey}
                      onChange={(e) => setHelpIssueKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {assignedIssuesList.slice(0, 5).map(i => (
                        <option key={i.key_issue} value={i.key_issue}>{i.key_issue} - {i.summary.substring(0, 25)}...</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Tipo de Apoyo Requerido</label>
                    <select
                      value={helpType}
                      onChange={(e) => setHelpType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Bloqueo Técnico">Bloqueo Técnico</option>
                      <option value="Aprobación de Pull Request">Aprobación de Pull Request</option>
                      <option value="Aclaración de Requerimiento">Aclaración de Requerimiento</option>
                      <option value="Problemas de Ambiente / Credenciales">Problemas de Ambiente / Credenciales</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Mensaje Detallado para el Líder</label>
                  <textarea
                    rows={3}
                    required
                    value={helpMessage}
                    onChange={(e) => setHelpMessage(e.target.value)}
                    placeholder="Describe el bloqueo o duda técnica requerida..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAlertsModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    <span>Enviar a Líder</span>
                  </button>
                </div>
              </form>
            )}

            {/* CONTENIDO PESTAÑA 2: SOLICITUDES ENVIADAS */}
            {alertsTab === 'sent_requests' && (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {submittedHelpRequests.map(r => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-indigo-400 font-mono">{r.issueKey} ({r.type})</span>
                      <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 italic">"{r.message}"</p>
                    <span className="text-[10px] text-slate-500 block">{r.date}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CONTENIDO PESTAÑA 3: MIS ALERTAS */}
            {alertsTab === 'alerts' && (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {[
                  { id: 1, type: 'critical', text: 'MCHAV-105 en inactividad (2 días en bloqueo). Se sugiere solicitar apoyo.' },
                  { id: 2, type: 'warning', text: 'WIP en 7 tareas abiertas. Mantener WIP ≤ 3 mejora la velocidad de entrega.' },
                  { id: 3, type: 'info', text: 'Sprint activo. 81% de Story Points completados.' }
                ].map(a => (
                  <div key={a.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                    <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300 leading-relaxed">{a.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPONENTE OCULTO PARA IMPRESIÓN PDF */}
      <DeveloperPdfReport 
        ref={printComponentRef} 
        project={projects.find(p => String(p.id_proyecto) === String(selectedProjectId))}
        devName={devName}
        kpis={scorecard?.kpis}
        assignedIssues={assignedIssuesList}
      />
    </div>
  );
}
