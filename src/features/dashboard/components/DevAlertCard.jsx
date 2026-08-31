import React from 'react';
import { Clock, Flame, HelpCircle, AlertOctagon, Scissors, ArrowUpRight } from 'lucide-react';

export default function DevAlertCard({ alert, executingAction, handleAlertAction }) {
  const isCritical = alert.level === 'CRITICAL';

  return (
    <div className="group flex flex-col rounded-3xl bg-white/80 dark:bg-[#141738]/80 backdrop-blur-md p-5 sm:p-7 shadow-sm border border-slate-200/80 dark:border-[#272b5c]/80 justify-between transition-all duration-300 hover:shadow-lg relative overflow-hidden">
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
}
