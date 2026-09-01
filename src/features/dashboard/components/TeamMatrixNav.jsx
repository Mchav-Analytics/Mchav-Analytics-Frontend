import React from 'react';
import { Trophy, ShieldCheck } from 'lucide-react';

export default function TeamMatrixNav({ 
  onNavigateToHealth, 
  onSelectDevForScorecard,
  topPerformer,
  qualityThreshold = 80,
  activeModelName = 'Modelo Estándar MCHAV'
}) {
  return (
    <div className="w-full flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-3 px-4 rounded-2xl shadow-sm dark:shadow-lg backdrop-blur-md overflow-hidden transition-all">
      
      {/* SECTOR IZQUIERDO: BOTONES DE NAVEGACIÓN */}
      <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 custom-scrollbar flex-nowrap shrink-0 max-w-full">
        {/* BOTONES DE VISTA */}
        <button className="px-3 py-1.5 text-[11px] sm:text-xs font-bold bg-indigo-600 text-white rounded-xl shadow border border-indigo-500 flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap">
          <span>Matriz 4 Cuadrantes</span>
        </button>

        <button
          onClick={() => onSelectDevForScorecard && onSelectDevForScorecard(null)}
          className="px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
        >
          <span>Scorecards Desarrolladores</span>
        </button>
      </div>

      {/* SECTOR DERECHO: RESUMEN DE UMBRAL ACTIVO + TOP PERFORMER */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-2.5 w-full xl:w-auto pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100 dark:border-slate-800/80 shrink-0 min-w-0">
        
        {/* INSIGNIA UMBRAL Y MODELO */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="whitespace-nowrap">Umbral: {qualityThreshold}%</span>
          <span className="text-slate-400 dark:text-slate-500">|</span>
          <span className="truncate max-w-[120px] sm:max-w-[180px]">{activeModelName}</span>
        </div>

        {/* TOP PERFORMER */}
        {topPerformer && (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-[#12142e] px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-500/30 shadow-xs shrink-0 max-w-full sm:max-w-xs">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <Trophy size={11} />
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-[9px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-wider">Top Performer</span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-none truncate max-w-[140px] sm:max-w-[220px]">
                {topPerformer.nombre} ({topPerformer.performance_score} pts)
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
