// ============================================================================
// COMPONENTE DE BARRA LATERAL (SIDEBAR) — NAVEGACIÓN COMPLETA Y ALIGERADA (RBAC)
// ============================================================================
// Incluye las pestañas de Resumen, Tareas (NUEVA), Historial (NUEVA), Sincronización y Usuarios y Roles.

import React from 'react';
import {
  FolderKanban,
  LayoutDashboard,
  ClipboardList,
  Users,
  Code,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../../features/auth/context/AuthContext';

function Sidebar({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  isCollapsed,
  setIsCollapsed
}) {
  const { logout, user } = useAuth(); // Hook de autenticación global para obtener el usuario activo y su rol

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
  };

  // Rol activo del usuario logueado (por defecto 'ADMIN', 'MANAGER' o 'DEVELOPER')
  const userRole = user?.rol || 'ADMIN';

  // Generar dinámicamente el menú de navegación según el rol
  const navItems = React.useMemo(() => {
    // Si el usuario es Desarrollador (DEVELOPER), solo ve su pestaña propia "Mi Trabajo"
    if (userRole === 'DEVELOPER') {
      return [
        { id: 'developer', label: 'Mi Trabajo', icon: Code },
      ];
    }

    // Si el usuario es Líder Técnico (MANAGER), ve Proyectos, Resumen y Sincronización
    if (userRole === 'MANAGER') {
      return [
        { id: 'proyectos', label: 'Proyectos', icon: FolderKanban },
        { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
        { id: 'sincronizacion', label: 'Sincronización', icon: ClipboardList },
      ];
    }

    // Si el usuario es Administrador (ADMIN), ve Usuarios y Roles de primero y Proyectos debajo
    return [
      { id: 'usuarios', label: 'Usuarios y Roles', icon: Users },
      { id: 'proyectos', label: 'Proyectos', icon: FolderKanban },
      { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
      { id: 'sincronizacion', label: 'Sincronización', icon: ClipboardList },
    ];
  }, [userRole]);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Botón flotante para abrir/cerrar panel */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="sidebar-toggle-btn"
        aria-label={isCollapsed ? "Expandir panel" : "Colapsar panel"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Cabecera con Logo Oficial */}
      <div
        className="sidebar-header"
        style={{
          borderBottom: 'none',
          marginBottom: '1.5rem',
          paddingBottom: '0',
          justifyContent: isCollapsed ? 'center' : 'flex-start'
        }}
      >
        <div
          className="sidebar-logo"
          style={{
            background: 'none',
            width: 'auto',
            height: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Logo style={{ marginRight: isCollapsed ? '0px' : '8px' }} />
        </div>
        {!isCollapsed && (
          <span className="sidebar-title" style={{ fontSize: '1.15rem', display: 'flex', flexDirection: 'column' }}>
            <strong>MCHAV</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>Analytics</span>
          </span>
        )}
      </div>

      {/* Menú de Navegación Principal Conservado e Incrementado con Tareas e Historial */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="sidebar-icon" size={18} />
              {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer del Sidebar con Selector de Tema Claro/Oscuro y Salida */}
      <div className="sidebar-footer">
        {/* Selector de Tema con Switch Visual Exacto */}
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-full border border-slate-300 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer mb-2"
          title={isCollapsed ? (isDarkMode ? "Modo Oscuro" : "Modo Claro") : undefined}
        >
          <div className="flex items-center gap-2">
            {isDarkMode ? (
              <Moon size={16} className="text-indigo-400 shrink-0" />
            ) : (
              <Sun size={16} className="text-amber-500 shrink-0" />
            )}
            {!isCollapsed && (
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                {isDarkMode ? "Modo Oscuro" : "Modo Claro"}
              </span>
            )}
          </div>

          {!isCollapsed && (
            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${isDarkMode ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}>
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </div>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="sidebar-link logout-btn"
          title={isCollapsed ? "Cerrar Sesión" : undefined}
        >
          <LogOut className="sidebar-icon" size={18} />
          {!isCollapsed && <span className="sidebar-label">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
