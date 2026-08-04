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

export default function DevAlertsView({ selectedProjectId = 'PROJ-01' }) {
  const { user } = useAuth();
  const [alertsData, setAlertsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [executingAction, setExecutingAction] = useState(false);

  useEffect(() => {
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
      
      {/* ENCABEZADO ESPACIOSO CON AURA DEGRADADA */}
      <div className="relative group rounded-2xl bg-slate-950 p-8 shadow-2xl border border-slate-800/80 transition-all duration-300">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-red-500/20 blur-md opacity-30 transition-opacity group-hover:opacity-50 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-amber-500 to-red-600 text-white font-extrabold shadow-xl shadow-rose-500/20">
              <AlertTriangle size={26} />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                Mis Bloqueos y Alertas
                <span className="flex items-center gap-2 rounded-full bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20">
                  <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse"></span>
                  {alerts.length} Alertas Activadas
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Detector automático de inactividad, multitarea excesiva y cuellos de botella.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST DE RESPUESTA DE ACCIÓN API */}
      {actionMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-3 shadow-xl transition-all">
          <CheckCircle2 size={18} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* LISTADO DE ALERTAS ESPACIOSAS */}
      <div className="space-y-8 flex-1">

        {alerts.map((alert, idx) => {
          const isCritical = alert.level === 'CRITICAL';
          return (
            <div key={idx} className="group relative flex flex-col rounded-2xl bg-slate-950 p-8 shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-rose-500/20 border border-slate-800/80 space-y-6">
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${isCritical ? 'from-rose-500 via-red-500 to-amber-500' : 'from-amber-500 via-orange-500 to-yellow-500'} opacity-15 blur-sm transition-opacity duration-300 group-hover:opacity-30 pointer-events-none`}></div>
              <div className="relative z-10 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${isCritical ? 'from-rose-500 to-red-600' : 'from-amber-500 to-orange-600'} shrink-0`}>
                      {isCritical ? <Clock className="h-6 w-6 text-white" /> : <Flame className="h-6 w-6 text-slate-950 fill-current" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold text-white">
                          {alert.title}
                        </h3>
                        <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase border ${isCritical ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          {alert.level || 'WARNING'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">
                        {alert.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ACCIONES RÁPIDAS DE DESBLOQUEO SI ES ALERTA DE TAREA */}
                {alert.type === 'INACTIVITY' && (
                  <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Acción de Desbloqueo:</span>
                    <button 
                      disabled={executingAction}
                      onClick={() => handleAlertAction(alert.issue_id || "101", "request_help")}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:from-rose-600 hover:to-red-700 cursor-pointer shadow-md shadow-rose-500/20 disabled:opacity-50"
                    >
                      <HelpCircle size={16} /> Pedir Ayuda al Líder
                    </button>
                    <button 
                      disabled={executingAction}
                      onClick={() => handleAlertAction(alert.issue_id || "101", "mark_blocked")}
                      className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 border border-slate-700 transition-all hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                    >
                      <AlertOctagon size={16} className="text-amber-400" /> Marcar Bloqueado
                    </button>
                    <button 
                      disabled={executingAction}
                      onClick={() => handleAlertAction(alert.issue_id || "101", "split_task")}
                      className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 border border-slate-700 transition-all hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                    >
                      <Scissors size={16} className="text-indigo-400" /> Descomponer Tarea
                    </button>
                  </div>
                )}

                {alert.type === 'WIP_EXCEEDED' && (
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Recomendación: Pausa tareas secundarias y concluye la más antigua.</span>
                    <button className="flex items-center gap-1.5 text-amber-400 font-bold hover:text-amber-300 cursor-pointer">
                      Ver Mi WIP en Tabla <ArrowUpRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
