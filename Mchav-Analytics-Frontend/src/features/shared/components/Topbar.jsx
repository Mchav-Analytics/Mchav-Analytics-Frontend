import React, { useState, useMemo } from 'react';
import DatePickerDropdown from './DatePickerDropdown';
import ProjectPickerDropdown from './ProjectPickerDropdown';
import ProfileSettingsModal from './ProfileSettingsModal';
import { Settings, Menu, Bell, CheckCircle2 } from 'lucide-react';
import { isCriticalBug, isBottleneck } from '../../../utils/issueHelpers';

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
  setDateFilter,
  onToggleMobileMenu,
  setActiveTab,
  issues = [],
  onSelectIssue
}) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Calcular las alertas dinámicas en base a las tareas reales (congruencia con Dashboard)
  const notifications = useMemo(() => {
    const list = [];
    const criticalBugs = issues.filter(isCriticalBug);
    const blockedTasks = issues.filter(isBottleneck);

    criticalBugs.forEach(b => {
      list.push({
        id: `bug-${b.key}`,
        issueObj: b,
        type: 'critical',
        title: `Bug Crítico ${b.key} asignado`,
        desc: `Asignado a ${b.assignee || 'sin asignar'}. Requiere atención inmediata.`,
        time: 'Alerta Activa'
      });
    });

    blockedTasks.forEach(b => {
      list.push({
        id: `blocked-${b.key}`,
        issueObj: b,
        type: 'warning',
        title: `Tarea demorada ${b.key}`,
        desc: `${Number(b.cycle_time).toFixed(1)} días en curso. Revisar en la Daily.`,
        time: 'Alerta Activa'
      });
    });

    return list;
  }, [issues]);

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
      
      {/* Lado Izquierdo: Título, Subtítulo y Hamburger móvil */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="xl:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/40 hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            <Menu size={18} />
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block leading-none">
            {subtitle}
          </p>
        </div>
      </div>
      
      {/* Lado Derecho: Acciones y Perfil */}
      <div className="topbar-actions flex items-center gap-3">

        {/* Filtro Rango Fecha */}
        {setDateFilter && (
          <DatePickerDropdown dateFilter={dateFilter} setDateFilter={setDateFilter} />
        )}

        {/* Filtro Proyecto */}
        {setSelectedProjectId && (
          <ProjectPickerDropdown
            projects={projects}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
          />
        )}

        {/* Botón de Notificaciones (Campanita) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-[36px] h-[36px] rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#131B2E] text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer relative"
            title="Notificaciones"
          >
            <Bell size={15} />
            {/* Punto indicador rojo de notificación activa */}
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-rose-500 border border-white dark:border-[#131B2E] shrink-0 animate-ping" />
            )}
          </button>

          {isNotifOpen && (
            <>
              {/* Backdrop invisible para cerrar al hacer click fuera */}
              <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
              
              {/* Dropdown Box */}
              <div className="absolute right-0 mt-2.5 w-76 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-fade-in">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notificaciones</span>
                  <span className="text-[9px] font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded-md">
                    {notifications.length} {notifications.length === 1 ? 'alerta' : 'alertas'}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div 
                        key={notif.id}
                        onClick={() => {
                          if (typeof onSelectIssue === 'function' && notif.issueObj) {
                            onSelectIssue(notif.issueObj);
                          } else if (typeof setActiveTab === 'function') {
                            setActiveTab('proyectos');
                          }
                          setIsNotifOpen(false);
                        }}
                        className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex gap-2.5 items-start cursor-pointer text-left"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 mt-1.5 ${notif.type === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                        <div className="flex-1 space-y-0.5">
                          <p className="text-[11px] leading-relaxed font-bold text-slate-700 dark:text-slate-200">
                            {notif.title}
                          </p>
                          <p className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                            {notif.desc}
                          </p>
                          <p className="text-[8px] text-indigo-650 dark:text-indigo-400 font-bold uppercase tracking-wider">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
                      <CheckCircle2 size={24} className="text-emerald-500" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-800 dark:text-white">
                          Todo en orden
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          No hay alertas críticas en el sprint actual.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="px-4 py-2 border-t border-slate-100 dark:border-white/5 text-center bg-slate-50/50 dark:bg-slate-900/10">
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 cursor-pointer">
                    Marcar todas como leídas
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Perfil e Configuración */}
        <button
          type="button"
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#1B243B]/60 border border-transparent hover:border-slate-200 dark:hover:border-white/5 transition-all cursor-pointer text-left"
          title="Ver perfil y configuración de credenciales"
        >
          <div className="flex flex-col items-end user-profile-text">
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.2' }}>
              {userProfile ? userProfile.nombre : 'Usuario'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>
              {userProfile && userProfile.rol ? userProfile.rol : 'Administrador'}
            </span>
          </div>

          <div 
            style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.8rem' }}
          >
            {getUserInitials()}
          </div>

          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1B243B] text-slate-550 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">
            <Settings size={14} />
          </div>
        </button>
      </div>

      {/* Modal de Perfil y Configuración */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
      />
    </header>
  );
}

export default Topbar;
