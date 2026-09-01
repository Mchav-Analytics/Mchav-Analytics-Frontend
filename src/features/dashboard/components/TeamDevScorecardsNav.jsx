import React from 'react';
import LastSyncBadge from './LastSyncBadge';

export default function TeamDevScorecardsNav({ 
  selectedProjectId, 
  onNavigateToMatrix 
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-3 px-4 rounded-xl shadow-sm dark:shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
        <button 
          onClick={onNavigateToMatrix}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-slate-100 dark:bg-[#12142e] hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-[#33376b] flex items-center gap-1.5 cursor-pointer"
        >
          <span>Matriz 4 Cuadrantes</span>
        </button>
        <button className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg shadow border border-indigo-500 flex items-center gap-1.5 cursor-pointer">
          <span>Scorecards Desarrolladores</span>
        </button>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
        <LastSyncBadge />
        <span className="hidden md:inline text-slate-300 dark:text-slate-600">|</span>
        <span className="font-semibold text-slate-800 dark:text-slate-300">Proyecto: {selectedProjectId}</span>
      </div>
    </div>
  );
}
