import DatePickerDropdown from './DatePickerDropdown';
import ProjectPickerDropdown from './ProjectPickerDropdown';

function Topbar({ 
  title = "Resumen 👋", 
  subtitle = "Aquí tienes un panorama general de tus proyectos.",
  projects = [], 
  selectedProjectId, 
  setSelectedProjectId, 
  syncLoading, 
  handleSyncNow,
  userProfile,
  dateFilter,
  setDateFilter
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

        {/* Filtro Rango Fecha (Calendario Seleccionable por Día, Mes, Año y Rango) */}
        {setDateFilter && (
          <DatePickerDropdown dateFilter={dateFilter} setDateFilter={setDateFilter} />
        )}

        {/* Filtro Proyecto (Componente Desplegable Visualmente Mejorado) */}
        {setSelectedProjectId && (
          <ProjectPickerDropdown
            projects={projects}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
          />
        )}



        {/* Perfil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }} className="user-profile-text">
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.2' }}>
              {userProfile ? userProfile.nombre : 'Usuario'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>
              {userProfile && userProfile.rol ? userProfile.rol : 'Administrador'}
            </span>
          </div>
          <div 
            style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.85rem' }}
            title={userProfile ? `${userProfile.nombre} (${userProfile.rol || 'Administrador'})` : 'Usuario'}
          >
            {getUserInitials()}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
