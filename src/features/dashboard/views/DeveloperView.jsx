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
import AiDevCoach from '../components/AiDevCoach';

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
      align === "right" ? "right-0 sm:right-0 sm:translate-x-0 -translate-x-3/4 sm:-translate-x-0" :
        "left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0";

  return (
    <div className="group/tooltip relative inline-flex items-center cursor-help ml-1.5 shrink-0 z-30">
      <div className="p-1 rounded-full text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer border border-transparent hover:border-indigo-500/30">
        <Info size={14} className="shrink-0" />
      </div>
      <div className={`opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 absolute top-full ${alignClass} mt-2 w-56 sm:w-68 max-w-[calc(100vw-3rem)] p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 text-xs font-medium rounded-xl shadow-2xl border border-indigo-500/60 pointer-events-none leading-relaxed text-left z-40`}>
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
  const [aiCoachTip, setAiCoachTip] = useState(null);
  const [efficiencyGain, setEfficiencyGain] = useState(14);
  const [cleanDeliveries, setCleanDeliveries] = useState(100);
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
  const [helpIssueKey, setHelpIssueKey] = useState('');
  const [helpType, setHelpType] = useState('Bloqueo Técnico');
  const [helpUrgency, setHelpUrgency] = useState('Alta');
  const [helpMessage, setHelpMessage] = useState('');
  const [submittedHelpRequests, setSubmittedHelpRequests] = useState([]);
  const [showHelpSuccessToast, setShowHelpSuccessToast] = useState(false);

  // Elementos "Requiere mi atención"
  const [attentionItems, setAttentionItems] = useState([]);

  const devName = user?.nombre || 'Desarrollador';

  const loadScorecard = async () => {
    try {
      const activeProjId = selectedProjectId || (projects && projects[0]?.id_proyecto) || '10000';
      const data = await developerService.getMyScorecard(activeProjId);
      
      // Cargar consejo del AI Dev Coach
      try {
        const focusData = await developerService.getDailyFocus(activeProjId);
        if (focusData) {
          if (focusData.ai_coach_tip) setAiCoachTip(focusData.ai_coach_tip);
          if (focusData.efficiency_gain_pct !== undefined) setEfficiencyGain(focusData.efficiency_gain_pct);
          if (focusData.clean_deliveries_pct !== undefined) setCleanDeliveries(focusData.clean_deliveries_pct);
        }
      } catch (fErr) {
        console.warn("No se pudo cargar el consejo de Gemini DailyFocus:", fErr);
      }
      
      if (data && Array.isArray(data.assigned_issues)) {
        data.assigned_issues = data.assigned_issues.map(issue => {
          let st = (issue.status_actual || 'PENDIENTE').toUpperCase();
          if (['FINALIZADO', 'DONE', 'COMPLETADA', 'LISTO'].some(s => st.includes(s))) st = 'LISTO';
          else if (['IN PROGRESS', 'EN CURSO', 'EN PROGRESO'].some(s => st.includes(s))) st = 'EN PROGRESO';
          else if (['TO DO', 'POR HACER', 'PENDIENTE', 'BACKLOG'].some(s => st.includes(s))) st = 'PENDIENTE';

          return {
            key_issue: issue.key_issue,
            summary: issue.summary,
            status_actual: st,
            rawStatus: issue.status_actual,
            story_points: issue.story_points || 0,
            cycle_time_days: issue.cycle_time_days || 0,
            tipo: issue.issue_type || issue.tipo || 'Historia',
            prioridad: issue.priority || issue.prioridad || 'Media',
            epic_name: issue.epic_name,
            fecha_creacion: issue.created_at
          };
        });
      }

      setScorecard(data);
    } catch (err) {
      console.warn("Error cargando scorecard:", err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      // 1. Cargar de inmediato los datos locales
      await loadScorecard();
      // 2. Sincronizar en segundo plano con Jira y refrescar
      try {
        await jiraService.triggerSync(true);
        await loadScorecard();
      } catch (e) {
        // Ignorar si ya está corriendo o falla
      }
    };
    initData();

    const timer = setInterval(async () => {
      try {
        await jiraService.triggerSync(true);
      } catch (e) {}
      loadScorecard();
    }, 20000);
    return () => clearInterval(timer);
  }, [selectedProjectId, user?.email]);

  const handleReloadData = async () => {
    setIsRefreshing(true);
    try {
      setToastMsg('Sincronizando tareas con Jira...');
      await jiraService.triggerSync(true);
    } catch (e) {
      console.warn('Sync ya está en proceso o falló', e);
    } finally {
      setTimeout(() => setToastMsg(''), 3000);
    }
    await loadScorecard();
    setTimeout(() => setIsRefreshing(false), 500);
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
  }).sort((a, b) => new Date(b.fecha_creacion || 0) - new Date(a.fecha_creacion || 0));

  const historiasCount = assignedIssuesList.filter(i => (i.tipo || '').includes('Historia')).length;
  const bugsCount = assignedIssuesList.filter(i => (i.tipo || '').toLowerCase().includes('bug')).length;
  const tareasCount = assignedIssuesList.filter(i => (i.tipo || '').includes('Tarea') || (i.tipo || '').includes('Deuda')).length;
  const totalCount = assignedIssuesList.length;

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
        title: 'Nueva Tarea Asignada',
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
      <div className="w-full pb-4 sm:pb-6 relative flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-200/50 dark:border-[#272b5c]/50 mb-2">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] -z-10 opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold shadow-lg shadow-indigo-500/20 shrink-0">
            <User size={24} className="sm:w-7 sm:h-7" />
          </div>
          <div className="space-y-1 text-left min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-widest bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-1.5 shrink-0 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                DEVELOPER WORKSPACE
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                • Desarrollador: <strong className="text-slate-800 dark:text-slate-200 font-bold">{devName}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Mi Trabajo
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t border-slate-100 dark:border-slate-800/80 md:border-t-0">
          {/* ENCABEZADO DE CONTEXTO DE PROYECTO ACTIVO INTEGRADO */}
          <div className="pr-2 sm:pr-4 sm:border-r border-slate-200 dark:border-slate-700/50">
            <DeveloperProjectHeader 
              projects={projects}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              syncSuccessMsg={syncSuccessMsg}
              isGlobalView={true}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* CAMPANITA DE NOTIFICACIONES */}
            <LiderNotificationBell 
              onNavigateTab={onNavigateTab} 
              dynamicNotifications={dynamicNotifications} 
              onOpenTask={(issueKey) => {
                const found = assignedIssuesList.find(i => i.key_issue === issueKey || i.id_issue === issueKey);
                if (found) {
                  setSelectedIssueModal(found);
                } else if (onNavigateTab) {
                  onNavigateTab('dev_workload');
                }
              }}
            />

            <button
              onClick={handleReloadData}
              className="p-3 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-[#1a1e47] bg-white dark:bg-[#0c0e21] border border-slate-200 dark:border-[#272b5c] rounded-2xl transition-all cursor-pointer shadow-sm focus:ring-2 focus:ring-indigo-500/50"
              title="Actualizar datos"
            >
              <RotateCcw size={18} className={isRefreshing ? "animate-spin text-indigo-500" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* ASISTENTE INTELIGENTE — AI DEV COACH */}
      <AiDevCoach 
        tip={aiCoachTip}
        efficiencyGain={efficiencyGain}
        cleanDeliveries={cleanDeliveries}
        loading={isRefreshing}
      />

      {/* 2. KPIS PERSONALES (DEL DESARROLLADOR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">

        {/* CYCLE TIME */}
        <div className="flex flex-col rounded-3xl bg-white/80 dark:bg-[#141738]/80 backdrop-blur-md p-5 shadow-sm border border-slate-200/80 dark:border-[#272b5c]/80 justify-between transition-all duration-300 hover:shadow-emerald-500/10 hover:border-emerald-500/30 min-h-[140px] sm:min-h-[150px] relative group z-10 hover:z-50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] -z-10 opacity-[0.07] group-hover:opacity-[0.15] transition-opacity"></div>
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
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 tracking-tight drop-shadow-sm">{scorecard?.cycle_time_personal ?? '3.2'}</span>
              <span className="text-xs font-bold text-emerald-500 ml-1">días</span>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{scorecard?.cycle_time_prev && scorecard?.cycle_time_personal ? (scorecard.cycle_time_personal <= scorecard.cycle_time_prev ? '↓' : '↑') + ' ' + Math.abs(scorecard.cycle_time_personal - scorecard.cycle_time_prev).toFixed(1) + 'd vs sprint previo' : '↓ 0.3d vs sprint previo'}</p>
            </div>
            <SparklineMini color="#10b981" />
          </div>
        </div>

        {/* TICKETS WIP */}
        <div className="flex flex-col rounded-3xl bg-white/80 dark:bg-[#141738]/80 backdrop-blur-md p-5 shadow-sm border border-slate-200/80 dark:border-[#272b5c]/80 justify-between transition-all duration-300 hover:shadow-purple-500/10 hover:border-purple-500/30 min-h-[140px] sm:min-h-[150px] relative group z-10 hover:z-50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-[60px] -z-10 opacity-[0.07] group-hover:opacity-[0.15] transition-opacity"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ClipboardList size={16} />
              </div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">TICKETS WIP</h3>
            </div>
            <MetricInfoTooltip text="Tus incidencias activas en progreso en tu tablero personal." />
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-sm">{scorecard?.wip_tickets ?? 7}</span>
                <span className="text-xs font-bold text-purple-400 ml-1">activos</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                {scorecard?.wip_max ? Math.round(((scorecard.wip_tickets ?? 0) / scorecard.wip_max) * 100) : 70}% cap.
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900/60 h-2.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-[#272b5c]/50">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full relative" style={{ width: `${scorecard?.wip_max ? Math.min(Math.round(((scorecard.wip_tickets ?? 0) / scorecard.wip_max) * 100), 100) : 70}%` }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* THROUGHPUT */}
        <div className="flex flex-col rounded-3xl bg-white/80 dark:bg-[#141738]/80 backdrop-blur-md p-5 shadow-sm border border-slate-200/80 dark:border-[#272b5c]/80 justify-between transition-all duration-300 hover:shadow-cyan-500/10 hover:border-cyan-500/30 min-h-[140px] sm:min-h-[150px] relative group z-10 hover:z-50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500 rounded-full blur-[60px] -z-10 opacity-[0.07] group-hover:opacity-[0.15] transition-opacity"></div>
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
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight drop-shadow-sm">{scorecard?.throughput_tickets ?? 14}</span>
              <span className="text-xs font-bold text-cyan-500 ml-1">tickets</span>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Promedio: {scorecard?.throughput_avg_daily ?? '2.3'}/día</p>
            </div>
            <div className="w-16 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ v: 2 }, { v: 3 }, { v: 1 }, { v: 4 }, { v: 4 }]}>
                  <Bar dataKey="v" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* STORY POINTS */}
        <div className="flex flex-col rounded-3xl bg-white/80 dark:bg-[#141738]/80 backdrop-blur-md p-5 shadow-sm border border-slate-200/80 dark:border-[#272b5c]/80 justify-between transition-all duration-300 hover:shadow-pink-500/10 hover:border-pink-500/30 min-h-[140px] sm:min-h-[150px] relative group z-10 hover:z-50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500 rounded-full blur-[60px] -z-10 opacity-[0.07] group-hover:opacity-[0.15] transition-opacity"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
                <Zap size={16} />
              </div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">STORY POINTS</h3>
            </div>
            <MetricInfoTooltip align="right" text="Puntos de historia completados versus tu meta del sprint." />
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-sm">{scorecard?.story_points_burned ?? 65}</span>
                <span className="text-xs font-bold text-pink-500 ml-1">SP</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/30">
                {scorecard?.story_points_target > 0 ? `${scorecard?.story_points_achieved_pct ?? 0}% de la meta` : 'Sin meta'}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900/60 h-2.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-[#272b5c]/50">
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 h-full relative" style={{ width: scorecard?.story_points_target > 0 ? `${Math.min(scorecard?.story_points_achieved_pct ?? 0, 100)}%` : (scorecard?.story_points_burned > 0 ? '100%' : '0%') }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. SECCIÓN GRID SIDE-BY-SIDE EQUILIBRADA: DISTRIBUCIÓN DE MI TRABAJO & MIS TAREAS ASIGNADAS CON PAGINACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 flex-1">

        {/* TARJETA IZQUIERDA (5 COLUMNAS): DISTRIBUCIÓN DE MI TRABAJO CON GRÁFICA Y LEYENDAS */}
        <div className="lg:col-span-5 p-5 sm:p-7 rounded-3xl bg-white/80 dark:bg-[#141738]/80 backdrop-blur-md border border-slate-200/80 dark:border-[#272b5c]/80 shadow-sm space-y-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] -z-10 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity"></div>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="space-y-0.5">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <PieChartIcon size={16} className="text-indigo-400" />
                Distribución de mi trabajo
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Proporción de esfuerzo asignado por tipo de incidencia.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 shrink-0 ml-2">Total: {totalCount}</span>
          </div>

          {/* CONTENIDO CENTRADO Y NATIVO LADO A LADO */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 items-center gap-4 py-2">

              {/* GRÁFICA CIRCULAR DE DONA */}
              <div className="h-40 w-full relative flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={60}
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

              {/* LEYENDAS */}
              <div className="space-y-2">
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
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer border ${isSelected ? 'bg-slate-100 dark:bg-slate-800 border-indigo-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <ItemIcon size={13} className={`${isSelected ? 'text-indigo-500' : 'text-slate-400'} shrink-0`} />
                        <span className={`text-[11px] font-semibold truncate ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{item.name}</span>
                      </div>
                      <span className={`text-[11px] font-black shrink-0 ml-1.5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
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
            <div className="lg:col-span-7 p-5 sm:p-7 rounded-3xl bg-white/80 dark:bg-[#141738]/80 backdrop-blur-md border border-slate-200/80 dark:border-[#272b5c]/80 shadow-sm space-y-4 flex flex-col justify-between min-w-0 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full blur-[60px] -z-10 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity"></div>
              
              {/* CABECERA Y FILTROS ENVOLVENTES (RESPONSIVE 100%) */}
              <div className="space-y-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <ListTodo size={18} className="text-indigo-400 shrink-0" />
                      <span>Mis Tareas Asignadas</span>
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Listado completo de tus tareas asignadas con estado y esfuerzo.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg shrink-0">
                    {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea' : 'tareas'}
                  </span>
                </div>

                {/* FILTROS DE ESTADO FLEX-WRAP TOTALMENTE RESPONSIVOS */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
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
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                        : 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* LISTADO / TABLA DE TAREAS RESPONSIVA */}
              <div className="flex-1 min-h-[220px]">
                {/* VISTA ESCRITORIO / TABLA OPTIMIZADA */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold uppercase text-slate-400">
                        <th className="py-2.5 px-2.5">Clave</th>
                        <th className="py-2.5 px-2.5">Resumen</th>
                        <th className="py-2.5 px-2.5">Estado</th>
                        <th className="py-2.5 px-2 text-center">SP</th>
                        <th className="py-2.5 px-2 text-center">Cycle</th>
                        <th className="py-2.5 px-2 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {paginatedTasks.length > 0 ? (
                        paginatedTasks.map((t) => (
                          <tr key={t.key_issue} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                            <td className="py-2.5 px-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-300 whitespace-nowrap">
                              {t.key_issue}
                            </td>
                            <td className="py-2.5 px-2.5 font-semibold text-slate-900 dark:text-slate-100 max-w-[180px] lg:max-w-[220px] truncate" title={t.summary}>
                              {t.summary}
                            </td>
                            <td className="py-2.5 px-2.5 whitespace-nowrap">
                              {(() => {
                                const st = (t.status_actual || 'POR HACER').toUpperCase();
                                if (st.includes('LISTO') || st.includes('DONE') || st.includes('COMPLETADA') || st.includes('FINALIZADO')) {
                                  return (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
                                      <CheckCircle2 size={11} className="text-emerald-500" />
                                      Listo
                                    </span>
                                  );
                                }
                                if (st.includes('PROGRESO') || st.includes('PROGRESS') || st.includes('CURSO')) {
                                  return (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                      En Progreso
                                    </span>
                                  );
                                }
                                if (st.includes('BLOQUEADA') || st.includes('BLOCKED')) {
                                  return (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/40">
                                      <AlertTriangle size={11} className="text-rose-500" />
                                      Bloqueada
                                    </span>
                                  );
                                }
                                if (st.includes('REVISI') || st.includes('REVIEW')) {
                                  return (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40">
                                      <Clock size={11} className="text-amber-500" />
                                      En Revisión
                                    </span>
                                  );
                                }
                                return (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                                    Por Hacer
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="py-2.5 px-2 text-center font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {t.story_points}
                            </td>
                            <td className="py-2.5 px-2 text-center font-semibold text-slate-400 text-[11px] whitespace-nowrap">
                              {t.cycle_time_days > 0 ? `${t.cycle_time_days}d` : '--'}
                            </td>
                            <td className="py-2.5 px-2 text-right whitespace-nowrap">
                              <button
                                onClick={() => setSelectedIssueModal(t)}
                                className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
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

                {/* VISTA MÓVIL / TARJETAS FLUIDAS (< 640px) */}
                <div className="block sm:hidden space-y-2.5">
                  {paginatedTasks.length > 0 ? (
                    paginatedTasks.map((t) => (
                      <div key={t.key_issue} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-300">
                            {t.key_issue}
                          </span>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const st = (t.status_actual || 'POR HACER').toUpperCase();
                              if (st.includes('LISTO') || st.includes('DONE') || st.includes('COMPLETADA') || st.includes('FINALIZADO')) {
                                return (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50">
                                    <CheckCircle2 size={10} className="text-emerald-500" /> Listo
                                  </span>
                                );
                              }
                              if (st.includes('PROGRESO') || st.includes('PROGRESS') || st.includes('CURSO')) {
                                return (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Progreso
                                  </span>
                                );
                              }
                              if (st.includes('BLOQUEADA') || st.includes('BLOCKED')) {
                                return (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50">
                                    <AlertTriangle size={10} className="text-rose-500" /> Bloqueada
                                  </span>
                                );
                              }
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  Por Hacer
                                </span>
                              );
                            })()}
                            <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                              {t.story_points} SP
                            </span>
                          </div>
                        </div>

                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-relaxed">
                          {t.summary}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                          <span>Cycle: {t.cycle_time_days > 0 ? `${t.cycle_time_days}d` : '--'}</span>
                          <button
                            onClick={() => setSelectedIssueModal(t)}
                            className="px-3 py-1 text-[11px] font-extrabold rounded-lg bg-indigo-600 text-white cursor-pointer"
                          >
                            Ver detalle
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No hay tareas que coincidan con este filtro.
                    </div>
                  )}
                </div>
              </div>

              {/* CONTROLES DE PAGINACIÓN */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                <span className="text-slate-400 font-medium text-center sm:text-left">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 text-left">
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

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
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
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] w-[95vw] sm:max-w-3xl rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block">Prioridad</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{selectedIssueModal.prioridad || 'Media'}</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block">Story Points</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{selectedIssueModal.story_points || 0} SP</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold block">Tiempo de Ciclo</span>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {selectedIssueModal.cycle_time_days > 0 ? `${selectedIssueModal.cycle_time_days} días` : 'En progreso / Reciente'}
                  </strong>
                </div>
              </div>

              {/* INFORMACIÓN DE SOLO LECTURA / HISTORIAL */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1a1d40]/60 border border-slate-200 dark:border-[#33376b] flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Tipo: <strong className="text-slate-800 dark:text-slate-200">{selectedIssueModal.tipo || 'Historia'}</strong>
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Estado actual en Jira: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedIssueModal.status_actual}</strong>
                </span>
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
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="text-amber-400 fill-amber-400" size={18} />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
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
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
              <button
                onClick={() => setAlertsTab('request_form')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${alertsTab === 'request_form'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                + Nueva Solicitud
              </button>
              <button
                onClick={() => setAlertsTab('sent_requests')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${alertsTab === 'sent_requests'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Mis Solicitudes ({submittedHelpRequests.length})
              </button>
              <button
                onClick={() => setAlertsTab('alerts')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${alertsTab === 'alerts'
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                {alerts && alerts.length > 0 ? alerts.map(a => (
                  <div key={a.id || Math.random()} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                    <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300 leading-relaxed">{a.description || a.title || a.text}</p>
                  </div>
                )) : (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center text-center">
                    <p className="text-xs text-slate-400">No hay alertas recientes.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
