import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  MessageSquare,
  RefreshCw,
  FileBarChart2,
  Bug,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  UserCheck,
  CheckSquare,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { jiraService } from '../../../services/api';
import {
  getReadNotificationIds,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotificationUpdates
} from '../../../services/notificationStore';

// Configuración de notificaciones separadas POR ROL
const roleNotifications = {
  DEVELOPER: [],
  MANAGER: [],
  ADMIN: []
};

export default function LiderNotificationBell({ className = "", onNavigateToHub = undefined, onNavigateTab = undefined, dynamicNotifications = [], onOpenTask = undefined }) {
  const { user } = useAuth();

  // Detectar rol exacto del usuario activo
  const rawRole = (user?.rol || 'MANAGER').toUpperCase();
  const activeRole = rawRole.includes('DEV') ? 'DEVELOPER' : rawRole.includes('ADMIN') ? 'ADMIN' : 'MANAGER';

  const [isOpen, setIsOpen] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [syncMsg, setSyncMsg] = useState('');
  const popoverRef = useRef(null);

  const getMergedNotifications = (role) => {
    const base = roleNotifications[role] || roleNotifications.MANAGER;
    // Filter out static task assignments if dynamic ones exist, to avoid duplicates/dummy data
    const filteredBase = dynamicNotifications.length > 0 ? base.filter(n => n.type !== 'TASK_ASSIGNED') : base;
    const combined = [...dynamicNotifications, ...filteredBase];
    const readIds = getReadNotificationIds();
    return combined.map(n => ({
      ...n,
      isRead: n.isRead || readIds.includes(n.id)
    }));
  };

  const [notifications, setNotifications] = useState(() => getMergedNotifications(activeRole));

  // Sincronizar notificaciones según el rol y suscribirse a cambios globales en tiempo real
  useEffect(() => {
    setNotifications(getMergedNotifications(activeRole));
    const unsubscribe = subscribeToNotificationUpdates(() => {
      setNotifications(getMergedNotifications(activeRole));
    });
    return unsubscribe;
  }, [activeRole, dynamicNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = () => {
    const ids = notifications.map(n => n.id);
    markAllNotificationsAsRead(ids);
  };

  const handleMarkSingleRead = (id) => {
    markNotificationAsRead(id);
  };

  const handleGoToHub = () => {
    setIsOpen(false);
    if (onNavigateTab) {
      onNavigateTab('alerts_center');
    } else if (onNavigateToHub) {
      onNavigateToHub('alerts_center');
    }
  };

  const handleNavigate = (tabName) => {
    setIsOpen(false);
    if (onNavigateTab) {
      onNavigateTab(tabName);
    } else if (onNavigateToHub) {
      onNavigateToHub(tabName);
    }
  };

  const handleOpenTask = (issueKey) => {
    setIsOpen(false);
    if (onOpenTask && issueKey) {
      onOpenTask(issueKey);
    } else {
      handleNavigate('developer');
    }
  };

  const handleRetrySync = (id) => {
    setSyncingId(id);
    jiraService.triggerSync()
      .then(() => {
        setSyncMsg('✨ Sincronización reintentada con éxito');
        markNotificationAsRead(id);
        setTimeout(() => setSyncMsg(''), 3000);
      })
      .catch((err) => {
        console.error("Error al reintentar sync:", err);
        setSyncMsg('⚠️ Error reintentando sync');
        setTimeout(() => setSyncMsg(''), 3000);
      })
      .finally(() => {
        setSyncingId(null);
      });
  };

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* BOTÓN DE CAMPANA */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer relative flex items-center justify-center shadow-xs"
        title={`Notificaciones - Rol ${activeRole}`}
      >
        <Bell size={16} className="text-slate-700 dark:text-slate-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* POPUP EMERGENTE DEL CENTRO DE ACTIVIDAD */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150 text-left">
          {/* CABECERA POPUP */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Notificaciones ({activeRole})
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold text-[10px]">
                  {unreadCount} activas
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mr-1 cursor-pointer"
                >
                  Marcar leídas
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {syncMsg && (
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-[11px] font-bold text-center animate-in fade-in">
              {syncMsg}
            </div>
          )}

          {/* LISTA DE NOTIFICACIONES FILTRADAS POR ROL */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 pr-1 space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkSingleRead(notif.id)}
                className={`p-3 rounded-xl transition-all flex flex-col gap-2 ${!notif.isRead
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-85'
                  }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${notif.type === 'TASK_ASSIGNED' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' :
                      notif.type === 'SOLICITUD' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400' :
                        notif.type === 'BUG' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                          notif.type === 'ALERTA' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                            notif.type === 'SYNC_FAIL' ? 'bg-red-500/15 text-red-600 dark:text-red-400' :
                              notif.type === 'SYNC_SUCCESS' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                                notif.type === 'USER_REG' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400' :
                                  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    }`}>
                    {notif.type === 'TASK_ASSIGNED' ? <CheckSquare size={14} /> :
                      notif.type === 'SOLICITUD' ? <MessageSquare size={14} /> :
                        notif.type === 'BUG' ? <Bug size={14} /> :
                          notif.type === 'ALERTA' ? <AlertTriangle size={14} /> :
                            notif.type === 'SYNC_FAIL' ? <RefreshCw size={14} /> :
                              notif.type === 'SYNC_SUCCESS' ? <CheckCircle2 size={14} /> :
                                notif.type === 'USER_REG' ? <UserCheck size={14} /> :
                                  <FileBarChart2 size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      {notif.description}
                    </p>
                    {notif.tagline && (
                      <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-300 mt-1 italic">
                        {notif.tagline}
                      </p>
                    )}
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN RÁPIDA SEGÚN TIPO Y ROL */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                  {notif.type === 'TASK_ASSIGNED' && (
                    <button
                      onClick={() => handleOpenTask(notif.issueKey)}
                      className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CheckSquare size={11} /> Ver tarea
                    </button>
                  )}

                  {notif.type === 'USER_REG' && (
                    <button
                      onClick={() => handleNavigate('usuarios')}
                      className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck size={11} /> Ver usuarios
                    </button>
                  )}

                  {notif.type === 'SOLICITUD' && (
                    <button
                      onClick={handleGoToHub}
                      className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare size={11} /> Responder
                    </button>
                  )}

                  {notif.type === 'BUG' && (
                    <button
                      onClick={() => handleNavigate('team_matrix')}
                      className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-rose-600/20 text-rose-700 dark:text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Bug size={11} /> Ver bug
                    </button>
                  )}

                  {notif.type === 'ALERTA' && (
                    <button
                      onClick={handleGoToHub}
                      className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-amber-600/20 text-amber-700 dark:text-amber-300 hover:bg-amber-600 hover:text-white border border-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <AlertTriangle size={11} /> Revisar
                    </button>
                  )}

                  {notif.type === 'SYNC_FAIL' && (
                    <button
                      onClick={() => handleRetrySync(notif.id)}
                      disabled={syncingId === notif.id}
                      className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={11} className={syncingId === notif.id ? 'animate-spin' : ''} />
                      {syncingId === notif.id ? 'Reintentando...' : 'Reintentar'}
                    </button>
                  )}

                  {notif.type === 'REPORT' && (
                    <button
                      onClick={() => handleNavigate('sprint_health')}
                      className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <FileBarChart2 size={11} /> Ver informe
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* PIE DE PANEL EMERGENTE */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleGoToHub}
              className="w-full py-1.5 px-3 text-center text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Ir al Centro de Actividad completo</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
