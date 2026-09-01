import React from 'react';
import { Activity } from 'lucide-react';
import { useProjectsData } from '../../../hooks/useProjectsData';

export default function SprintHealthHeader({ 
  selectedProjectId, 
  onNavigateToMatrix,
  healthScore 
}) {
  const { dbProjects: allProjects = [] } = useProjectsData();
  const foundProj = allProjects.find(p => String(p.id || p.id_proyecto) === String(selectedProjectId));
  const projectNameDisplay = foundProj?.name || foundProj?.nombre || (selectedProjectId === 'PROJ-01' ? 'MCHAV Core' : selectedProjectId);

  const getScoreColor = (score) => {
    if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', stroke: '#10b981' };
    if (score >= 60) return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40', stroke: '#f59e0b' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/40', stroke: '#f43f5e' };
  };

  const scoreTheme = getScoreColor(healthScore);

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shrink-0">
          <Activity size={24} />
        </div>
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5 text-[13px] mb-2 font-medium">
            <span className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline transition-all" onClick={onNavigateToMatrix}>Matriz de Rendimiento</span>
            <span className="text-slate-400 dark:text-slate-500 mx-0.5">&gt;</span>
            <span className="text-slate-900 dark:text-white font-bold">Salud del Sprint</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
              Predictability Engine
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              • Proyecto: <strong className="text-slate-800 dark:text-slate-200 font-bold">{projectNameDisplay} {selectedProjectId && selectedProjectId !== projectNameDisplay ? `(${selectedProjectId})` : ''}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Salud del Sprint & Flow — {projectNameDisplay}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className={`flex items-center gap-3 p-2.5 px-4 rounded-2xl border shadow-md ${scoreTheme.bg} ${scoreTheme.border}`}>
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-11 h-11 transform -rotate-90">
              <circle cx="22" cy="22" r="17" stroke="#cbd5e1" strokeWidth="3.5" fill="transparent" />
              <circle
                cx="22"
                cy="22"
                r="17"
                stroke={scoreTheme.stroke}
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray={107}
                strokeDashoffset={107 - (107 * Math.min(healthScore, 100)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className={`absolute font-extrabold text-xs ${scoreTheme.text}`}>{healthScore}</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">Sprint Health Score</span>
            <span className={`text-xs font-black ${scoreTheme.text}`}>
              {healthScore >= 80 ? 'Saludable' : healthScore >= 60 ? 'Atención' : 'Riesgo Alto'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
