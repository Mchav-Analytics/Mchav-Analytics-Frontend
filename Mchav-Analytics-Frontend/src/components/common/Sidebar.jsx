import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  ClipboardList, 
  Settings, 
  Activity, 
  LogOut 
} from 'lucide-react';
import Logo from './Logo';

function Sidebar({ activeTab, setActiveTab, isDarkMode, setIsDarkMode }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header" style={{ borderBottom: 'none', marginBottom: '1.5rem', paddingBottom: '0' }}>
        <div className="sidebar-logo" style={{ background: 'none', width: 'auto', height: 'auto', display: 'flex', alignItems: 'center' }}>
          <Logo />
        </div>
        <span className="sidebar-title" style={{ fontSize: '1.15rem', display: 'flex', flexDirection: 'column' }}>
          <strong>MCHAV</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>Analytics</span>
        </span>
      </div>
      
      <nav className="nav-menu">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit' }}
        >
          <LayoutDashboard /> Resumen
        </button>
        <button 
          onClick={() => setActiveTab('proyectos')} 
          className={`nav-item ${activeTab === 'proyectos' ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit' }}
        >
          <FolderKanban /> Rendimiento
        </button>
        <button 
          onClick={() => setActiveTab('sincronizacion')} 
          className={`nav-item ${activeTab === 'sincronizacion' ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit' }}
        >
          <ClipboardList /> Sincronización
        </button>
        <button 
          onClick={() => setActiveTab('configuracion')} 
          className={`nav-item ${activeTab === 'configuracion' ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit' }}
        >
          <Settings /> Configuración
        </button>
      </nav>
      
      <div className="sidebar-promo-card">
        <div className="sidebar-promo-icon">
          <Activity size={20} />
        </div>
        <div className="sidebar-promo-title">
          Obtén insights valiosos de tus datos de Jira
        </div>
        <button onClick={() => setActiveTab('proyectos')} className="sidebar-promo-btn">
          Explorar reportes →
        </button>
      </div>

      <div className="theme-switcher-wrapper">
        <select 
          value={isDarkMode ? 'dark' : 'light'} 
          onChange={(e) => setIsDarkMode(e.target.value === 'dark')}
          className="theme-switcher-select"
        >
          <option value="light">☀️ Modo claro</option>
          <option value="dark">🌙 Modo oscuro</option>
        </select>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <a href="/" className="nav-item"><LogOut /> Cerrar Sesión</a>
      </div>
    </aside>
  );
}

export default Sidebar;
