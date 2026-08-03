import React from 'react';
import { RefreshCw } from 'lucide-react';

function Topbar({ 
  title = "Resumen 👋", 
  subtitle = "Aquí tienes un panorama general de tus proyectos.",
  projects = [], 
  selectedProjectId, 
  setSelectedProjectId, 
  syncLoading, 
  handleSyncNow,
  userProfile
}) {
  
  // Obtener iniciales del usuario para el avatar
  const getUserInitials = () => {
    if (!userProfile || !userProfile.nombre) return "AD";
    const parts = userProfile.nombre.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>{title}</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', margin: '0' }}>{subtitle}</p>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Botón Sincronizar (MCHAV) */}
        {handleSyncNow && (
          <button 
            onClick={handleSyncNow} 
            disabled={syncLoading} 
            className="sync-btn"
            style={{ height: '34px', padding: '0 12.5px', fontSize: '0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', margin: '0' }}
          >
            <RefreshCw size={14} className={syncLoading ? 'animate-spin' : ''} />
            {syncLoading ? "Sincronizando..." : "Sincronizar"}
          </button>
        )}

        {/* Filtro Rango Fecha */}
        <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '6px 12px', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>📅</span>
          <select style={{ border: 'none', background: 'none', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
            <option>1 may - 31 may 2025</option>
            <option>Todos los tiempos</option>
          </select>
        </div>

        {/* Filtro Proyecto */}
        {setSelectedProjectId && (
          <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '6px 12px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>📁</span>
            <select 
              value={selectedProjectId} 
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{ border: 'none', background: 'none', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              <option value="">Todos los proyectos</option>
              {projects.map(p => (
                <option key={p.id_proyecto} value={p.id_proyecto}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notificaciones */}
        <button style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '38px', height: '38px', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
          <span style={{ fontSize: '1.1rem' }}>🔔</span>
          <span style={{ position: 'absolute', top: '2px', right: '2px', background: '#EF4444', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>3</span>
        </button>

        {/* Perfil */}
        <div 
          style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.85rem' }}
          title={userProfile ? `${userProfile.nombre} (${userProfile.rol || 'Sin Rol'})` : 'Usuario'}
        >
          {getUserInitials()}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
