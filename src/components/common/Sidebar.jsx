import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  ClipboardList, 
  Settings, 
  Activity, 
  LogOut,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Logo from './Logo';

function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  setIsDarkMode, 
  isCollapsed, 
  setIsCollapsed 
}) {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Botón flotante para abrir/cerrar */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="sidebar-toggle-btn"
        aria-label={isCollapsed ? "Expandir panel" : "Colapsar panel"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Cabecera */}
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
      
      {/* Menú de Navegación */}
      <nav className="nav-menu">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          style={{ 
            background: 'none', 
            border: 'none', 
            width: '100%', 
            textAlign: 'left', 
            font: 'inherit',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem'
          }}
          title={isCollapsed ? "Resumen" : ""}
        >
          <LayoutDashboard /> {!isCollapsed && "Resumen"}
        </button>
        <button 
          onClick={() => setActiveTab('usuarios')} 
          className={`nav-item ${activeTab === 'usuarios' ? 'active' : ''}`}
          style={{ 
            background: 'none', 
            border: 'none', 
            width: '100%', 
            textAlign: 'left', 
            font: 'inherit',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem'
          }}
          title={isCollapsed ? "Usuarios" : ""}
        >
          <Users /> {!isCollapsed && "Usuarios"}
        </button>
        <button 
          onClick={() => setActiveTab('sincronizacion')} 
          className={`nav-item ${activeTab === 'sincronizacion' ? 'active' : ''}`}
          style={{ 
            background: 'none', 
            border: 'none', 
            width: '100%', 
            textAlign: 'left', 
            font: 'inherit',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem'
          }}
          title={isCollapsed ? "Sincronización" : ""}
        >
          <ClipboardList /> {!isCollapsed && "Sincronización"}
        </button>
      </nav>
      


      {/* Cambiador de Tema */}
      <div 
        className="theme-switcher-wrapper" 
        style={{ 
          marginTop: 'auto',
          display: 'flex', 
          justifyContent: isCollapsed ? 'center' : 'stretch' 
        }}
      >
        {isCollapsed ? (
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-main)', 
              cursor: 'pointer',
              fontSize: '1.25rem',
              padding: '0.25rem'
            }}
            title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>
        ) : (
          <select 
            value={isDarkMode ? 'dark' : 'light'} 
            onChange={(e) => setIsDarkMode(e.target.value === 'dark')}
            className="theme-switcher-select"
          >
            <option value="light">☀️ Modo claro</option>
            <option value="dark">🌙 Modo oscuro</option>
          </select>
        )}
      </div>

      {/* Botón de Cerrar Sesión */}
      <div 
        style={{ 
          marginTop: '1rem',
          display: 'flex', 
          justifyContent: isCollapsed ? 'center' : 'flex-start' 
        }}
      >
        <a 
          href="/" 
          className="nav-item"
          style={{ 
            width: '100%',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem'
          }}
          title={isCollapsed ? "Cerrar Sesión" : ""}
        >
          <LogOut /> {!isCollapsed && "Cerrar Sesión"}
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;
