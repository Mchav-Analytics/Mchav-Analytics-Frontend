import React from 'react';
import { UserCheck, Users } from 'lucide-react';
import { useProjectsData } from '../../../hooks/useProjectsData';

export default function TeamDevScorecardsHeader({ 
  selectedProjectId, 
  onSelectProject, 
  onNavigateToMatrix 
}) {
  const { dbProjects: allProjects = [] } = useProjectsData();
  const foundProj = allProjects.find(p => String(p.id || p.id_proyecto) === String(selectedProjectId));
  const projectNameDisplay = foundProj?.name || foundProj?.nombre || (selectedProjectId === 'PROJ-01' ? 'MCHAV Core' : selectedProjectId);

  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      {/* Lado Izquierdo: Ícono en Gradiente + Insignia + Título */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shrink-0">
          <UserCheck size={24} />
        </div>
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5 text-[13px] mb-2 font-medium">
            <span className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline transition-all" onClick={onNavigateToMatrix}>Matriz de Rendimiento</span>
            <span className="text-slate-400 dark:text-slate-500 mx-0.5">&gt;</span>
            <span className="text-slate-900 dark:text-white font-bold">Scorecards</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
              Supervisión Ejecutiva
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              • Proyecto: <strong className="text-slate-800 dark:text-slate-200 font-bold">{projectNameDisplay}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Scorecards Desarrolladores — {projectNameDisplay}
          </h1>
        </div>
      </div>

      {/* Lado Derecho: Selector de Proyecto (Equipo) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700/80 shrink-0">
          <Users className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">Proyecto:</span>
          <select
            value={selectedProjectId || 'PROJ-01'}
            onChange={(e) => onSelectProject && onSelectProject(e.target.value)}
            className="bg-transparent text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer max-w-[160px] sm:max-w-[220px] truncate"
          >
            <option value="PROJ-01" className="bg-white dark:bg-[#191c3d] text-slate-900 dark:text-white font-bold">Proyecto PROJ-01 (MCHAV Core)</option>
            {allProjects.map((p) => (
              <option key={p.id || p.id_proyecto} value={p.id || p.id_proyecto} className="bg-white dark:bg-[#191c3d] text-slate-900 dark:text-white font-bold">
                {p.name || p.nombre || p.id_proyecto}
              </option>
            ))}
          </select>
        </div>
      </div>

    </div>
  );
}
