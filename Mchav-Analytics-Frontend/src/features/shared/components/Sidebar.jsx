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
  ChevronRight,
  Sun,
  Moon,
  History,
  FileText
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
          onClick={() => setActiveTab('proyectos')} 
          className={`nav-item ${activeTab === 'proyectos' ? 'active' : ''}`}
          style={{ 
            background: 'none', 
            border: 'none', 
            width: '100%', 
            textAlign: 'left', 
            font: 'inherit',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem'
          }}
          title={isCollapsed ? "Tareas" : ""}
        >
          <FolderKanban /> {!isCollapsed && "Tareas"}
        </button>
        <button 
          onClick={() => setActiveTab('historial')} 
          className={`nav-item ${activeTab === 'historial' ? 'active' : ''}`}
          style={{ 
            background: 'none', 
            border: 'none', 
            width: '100%', 
            textAlign: 'left', 
            font: 'inherit',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem'
          }}
          title={isCollapsed ? "Historial" : ""}
        >
          <History /> {!isCollapsed && "Historial"}
        </button>
        <button 
          onClick={() => setActiveTab('reportes')} 
          className={`nav-item ${activeTab === 'reportes' ? 'active' : ''}`}
          style={{ 
            background: 'none', 
            border: 'none', 
            width: '100%', 
            textAlign: 'left', 
            font: 'inherit',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem'
          }}
          title={isCollapsed ? "Reportes" : ""}
        >
          <FileText /> {!isCollapsed && "Reportes"}
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
      


      {/* Cambiador de Tema (Botón Real de Alternancia Instantánea) */}
      <div className="mt-auto pt-2">
        {isCollapsed ? (
          <button 
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-500/50 transition-all shadow-sm cursor-pointer flex items-center justify-center"
            title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
          >
            {isDarkMode ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-500" />}
          </button>
        ) : (
          <button 
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-500/50 transition-all text-xs font-semibold shadow-sm cursor-pointer"
            title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
          >
            <div className="flex items-center gap-2">
              {isDarkMode ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-500" />}
              <span>{isDarkMode ? "Modo Oscuro" : "Modo Claro"}</span>
            </div>
            <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-amber-400'}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-4.5' : 'translate-x-1'}`} />
            </div>
          </button>
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
