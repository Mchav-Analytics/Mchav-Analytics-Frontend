// ============================================================================
// COMPONENTE DE BARRA SUPERIOR (TOPBAR) — CON MENÚ DE PERFIL ESTILO GOOGLE
// ============================================================================
// Integra los filtros superiores, la campanita con modal centrado y el menú desplegable
// de perfil estilo Google Account para Administrador y Desarrollador.

import React, { useState } from 'react';
import DatePickerDropdown from '../ui/DatePickerDropdown';
import ProjectPickerDropdown from '../ui/ProjectPickerDropdown';
import ProfileSettingsModal from '../../features/auth/components/ProfileSettingsModal';
import { Settings, Bell, CheckCircle2, UserCheck, X, Shield, Code, Briefcase, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';

function Topbar({
  title = "Resumen 👋",
  subtitle = "Aquí tienes un panorama general de tus proyectos.",
  projects = [],
  selectedProjectId,
  setSelectedProjectId,
  syncLoading,
  handleSyncNow,
  userProfile: propUserProfile,
  dateFilter,
  setDateFilter,
  isDarkMode,
  setIsDarkMode,
  setActiveTab,
  alerts,
  setAlerts
}) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Estado para el Modal Centrado en pantalla de asignación de rol
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRoleForUser, setSelectedRoleForUser] = useState('DEVELOPER'); // 'DEVELOPER' o 'MANAGER'

  const { user: authUser, logout, approveUserPermission, approvedUsers } = useAuth(); // Hook de autenticación global

  const activeUser = authUser || propUserProfile;

  // Evaluar si el usuario está en estado pendiente de aprobación para deshabilitar selectores
  const isPendingUser = activeUser?.status === 'PENDING';

  // Evaluar dinámicamente cuál usuario tiene solicitud de rol pendiente (Andrés Felipe Torres para Manager o Clara Gómez para Dev)
  const pendingUser = React.useMemo(() => {
    if (activeUser?.rol !== 'ADMIN') return null;
    if (!approvedUsers.includes('aftorres@mchav.com')) {
      return { name: 'Andrés Felipe Torres', email: 'aftorres@mchav.com', initials: 'AF', defaultRole: 'MANAGER' };
    }
    if (!approvedUsers.includes('cgomez@mchav.com')) {
      return { name: 'Clara Gómez', email: 'cgomez@mchav.com', initials: 'CG', defaultRole: 'DEVELOPER' };
    }
    return null;
  }, [approvedUsers, activeUser?.rol]);

  const pendingRequestsCount = pendingUser ? 1 : 0;

  // --- NUEVO: Conteo de alertas de sistema y total acumulado ---
  const systemAlertsCount = alerts?.length || 0;
  const totalNotificationCount = activeUser?.rol === 'ADMIN'
    ? pendingRequestsCount + systemAlertsCount
    : systemAlertsCount;

  // Obtener iniciales del usuario para mostrar en el avatar circular
  const getUserInitials = () => {
    if (!activeUser || !activeUser.nombre) return "VH";
    const parts = activeUser.nombre.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  // Formatear la etiqueta legible del rol (ADMIN -> Administrador, DEVELOPER -> Desarrollador)
  const getRoleLabel = () => {
    if (!activeUser || !activeUser.rol) return 'Administrador';
    if (activeUser.rol === 'DEVELOPER') return 'Desarrollador';
    if (activeUser.rol === 'ADMIN') return 'Administrador';
    return activeUser.rol;
  };

  // Confirmar y aplicar la aprobación del rol guardando el estado sin redirigir al Admin
  const handleConfirmRoleApproval = () => {
    const emailToApprove = pendingUser ? pendingUser.email : 'aftorres@mchav.com';
    approveUserPermission(emailToApprove, selectedRoleForUser);
    setIsRoleModalOpen(false);
    setIsNotificationsOpen(false);
  };

  return (
    <header className="topbar">
      {/* Título y Subtítulo de la Vista */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>{title}</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', margin: '0' }}>{subtitle}</p>
      </div>

      {/* Controles de Filtros, Notificaciones y Perfil */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* Selector de Rango de Fecha (Deshabilitado con Candado en Estado PENDING) */}
        {setDateFilter && (
          <DatePickerDropdown
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            disabled={isPendingUser}
          />
        )}

        {/* Selector de Proyecto Activo (Deshabilitado con Candado en Estado PENDING) */}
        {setSelectedProjectId && (
          <ProjectPickerDropdown
            projects={projects}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            disabled={isPendingUser}
          />
        )}

        {/* Campanita de Notificaciones para el Administrador */}
        {(activeUser?.rol === 'ADMIN' || activeUser?.rol === 'MANAGER') && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (activeUser?.rol === 'ADMIN' && pendingRequestsCount > 0) {
                  setIsRoleModalOpen(true); // Abrir modal centrado directamente al hacer clic en notificaciones
                } else {
                  setIsNotificationsOpen(!isNotificationsOpen);
                }
              }}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer relative shadow-sm"
              title="Bandeja de notificaciones y solicitudes de acceso"
            >
              <Bell size={18} />

              {/* Globo rojo con conteo de solicitudes pendientes */}
              {totalNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center animate-bounce shadow-md">
                  {totalNotificationCount}
                </span>
              )}
            </button>

            {/* Desplegable Popover secundario de Campanita de Notificaciones */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 p-4 space-y-3 text-left animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-indigo-500" />
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Notificaciones ({totalNotificationCount})
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={14} />
                  </button>
                </div>

                {totalNotificationCount > 0 ? (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {/* Solicitud de Rol (Exclusivo para el Administrador) */}
                    {activeUser?.rol === 'ADMIN' && pendingRequestsCount > 0 && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                          <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                            Solicitud de Acceso Pendiente
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                          <strong>{pendingUser ? pendingUser.name : 'Andrés Felipe Torres'}</strong> (<code className="text-[10px]">{pendingUser ? pendingUser.email : 'aftorres@mchav.com'}</code>) solicita asignación de rol.
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            setIsRoleModalOpen(true); // Abrir modal centrado
                          }}
                          className="w-full mt-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Shield size={14} /> Seleccionar y Asignar Rol
                        </button>
                      </div>
                    )}

                    {/* Alertas del Sistema Evaluadas */}
                    {alerts && alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 border rounded-2xl space-y-1 relative group/alert ${alert.tipo === 'danger'
                            ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-900 dark:text-rose-300'
                            : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-300'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold flex items-center gap-1">
                            {alert.titulo}
                          </span>
                          {/* Botón para descartar/cerrar la alerta */}
                          <button
                            onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                            title="Descartar alerta"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <p className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-300">
                          {alert.descripcion}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 space-y-1">
                    <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sin solicitudes pendientes</p>
                    <p className="text-[11px]">Todos los desarrolladores tienen sus permisos autorizados.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Contenedor Desplegable del Perfil de Usuario Estilo Google */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(!isProfileModalOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all cursor-pointer text-left"
            title="Ver perfil y configuración de cuenta"
          >
            <div className="flex flex-col items-end user-profile-text">
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.2' }}>
                {activeUser ? activeUser.nombre : 'Valka Hoyos'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>
                {getRoleLabel()}
              </span>
            </div>

            <div
              style={{ width: '38px', height: '38px', borderRadius: '50%', background: activeUser?.rol === 'DEVELOPER' ? 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)' : 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.85rem' }}
            >
              {getUserInitials()}
            </div>

            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <Settings size={15} />
            </div>
          </button>

          {/* Menú Desplegable de Perfil Estilo Google Popover */}
          <ProfileSettingsModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            userProfile={{ ...activeUser, onLogout: logout }}
          />
        </div>

      </div>

      {/* MODAL CENTRADO EN PANTALLA DE ASIGNACIÓN DE ROL POR EL ADMINISTRADOR */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-left animate-in zoom-in-95 duration-150">

            {/* Cabecera del Modal Centrado */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                    Solicitud de Acceso Pendiente
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Asigna el rol jerárquico antes de autorizar el ingreso
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tarjeta del Usuario Solicitante */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {pendingUser ? pendingUser.initials : 'AF'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {pendingUser ? pendingUser.name : 'Andrés Felipe Torres'}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {pendingUser ? pendingUser.email : 'aftorres@mchav.com'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase">
                Pendiente
              </span>
            </div>

            {/* Opciones de Asignación de Rol (Desarrollador vs Líder Técnico) */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                🛡️ Selecciona el Rol Jerárquico:
              </label>

              {/* Opción 1: Desarrollador */}
              <div
                onClick={() => setSelectedRoleForUser('DEVELOPER')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${selectedRoleForUser === 'DEVELOPER'
                    ? 'bg-indigo-50/70 dark:bg-indigo-500/10 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
              >
                <input
                  type="radio"
                  name="roleSelect"
                  checked={selectedRoleForUser === 'DEVELOPER'}
                  onChange={() => setSelectedRoleForUser('DEVELOPER')}
                  className="mt-1 accent-indigo-600"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Code size={15} className="text-teal-500" />
                    <span className="text-xs font-extrabold">Desarrollador (DEVELOPER)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    Acceso a su espacio de trabajo personal, métricas de Cycle Time, Throughput personal y consola JQL libre.
                  </p>
                </div>
              </div>

              {/* Opción 2: Líder Técnico / Manager */}
              <div
                onClick={() => setSelectedRoleForUser('MANAGER')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${selectedRoleForUser === 'MANAGER'
                    ? 'bg-purple-50/70 dark:bg-purple-500/10 border-purple-500 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/30'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
              >
                <input
                  type="radio"
                  name="roleSelect"
                  checked={selectedRoleForUser === 'MANAGER'}
                  onChange={() => setSelectedRoleForUser('MANAGER')}
                  className="mt-1 accent-purple-600"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={15} className="text-purple-500" />
                    <span className="text-xs font-extrabold">Líder Técnico (MANAGER)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    Acceso a los dashboards consolidados de equipo, informes de velocidad de sprint y gestión de proyectos.
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de Acción del Modal */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleApproval}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck size={15} /> Aprobar y Guardar Rol
              </button>
            </div>

          </div>
        </div>
      )}

    </header>
  );
}

export default Topbar;
