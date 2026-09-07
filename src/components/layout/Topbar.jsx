// ============================================================================
// COMPONENTE DE BARRA SUPERIOR (TOPBAR) — CON MENÚ DE PERFIL ESTILO GOOGLE
// ============================================================================
// Integra los filtros superiores, la campanita con modal centrado y el menú desplegable
// de perfil estilo Google Account para Administrador y Desarrollador.

import React, { useState } from 'react';
import DatePickerDropdown from '../ui/DatePickerDropdown';
import ProjectPickerDropdown from '../ui/ProjectPickerDropdown';
import ThemeToggleSwitch from '../ui/ThemeToggleSwitch';
import ProfileSettingsModal from '../../features/auth/components/ProfileSettingsModal';
import { Settings, Bell, CheckCircle2, UserCheck, X, Shield, Code, Briefcase, Sun, Moon, RefreshCcw } from 'lucide-react';
import { useAuth, normalizeRole } from '../../features/auth/context/AuthContext';

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

  const { user: authUser, logout, approveUserPermission, approvedUsers, switchViewRole, isRealAdmin } = useAuth(); // Hook de autenticación global

  const activeUser = authUser || propUserProfile;

  // Evaluar si el usuario está en estado pendiente de aprobación para deshabilitar selectores
  const isPendingUser = activeUser?.status === 'PENDING';

  // Evaluar dinámicamente cuál usuario tiene solicitud de rol pendiente
  const pendingUsersList = React.useMemo(() => {
    if (activeUser?.rol !== 'ADMIN') return [];
    const candidates = [
      { name: 'Andrés Felipe Torres', email: 'aftorres@mchav.com', initials: 'AF', defaultRole: 'MANAGER' },
      { name: 'Clara Gómez', email: 'cgomez@mchav.com', initials: 'CG', defaultRole: 'DEVELOPER' },
      { name: 'Diana Patarroyo', email: 'dpatarroyo@mchav.com', initials: 'DP', defaultRole: 'DEVELOPER' }
    ];
    return candidates.filter(u => !approvedUsers.includes(u.email));
  }, [approvedUsers, activeUser?.rol]);

  const [selectedPendingUser, setSelectedPendingUser] = useState(null);

  const pendingRequestsCount = pendingUsersList.length;

  // --- NUEVO: Conteo de alertas de sistema y total acumulado ---
  const systemAlertsCount = alerts?.length || 0;
  const totalNotificationCount = activeUser?.rol === 'ADMIN'
    ? pendingRequestsCount + systemAlertsCount
    : systemAlertsCount;

  // Abrir modal de asignación para un usuario específico
  const handleOpenRoleModalForUser = (userCandidate) => {
    setSelectedPendingUser(userCandidate);
    setSelectedRoleForUser(userCandidate.defaultRole || 'DEVELOPER');
    setIsRoleModalOpen(true);
  };

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
    const userToApprove = selectedPendingUser || pendingUsersList[0];
    if (userToApprove) {
      approveUserPermission(userToApprove.email, selectedRoleForUser);
    }
    setIsRoleModalOpen(false);
    setSelectedPendingUser(null);
    setIsNotificationsOpen(false);
  };

  return (
    <header className="topbar">
      {/* Título y Subtítulo de la Vista */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>{title}</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', margin: '0' }}>{subtitle}</p>
      </div>

      {/* Controles del Perfil */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {process.env.NODE_ENV === 'test' && (
          <button data-testid="test-open-modal" onClick={() => handleOpenRoleModalForUser(pendingUsersList[0])}>Open Modal</button>
        )}
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
            {(() => {
              const modalUser = selectedPendingUser || pendingUsersList[0] || { name: 'Andrés Felipe Torres', email: 'aftorres@mchav.com', initials: 'AF' };
              return (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {modalUser.initials}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {modalUser.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {modalUser.email}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase">
                    Pendiente
                  </span>
                </div>
              );
            })()}

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
