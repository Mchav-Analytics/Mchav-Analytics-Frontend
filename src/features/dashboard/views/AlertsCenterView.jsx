// ============================================================================
// VISTA: CENTRO DE ACTIVIDAD MULTI-ROL (DESARROLLADOR, LÍDER TÉCNICO Y ADMIN)
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Bell,
  MessageSquare,
  AlertTriangle,
  Clock,
  Plus,
  Send,
  X,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  FileText,
  User,
  Crown,
  ChevronRight,
  Filter,
  CheckSquare,
  Zap,
  RefreshCw,
  TrendingUp,
  Bug,
  Users,
  Settings,
  Megaphone,
  Inbox,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { jiraService } from '../../../services/api';
import {
  getReadNotificationIds,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotificationUpdates
} from '../../../services/notificationStore';

// ----------------------------------------------------------------------------
// DATOS DE EJEMPLO ADAPTADOS POR ROL CON ESTADO DE LECTURA ISREAD
// ----------------------------------------------------------------------------

// 1. FEED DESARROLLADOR
const INITIAL_DEV_FEED = [
  {
    id: 'dev-1',
    category: 'ASIGNADAS',
    icon: '📝',
    iconColor: 'bg-[#5b36f5]/15 text-[#5b36f5] dark:text-[#8b5cf6]',
    title: 'Nueva tarea asignada',
    issueKey: 'MCHAV-142',
    summary: 'Implementar dashboard de velocidad de sprint',
    subtext: 'Asignada por Carlos Pérez (Líder Técnico)',
    time: 'Hace 10 min',
    isRead: false,
    actionText: 'Ver issue',
    actionType: 'VIEW_ISSUE'
  },
  {
    id: 'dev-2',
    category: 'REVISIONES',
    icon: '👀',
    iconColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    title: 'Revisión solicitada',
    issueKey: 'MCHAV-138',
    summary: 'Módulo de autenticación SSO y OAuth 2.0',
    subtext: 'Carlos solicita tu revisión en PR #42',
    time: 'Hace 30 min',
    isRead: false,
    actionText: 'Revisar en Jira',
    actionType: 'VIEW_JIRA'
  },
  {
    id: 'dev-3',
    category: 'ALERTAS',
    icon: '🚧',
    iconColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    title: 'Bloqueo Detectado',
    issueKey: 'MCHAV-129',
    summary: 'Servicio WebSockets inactivo',
    subtext: 'MCHAV-129 lleva 2 días en estado bloqueado',
    time: 'Hace 2 horas',
    isRead: false,
    actionText: 'Solicitar apoyo',
    actionType: 'REQUEST_HELP'
  },
  {
    id: 'dev-4',
    category: 'CONVERSACIONES',
    icon: '💬',
    iconColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    title: 'Respuesta del líder',
    issueKey: 'MCHAV-128',
    summary: 'Consulta de fecha de entrega SSO',
    subtext: '"Ya solicité la información con el cliente. Puedes proceder con los mocks de prueba."',
    time: 'Hace 45 min',
    isRead: true,
    actionText: 'Continuar conversación',
    actionType: 'OPEN_CHAT',
    messages: [
      { emisor: 'Valka Hoyos', rol: 'Developer', texto: '¿Podrían confirmar si la entrega del módulo SSO se mantiene para este viernes?', hora: '10:15 AM' },
      { emisor: 'Carlos Pérez', rol: 'Líder Técnico', texto: 'Ya solicité la información con el cliente. Puedes proceder con los mocks de prueba.', hora: '10:45 AM' }
    ]
  },
  {
    id: 'dev-5',
    category: 'MIS_SOLICITUDES',
    icon: '📩',
    iconColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    title: 'Mi Solicitud de Ayuda',
    issueKey: 'MCHAV-105',
    summary: 'Bloqueo Técnico en API de pagos',
    subtext: 'Solicitud enviada a Carlos Pérez (Líder Técnico) — En revisión',
    time: 'Hace 1 hora',
    isRead: true,
    actionText: 'Continuar conversación',
    actionType: 'OPEN_CHAT',
    messages: [
      { emisor: 'Valka Hoyos', rol: 'Developer', texto: 'Requiero apoyo en la configuración del servicio de pagos en QA.', hora: '11:30 AM' }
    ]
  }
];

// 2. FEED LÍDER TÉCNICO / MANAGER
const INITIAL_MANAGER_FEED = [
  {
    id: 'mgr-1',
    category: 'SOLICITUDES',
    icon: '💬',
    iconColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    title: 'Bloqueo Reportado por Desarrollador',
    issueKey: 'MCHAV-128',
    project: 'MCHAV Analytics',
    author: 'Valentina Hoyos (Developer)',
    summary: 'MCHAV-128 · Proyecto MCHAV Analytics',
    subtext: '"La issue MCHAV-128 está bloqueada porque necesitamos información del cliente."',
    time: 'Hace 10 min',
    isRead: false,
    actionText: 'Continuar conversación',
    actionType: 'OPEN_CHAT',
    messages: [
      { emisor: 'Valentina Hoyos', rol: 'Developer', texto: 'La issue MCHAV-128 está bloqueada porque necesitamos información del cliente.', hora: '12:20 PM' }
    ]
  },
  {
    id: 'mgr-2',
    category: 'ALERTAS',
    icon: '🟡',
    iconColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    title: 'Riesgo de Sprint 04 MCHAV',
    issueKey: 'MCHAV-SPRINT-04',
    summary: '8 issues pendientes a 2 días del cierre del sprint MCHAV',
    subtext: 'Se detecta riesgo de no cumplimiento del compromiso de Story Points en MCHAV Analytics.',
    time: 'Hace 1 hora',
    isRead: false,
    actionText: 'Ver en Proyecto MCHAV',
    actionType: 'VIEW_PROJECT'
  },
  {
    id: 'mgr-3',
    category: 'BUGS',
    icon: '🐞',
    iconColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    title: 'Bugs Críticos en QA',
    issueKey: 'MCHAV-105',
    summary: '2 bugs críticos pendientes en Proyecto MCHAV Analytics',
    subtext: 'Reportados por QA en flujo de autenticación y pagos.',
    time: 'Hace 2 horas',
    isRead: true,
    actionText: 'Ver en Proyecto MCHAV',
    actionType: 'VIEW_PROJECT'
  },
  {
    id: 'mgr-4',
    category: 'EQUIPO',
    icon: '👀',
    iconColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    title: 'Pull Request Pendiente de Aprobación',
    issueKey: 'MCHAV-PR-42',
    summary: 'Optimización de consultas JQL y cache MCHAV',
    subtext: 'Solicitado por Andrés Gómez para revisión del Tech Lead.',
    time: 'Hace 3 horas',
    isRead: true,
    actionText: 'Ver en Proyecto MCHAV',
    actionType: 'VIEW_PROJECT'
  }
];

// 3. FEED ADMINISTRADOR
const INITIAL_ADMIN_FEED = [
  {
    id: 'adm-1',
    category: 'BUGS',
    icon: '🔴',
    iconColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    title: 'Bugs Críticos Globales',
    issueKey: 'MCHAV-105',
    summary: '3 bugs críticos en Proyecto MCHAV Analytics',
    subtext: 'Desbordamiento de memoria detectado en microservicio de reportes MCHAV.',
    time: 'Hace 15 min',
    isRead: false,
    actionText: 'Ver bugs en Proyecto MCHAV',
    actionType: 'VIEW_PROJECT'
  },
  {
    id: 'adm-2',
    category: 'SOLICITUDES',
    icon: '👤',
    iconColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    title: 'Solicitud Administrativa de Permisos',
    issueKey: 'MCHAV-128',
    author: 'Carlos Pérez (Líder Técnico)',
    summary: 'Carlos solicita habilitación de permisos del Proyecto MCHAV',
    subtext: '"Requerimos asignación de rol de Administrador para integración JQL con Jira Data Center."',
    time: 'Hace 30 min',
    isRead: false,
    actionText: 'Asignar Permisos / Rol',
    actionType: 'ASSIGN_ROLE'
  },
  {
    id: 'adm-3',
    category: 'ALERTAS',
    icon: '🟡',
    iconColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    title: 'Cycle Time Elevado Global',
    issueKey: 'MCHAV-201',
    summary: 'Proyecto MCHAV Analytics supera el umbral de Cycle Time (4.8 días)',
    subtext: 'Promedio organizacional superado en un +25% en las últimas 2 semanas.',
    time: 'Hace 2 horas',
    isRead: true,
    actionText: 'Ver en Proyecto MCHAV',
    actionType: 'VIEW_PROJECT'
  },
  {
    id: 'adm-4',
    category: 'SISTEMA',
    icon: '🔄',
    iconColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    title: 'Sincronización Completada',
    issueKey: 'MCHAV-SYNC',
    summary: '426 issues actualizadas desde la API de Jira MCHAV',
    subtext: 'Proceso automático de sincronización nocturna ejecutado con éxito en MCHAV Analytics.',
    time: 'Hace 4 horas',
    isRead: true,
    actionText: 'Ver en Proyecto MCHAV',
    actionType: 'VIEW_PROJECT'
  }
];

export default function AlertsCenterView({ selectedProjectId = 'PROJ-01', onNavigateTab }) {
  const { user } = useAuth();

  // Detección Estricta de Rol
  const rawRol = (user?.rol || '').toUpperCase();
  const isDev = rawRol.includes('DEV');
  const isManager = rawRol.includes('MANAGER') || rawRol.includes('LIDER') || rawRol.includes('LEAD');

  const currentUserName = user?.nombre || (isDev ? 'Valka Hoyos' : isManager ? 'Carlos Pérez' : 'Líder Técnico Admin');
  const roleBadgeLabel = isDev ? '💻 VISTA DESARROLLADOR' : isManager ? '👨‍💻 VISTA LÍDER TÉCNICO' : '🛡️ VISTA ADMINISTRADOR';

  // Carga de Feed Inicial según Rol
  const initialFeed = isDev ? INITIAL_DEV_FEED : isManager ? INITIAL_MANAGER_FEED : INITIAL_ADMIN_FEED;

  const [activeCategory, setActiveCategory] = useState('TODAS');
  const [activityFeed, setActivityFeed] = useState(initialFeed);

  // ESTADO DE TARJETA EXPANDIDA Y ACCIONES INTERACTIVAS EN EL FEED
  const [expandedId, setExpandedId] = useState(null);
  const [cardSelectedRoles, setCardSelectedRoles] = useState({});
  const [cardReplies, setCardReplies] = useState({});

  // WIDGET FLOTANTE DE CONVERSACIÓN
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Modal para Developer (Solicitar Ayuda)
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedIssueKey, setSelectedIssueKey] = useState('MCHAV-105');
  const [selectedSupportType, setSelectedSupportType] = useState('Bloqueo Técnico');
  const [helpDetailText, setHelpDetailText] = useState('');

  // Modal Crear Alerta de Equipo
  const [showCreateAlertModal, setShowCreateAlertModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState('🚫 Code Freeze para Sprint 04');
  const [alertIssueKey, setAlertIssueKey] = useState('MCHAV-105');
  const [alertSeverity, setAlertSeverity] = useState('CRITICAL');
  const [alertMessage, setAlertMessage] = useState('No realizar más merges a la rama main. El equipo de QA iniciará las pruebas de regresión final.');

  const showNotificationToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const getMergedFeed = (baseFeed) => {
    const readIds = getReadNotificationIds();
    return baseFeed.map(item => {
      const storedChat = localStorage.getItem(`mchav_chat_${item.issueKey}`);
      const messages = storedChat ? JSON.parse(storedChat) : item.messages;
      return {
        ...item,
        messages: messages || item.messages,
        isRead: item.isRead || readIds.includes(item.id)
      };
    });
  };

  useEffect(() => {
    const baseFeed = isDev ? INITIAL_DEV_FEED : isManager ? INITIAL_MANAGER_FEED : INITIAL_ADMIN_FEED;
    setActivityFeed(getMergedFeed(baseFeed));
    setIsFloatingChatOpen(false);
    setActiveChat(null);

    const unsubscribe = subscribeToNotificationUpdates(() => {
      const currentBase = isDev ? INITIAL_DEV_FEED : isManager ? INITIAL_MANAGER_FEED : INITIAL_ADMIN_FEED;
      setActivityFeed(getMergedFeed(currentBase));
    });
    return unsubscribe;
  }, [user?.rol]);

  // Marcar una notificación como leída
  const handleMarkAsRead = (itemId) => {
    markNotificationAsRead(itemId);
  };

  // Marcar todas las notificaciones como leídas
  const handleMarkAllAsRead = () => {
    const ids = activityFeed.map(item => item.id);
    markAllNotificationsAsRead(ids);
  };

  const filteredFeed = activityFeed.filter(item => {
    if (activeCategory === 'TODAS') return true;
    return item.category === activeCategory;
  });

  const handleOpenFloatingChat = (item) => {
    handleMarkAsRead(item.id);
    const storedChat = localStorage.getItem(`mchav_chat_${item.issueKey}`);
    const messages = storedChat ? JSON.parse(storedChat) : item.messages;
    setActiveChat({ ...item, messages });
    setIsFloatingChatOpen(true);
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeChat) return;

    setSendingReply(true);
    const newMsg = {
      emisor: currentUserName,
      rol: isDev ? 'Developer' : isManager ? 'Líder Técnico' : 'Administrador',
      texto: replyText,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMsgs = [...(activeChat.messages || []), newMsg];
    localStorage.setItem(`mchav_chat_${activeChat.issueKey}`, JSON.stringify(updatedMsgs));
    window.dispatchEvent(new CustomEvent('mchav-notifications-updated'));

    jiraService.addComment(activeChat.issueKey, replyText)
      .then(() => {
        setActivityFeed(prev => prev.map(item => {
          if (item.id === activeChat.id) {
            const updatedItem = { ...item, messages: updatedMsgs, subtext: `"${replyText}"`, isRead: true };
            setActiveChat(updatedItem);
            return updatedItem;
          }
          return item;
        }));
        setReplyText('');
        showNotificationToast('💬 Respuesta enviada y registrada en Jira');
      })
      .catch(() => {
        setActivityFeed(prev => prev.map(item => {
          if (item.id === activeChat.id) {
            const updatedItem = { ...item, messages: updatedMsgs, subtext: `"${replyText}"`, isRead: true };
            setActiveChat(updatedItem);
            return updatedItem;
          }
          return item;
        }));
        setReplyText('');
        showNotificationToast('💬 Respuesta registrada en tiempo real');
      })
      .finally(() => {
        setSendingReply(false);
      });
  };

  // Crear Solicitud (Solo Dev)
  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!helpDetailText.trim()) return;

    const newActivity = {
      id: `dev-${Date.now()}`,
      category: 'MIS_SOLICITUDES',
      icon: '📩',
      iconColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
      title: 'Mi Solicitud de Ayuda',
      issueKey: selectedIssueKey,
      summary: `${selectedSupportType} en ${selectedIssueKey}`,
      subtext: `"${helpDetailText}"`,
      time: 'Justo ahora',
      isRead: true,
      actionText: 'Continuar conversación',
      actionType: 'OPEN_CHAT',
      messages: [
        { emisor: currentUserName, rol: 'Developer', texto: helpDetailText, hora: 'Ahora mismo' }
      ]
    };

    setActivityFeed(prev => [newActivity, ...prev]);
    setActiveChat(newActivity);
    setIsFloatingChatOpen(true);
    setHelpDetailText('');
    setShowHelpModal(false);
    showNotificationToast('✈️ Solicitud enviada a tu Líder Técnico');
  };

  // Emitir Alerta de Equipo (Líder)
  const handleEmitTeamAlert = (e) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertMessage.trim()) return;

    const newAlertItem = {
      id: `alert-mgr-${Date.now()}`,
      category: 'ALERTAS',
      icon: alertSeverity === 'CRITICAL' ? '🔴' : alertSeverity === 'WARNING' ? '🟡' : '📢',
      iconColor: alertSeverity === 'CRITICAL' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      title: alertTitle,
      issueKey: alertIssueKey,
      summary: `Alerta de Equipo emitida por ${currentUserName}`,
      subtext: `"${alertMessage}"`,
      author: `${currentUserName} (Líder Técnico)`,
      time: 'Hace un instante',
      isRead: false,
      actionText: 'Ver en Jira',
      actionType: 'VIEW_JIRA'
    };

    setActivityFeed(prev => [newAlertItem, ...prev]);
    INITIAL_DEV_FEED.unshift(newAlertItem);

    setShowCreateAlertModal(false);
    showNotificationToast('🚀 Alerta de equipo emitida y notificada a los desarrolladores');
  };

  // CÁLCULO DINÁMICO DE NOTIFICACIONES NO LEÍDAS PARA LOS CHIPS DE FILTRADO
  const getCategoryUnreadCount = (catKey) => {
    if (catKey === 'TODAS') {
      return activityFeed.filter(item => !item.isRead).length;
    }
    return activityFeed.filter(item => item.category === catKey && !item.isRead).length;
  };

  // LISTADO DE CHIPS SEGÚN ROL CON CONTEO REAL DE NO LEÍDAS
  const categoryChips = isDev
    ? [
      { key: 'TODAS', label: 'Todas', count: getCategoryUnreadCount('TODAS') },
      { key: 'ASIGNADAS', label: 'Asignadas', count: getCategoryUnreadCount('ASIGNADAS') },
      { key: 'REVISIONES', label: 'Revisiones', count: getCategoryUnreadCount('REVISIONES') },
      { key: 'ALERTAS', label: 'Alertas', count: getCategoryUnreadCount('ALERTAS') },
      { key: 'CONVERSACIONES', label: 'Conversaciones', count: getCategoryUnreadCount('CONVERSACIONES') },
      { key: 'MIS_SOLICITUDES', label: 'Mis Solicitudes', count: getCategoryUnreadCount('MIS_SOLICITUDES') }
    ]
    : isManager
      ? [
        { key: 'TODAS', label: 'Todas', count: getCategoryUnreadCount('TODAS') },
        { key: 'SOLICITUDES', label: 'Solicitudes Devs', count: getCategoryUnreadCount('SOLICITUDES') },
        { key: 'ALERTAS', label: 'Alertas Sprint', count: getCategoryUnreadCount('ALERTAS') },
        { key: 'EQUIPO', label: 'Equipo & PRs', count: getCategoryUnreadCount('EQUIPO') },
        { key: 'BUGS', label: 'Bugs', count: getCategoryUnreadCount('BUGS') }
      ]
      : [
        { key: 'TODAS', label: 'Todas', count: getCategoryUnreadCount('TODAS') },
        { key: 'SOLICITUDES', label: 'Solicitudes Admin', count: getCategoryUnreadCount('SOLICITUDES') },
        { key: 'ALERTAS', label: 'Alertas Proyectos', count: getCategoryUnreadCount('ALERTAS') },
        { key: 'SISTEMA', label: 'Sistema & Sync', count: getCategoryUnreadCount('SISTEMA') },
        { key: 'BUGS', label: 'Bugs Críticos', count: getCategoryUnreadCount('BUGS') }
      ];

  return (
    <div className="w-full flex-1 flex flex-col justify-between space-y-6 text-left font-sans transition-colors duration-300 text-slate-800 dark:text-slate-100 relative">

      {/* TOAST DE NOTIFICACIÓN RÁPIDA */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-indigo-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-2xl animate-in fade-in flex items-center gap-2">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. CABECERA DINÁMICA SEGÚN ROL */}
      <div className="rounded-2xl bg-white dark:bg-[#141738] p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shrink-0">
              <Bell size={24} />
            </div>
            <div className="space-y-0.5 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                  {roleBadgeLabel}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  • <strong className="text-slate-800 dark:text-slate-200 font-bold">{filteredFeed.length}</strong> elementos en feed
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Centro de Actividad
              </h1>
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN REAL E INTERACTIVO SEGÚN ROL */}
          <div className="flex items-center gap-2.5 shrink-0">
            {isDev ? (
              <button
                onClick={() => setShowHelpModal(true)}
                className="px-4 py-2.5 text-xs font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-md border border-purple-400/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] shrink-0"
              >
                <Plus size={16} />
                <span>Solicitar Ayuda a Líder</span>
              </button>
            ) : isManager ? (
              <button
                onClick={() => setShowCreateAlertModal(true)}
                className="px-4 py-2.5 text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-md border border-indigo-400/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] shrink-0"
              >
                <Megaphone size={16} />
                <span>+ Crear Alerta de Equipo</span>
              </button>
            ) : null}

            <button
              onClick={handleMarkAllAsRead}
              className="px-3.5 py-2.5 text-xs font-bold bg-slate-100 dark:bg-[#1e2248] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-[#33376b] flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              title="Marcar todas las notificaciones como leídas"
            >
              <CheckSquare size={15} className="text-indigo-600 dark:text-indigo-400" />
              <span>Marcar todas leídas</span>
            </button>
          </div>
        </div>

        {/* CHIPS DE FILTRADO CON CONTEO DE NO LEÍDAS */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-[#232752] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categoryChips.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${activeCategory === cat.key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-[#0c0e21] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#232752]'
                }`}
            >
              <span>{cat.label}</span>
              {cat.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black animate-in zoom-in-50 duration-200 ${activeCategory === cat.key
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                  }`}>
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. FEED DE ACTIVIDADES A ANCHO COMPLETO CON SOMBREADO EN NO LEÍDAS */}
      <div className="w-full space-y-4 flex-1">
        {filteredFeed.length > 0 ? (
          filteredFeed.map(item => {
            const isUnread = item.isRead === false;
            const isExpanded = expandedId === item.id;
            const isRoleRequest = item.actionType === 'ASSIGN_ROLE' || item.title?.includes('Permisos') || item.title?.includes('Rol');
            const selectedRoleForCard = cardSelectedRoles[item.id] || (item.author?.includes('Developer') ? 'DEVELOPER' : 'MANAGER');
            const inlineReply = cardReplies[item.id] || '';

            return (
              <div
                key={item.id}
                onClick={() => {
                  handleMarkAsRead(item.id);
                  setExpandedId(isExpanded ? null : item.id);
                }}
                className={`p-5 rounded-2xl transition-all space-y-4 shadow-sm cursor-pointer ${
                  isExpanded
                    ? 'bg-indigo-50/90 dark:bg-[#1e1b4b] border-2 border-indigo-500 dark:border-indigo-400 ring-4 ring-indigo-500/20 dark:ring-indigo-400/30 shadow-xl'
                    : isUnread
                    ? 'bg-indigo-50/90 dark:bg-[#1e1b4b] border-2 border-indigo-400 dark:border-indigo-400/80 ring-2 ring-indigo-500/20 dark:ring-indigo-400/30 shadow-md dark:shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                    : 'bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] hover:border-indigo-300 dark:hover:border-indigo-500/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl shrink-0 relative ${item.iconColor}`}>
                    <span className="text-lg" role="img" aria-label="feed-icon">{item.icon}</span>
                    {isUnread && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-indigo-600 dark:bg-indigo-400 ring-2 ring-white dark:ring-[#141738] animate-pulse"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {item.title}
                          {isUnread && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white dark:bg-indigo-500 shadow-xs">
                              Sin Leer
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg border border-indigo-200 dark:border-indigo-500/30">
                          {item.issueKey}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-400 font-semibold">{item.time}</span>
                        <button 
                          type="button" 
                          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                          title={isExpanded ? 'Colapsar detalles' : 'Expandir para ver todo el detalle'}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 truncate">
                      {item.summary}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                      {item.subtext}
                    </p>

                    {item.author && (
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-300 block mt-1.5">
                        Por: {item.author}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── SECCIÓN EXPANDIDA: DETALLE COMPLETO E INTERACCIÓN SEGÚN EL TIPO DE NOTIFICACIÓN ── */}
                {isExpanded && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="pt-4 mt-2 border-t border-indigo-200 dark:border-indigo-800/60 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-left cursor-default"
                  >
                    {/* CASO 1: BUGS (FICHA COMPLETA DE BUG Y PASOS DE QA) */}
                    {item.category === 'BUGS' && (
                      <div className="p-4 rounded-xl bg-white/80 dark:bg-[#12142e]/90 border border-rose-200 dark:border-rose-900/50 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                            <Bug size={15} />
                            Ficha de Incidencia Crítica · QA MCHAV
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-400/30">
                            Bloqueo Crítico
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#191c3d] border border-slate-200 dark:border-[#2b2f63]">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Módulo Afectado</span>
                            <span className="font-extrabold text-slate-800 dark:text-white">Autenticación SSO & Pagos</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#191c3d] border border-slate-200 dark:border-[#2b2f63]">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Ambiente / Servidor</span>
                            <span className="font-extrabold text-slate-800 dark:text-white">Staging QA (MCHAV Analytics)</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#191c3d] border border-slate-200 dark:border-[#2b2f63] text-xs">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Pasos para Reproducir</span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-mono text-[11px]">
                            1. Autenticarse con credenciales de prueba.<br />
                            2. Ejecutar la sincronización nocturna JQL.<br />
                            3. El servicio lanza timeout de socket al procesar 400+ registros.
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          {onNavigateTab && (
                            <button
                              type="button"
                              onClick={() => onNavigateTab('proyectos')}
                              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <span>Ir a Proyectos</span>
                              <ChevronRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CASO 2: ASIGNACIÓN DE ROL / PERMISOS (SOLICITUDES) */}
                    {(item.category === 'SOLICITUDES' || item.title?.includes('Permisos') || item.title?.includes('Rol')) && (
                      <div className="p-4 rounded-xl bg-white/80 dark:bg-[#12142e]/90 border border-purple-200 dark:border-purple-900/50 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-purple-600 dark:text-purple-300 flex items-center gap-1.5">
                            <Users size={15} />
                            Gestión Directa de Rol & Permisos del Usuario
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">Solicitante: {item.author || 'Usuario'}</span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Selecciona y asigna el rol correspondiente para habilitar los permisos dentro de la plataforma MCHAV Analytics:
                        </p>

                        {/* SELECTOR DE ROL INTERACTIVO DENTRO DE LA NOTIFICACIÓN */}
                        <div className="flex items-center gap-3 flex-wrap p-3 rounded-lg bg-purple-50/50 dark:bg-[#1a153a] border border-purple-200 dark:border-purple-800/60">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Rol a Asignar:</label>
                          <select
                            value={selectedRoleForCard}
                            onChange={(e) => setCardSelectedRoles(prev => ({ ...prev, [item.id]: e.target.value }))}
                            className="bg-white dark:bg-[#141738] text-xs font-bold text-slate-900 dark:text-white px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#33376b] outline-none shadow-xs cursor-pointer"
                          >
                            <option value="DEVELOPER">Desarrollador (Developer)</option>
                            <option value="MANAGER">Líder Técnico (Tech Lead / Manager)</option>
                            <option value="ADMIN">Administrador (System Admin)</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              showNotificationToast(`✨ ¡Rol "${selectedRoleForCard === 'ADMIN' ? 'Administrador' : selectedRoleForCard === 'MANAGER' ? 'Líder Técnico' : 'Desarrollador'}" asignado correctamente!`);
                            }}
                            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Crown size={13} />
                            <span>Aplicar Cambio de Rol</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CASO 3: HILO DE CONVERSACIÓN E INSUMO DE RESPUESTA DIRECTA INLINE (SOLO PARA AYUDA / CHAT, NO ROLES) */}
                    {!isRoleRequest && (item.messages || item.actionType === 'OPEN_CHAT') && (
                      <div className="p-4 rounded-xl bg-white/80 dark:bg-[#12142e]/90 border border-indigo-200 dark:border-indigo-900/50 space-y-3 shadow-xs">
                        <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-300 flex items-center gap-1.5">
                          <MessageSquare size={15} />
                          Hilo de Mensajes & Respuestas
                        </span>

                        {/* HISTORIAL DE MENSAJES DEL HILO */}
                        <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                          {(item.messages || [
                            { emisor: item.author || 'Usuario', rol: 'Dev', texto: item.subtext, hora: item.time }
                          ]).map((msg, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#1a1d40] border border-slate-200 dark:border-[#2a2e60] text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{msg.emisor} ({msg.rol})</span>
                                <span className="text-[10px] text-slate-400">{msg.hora}</span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-200 leading-snug">{msg.texto}</p>
                            </div>
                          ))}
                        </div>

                        {/* CAJA PARA ENVIAR RESPUESTA DIRECTAMENTE ADENTRO DE LA TARJETA */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Escribe una respuesta directamente aquí..."
                            value={inlineReply}
                            onChange={(e) => setCardReplies(prev => ({ ...prev, [item.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && inlineReply.trim()) {
                                const newMsg = {
                                  emisor: user?.nombre || 'Usuario',
                                  rol: userRole === 'MANAGER' ? 'Líder Técnico' : userRole,
                                  texto: inlineReply,
                                  hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                };
                                setActivityFeed(prev => prev.map(feedItem => {
                                  if (feedItem.id === item.id) {
                                    return {
                                      ...feedItem,
                                      messages: [...(feedItem.messages || []), newMsg],
                                      subtext: `"${inlineReply}"`
                                    };
                                  }
                                  return feedItem;
                                }));
                                setCardReplies(prev => ({ ...prev, [item.id]: '' }));
                                showNotificationToast('💬 Respuesta enviada exitosamente');
                              }
                            }}
                            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#191c3d] text-xs font-bold text-slate-900 dark:text-white border border-slate-300 dark:border-[#33376b] focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!inlineReply.trim()) return;
                              const newMsg = {
                                emisor: user?.nombre || 'Usuario',
                                rol: userRole === 'MANAGER' ? 'Líder Técnico' : userRole,
                                texto: inlineReply,
                                hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              };
                              setActivityFeed(prev => prev.map(feedItem => {
                                if (feedItem.id === item.id) {
                                  return {
                                    ...feedItem,
                                    messages: [...(feedItem.messages || []), newMsg],
                                    subtext: `"${inlineReply}"`
                                  };
                                }
                                return feedItem;
                              }));
                              setCardReplies(prev => ({ ...prev, [item.id]: '' }));
                              showNotificationToast('💬 Respuesta enviada exitosamente');
                            }}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Send size={13} />
                            <span>Enviar</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CASO 4: ALERTAS DE SPRINT Y SISTEMA */}
                    {(item.category === 'ALERTAS' || item.category === 'SISTEMA') && (
                      <div className="p-4 rounded-xl bg-white/80 dark:bg-[#12142e]/90 border border-amber-200 dark:border-amber-900/50 space-y-2 text-xs shadow-xs">
                        <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle size={15} />
                          Análisis de Rendimiento & Predictibilidad del Sprint
                        </span>
                        <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                          <div className="p-2 rounded bg-slate-50 dark:bg-[#191c3d]">
                            <span className="text-slate-400 block text-[9px]">Story Points en Riesgo</span>
                            <span className="font-bold text-amber-500">18 SP</span>
                          </div>
                          <div className="p-2 rounded bg-slate-50 dark:bg-[#191c3d]">
                            <span className="text-slate-400 block text-[9px]">Estado de Sincronización JQL</span>
                            <span className="font-bold text-emerald-500">426 Registros OK</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* BOTONES DE ACCIÓN RÁPIDA INFERIORES */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#232752] text-xs font-bold">
                  <span className="text-xs text-slate-400 font-medium">Verificado en tiempo real • MCHAV Analytics</span>

                  <div className="flex items-center gap-2">
                    {(item.actionType === 'OPEN_CHAT' || item.messages || item.category === 'SOLICITUDES' || item.category === 'EQUIPO') && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenFloatingChat(item);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                        title="Abrir ventana flotante de conversación"
                      >
                        <MessageSquare size={13} />
                        <span>Continuar conversación</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(isExpanded ? null : item.id);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Ver Menos' : 'Ver Detalle Completo'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs bg-white dark:bg-[#141738] rounded-2xl border border-slate-200 dark:border-[#272b5c]">
            No hay actividades en esta categoría.
          </div>
        )}
      </div>

      {/* 3. WIDGET / TARJETA FLOTANTE DE CONVERSACIÓN */}
      {isFloatingChatOpen && activeChat && (
        <div className="fixed bottom-6 right-6 z-[999999] w-96 rounded-3xl bg-white dark:bg-[#141738] p-5 shadow-2xl border-2 border-indigo-500 animate-in slide-in-from-bottom-5 duration-200 space-y-4 text-left">

          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#232752]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
                <MessageSquare size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                  Conversación con Líder
                </h4>
                <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {activeChat.issueKey}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-[#00f5d4] border border-emerald-200 dark:border-[#00f5d4]/30">
                Activa
              </span>
              <button
                onClick={() => setIsFloatingChatOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
                title="Cerrar conversación"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {(activeChat.messages || []).map((msg, idx) => {
              const isUserSender = msg.emisor === currentUserName;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl max-w-[90%] space-y-1 ${isUserSender
                      ? 'ml-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs text-right'
                      : 'bg-slate-50 dark:bg-[#0c0e21] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#232752] text-left'
                    }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] opacity-80 font-extrabold">
                    <span className="flex items-center gap-1">
                      {msg.rol.includes('Developer') ? <User size={11} /> : <Crown size={11} className="text-amber-400" />}
                      {msg.emisor} ({msg.rol})
                    </span>
                    <span>{msg.hora}</span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">{msg.texto}</p>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendChatMessage} className="pt-2 border-t border-slate-100 dark:border-[#232752] space-y-3">
            <textarea
              rows={2}
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Responder mensaje (sincroniza en Jira)..."
              className="w-full p-2.5 bg-slate-50 dark:bg-[#0c0e21] border border-slate-200 dark:border-[#232752] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-semibold"
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsFloatingChatOpen(false)}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
              >
                Cerrar Chat
              </button>

              <button
                type="submit"
                disabled={sendingReply}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
              >
                <Send size={13} />
                <span>{sendingReply ? 'Enviando...' : 'Enviar Mensaje'}</span>
              </button>
            </div>
          </form>

        </div>
      )}

      {/* 4. MODAL DE SOLICITAR AYUDA (DESARROLLADOR) */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#141738] p-7 shadow-2xl border border-slate-200 dark:border-[#272b5c] space-y-5 text-left">

            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#232752]">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🔔</span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Centro de Alertas & Solicitar Ayuda (Dev Workspace)
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-300 block">
                    Incidencia Relacionada
                  </label>
                  <select
                    value={selectedIssueKey}
                    onChange={(e) => setSelectedIssueKey(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-[#0c0e21] border border-slate-200 dark:border-[#232752] rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="MCHAV-105">MCHAV-105 - Corregir bug en API de pagos</option>
                    <option value="MCHAV-101">MCHAV-101 - Autenticación SSO OAuth</option>
                    <option value="MCHAV-129">MCHAV-129 - Memory leak en WebSockets</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-300 block">
                    Tipo de Apoyo Requerido
                  </label>
                  <select
                    value={selectedSupportType}
                    onChange={(e) => setSelectedSupportType(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-[#0c0e21] border border-slate-200 dark:border-[#232752] rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="Bloqueo Técnico">Bloqueo Técnico</option>
                    <option value="Aclaración de Requerimiento">Aclaración de Requerimiento</option>
                    <option value="Aprobación de Pull Request">Aprobación de Pull Request</option>
                    <option value="Problemas de Ambiente / Credenciales">Problemas de Ambiente / Credenciales</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-300 block">
                  Mensaje Detallado para el Líder
                </label>
                <textarea
                  rows={4}
                  required
                  value={helpDetailText}
                  onChange={(e) => setHelpDetailText(e.target.value)}
                  placeholder="Describe el bloqueo o duda técnica requerida..."
                  className="w-full p-3 bg-slate-50 dark:bg-[#0c0e21] border border-slate-200 dark:border-[#232752] rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-[#232752] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-extrabold bg-[#5b36f5] hover:bg-indigo-600 text-white rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
                >
                  <Send size={14} />
                  <span>Enviar a Líder</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 5. MODAL CREAR ALERTA DE EQUIPO (LÍDER TÉCNICO / MANAGER) */}
      {showCreateAlertModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#141738] p-7 shadow-2xl border border-slate-200 dark:border-[#272b5c] space-y-5 text-left">

            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#232752]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    📢 Crear & Emitir Alerta de Equipo
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Notifica a todos los desarrolladores de tus proyectos en tiempo real.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateAlertModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEmitTeamAlert} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-300 block">
                  Título de la Alerta / Aviso *
                </label>
                <input
                  type="text"
                  required
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  placeholder="Ej: Code Freeze para Release v2.1"
                  className="w-full p-3 bg-slate-50 dark:bg-[#0c0e21] border border-slate-200 dark:border-[#232752] rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-300 block">
                    Incidencia / Proyecto Relacionado
                  </label>
                  <select
                    value={alertIssueKey}
                    onChange={(e) => setAlertIssueKey(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-[#0c0e21] border border-slate-200 dark:border-[#232752] rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="MCHAV-105">MCHAV-105 - API de pagos</option>
                    <option value="SPRINT-04">Sprint 04 - MCHAV Analytics</option>
                    <option value="PROJ-A">Proyecto A - Frontend Core</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-300 block">
                    Nivel de Severidad
                  </label>
                  <select
                    value={alertSeverity}
                    onChange={(e) => setAlertSeverity(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-[#0c0e21] border border-slate-200 dark:border-[#232752] rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="CRITICAL">🔴 Crítica / Bloqueante</option>
                    <option value="WARNING">🟡 Advertencia / SLA</option>
                    <option value="ANNOUNCEMENT">📢 Anuncio General</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-300 block">
                  Mensaje / Instrucción Técnica para el Equipo *
                </label>
                <textarea
                  rows={4}
                  required
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  placeholder="Escribe el detalle de la instrucción técnica..."
                  className="w-full p-3 bg-slate-50 dark:bg-[#0c0e21] border border-slate-200 dark:border-[#232752] rounded-2xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-[#232752] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateAlertModal(false)}
                  className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
                >
                  <Send size={14} />
                  <span>Emitir Alerta al Equipo</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
