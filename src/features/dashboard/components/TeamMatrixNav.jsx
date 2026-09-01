import React from 'react';
import { Trophy, Users, ShieldCheck } from 'lucide-react';

export default function TeamMatrixNav({ 
  selectedProjectId,
  onSelectProject,
  allProjects = [],
  onNavigateToHealth, 
  onSelectDevForScorecard,
  topPerformer,
  qualityThreshold = 80,
  activeModelName = 'Modelo Estándar MCHAV'
}) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-3 px-4 rounded-2xl shadow-sm dark:shadow-lg backdrop-blur-md">
      
      {/* SECTOR IZQUIERDO: SELECTOR DE PROYECTO (EQUIPO JIRA) + NAVEGACIÓN */}
      <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
        
        {/* SELECTOR DE EQUIPO (PROYECTO JIRA) */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <Users className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Equipo:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => onSelectProject && onSelectProject(e.target.value)}
            className="bg-transparent text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="PROJ-01">Proyecto PROJ-01 (MCHAV Core)</option>
            {allProjects.map((p) => (
              <option key={p.id || p.id_proyecto} value={p.id || p.id_proyecto}>
                {p.name || p.nombre || p.id_proyecto}
              </option>
            ))}
          </select>
        </div>

        <button className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow border border-indigo-500 flex items-center gap-1.5 cursor-pointer shrink-0">
          <span>Matriz 4 Cuadrantes</span>
        </button>
        {onNavigateToHealth && (
          <button
            onClick={onNavigateToHealth}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Salud del Sprint & Flow</span>
          </button>
        )}
        <button
          onClick={() => onSelectDevForScorecard && onSelectDevForScorecard(null)}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>Scorecards Desarrolladores</span>
        </button>
      </div>

      {/* SECTOR DERECHO: RESUMEN TOP PERFORMER + UMBRAL ACTIVO */}
      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0 w-full md:w-auto justify-between md:justify-end">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          <span>Umbral: {qualityThreshold}%</span>
          <span className="text-slate-400 dark:text-slate-500">|</span>
          <span className="truncate max-w-[120px]">{activeModelName}</span>
        </div>

        {topPerformer && (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-[#12142e] px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-500/30 shadow-xs">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <Trophy size={11} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-wider">Top Performer</span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-none">{topPerformer.nombre} ({topPerformer.performance_score} pts)</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
