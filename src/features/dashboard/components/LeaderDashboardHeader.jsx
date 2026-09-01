import React from 'react';
import { BarChart2, ShieldCheck, Calculator } from 'lucide-react';

export default function LeaderDashboardHeader({ 
  selectedProjectId, 
  setActiveTab
}) {
  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shrink-0">
          <BarChart2 size={24} />
        </div>
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-indigo-600 dark:text-indigo-300" />
              Liderazgo Técnico
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              • Proyecto: <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedProjectId || 'MCHAV'}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Panel Operativo del Sprint Activo
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('capacidad')}
          className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-extrabold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Calculator size={14} className="text-cyan-600 dark:text-cyan-400" /> 
          Planificar Capacidad
        </button>
      </div>
    </div>
  );
}
