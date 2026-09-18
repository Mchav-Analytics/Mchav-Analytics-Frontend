import React from 'react';
import { useProjectsData } from '../../../hooks/useProjectsData';

export default function TeamDevScorecardsNav({ 
  selectedProjectId, 
  onNavigateToMatrix 
}) {
  const { dbProjects: allProjects = [] } = useProjectsData();
  const foundProj = allProjects.find(p => String(p.id || p.id_proyecto) === String(selectedProjectId));
  const projectNameDisplay = foundProj?.name || foundProj?.nombre || (selectedProjectId === 'PROJ-01' ? 'MCHAV ANALITYCS' : selectedProjectId);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-2 sm:p-2.5 px-3 sm:px-4 rounded-2xl shadow-xs backdrop-blur-xs">
      {/* BOTONES DE SUB-NAVEGACIÓN EN PILLS (NO REMOVER) */}
      <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
        <button 
          onClick={onNavigateToMatrix}
          className="px-4 py-2 text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-slate-100/90 dark:bg-[#12142e] hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200/80 dark:border-[#33376b] flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>Matriz de Flujo y Eficiencia</span>
        </button>
        <button className="px-4 py-2 text-[13px] font-black bg-indigo-600 dark:bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/25 border border-indigo-500 flex items-center gap-1.5 cursor-default shrink-0">
          <span>Scorecards Desarrolladores</span>
        </button>
      </div>

      <div className="flex items-center gap-3 text-[13px] text-slate-400 shrink-0">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Proyecto Activo: <span className="font-black text-indigo-600 dark:text-indigo-400">{projectNameDisplay}</span>
        </span>
      </div>
    </div>
  );
}
