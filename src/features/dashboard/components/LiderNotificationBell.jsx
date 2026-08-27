import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  MessageSquare,
  RefreshCw,
  FileBarChart2,
  Bug,
  ArrowRight,
  CheckCircle2,
  UserCheck,
  CheckSquare,
  Inbox
} from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { jiraService } from '../../../services/api';
import {
  getReadNotificationIds,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotificationUpdates
} from '../../../services/notificationStore';

const roleNotifications = {
  DEVELOPER: [],
  MANAGER: [],
  ADMIN: []
};

const EMPTY_ARRAY = [];

export default function LiderNotificationBell({ 
  className = "", 
  onNavigateToHub = undefined, 
  onNavigateTab = undefined, 
  dynamicNotifications = EMPTY_ARRAY, 
  onOpenTask = undefined 
}) {
  const { user } = useAuth();

  const rawRole = (user?.rol || 'DEVELOPER').toUpperCase();
  const activeRole = rawRole.includes('ADMIN') ? 'ADMIN' : rawRole.includes('MANAG') || rawRole.includes('LIDER') ? 'MANAGER' : 'DEVELOPER';

  const [isOpen, setIsOpen] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [syncMsg, setSyncMsg] = useState('');
  const popoverRef = useRef(null);

  const getMergedNotifications = (role) => {
    const base = roleNotifications[role] || roleNotifications.MANAGER;
    const filteredBase = dynamicNotifications.length > 0 ? base.filter(n => n.type !== 'TASK_ASSIGNED') : base;
    const combined = [...dynamicNotifications, ...filteredBase];
    const readIds = getReadNotificationIds();
    return combined.map(n => ({
      ...n,
      isRead: n.isRead || readIds.includes(n.id)
    }));
  };

  const [notifications, setNotifications] = useState(() => getMergedNotifications(activeRole));

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
    } else if (onNavigateTab) {
      onNavigateTab('dev_workload');
    } else {
      handleNavigate('developer');
    }
  };

  const handleRetrySync = (id) => {
    setSyncingId(id);
    jiraService.triggerSync()
      .then(() => {
        setSyncMsg('✨ Sincronización completada con éxito');
        markNotificationAsRead(id);
        setTimeout(() => setSyncMsg(''), 3000);
      })
      .catch((err) => {
        console.error("Error al reintentar sync:", err);
        setSyncMsg('⚠️ Error al sincronizar con Jira');
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
        className="p-2.5 rounded-2xl bg-white dark:bg-[#141738] hover:bg-slate-100 dark:hover:bg-[#1a1e47] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#272b5c] transition-all cursor-pointer relative flex items-center justify-center shadow-xs"
        title={`Notificaciones - Rol ${activeRole}`}
      >
        <Bell size={18} className="text-slate-700 dark:text-slate-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* POPUP EMERGENTE DE NOTIFICACIONES */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[calc(100vw-2.5rem)] sm:w-96 max-w-sm bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-2xl shadow-2xl z-[9999] p-4 sm:p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-left">
          
          {/* CABECERA POPUP */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#232752] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Bell size={15} />
              </div>
              <div>
                <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Notificaciones
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  Rol {activeRole}
                </span>
              </div>
              {unreadCount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                  {unreadCount} activas
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer mr-1"
                >
                  Marcar leídas
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1e47] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {syncMsg && (
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold text-center animate-in fade-in">
              {syncMsg}
            </div>
          )}

          {/* LISTA DE NOTIFICACIONES */}
          <div className="max-h-88 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkSingleRead(notif.id)}
                  className={`p-3.5 rounded-2xl transition-all border flex flex-col gap-2.5 ${
                    !notif.isRead
                      ? 'bg-slate-50/90 dark:bg-[#0c0e21] border-indigo-200 dark:border-indigo-900/50 shadow-xs'
                      : 'bg-white dark:bg-[#1a1e47]/40 border-slate-200/70 dark:border-[#232752] opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      notif.type === 'TASK_ASSIGNED' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30' :
                      notif.type === 'SOLICITUD' ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30' :
                      notif.type === 'BUG' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30' :
                      notif.type === 'ALERTA' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30' :
                      notif.type === 'SYNC_FAIL' ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30' :
                      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                    }`}>
                      {notif.type === 'TASK_ASSIGNED' ? <CheckSquare size={16} /> :
                        notif.type === 'SOLICITUD' ? <MessageSquare size={16} /> :
                        notif.type === 'BUG' ? <Bug size={16} /> :
                        notif.type === 'ALERTA' ? <AlertTriangle size={16} /> :
                        notif.type === 'SYNC_FAIL' ? <RefreshCw size={16} /> :
                        notif.type === 'USER_REG' ? <UserCheck size={16} /> :
                        <FileBarChart2 size={16} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                          {notif.title?.replace('📌', '').trim() || 'Nueva Notificación'}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {notif.time}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug mt-1 font-medium">
                        {notif.description}
                      </p>

                      {notif.tagline && (
                        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1 italic">
                          {notif.tagline}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ACCIÓN RÁPIDA CONTEXTUAL */}
                  <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-[#232752]/70">
                    {notif.type === 'TASK_ASSIGNED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTask(notif.issueKey);
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>Ver tarea</span>
                        <ArrowRight size={13} />
                      </button>
                    )}

                    {notif.type === 'USER_REG' && (
                      <button
                        onClick={() => handleNavigate('usuarios')}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <UserCheck size={13} /> Ver usuarios
                      </button>
                    )}

                    {notif.type === 'SOLICITUD' && (
                      <button
                        onClick={handleGoToHub}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <MessageSquare size={13} /> Responder
                      </button>
                    )}

                    {notif.type === 'BUG' && (
                      <button
                        onClick={() => handleNavigate('team_matrix')}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Bug size={13} /> Ver bug
                      </button>
                    )}

                    {notif.type === 'ALERTA' && (
                      <button
                        onClick={handleGoToHub}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <AlertTriangle size={13} /> Revisar
                      </button>
                    )}

                    {notif.type === 'SYNC_FAIL' && (
                      <button
                        onClick={() => handleRetrySync(notif.id)}
                        disabled={syncingId === notif.id}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <RefreshCw size={13} className={syncingId === notif.id ? 'animate-spin' : ''} />
                        {syncingId === notif.id ? 'Reintentando...' : 'Reintentar'}
                      </button>
                    )}

                    {notif.type === 'REPORT' && (
                      <button
                        onClick={() => handleNavigate('sprint_health')}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <FileBarChart2 size={13} /> Ver informe
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Inbox size={32} className="text-slate-400 dark:text-slate-600" />
                <span className="text-xs font-medium">No tienes notificaciones pendientes 🎉</span>
              </div>
            )}
          </div>

          {/* PIE DE PANEL EMERGENTE */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#232752]">
            <button
              onClick={handleGoToHub}
              className="w-full py-2 px-3 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Ir al Centro de Actividad completo</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
