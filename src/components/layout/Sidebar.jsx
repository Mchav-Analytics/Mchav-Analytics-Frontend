// ============================================================================
// SIDEBAR — MERAKI UI CON PROYECTOS INTERACTIVOS Y BOTÓN DE CERRAR SESIÓN
// ============================================================================

import React, { useState } from 'react';
import Logo from './Logo';
import ThemeToggleSwitch from '../ui/ThemeToggleSwitch';
import { useAuth, normalizeRole } from '../../features/auth/context/AuthContext';
import { Settings } from 'lucide-react';
import ProfileSettingsModal from '../../features/auth/components/ProfileSettingsModal';

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
    )
  };

  // ── Navegación según el rol ──
  const navItems = React.useMemo(() => {
    if (userRole === 'DEVELOPER') {
      return [
        { id: 'developer', label: 'Mi Trabajo', icon: icons.home },
        { id: 'daily_focus', label: 'Mi Agenda de Hoy', icon: icons.target },
        { id: 'dev_workload', label: 'Plan de Trabajo', icon: icons.projects },
        { id: 'alerts_center', label: 'Centro de Actividad', icon: icons.alert },
        { id: 'activity_history', label: 'Historial', icon: icons.history },
      ];
    }

    if (userRole === 'MANAGER') {
      return [
        { id: 'dashboard', label: 'Panel Operativo', icon: icons.dashboard },
        { id: 'proyectos', label: 'Proyectos', icon: icons.projects },
        { id: 'alerts_center', label: 'Centro de Actividad', icon: icons.alert },
        { id: 'team_matrix', label: 'Matriz de Rendimiento', icon: icons.target },
        { id: 'sprint_health', label: 'Salud del Sprint', icon: icons.reporting },
        { id: 'sincronizacion', label: 'Sincronización', icon: icons.sync },
      ];
    }

    return [
      { id: 'dashboard', label: 'Resumen', icon: icons.dashboard },
      { id: 'usuarios', label: 'Usuarios y Roles', icon: icons.users },
      { id: 'proyectos', label: 'Proyectos', icon: icons.projects },
      { id: 'jql_queries', label: 'Consultas JQL', icon: icons.code },
      { id: 'alerts_center', label: 'Centro de Actividad', icon: icons.alert },
      { id: 'team_matrix', label: 'Matriz de Rendimiento', icon: icons.target },
      { id: 'sincronizacion', label: 'Sincronización', icon: icons.sync },
    ];
  }, [userRole]);

  // ── Clases de navegación con efecto dinámico ──
  const linkClasses = 'group/nav relative flex items-center px-3 py-2.5 text-gray-500 dark:text-gray-400 rounded-xl transition-all duration-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/60 hover:translate-x-0.5';
  const activeLinkClasses = 'sidebar-nav-active group/nav relative flex items-center px-3 py-2.5 rounded-xl text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/15 font-semibold shadow-md shadow-indigo-200/60 dark:shadow-indigo-500/20 border border-indigo-200/80 dark:border-indigo-500/20 transition-all duration-300';

  // ── Iniciales del usuario ──
  const userInitials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'CG';

  return (
    <aside
      className={`flex flex-col h-full py-4 bg-white border-r rtl:border-r-0 rtl:border-l dark:bg-[#0f172a] dark:border-slate-800 transition-all duration-300 relative z-50 ${
        isCollapsed ? 'w-[72px] px-3 items-center overflow-visible' : 'w-64 px-5 overflow-y-auto'
      }`}
      style={{ flexShrink: 0 }}
    >

      {/* ── CABECERA CON LOGO Y BURGER ANIMADO DE COLAPSO (Uiverse) ── */}
      <div className={`flex items-center justify-between w-full ${isCollapsed ? 'flex-col gap-4 justify-center' : ''}`}>
        <a href="#" onClick={(e) => e.preventDefault()} className={`${isCollapsed ? 'flex justify-center' : ''}`}>
          <Logo
            style={{
              width: isCollapsed ? '36px' : '44px',
              height: isCollapsed ? '36px' : '44px',
              borderRadius: '10px',
              marginRight: 0,
            }}
          />
        </a>

        {/* Botón Burger Animado */}
        <label className="burger" htmlFor="sidebar-burger-toggle" title={isCollapsed ? 'Expandir panel' : 'Colapsar panel'}>
          <input
            type="checkbox"
            id="sidebar-burger-toggle"
            checked={!isCollapsed}
            onChange={() => setIsCollapsed(!isCollapsed)}
          />
          <span></span>
          <span></span>
          <span></span>
        </label>
      </div>

      <div className="flex flex-col justify-between flex-1 mt-1.5">

        {/* ── SELECTOR DE MODOS DE VISTA DE ROL (PARA TODOS EN MODO DEMO) ── */}
        {!isCollapsed && (
          <div className="mb-1.5 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                Vista de Rol
              </span>
              {user?.isSimulated && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse">
                  Simulando
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => switchViewRole('ADMIN')}
                className={`py-1 px-1 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                  userRole === 'ADMIN'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title="Ver plataforma como Administrador"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => switchViewRole('MANAGER')}
                className={`py-1 px-1 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                  userRole === 'MANAGER'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title="Ver plataforma como Líder Técnico"
              >
                Líder
              </button>
              <button
                type="button"
                onClick={() => switchViewRole('DEVELOPER')}
                className={`py-1 px-1 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                  userRole === 'DEVELOPER'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title="Ver plataforma como Desarrollador"
              >
                Dev
              </button>
            </div>
          </div>
        )}

        {/* ── NAVEGACIÓN PRINCIPAL CON DISEÑO UIVERSE GLASSMORPHISM (by mymiamo) ── */}
        <nav className={`uiverse-menu ${isCollapsed ? 'items-center !px-1.5 !py-2.5 gap-2 overflow-visible' : ''}`}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group relative uiverse-menu-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center !px-2.5 !py-2.5' : ''}`}
              >
                {item.icon}
                {!isCollapsed && <span>{item.label}</span>}
                
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3.5 py-1.5 rounded-xl bg-white/95 text-indigo-950 dark:bg-[#191c3d]/95 dark:text-white backdrop-blur-xl font-extrabold text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 ease-out z-[99999] shadow-xl shadow-indigo-500/15 border border-indigo-200/90 dark:border-[#3b3f78] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-sm animate-pulse"></span>
                    <span>{item.label}</span>
                    <div className="absolute top-1/2 -translate-y-1/2 -left-[5px] w-2.5 h-2.5 bg-white/95 dark:bg-[#191c3d]/95 rotate-45 border-b border-l border-indigo-200/90 dark:border-[#3b3f78] rounded-bl-[2px]"></div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>



        {/* ── FOOTER: PERFIL DE USUARIO, MODO CLARO/OSCURO Y BOTÓN DE CERRAR SESIÓN ── */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          
          {/* Switch de Tema Sol / Luna Uiverse (Alineado a la izquierda) */}
          <div className="flex items-center justify-start px-1 py-1">
            <ThemeToggleSwitch isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </div>

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
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
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
            <div className="flex flex-col items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="group relative p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors cursor-pointer"
                title="Configuración de Perfil"
                style={{ border: 'none', background: 'transparent' }}
              >
                <Settings size={17} />
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3.5 py-1.5 rounded-xl bg-white/95 text-indigo-950 dark:bg-[#191c3d]/95 dark:text-white backdrop-blur-xl font-extrabold text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 ease-out z-[99999] shadow-xl shadow-indigo-500/15 border border-indigo-200/90 dark:border-[#3b3f78] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-sm animate-pulse"></span>
                  <span>Ajustes de Perfil</span>
                  <div className="absolute top-1/2 -translate-y-1/2 -left-[5px] w-2.5 h-2.5 bg-white/95 dark:bg-[#191c3d]/95 rotate-45 border-b border-l border-indigo-200/90 dark:border-[#3b3f78] rounded-bl-[2px]"></div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="group relative p-2 text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                title="Cerrar Sesión"
                style={{ border: 'none', background: 'transparent' }}
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

        </div>

      </div>
    </aside>
  );
}

export default Sidebar;
