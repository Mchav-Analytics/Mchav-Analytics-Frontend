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

    // Si el usuario es Líder Técnico (MANAGER), ve Resumen (Dashboard), Proyectos y Sincronización
    if (userRole === 'MANAGER') {
      return [
        { id: 'dashboard', label: 'Resumen Executive', icon: LayoutDashboard },
        { id: 'proyectos', label: 'Proyectos y Equipos', icon: FolderKanban },
        { id: 'sincronizacion', label: 'Sincronización Jira', icon: ClipboardList },
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
      {/* Botón flotante para abrir/cerrar panel en su posición exacta original en el borde */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="sidebar-toggle-btn"
        aria-label={isCollapsed ? "Expandir panel" : "Colapsar panel"}
        title={isCollapsed ? "Expandir panel" : "Colapsar panel"}
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

      {/* Menú de Navegación Principal con Proyección Isométrica sólo en Colapsado */}
      <nav className="sidebar-nav [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div key={item.id} className="iso-pro relative w-full flex items-center justify-start">
              {/* Los aros 3D sólo se muestran cuando el sidebar está colapsado para evitar superponerse al texto */}
              {isCollapsed && (
                <>
                  <span className="iso-ring"></span>
                  <span className="iso-ring"></span>
                  <span className="iso-ring"></span>
                </>
              )}
              <button
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon className={`sidebar-icon ${isCollapsed ? 'iso-svg' : ''}`} size={18} />
                {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
              </button>
              {/* Etiqueta isométrica visible únicamente al pasar el cursor en modo colapsado */}
              {isCollapsed && (
                <span className="text iso-text font-sans">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer del Sidebar con Selector de Tema Claro/Oscuro y Salida */}
      <div className="sidebar-footer">
        {/* Selector de Tema: Únicamente Interruptor Animado Alineado a la Izquierda (Uiverse.io) */}
        <div className="flex items-center justify-start pl-2 py-2 mb-2">
          <label className="theme text-[8px] sm:text-[9px] cursor-pointer" title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}>
            <span className="theme__toggle-wrap">
              <input
                type="checkbox"
                className="theme__toggle"
                role="switch"
                name="theme"
                value="dark"
                checked={isDarkMode}
                onChange={(e) => setIsDarkMode(e.target.checked)}
              />
              <span className="theme__icon">
                <span className="theme__icon-part"></span>
                <span className="theme__icon-part"></span>
                <span className="theme__icon-part"></span>
                <span className="theme__icon-part"></span>
                <span className="theme__icon-part"></span>
                <span className="theme__icon-part"></span>
                <span className="theme__icon-part"></span>
                <span className="theme__icon-part"></span>
                <span className="theme__icon-part"></span>
              </span>
            </span>
          </label>
        </div>

        <div className="iso-pro relative w-full flex items-center justify-start">
          {isCollapsed && (
            <>
              <span className="iso-ring"></span>
              <span className="iso-ring"></span>
              <span className="iso-ring"></span>
            </>
          )}
          <button
            onClick={handleLogout}
            className="sidebar-link logout-btn"
          >
            <LogOut className={`sidebar-icon ${isCollapsed ? 'iso-svg' : ''}`} size={18} />
            {!isCollapsed && <span className="sidebar-label">Cerrar Sesión</span>}
          </button>
          {isCollapsed && (
            <span className="text iso-text font-sans">
              Cerrar Sesión
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
