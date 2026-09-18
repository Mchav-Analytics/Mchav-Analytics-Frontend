// ============================================================================
// SIDEBAR — MERAKI UI CON PROYECTOS INTERACTIVOS Y BOTÓN DE CERRAR SESIÓN
// ============================================================================

import React, { useState } from 'react';
import Logo from './Logo';
import ThemeToggleSwitch from '../ui/ThemeToggleSwitch';
import { useAuth, normalizeRole } from '../../features/auth/context/AuthContext';
import { Settings, Sparkles, Shield, Briefcase, Code, MessageCircle, ChevronLeft, ChevronDown, Calendar, BarChart2, Activity, User, Folder } from 'lucide-react';
import ProfileSettingsModal from '../../features/auth/components/ProfileSettingsModal';
import AiChatModal from '../ui/AiChatModal';
import owlMascotImg from '../../assets/owl_mascot.png';
import LiderNotificationBell from '../../features/dashboard/components/LiderNotificationBell';

function Sidebar({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  isCollapsed,
  setIsCollapsed,
  projects = [],
  selectedProjectId = 'PROJ-01',
  setSelectedProjectId
}) {
  const { logout, user, switchViewRole, isRealAdmin } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
  };

  const userRole = normalizeRole(user?.rol);

  // ── Iconos SVG exactos del snippet Meraki UI ──
  const icons = {
    home: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    dashboard: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
    projects: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
    tasks: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
      </svg>
    ),
    reporting: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </svg>
    ),
    users: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    target: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3" />
      </svg>
    ),
    alert: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    history: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    sync: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.182-3.183" />
      </svg>
    ),
    chevronRight: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 rtl:rotate-180">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    ),
    plus: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
    logout: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
      </svg>
    ),
    sun: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-amber-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25m-13.5 0H3m15.364-6.364l-1.591 1.591M6.343 17.657l-1.591 1.591m12.728 0l-1.591-1.591M6.343 6.343L4.752 4.752M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
      </svg>
    ),
    code: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    moon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-indigo-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
      </svg>
    ),
    calendar: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
      </svg>
    )
  };

  // ── Navegación según el rol (Agrupada) ──
  const navGroups = React.useMemo(() => {
    const aiIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    );

    if (userRole === 'DEVELOPER') {
      return [
        {
          title: 'Mi Trabajo',
          icon: <User size={16} />,
          items: [
            { id: 'developer', label: 'Mi Tablero', icon: icons.home },
            { id: 'daily_focus', label: 'Mi Agenda', icon: icons.calendar },
            { id: 'dev_workload', label: 'Plan de Trabajo', icon: icons.projects },
          ]
        },
        {
          title: 'Seguimiento',
          icon: <Activity size={16} />,
          items: [
            { id: 'alerts_center', label: 'Centro de Actividad', icon: icons.alert },
            { id: 'activity_history', label: 'Historial', icon: icons.history },
          ]
        }
      ];
    }

    if (userRole === 'MANAGER') {
      return [
        {
          title: 'Operación',
          icon: <Briefcase size={16} />,
          items: [
            { id: 'proyectos', label: 'Proyectos', icon: icons.projects },
            { id: 'sprint_health', label: 'Sprints', icon: icons.tasks },
          ]
        },
        {
          title: 'Planificación',
          icon: <Calendar size={16} />,
          items: [
            { id: 'capacity_form', label: 'Parámetros y Ausencias', icon: icons.calendar },
            { id: 'capacity_jira', label: 'Impacto en Jira', icon: icons.tasks },
          ]
        },
        {
          title: 'Analítica',
          icon: <BarChart2 size={16} />,
          items: [
            { id: 'flow_analytics', label: 'Análisis de Flujo', icon: icons.target },
            { id: 'team_matrix', label: 'Matriz de Flujo y Eficiencia', icon: icons.target },
            { id: 'reports_center', label: 'Centro de Reportes', icon: icons.history },
          ]
        },
        {
          title: 'Sistema',
          icon: <Sparkles size={16} />,
          items: [
            { id: 'sincronizacion', label: 'Sincronización', icon: icons.sync },
            { id: 'ai_rules', label: 'Reglas de IA', icon: aiIcon },
            { id: 'alerts_center', label: 'Centro de Actividad', icon: icons.alert },
          ]
        }
      ];
    }

    // ADMIN
    return [
      {
        title: 'Operación',
        icon: <Briefcase size={16} />,
        items: [
          { id: 'proyectos', label: 'Proyectos', icon: icons.projects },
          { id: 'sprint_health', label: 'Sprints', icon: icons.tasks },
        ]
      },
      {
        title: 'Analítica',
        icon: <BarChart2 size={16} />,
        items: [
          { id: 'flow_analytics', label: 'Análisis de Flujo', icon: icons.target },
          { id: 'team_matrix', label: 'Matriz de Flujo y Eficiencia', icon: icons.target },
          { id: 'reports_center', label: 'Centro de Reportes', icon: icons.history },
        ]
      },
      {
        title: 'Sistema',
        icon: <Shield size={16} />,
        items: [
          { id: 'usuarios', label: 'Usuarios y Roles', icon: icons.users },
          { id: 'sincronizacion', label: 'Sincronización', icon: icons.sync },
          { id: 'ai_rules', label: 'Reglas de IA', icon: aiIcon },
          { id: 'jql_queries', label: 'Consultas JQL', icon: icons.code },
          { id: 'alerts_center', label: 'Centro de Actividad', icon: icons.alert },
        ]
      }
    ];
  }, [userRole, icons]);

  // ── Estado para secciones colapsables (Acordeón, por defecto colapsadas al ingresar) ──
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (title) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // ── Mapa de temas y gradientes por categoría ──
  const categoryThemeMap = {
    'Operación': {
      gradient: 'from-[#2563eb] to-[#3b82f6]',
      activeText: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/40',
      borderGuide: 'border-blue-400/80 dark:border-blue-600/80',
      closedBg: 'bg-[#e8eff8]/80 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100',
      shadowGlow: 'shadow-md shadow-blue-600/12 dark:shadow-blue-900/30 hover:shadow-lg hover:shadow-blue-600/20',
      iconBg: 'bg-blue-100/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300'
    },
    'Planificación': {
      gradient: 'from-[#2563eb] to-[#3b82f6]',
      activeText: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/40',
      borderGuide: 'border-blue-400/80 dark:border-blue-600/80',
      closedBg: 'bg-[#e8eff8]/80 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100',
      shadowGlow: 'shadow-md shadow-blue-600/12 dark:shadow-blue-900/30 hover:shadow-lg hover:shadow-blue-600/20',
      iconBg: 'bg-blue-100/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300'
    },
    'Analítica': {
      gradient: 'from-[#2563eb] to-[#3b82f6]',
      activeText: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/40',
      borderGuide: 'border-blue-400/80 dark:border-blue-600/80',
      closedBg: 'bg-[#e8eff8]/80 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100',
      shadowGlow: 'shadow-md shadow-blue-600/12 dark:shadow-blue-900/30 hover:shadow-lg hover:shadow-blue-600/20',
      iconBg: 'bg-blue-100/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300'
    },
    'Configuración e IA': {
      gradient: 'from-[#2563eb] to-[#3b82f6]',
      activeText: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/40',
      borderGuide: 'border-blue-400/80 dark:border-blue-600/80',
      closedBg: 'bg-[#e8eff8]/80 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100',
      shadowGlow: 'shadow-md shadow-blue-600/12 dark:shadow-blue-900/30 hover:shadow-lg hover:shadow-blue-600/20',
      iconBg: 'bg-blue-100/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300'
    },
    'Sistema': {
      gradient: 'from-[#2563eb] to-[#3b82f6]',
      activeText: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/40',
      borderGuide: 'border-blue-400/80 dark:border-blue-600/80',
      closedBg: 'bg-[#e8eff8]/80 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100',
      shadowGlow: 'shadow-md shadow-blue-600/12 dark:shadow-blue-900/30 hover:shadow-lg hover:shadow-blue-600/20',
      iconBg: 'bg-blue-100/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300'
    },
    'Mi Trabajo': {
      gradient: 'from-[#2563eb] to-[#3b82f6]',
      activeText: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/40',
      borderGuide: 'border-blue-400/80 dark:border-blue-600/80',
      closedBg: 'bg-[#e8eff8]/80 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100',
      shadowGlow: 'shadow-md shadow-blue-600/12 dark:shadow-blue-900/30 hover:shadow-lg hover:shadow-blue-600/20',
      iconBg: 'bg-blue-100/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300'
    },
    'Seguimiento': {
      gradient: 'from-[#2563eb] to-[#3b82f6]',
      activeText: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/40',
      borderGuide: 'border-blue-400/80 dark:border-blue-600/80',
      closedBg: 'bg-[#e8eff8]/80 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100',
      shadowGlow: 'shadow-md shadow-blue-600/12 dark:shadow-blue-900/30 hover:shadow-lg hover:shadow-blue-600/20',
      iconBg: 'bg-blue-100/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300'
    }
  };

  // ── Clases de navegación con efecto dinámico ──
  const linkClasses = 'group/nav relative flex items-center px-3 py-2.5 text-gray-500 dark:text-gray-400 rounded-xl transition-all duration-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/60 hover:translate-x-0.5';
  const activeLinkClasses = 'sidebar-nav-active group/nav relative flex items-center px-3 py-2.5 rounded-xl text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/15 font-semibold shadow-md shadow-indigo-200/60 dark:shadow-indigo-500/20 border border-indigo-200/80 dark:border-indigo-500/20 transition-all duration-300';

  // ── Iniciales del usuario ──
  const userInitials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'CG';

  return (
    <aside
      className={`flex flex-col h-full py-4 bg-[#f8faff] dark:bg-[#14192b] border-r border-indigo-100/80 rtl:border-r-0 rtl:border-l dark:border-slate-800 transition-all duration-300 relative z-50 overflow-visible ${
        isCollapsed ? 'w-[72px] px-3 items-center' : 'w-64 px-5'
      }`}
      style={{ flexShrink: 0 }}
    >
      {/* ── BOTÓN FLOTANTE ULTRA-PREMIUM EN EL BORDE DERECHO PARA COLAPSAR Y EXPANDIR ── */}
      <div className="absolute top-1/2 -translate-y-1/2 -right-3 z-[60]">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-6 h-6 rounded-full bg-[#f8faff] dark:bg-[#191c3d] border border-slate-200 dark:border-[#3b3f78] text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/50 dark:hover:border-indigo-400/60 shadow-md hover:shadow-indigo-500/25 transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-115 active:scale-90"
          title={isCollapsed ? 'Expandir panel lateral' : 'Colapsar panel lateral'}
        >
          <ChevronLeft
            size={13}
            className={`transition-transform duration-300 stroke-[2.5] ${
              isCollapsed ? 'rotate-180 text-indigo-500 dark:text-indigo-400' : ''
            }`}
          />
        </button>
      </div>

      {/* ── CABECERA CON LOGO CENTRADO Y AMPLIADO ── */}
      <div className="flex items-center justify-center w-full py-1">
        <button 
          type="button" 
          onClick={() => setActiveTab('proyectos')} 
          className="outline-none cursor-pointer border-none bg-transparent flex items-center justify-center transition-transform hover:scale-105"
          title="Ir a Inicio / Proyectos"
        >
          <Logo
            style={{
              width: isCollapsed ? '44px' : '96px',
              height: isCollapsed ? '44px' : '96px',
              marginRight: 0,
            }}
          />
        </button>
      </div>

      {/* Línea divisoria debajo del logo */}
      <div className="w-full my-1.5 border-t border-gray-200/80 dark:border-gray-800" />

      <div className="flex flex-col justify-between flex-1 mt-1.5 min-h-0">





        {/* ── CONMUTADOR RÁPIDO DE VISTAS (3 BOTONES) ── */}
        <div className={`mb-3 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 ${isCollapsed ? 'flex flex-col gap-1.5 items-center w-full' : 'grid grid-cols-3 gap-1'}`}>
          <button
            type="button"
            onClick={() => {
              switchViewRole('ADMIN');
              setActiveTab('proyectos');
            }}
            className={`group relative rounded-xl text-[12px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
              isCollapsed ? 'w-8 h-8 p-0' : 'py-1.5 px-2 gap-1'
            } ${
              userRole === 'ADMIN'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
            title="Cambiar a Vista Administrador"
          >
            <Shield size={13} />
            {!isCollapsed && <span>Admin</span>}
            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3.5 py-1.5 rounded-xl bg-slate-900/95 dark:bg-[#191c3d]/95 text-white backdrop-blur-xl font-extrabold text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 ease-out z-[99999] shadow-xl border border-indigo-200/30 dark:border-[#3b3f78] flex items-center gap-2">
                <Shield size={12} className="text-indigo-400" />
                <span>Vista Administrador</span>
                <div className="absolute top-1/2 -translate-y-1/2 -left-[5px] w-2.5 h-2.5 bg-slate-900/95 dark:bg-[#191c3d]/95 rotate-45 border-b border-l border-indigo-200/30 dark:border-[#3b3f78] rounded-bl-[2px]"></div>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              switchViewRole('MANAGER');
              setActiveTab('proyectos');
            }}
            className={`group relative rounded-xl text-[12px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
              isCollapsed ? 'w-8 h-8 p-0' : 'py-1.5 px-2 gap-1'
            } ${
              userRole === 'MANAGER'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
            title="Cambiar a Vista Líder Técnico"
          >
            <Briefcase size={13} />
            {!isCollapsed && <span>Líder</span>}
            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3.5 py-1.5 rounded-xl bg-slate-900/95 dark:bg-[#191c3d]/95 text-white backdrop-blur-xl font-extrabold text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 ease-out z-[99999] shadow-xl border border-purple-200/30 dark:border-[#3b3f78] flex items-center gap-2">
                <Briefcase size={12} className="text-purple-400" />
                <span>Vista Líder Técnico</span>
                <div className="absolute top-1/2 -translate-y-1/2 -left-[5px] w-2.5 h-2.5 bg-slate-900/95 dark:bg-[#191c3d]/95 rotate-45 border-b border-l border-purple-200/30 dark:border-[#3b3f78] rounded-bl-[2px]"></div>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              switchViewRole('DEVELOPER');
              setActiveTab('developer');
            }}
            className={`group relative rounded-xl text-[12px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
              isCollapsed ? 'w-8 h-8 p-0' : 'py-1.5 px-2 gap-1'
            } ${
              userRole === 'DEVELOPER'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
            title="Cambiar a Vista Desarrollador"
          >
            <Code size={13} />
            {!isCollapsed && <span>Dev</span>}
            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3.5 py-1.5 rounded-xl bg-slate-900/95 dark:bg-[#191c3d]/95 text-white backdrop-blur-xl font-extrabold text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 ease-out z-[99999] shadow-xl border border-blue-200/30 dark:border-[#3b3f78] flex items-center gap-2">
                <Code size={12} className="text-blue-400" />
                <span>Vista Desarrollador</span>
                <div className="absolute top-1/2 -translate-y-1/2 -left-[5px] w-2.5 h-2.5 bg-slate-900/95 dark:bg-[#191c3d]/95 rotate-45 border-b border-l border-blue-200/30 dark:border-[#3b3f78] rounded-bl-[2px]"></div>
              </div>
            )}
          </button>
        </div>

        {/* ── NAVEGACIÓN PRINCIPAL CON ACORDEÓN ANIMADO CSS GRID ── */}
        <nav className={`uiverse-menu flex-1 overflow-y-auto ${isCollapsed ? 'items-center !px-1.5 !py-2.5 gap-2 overflow-visible' : ''} scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800`}>
          {navGroups.map((group, groupIdx) => {
            const isOpen = Boolean(openSections[group.title]);
            const hasActiveItem = group.items.some(item => {
              if (activeTab === item.id) return true;
              if (item.id === 'team_matrix' && ['team_matrix', 'team_devs'].includes(activeTab)) return true;
              if (item.id === 'sprint_health' && ['sprint_health'].includes(activeTab)) return true;
              if (item.id === 'capacity_calculator' && activeTab.startsWith('capacity_')) return true;
              return false;
            });

            return (
              <div
                key={groupIdx}
                className={`transition-all duration-300 ${
                  !isCollapsed && isOpen
                    ? 'mb-3.5 rounded-[22px] p-1.5 bg-gradient-to-b from-indigo-50/90 via-indigo-50/40 to-blue-50/20 dark:from-indigo-950/70 dark:via-indigo-950/40 dark:to-slate-900/30 shadow-xs'
                    : isCollapsed
                    ? 'mb-2.5 w-full flex flex-col items-center'
                    : 'mb-1.5'
                }`}
              >
                {!isCollapsed ? (
                  <button
                    type="button"
                    onClick={() => toggleSection(group.title)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer select-none group/hdr ${
                      isOpen
                        ? 'text-indigo-900 dark:text-indigo-200'
                        : 'bg-transparent hover:bg-slate-100/70 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                    title={isOpen ? `Plegar ${group.title}` : `Desplegar ${group.title}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-300 shrink-0 ${
                        isOpen
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover/hdr:scale-105'
                      }`}>
                        {group.icon || <Folder size={16} />}
                      </div>
                      <span className="truncate tracking-tight font-extrabold text-[14px]">{group.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasActiveItem && !isOpen && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
                      )}
                      <div className={`p-1 rounded-lg transition-transform duration-300 ease-out ${isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : 'rotate-0 text-slate-400'}`}>
                        <ChevronDown size={15} />
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleSection(group.title)}
                    className={`group relative w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                      isOpen
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                        : hasActiveItem
                        ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={group.title}
                  >
                    {group.icon || <Folder size={18} />}
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3.5 py-1.5 rounded-xl bg-white/95 text-indigo-950 dark:bg-[#191c3d]/95 dark:text-white backdrop-blur-xl font-extrabold text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 ease-out z-[99999] shadow-xl shadow-indigo-500/15 border border-indigo-200/90 dark:border-[#3b3f78] flex items-center gap-2">
                      <span>{group.title}</span>
                      <div className="absolute top-1/2 -translate-y-1/2 -left-[5px] w-2.5 h-2.5 bg-white/95 dark:bg-[#191c3d]/95 rotate-45 border-b border-l border-indigo-200/90 dark:border-[#3b3f78] rounded-bl-[2px]"></div>
                    </div>
                  </button>
                )}

                {/* ── CONTENEDOR DESPLEGABLE CON ANIMACIÓN CSS GRID ── */}
                <div
                  className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100 mt-1'
                      : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
                  }`}
                >
                  <div className="min-h-0">
                    <div className={`${!isCollapsed ? 'flex flex-col gap-1 px-1 pb-1' : 'flex flex-col gap-1.5 items-center mt-1'}`}>
                      {group.items.map((item, itemIdx) => {
                        const isMatrixSubtab = ['team_matrix', 'team_devs'].includes(activeTab);
                        const isSprintsSubtab = ['sprint_health'].includes(activeTab);
                        
                        let isActive = activeTab === item.id;
                        if (item.id === 'team_matrix' && isMatrixSubtab) isActive = true;
                        if (item.id === 'sprint_health' && isSprintsSubtab) isActive = true;
                        if (item.id === 'capacity_calculator' && activeTab.startsWith('capacity_')) isActive = true;

                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`group relative flex items-center gap-2 rounded-xl transition-all duration-200 cursor-pointer ${
                              isCollapsed
                                ? 'justify-center w-8 h-8 p-0 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                : isActive
                                ? 'w-full px-2.5 py-2 text-sm font-bold text-indigo-900 dark:text-indigo-100 bg-white/90 dark:bg-slate-800/90 shadow-sm'
                                : 'w-full px-2.5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            style={{ animationDelay: `${itemIdx * 40}ms` }}
                            title={item.label}
                          >
                            {/* Indicador de barra vertical activa */}
                            {isActive && !isCollapsed && (
                              <span className="w-1.5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0"></span>
                            )}

                            <div className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                              isActive && !isCollapsed
                                ? 'w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center'
                                : isActive && isCollapsed
                                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}>
                              {item.icon}
                            </div>

                            {!isCollapsed && <span className="text-left font-semibold tracking-tight leading-snug break-words whitespace-normal flex-1">{item.label}</span>}
                            
                            {isCollapsed && (
                              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3.5 py-1.5 rounded-xl bg-white/95 text-indigo-950 dark:bg-[#191c3d]/95 dark:text-white backdrop-blur-xl font-extrabold text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 ease-out z-[99999] shadow-xl shadow-indigo-500/15 border border-indigo-200/90 dark:border-[#3b3f78] flex items-center gap-2">
                                {isActive && <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-sm animate-pulse"></span>}
                                <span>{item.label}</span>
                                <div className="absolute top-1/2 -translate-y-1/2 -left-[5px] w-2.5 h-2.5 bg-white/95 dark:bg-[#191c3d]/95 rotate-45 border-b border-l border-indigo-200/90 dark:border-[#3b3f78] rounded-bl-[2px]"></div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>



        {/* ── BOTÓN CONSULTAR A NUBI (ESTILO GLOBO DE DIÁLOGO / MENSAJE DE LA MASCOTA) ── */}
        <div className={`my-2.5 ${isCollapsed ? 'px-1 flex justify-center' : 'px-1.5'}`}>
          {!isCollapsed ? (
            <div className="relative flex items-center justify-start group w-full px-1">
              {/* Mascota Nubi al lado izquierdo saludando con el ala */}
              <img
                src={owlMascotImg}
                alt="Mascota Nubi"
                className="w-9 h-9 object-contain shrink-0 z-20 -mr-1.5 ml-0.5 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6 group-hover:translate-x-[-2px] drop-shadow-md pointer-events-none"
              />

              {/* Contenedor del Botón en forma de Globo de Diálogo / Tarjeta de Mensaje */}
              <button
                type="button"
                onClick={() => setIsAiChatOpen(true)}
                className="group/btn relative w-auto max-w-full py-2 pl-3.5 pr-4 rounded-2xl rounded-tl-xs bg-gradient-to-r from-indigo-500/20 via-purple-500/25 to-pink-500/20 dark:from-indigo-500/30 dark:via-purple-500/35 dark:to-pink-500/30 hover:from-indigo-500/30 hover:via-purple-500/40 hover:to-pink-500/35 text-indigo-950 dark:text-indigo-100 font-extrabold text-xs transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-md hover:shadow-purple-500/15 hover:scale-[1.02] active:scale-[0.98] flex flex-col items-start justify-center border border-indigo-300/40 dark:border-indigo-400/20"
                title="Consultar Asistente Nubi IA"
              >
                {/* Pico/Punta del globo de diálogo apuntando a la mascota Nubi */}
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-500/20 dark:bg-indigo-500/30 rotate-45 rounded-bl-[1px] pointer-events-none group-hover/btn:bg-indigo-500/30 transition-colors"></div>

                {/* Animación de destello brillante (Shimmer Effect) al pasar el cursor */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 dark:via-white/20 to-transparent translate-x-[-150%] group-hover/btn:translate-x-[150%] transition-transform duration-700 ease-in-out pointer-events-none"></div>

                {/* Título Principal del Botón: ✦ Nubi IA */}
                <div className="relative z-10 flex items-center gap-1.5 w-full">
                  <span className="text-amber-500 dark:text-amber-400 text-xs font-black animate-pulse">✦</span>
                  <span className="font-black tracking-tight text-[12.5px] text-indigo-950 dark:text-white truncate">
                    Nubi IA
                  </span>
                </div>

                {/* Subtítulo desplegable al pasar el cursor: Consultar asistente */}
                <div className="relative z-10 grid grid-rows-[0fr] group-hover/btn:grid-rows-[1fr] opacity-0 group-hover/btn:opacity-100 transition-all duration-300 ease-in-out w-full">
                  <div className="overflow-hidden">
                    <span className="block pt-0.5 text-[12px] font-bold text-indigo-600 dark:text-indigo-300 tracking-wide truncate">
                      Consultar asistente
                    </span>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAiChatOpen(true)}
              className="group relative w-10 h-10 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all duration-300 cursor-pointer shadow-2xs hover:scale-110 active:scale-95"
              title="Consultar a Nubi"
            >
              <img
                src={owlMascotImg}
                alt="Nubi"
                className="w-6 h-6 object-contain shrink-0 group-hover:scale-110 transition-transform"
              />
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3.5 py-1.5 rounded-xl bg-indigo-950 text-white font-extrabold text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 ease-out z-[99999] shadow-xl flex items-center gap-2">
                <img src={owlMascotImg} alt="Nubi" className="w-4 h-4 object-contain shrink-0" />
                <span>Consultar a Nubi</span>
                <div className="absolute top-1/2 -translate-y-1/2 -left-[5px] w-2.5 h-2.5 bg-indigo-950 rotate-45 rounded-bl-[2px]"></div>
              </div>
            </button>
          )}
        </div>

        {/* ── FOOTER: MODO CLARO/OSCURO, PERFIL DE USUARIO Y CONFIGURACIÓN ── */}
        <div className="mt-2 pt-3 border-t border-gray-200 dark:border-gray-800 space-y-3">
          {/* Switch de Tema Sol / Luna Uiverse y Campana de Alertas Nubi IA */}
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2.5 justify-center w-full' : 'justify-between px-1'} py-0.5`}>
            <ThemeToggleSwitch isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <LiderNotificationBell 
              onNavigateTab={setActiveTab}
              isCollapsed={isCollapsed}
            />
          </div>

          {/* Línea divisoria debajo del interruptor del modo oscuro */}
          <div className="w-full border-t border-gray-200/80 dark:border-gray-800 my-1" />

          {/* Fila de Perfil de Usuario y Botones de Configuración + Cerrar Sesión */}
          {!isCollapsed ? (
            <div className="flex items-center justify-between pt-2 px-1">
              <div 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-x-2.5 overflow-hidden cursor-pointer hover:opacity-85 transition-opacity"
                title="Ver Ajustes de Perfil"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                  {userInitials}
                </div>
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-xs font-semibold text-gray-800 dark:text-white truncate">{user?.nombre || 'Usuario'}</span>
                  <span className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
                    {userRole === 'MANAGER' ? 'LÍDER TÉCNICO' : userRole}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* BOTÓN CONFIGURACIÓN / SETTINGS */}
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-all cursor-pointer border border-indigo-200 dark:border-indigo-800/50"
                  title="Configuración de Perfil (Ajustes)"
                >
                  <Settings size={16} />
                </button>

                {/* BOTÓN CERRAR SESIÓN */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                  title="Cerrar Sesión"
                  style={{ border: 'none', background: 'transparent' }}
                >
                  {icons.logout}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5 pt-2 w-full">

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="group relative w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-all cursor-pointer border border-slate-200/80 dark:border-slate-800"
                title="Configuración de Perfil"
              >
                <Settings size={18} />
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3.5 py-1.5 rounded-xl bg-white/95 text-indigo-950 dark:bg-[#191c3d]/95 dark:text-white backdrop-blur-xl font-extrabold text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 ease-out z-[99999] shadow-xl shadow-indigo-500/15 border border-indigo-200/90 dark:border-[#3b3f78] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-sm animate-pulse"></span>
                  <span>Ajustes de Perfil</span>
                  <div className="absolute top-1/2 -translate-y-1/2 -left-[5px] w-2.5 h-2.5 bg-white/95 dark:bg-[#191c3d]/95 rotate-45 border-b border-l border-indigo-200/90 dark:border-[#3b3f78] rounded-bl-[2px]"></div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="group relative w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer border border-slate-200/80 dark:border-slate-800"
                title="Cerrar Sesión"
              >
                {icons.logout}
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3.5 py-1.5 rounded-xl bg-white/95 text-rose-950 dark:bg-[#2e1065]/90 dark:text-white backdrop-blur-xl font-extrabold text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 ease-out z-[99999] shadow-xl shadow-rose-500/15 border border-rose-200/90 dark:border-rose-400/40 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>Cerrar Sesión</span>
                  <div className="absolute top-1/2 -translate-y-1/2 -left-[5px] w-2.5 h-2.5 bg-white/95 dark:bg-[#2e1065]/90 rotate-45 border-b border-l border-rose-200/90 dark:border-rose-400/40 rounded-bl-[2px]"></div>
                </div>
              </button>
            </div>
          )}

          {/* MODAL CONFIGURACIÓN DE PERFIL */}
          <ProfileSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            userProfile={user}
          />

          {/* MODAL CHAT CONVERSACIONAL DE IA (GOOGLE GEMINI) */}
          <AiChatModal
            isOpen={isAiChatOpen}
            onClose={() => setIsAiChatOpen(false)}
            selectedProjectId={selectedProjectId}
          />

        </div>

      </div>
    </aside>
  );
}

export default Sidebar;
