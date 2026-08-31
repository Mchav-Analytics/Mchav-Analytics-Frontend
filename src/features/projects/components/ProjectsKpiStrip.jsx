import React from 'react';
import { ClipboardList, CheckCircle2, RefreshCw } from 'lucide-react';

export const ProjectsKpiStrip = ({ computedMetrics }) => {
  return (
    <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-2xl shadow-2xs overflow-hidden p-4 sm:p-5">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800/80 gap-y-4 sm:gap-y-0">
        
        {/* KPI 1: Issues totales */}
        <div className="flex items-center gap-3 px-3 first:pl-0">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <ClipboardList size={18} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Issues totales</span>
            <span className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {computedMetrics.totalIssues}
            </span>
          </div>
        </div>

        {/* KPI 2: Completados */}
        <div className="flex items-center gap-3 px-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Completados</span>
            <span className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {computedMetrics.completados}
            </span>
          </div>
        </div>

        {/* KPI 3: En progreso */}
        <div className="flex items-center gap-3 px-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <RefreshCw size={18} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">En progreso</span>
            <span className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {computedMetrics.enProgreso}
            </span>
          </div>
        </div>

        {/* KPI 6: % Completado */}
        <div className="flex items-center justify-between gap-3 px-3 last:pr-0">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">% Completado</span>
            <span className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              {computedMetrics.pctCompletado}
            </span>
          </div>
          <div className="w-9 h-9 relative flex items-center justify-center shrink-0">
            <svg className="w-9 h-9 transform -rotate-90">
              <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-slate-800" fill="transparent" />
              <circle cx="18" cy="18" r="14" stroke="#10b981" strokeWidth="3" strokeDasharray={88} strokeDashoffset={88 - (88 * computedMetrics.pctNum) / 100} strokeLinecap="round" fill="transparent" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
};
