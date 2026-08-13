// ============================================================================
// COMPONENTE: BOTÓN Y POPUP EMERGENTE DE NOTIFICACIONES DEL LÍDER TÉCNICO
// ============================================================================
// Botón reutilizable de campana de notificaciones con menú emergente (Popover)
// para ser integrado en todas las sub-vistas del Líder Técnico sin redirección.

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, AlertTriangle, Activity, CheckCircle2, Check } from 'lucide-react';

const initialNotifications = [
  {
    id: 'notif-1',
    type: 'ALERT',
    priority: 'HIGH',
    title: 'Incidencia Estancada en In Progress',
    description: 'SCRUM-104 (Clara Gómez - 5 SP) lleva más de 3.5 días sin registro de avances.',
    time: 'Hace 15 min',
    isRead: false
  },
  {
    id: 'notif-2',
    type: 'SCOPE',
    priority: 'MEDIUM',
    title: 'Cambio de Alcance Detectado (+4 SP)',
    description: 'Se agregaron 2 nuevas historias al Sprint 3 (Activo) sin re-estimación.',
    time: 'Hace 1 hora',
    isRead: false
  },
  {
    id: 'notif-3',
    type: 'HELP',
    priority: 'HIGH',
    title: 'Solicitud de Ayuda de Desarrollador',
    description: 'Andrés Torres solicitó revisión técnica urgente para la tarea SCRUM-112.',
    time: 'Hace 2 horas',
    isRead: false
  },
  {
    id: 'notif-4',
    type: 'SUCCESS',
    priority: 'LOW',
    title: 'Tarea Crítica Completada',
    description: 'Valka Hoyos marcó como RESUELTA la incidencia SCRUM-108 (3 SP).',
    time: 'Hace 4 horas',
    isRead: true
  }
];

export default function LiderNotificationBell({ className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const popoverRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Cerrar al hacer clic fuera del popup emergente
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

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* BOTÓN DE CAMPANA */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer relative flex items-center justify-center shadow-xs"
        title="Notificaciones Operativas del Líder Técnico"
      >
        <Bell size={16} className="text-slate-700 dark:text-slate-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* POPUP EMERGENTE DE NOTIFICACIONES */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150 text-left">
          {/* CABECERA POPUP */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Notificaciones del Líder
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold text-[10px]">
                  {unreadCount} nuevas
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

          {/* LISTA DE NOTIFICACIONES */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 pr-1 space-y-1">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkSingleRead(notif.id)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                  !notif.isRead 
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/40' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-75'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  notif.priority === 'HIGH' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                  notif.type === 'SCOPE' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {notif.priority === 'HIGH' ? <AlertTriangle size={14} /> :
                   notif.type === 'SCOPE' ? <Activity size={14} /> :
                   <CheckCircle2 size={14} />}
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
