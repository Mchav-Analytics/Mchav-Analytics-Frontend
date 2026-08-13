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
  CheckCircle2
} from 'lucide-react';
import { jiraService } from '../../../services/api';

const initialNotifications = [
  {
    id: 'notif-1',
    type: 'SOLICITUD',
    title: '💬 Solicitud de Actualización',
    description: 'Carlos Pérez solicita confirmación sobre la entrega del módulo SSO (MCHAV-128).',
    tagline: 'Necesita interacción humana.',
    time: 'Hace 15 min',
    isRead: false,
    issueKey: 'MCHAV-128'
  },
  {
    id: 'notif-2',
    type: 'BUG',
    title: '🐞 Bug Crítico Detectado',
    description: 'Fallos devueltos en QA para MCHAV Analytics (MCHAV-105).',
    tagline: 'No necesariamente necesita respuesta.',
    time: 'Hace 45 min',
    isRead: false,
    issueKey: 'MCHAV-105'
  },
  {
    id: 'notif-3',
    type: 'ALERTA',
    title: '⚠️ Inactividad Prolongada (>48h)',
    description: 'MCHAV-104 lleva más de 3 días sin registro de avances.',
    tagline: 'Normalmente necesita acción.',
    time: 'Hace 2 horas',
    isRead: false
  },
  {
    id: 'notif-4',
    type: 'SYNC_FAIL',
    title: '🔄 Sincronización Fallida',
    description: 'Fallo de conexión en el motor de ingesta de Jira Cloud API.',
    tagline: 'Acción técnica.',
    time: 'Hace 3 horas',
    isRead: false
  },
  {
    id: 'notif-5',
    type: 'REPORT',
    title: '📊 Informe Generado',
    description: 'Resumen semanal de velocidad y salud del Sprint 04 disponible.',
    tagline: 'No necesita respuesta.',
    time: 'Hace 5 horas',
    isRead: true
  }
];

export default function LiderNotificationBell({ className = "", onNavigateToHub, onNavigateTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [syncingId, setSyncingId] = useState(null);
  const [syncMsg, setSyncMsg] = useState('');
  const popoverRef = useRef(null);

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
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkSingleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleGoToHub = () => {
    setIsOpen(false);
    if (onNavigateToHub) {
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

  const handleRetrySync = (id) => {
    setSyncingId(id);
    jiraService.triggerSync()
      .then(() => {
        setSyncMsg('✨ Sincronización reintentada con éxito');
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
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
        title="Centro de Actividad y Notificaciones"
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
                Notificaciones
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

          {/* LISTA DE NOTIFICACIONES CATEGORIZADAS */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 pr-1 space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkSingleRead(notif.id)}
                className={`p-3 rounded-xl transition-all flex flex-col gap-2 ${
                  !notif.isRead 
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-85'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    notif.type === 'SOLICITUD' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400' :
                    notif.type === 'BUG' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                    notif.type === 'ALERTA' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                    notif.type === 'SYNC_FAIL' ? 'bg-red-500/15 text-red-600 dark:text-red-400' :
                    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {notif.type === 'SOLICITUD' ? <MessageSquare size={14} /> :
                     notif.type === 'BUG' ? <Bug size={14} /> :
                     notif.type === 'ALERTA' ? <AlertTriangle size={14} /> :
                     notif.type === 'SYNC_FAIL' ? <RefreshCw size={14} /> :
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

                {/* BOTONES DE ACCIÓN RÁPIDA EXACTOS */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
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


