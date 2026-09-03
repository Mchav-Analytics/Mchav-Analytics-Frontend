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
  UserCheck,
  CheckSquare,
  Inbox,
  Sparkles,
  Zap,
  ShieldAlert,
  Activity,
  Bot
} from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { jiraService } from '../../../services/api';
import {
  getReadNotificationIds,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotificationUpdates
} from '../../../services/notificationStore';
import { generateNubiMetricAlerts } from '../../../services/nubiAlertsService';

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
  onOpenTask = undefined,
  metricsData = undefined
}) {
  const { user } = useAuth();

  const rawRole = (user?.rol || 'DEVELOPER').toUpperCase();
  const activeRole = rawRole.includes('ADMIN') ? 'ADMIN' : rawRole.includes('MANAG') || rawRole.includes('LIDER') ? 'MANAGER' : 'DEVELOPER';

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState('TODAS'); // 'TODAS' | 'ALERTAS_IA' | 'CRITICAS'
  const [syncingId, setSyncingId] = useState(null);
  const [syncMsg, setSyncMsg] = useState('');
  const [scanningNubi, setScanningNubi] = useState(false);
  const popoverRef = useRef(null);

  // Generación de Alertas en Tiempo Real de la IA de Nubi
  const [nubiAlerts, setNubiAlerts] = useState(() => generateNubiMetricAlerts(metricsData || {}));

  const handleScanNubiAlerts = () => {
    setScanningNubi(true);
    setSyncMsg('⚡ IA Nubi analizando métricas en tiempo real...');
    setTimeout(() => {
      const freshAlerts = generateNubiMetricAlerts(metricsData || {});
      setNubiAlerts(freshAlerts);
      setScanningNubi(false);
      setSyncMsg('✨ ¡IA Nubi completó la detección de anomalías!');
      setTimeout(() => setSyncMsg(''), 3000);
    }, 1200);
  };

  const getMergedNotifications = (role) => {
    const base = roleNotifications[role] || roleNotifications.MANAGER;
    const filteredBase = dynamicNotifications.length > 0 ? base.filter(n => n.type !== 'TASK_ASSIGNED') : base;
    const combined = [...nubiAlerts, ...dynamicNotifications, ...filteredBase];
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
  }, [activeRole, dynamicNotifications, nubiAlerts]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const criticalCount = notifications.filter(n => (n.severity === 'CRITICAL' || n.type === 'CRITICAL') && !n.isRead).length;

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
    setNubiAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const handleGoToHub = () => {
    setIsOpen(false);
    if (onNavigateTab) {
      onNavigateTab('alerts_center');
    } else if (onNavigateToHub) {
      onNavigateToHub('alerts_center');
    }
    window.dispatchEvent(new CustomEvent('navigateTab', { detail: { tab: 'alerts_center' } }));
  };

  const handleNavigate = (tabName) => {
    setIsOpen(false);
    if (onNavigateTab) {
      onNavigateTab(tabName);
    } else if (onNavigateToHub) {
      onNavigateToHub(tabName);
    }
    window.dispatchEvent(new CustomEvent('navigateTab', { detail: { tab: tabName } }));
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
    window.dispatchEvent(new CustomEvent('navigateTab', { detail: { tab: 'dev_workload' } }));
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

  const [opensUpward, setOpensUpward] = useState(false);
  const buttonTriggerRef = useRef(null);

  const handleToggleOpen = () => {
    if (!isOpen && buttonTriggerRef.current) {
      const rect = buttonTriggerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.top > windowHeight * 0.45) {
        setOpensUpward(true);
      } else {
        setOpensUpward(false);
      }
    }
    setIsOpen(!isOpen);
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilterTab === 'ALERTAS_IA') return notif.type === 'NUBI_ALERT' || notif.nubiDiagnosis;
    if (activeFilterTab === 'CRITICAS') return notif.severity === 'CRITICAL' || notif.type === 'CRITICAL' || notif.type === 'BUG' || notif.type === 'SYNC_FAIL';
    return true;
  });

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* BOTÓN DE CAMPANA DE NOTIFICACIONES CON PULSO EN TIEMPO REAL */}
      <button
        ref={buttonTriggerRef}
        type="button"
        onClick={handleToggleOpen}
        className="p-2.5 rounded-2xl bg-white dark:bg-[#141738] hover:bg-slate-100 dark:hover:bg-[#1a1e47] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#272b5c] transition-all cursor-pointer relative flex items-center justify-center shadow-xs"
        title={`Notificaciones & Alertas IA Nubi - Rol ${activeRole}`}
      >
        <Bell size={18} className="text-slate-700 dark:text-slate-200" />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full ${criticalCount > 0 ? 'bg-rose-500 animate-bounce' : 'bg-indigo-600'} text-white font-black text-[10px] flex items-center justify-center shadow-md`}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* POPUP EMERGENTE DE NOTIFICACIONES & ALERTAS IA DE NUBI */}
      {isOpen && (
        <div className={`absolute right-0 w-[calc(100vw-1.5rem)] sm:w-[480px] md:w-[520px] max-w-xl bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-2xl shadow-2xl z-[9999] p-4 sm:p-5 space-y-3.5 text-left transition-all ${
          opensUpward
            ? 'bottom-full mb-3 animate-in fade-in slide-in-from-bottom-2 duration-200'
            : 'top-full mt-3 animate-in fade-in slide-in-from-top-2 duration-200'
        }`}>
          
          {/* CABECERA CON ACCIÓN DE ESCANEO DE IA NUBI */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#232752] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border border-indigo-400/40 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                <Bot size={18} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>Alertas Nubi AI</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-[9px] border border-indigo-500/20">
                    Tiempo Real
                  </span>
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  Detección inteligente de desviaciones
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleScanNubiAlerts}
                disabled={scanningNubi}
                className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer"
                title="Re-analizar métricas y anomalías en tiempo real con Nubi AI"
              >
                <Sparkles size={12} className={scanningNubi ? 'animate-spin' : ''} />
                <span>{scanningNubi ? 'Analizando...' : 'Escanear IA'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1a1e47] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* BARRA DE PESTAÑAS DE FILTRO */}
          <div className="flex items-center justify-between gap-1 p-1 bg-slate-100/80 dark:bg-[#0f122e] rounded-xl border border-slate-200/60 dark:border-[#1e2348]">
            <button
              type="button"
              onClick={() => setActiveFilterTab('TODAS')}
              className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                activeFilterTab === 'TODAS'
                  ? 'bg-white dark:bg-[#1d224d] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterTab('ALERTAS_IA')}
              className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeFilterTab === 'ALERTAS_IA'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Zap size={11} />
              <span>Nubi AI ({nubiAlerts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterTab('CRITICAS')}
              className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeFilterTab === 'CRITICAS'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ShieldAlert size={11} />
              <span>Críticas ({criticalCount})</span>
            </button>
          </div>

          {syncMsg && (
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold text-center animate-in fade-in flex items-center justify-center gap-2">
              <Sparkles size={14} className="animate-spin text-indigo-500" />
              <span>{syncMsg}</span>
            </div>
          )}

          {/* LISTA DE NOTIFICACIONES & ALERTAS NUBI AI */}
          <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkSingleRead(notif.id)}
                  className={`p-3.5 rounded-2xl transition-all border flex flex-col gap-2.5 cursor-pointer ${
                    !notif.isRead
                      ? notif.severity === 'CRITICAL'
                        ? 'bg-rose-50/80 dark:bg-[#1f0d1a] border-rose-300 dark:border-rose-900/60 shadow-xs'
                        : 'bg-indigo-50/60 dark:bg-[#0c0e21] border-indigo-200 dark:border-indigo-900/50 shadow-xs'
                      : 'bg-white dark:bg-[#1a1e47]/40 border-slate-200/70 dark:border-[#232752] opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* ÍCONO DE TIPO / SEVERIDAD DE ALERTA */}
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 shadow-xs ${
                      notif.severity === 'CRITICAL' ? 'bg-rose-500 text-white border border-rose-400' :
                      notif.severity === 'WARNING' ? 'bg-amber-500 text-white border border-amber-400' :
                      notif.type === 'TASK_ASSIGNED' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' :
                      notif.type === 'BUG' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                      'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                    }`}>
                      {notif.type === 'NUBI_ALERT' ? <Bot size={16} /> :
                        notif.type === 'TASK_ASSIGNED' ? <CheckSquare size={16} /> :
                        notif.type === 'SOLICITUD' ? <MessageSquare size={16} /> :
                        notif.type === 'BUG' ? <Bug size={16} /> :
                        notif.type === 'SYNC_FAIL' ? <RefreshCw size={16} /> :
                        notif.type === 'USER_REG' ? <UserCheck size={16} /> :
                        <FileBarChart2 size={16} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white whitespace-normal leading-snug break-words flex-1">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0 pt-0.5">
                          {notif.time}
                        </span>
                      </div>

                      {/* BADGE DE SEVERIDAD */}
                      {notif.severity && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                            notif.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30' :
                            notif.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                            'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                          }`}>
                            {notif.severity === 'CRITICAL' ? 'Alerta Crítica' : notif.severity === 'WARNING' ? 'Advertencia' : 'Verificado Nubi'}
                          </span>
                          {notif.currentValue && (
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                              Actual: <strong className="text-indigo-600 dark:text-indigo-400">{notif.currentValue}</strong>
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug mt-1 font-medium">
                        {notif.description}
                      </p>

                      {/* DIAGNÓSTICO E INSIGHT DE IA NUBI */}
                      {notif.nubiDiagnosis && (
                        <div className="mt-2 p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1 text-left">
                          <div className="flex items-center gap-1 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
                            <Sparkles size={11} />
                            <span>Diagnóstico Nubi AI:</span>
                          </div>
                          <p className="text-[11px] text-indigo-950 dark:text-indigo-200 font-semibold leading-tight">
                            {notif.nubiDiagnosis}
                          </p>
                          {notif.nubiRecommendation && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic pt-0.5">
                              💡 <strong>Recomendación:</strong> {notif.nubiRecommendation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACCIÓN RÁPIDA CONTEXTUAL */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#232752]/70">
                    <span className="text-[10px] font-bold text-slate-400">
                      {notif.projectKey ? `Proyecto: ${notif.projectKey}` : 'MCHAV Analytics'}
                    </span>

                    {notif.targetTab ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigate(notif.targetTab);
                        }}
                        className="px-3 py-1.5 text-xs font-extrabold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>Resolver / Ver Métrica</span>
                        <ArrowRight size={13} />
                      </button>
                    ) : notif.type === 'TASK_ASSIGNED' ? (
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
                    ) : notif.type === 'SYNC_FAIL' ? (
                      <button
                        onClick={() => handleRetrySync(notif.id)}
                        disabled={syncingId === notif.id}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <RefreshCw size={13} className={syncingId === notif.id ? 'animate-spin' : ''} />
                        {syncingId === notif.id ? 'Reintentando...' : 'Reintentar'}
                      </button>
                    ) : (
                      <button
                        onClick={handleGoToHub}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>Ver en Hub</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Inbox size={32} className="text-slate-400 dark:text-slate-600" />
                <span className="text-xs font-medium">No tienes alertas pendientes para este filtro 🎉</span>
              </div>
            )}
          </div>

          {/* PIE DE PANEL EMERGENTE */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#232752] flex items-center justify-between">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              Marcar leídas
            </button>
            <button
              onClick={handleGoToHub}
              className="py-1.5 px-3 text-center text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Centro de Actividad completo</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
