// ============================================================================
// SUB-VISTA 3: MIS BLOQUEOS Y ALERTAS (CONEXIÓN BACKEND Y ACCIONES EN VIVO)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  HelpCircle, 
  Scissors, 
  AlertOctagon, 
  Flame,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { developerService } from '../../../services/api';
import DeveloperProjectHeader from '../../../components/layout/DeveloperProjectHeader';

export default function DevAlertsView({ 
  projects = [],
  selectedProjectId,
  setSelectedProjectId,
  syncSuccessMsg
}) {
  const { user } = useAuth();
  const [alertsData, setAlertsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [executingAction, setExecutingAction] = useState(false);

  const devName = user?.nombre || 'Valka Hoyos';
  const selectedProjectObj = projects.find(p => String(p.id_proyecto) === String(selectedProjectId));
  const projectName = selectedProjectObj?.nombre || `Proyecto ${selectedProjectId}`;

  useEffect(() => {
    if (!selectedProjectId) {
      setAlertsData(null);
      return;
    }
    setLoading(true);
    developerService.getDevAlerts(selectedProjectId)
      .then(res => {
        setAlertsData(res);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Error cargando alertas:", err);
        setLoading(false);
      });
  }, [selectedProjectId]);

  const handleAlertAction = (issueId, actionType) => {
    setExecutingAction(true);
    developerService.performAlertAction(issueId, actionType)
      .then(res => {
        setActionMsg(`✅ ${res.message || "Acción registrada correctamente."}`);
        setExecutingAction(false);
        setTimeout(() => setActionMsg(''), 5000);
      })
      .catch(err => {
        setActionMsg(`⚠️ Error al ejecutar la acción para el ticket #${issueId}`);
        setExecutingAction(false);
      });
  };

  const alerts = alertsData?.alerts || [
    { id: "alert-101", issue_id: "101", key_issue: "MCHAV-101", type: "INACTIVITY", level: "CRITICAL", title: "Inactividad: Tarea sin cambios por más de 48 horas", description: "Tu ticket MCHAV-101 (SSO OAuth 2.0) lleva 3.2 días en 'In Progress' sin registrar avances ni notas." },
    { id: "alert-wip", type: "WIP_EXCEEDED", level: "WARNING", title: "Advertencia de Multitarea Excesiva (WIP = 7 Tareas)", description: "Tienes 7 tareas abiertas en progreso. Mantener más de 3 tareas abiertas ralentiza el tiempo de ciclo." }
  ];

  return (
    <div className="w-full space-y-10 py-4 px-1 text-left font-sans min-h-[85vh] flex flex-col justify-between">
      

      {/* Si no hay proyecto seleccionado, mostrar prompt */}
      {!selectedProjectId ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white/80 dark:bg-[#141738]/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-[#272b5c]/80 text-center shadow-sm">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Selecciona un Proyecto</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Para ver tus alertas, selecciona en qué proyecto deseas trabajar desde el selector superior.
          </p>
        </div>
      ) : (
        <>
          {/* ENCABEZADO FLOTANTE ESTILO PREMIUM */}
          <div className="w-full pb-4 sm:pb-6 relative flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-200/50 dark:border-[#272b5c]/50 mb-6">
            <div className="absolute top-0 left-0 w-64 h-64 bg-rose-500 rounded-full blur-[100px] -z-10 opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-amber-500 to-red-600 text-white font-extrabold shadow-lg shadow-rose-500/20 shrink-0">
                <AlertTriangle size={24} className="sm:w-7 sm:h-7" />
              </div>
              <div className="space-y-1 text-left min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                    Centro de Actividad / {projectName}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none flex items-center gap-3 flex-wrap">
                  <span>Mis Bloqueos y Alertas</span>
                  <span className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                    {alerts.length} Alertas
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Detector automático de inactividad, multitarea excesiva y cuellos de botella.
                </p>
              </div>
            </div>
          </div>

          {/* TOAST DE RESPUESTA DE ACCIÓN API */}
          {actionMsg && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-900/30 backdrop-blur-sm border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center gap-3 shadow-md mb-6 animate-in fade-in slide-in-from-top-4">
              <CheckCircle2 size={18} />
              <span>{actionMsg}</span>
            </div>
          )}

          {/* LISTADO DE ALERTAS PREMIUM */}
          <div className="space-y-5 sm:space-y-6 flex-1">
            {alerts.map((alert, idx) => {
              const isCritical = alert.level === 'CRITICAL';
              return (
                <div key={idx} className="group flex flex-col rounded-3xl bg-white/80 dark:bg-[#141738]/80 backdrop-blur-md p-5 sm:p-7 shadow-sm border border-slate-200/80 dark:border-[#272b5c]/80 justify-between transition-all duration-300 hover:shadow-lg relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[70px] -z-10 opacity-[0.08] group-hover:opacity-[0.15] transition-opacity translate-x-1/3 -translate-y-1/3 ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                  
                  <div className="relative z-10 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${isCritical ? 'from-rose-500 to-red-600 shadow-rose-500/20' : 'from-amber-400 to-orange-500 shadow-amber-500/20'} text-white shadow-lg shrink-0`}>
                          {isCritical ? <Clock size={24} /> : <Flame size={24} />}
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                              {alert.title}
                            </h3>
                            <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase border ${isCritical ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/30' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'}`}>
                              {alert.level || 'WARNING'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ACCIONES RÁPIDAS DE DESBLOQUEO SI ES ALERTA DE TAREA */}
                    {alert.type === 'INACTIVITY' && (
                      <div className="pt-5 border-t border-slate-100 dark:border-[#272b5c]/60 flex flex-wrap items-center gap-3">
                        <button 
                          disabled={executingAction}
                          onClick={() => handleAlertAction(alert.issue_id || "101", "request_help")}
                          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:from-rose-600 hover:to-red-700 cursor-pointer shadow-md shadow-rose-500/20 disabled:opacity-50 hover:-translate-y-0.5"
                        >
                          <HelpCircle size={16} /> Pedir Ayuda al Planificador
                        </button>
                        <button 
                          disabled={executingAction}
                          onClick={() => handleAlertAction(alert.issue_id || "101", "mark_blocked")}
                          className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#0c0e21] px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#272b5c] transition-all hover:bg-slate-50 dark:hover:bg-[#1a1e47] cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          <AlertOctagon size={16} className="text-amber-500" /> Marcar Bloqueado
                        </button>
                        <button 
                          disabled={executingAction}
                          onClick={() => handleAlertAction(alert.issue_id || "101", "split_task")}
                          className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#0c0e21] px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#272b5c] transition-all hover:bg-slate-50 dark:hover:bg-[#1a1e47] cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          <Scissors size={16} className="text-indigo-500" /> Descomponer Tarea
                        </button>
                      </div>
                    )}

                    {alert.type === 'WIP_EXCEEDED' && (
                      <div className="pt-5 border-t border-slate-100 dark:border-[#272b5c]/60 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 font-medium">
                        <span>💡 Recomendación: Pausa tareas secundarias y concluye la más antigua.</span>
                        <button className="flex items-center gap-1.5 text-amber-500 font-bold hover:text-amber-400 cursor-pointer transition-colors bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg">
                          Ver Mi WIP en Tabla <ArrowUpRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
