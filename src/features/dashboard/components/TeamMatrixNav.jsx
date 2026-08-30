import React from 'react';
import { Trophy } from 'lucide-react';

export default function TeamMatrixNav({ 
  selectedProjectId, 
  onNavigateToHealth, 
  onSelectDevForScorecard,
  topPerformer
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-3 px-4 rounded-xl shadow-sm dark:shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
        <button className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg shadow border border-indigo-500 flex items-center gap-1.5 cursor-pointer">
          <span>Matriz 4 Cuadrantes</span>
        </button>
        {onNavigateToHealth && (
          <button
            onClick={onNavigateToHealth}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Salud del Sprint & Flow</span>
          </button>
        )}
        <button
          onClick={() => onSelectDevForScorecard && onSelectDevForScorecard(null)}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
        >
          <span>Scorecards Desarrolladores</span>
        </button>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
        {topPerformer && (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-[#12142e] px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-500/30 shadow-xs">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <Trophy size={13} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-wider">Top Performer</span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-none">{topPerformer.nombre} ({topPerformer.performance_score} pts)</span>
            </div>
          </div>
        )}
        <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/40 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          ETL Sync Activa
        </span>
        <span className="hidden md:inline text-slate-300 dark:text-slate-600">|</span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">Proyecto: {selectedProjectId}</span>
      </div>
    </div>
  );
}
