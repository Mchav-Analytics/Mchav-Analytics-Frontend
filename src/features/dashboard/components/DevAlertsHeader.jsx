import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DevAlertsHeader({ projectName, alertsCount }) {
  return (
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
              {alertsCount} Alertas
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Detector automático de inactividad, multitarea excesiva y cuellos de botella.
          </p>
        </div>
      </div>
    </div>
  );
}
