import React from 'react';
import { UserCheck, Users, RotateCw } from 'lucide-react';
import { useProjectsData } from '../../../hooks/useProjectsData';

export default function TeamDevScorecardsHeader({ 
  selectedProjectId, 
  onSelectProject, 
  onNavigateToMatrix 
}) {
  const { dbProjects: allProjects = [] } = useProjectsData();
  const foundProj = allProjects.find(p => String(p.id || p.id_proyecto) === String(selectedProjectId));
  const projectNameDisplay = foundProj?.name || foundProj?.nombre || (selectedProjectId === 'PROJ-01' || selectedProjectId === '10000' ? 'MCHAV ANALYTICS' : selectedProjectId || 'MCHAV ANALYTICS');

  return (
    <div className="w-full pb-4 border-b border-slate-200/60 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
      
      {/* Lado Izquierdo: Ícono + Breadcrumb + Título + Subtítulo */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shrink-0">
          <UserCheck size={24} />
        </div>
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="cursor-pointer text-indigo-600 dark:text-indigo-400 hover:underline transition-all" onClick={onNavigateToMatrix}>
              Developer Workload & Flow Profile
            </span>
            <span className="text-slate-300 dark:text-slate-600">&gt;</span>
            <span className="text-slate-700 dark:text-slate-300 font-bold">Detalle</span>
          </div>
          <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight">
            Developer Workload & Flow Profile — {projectNameDisplay}
          </h1>
          <p className="text-[13.5px] font-medium text-slate-500 dark:text-slate-400">
            Seguimiento del rendimiento, carga de trabajo y flujo de tickets del equipo de desarrollo.
          </p>
        </div>
      </div>

      {/* Lado Derecho: Selector de Proyecto + Botón Actualizar */}
      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700/80 shrink-0">
          <Users className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">Proyecto:</span>
          <select
            value={selectedProjectId || '10000'}
            onChange={(e) => onSelectProject && onSelectProject(e.target.value)}
            className="bg-transparent text-[13px] font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer max-w-[160px] sm:max-w-[220px] truncate"
          >
            {allProjects.length === 0 ? (
              <option value="10000" className="bg-white dark:bg-[#191c3d] text-slate-900 dark:text-white font-bold">
                MCHAV ANALYTICS (10000)
              </option>
            ) : (
              allProjects.map((p) => (
                <option key={p.id || p.id_proyecto} value={p.id || p.id_proyecto} className="bg-white dark:bg-[#191c3d] text-slate-900 dark:text-white font-bold">
                  {p.name || p.nombre || p.id_proyecto}
                </option>
              ))
            )}
          </select>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#191c3d] dark:hover:bg-[#272b5c] rounded-2xl text-slate-700 dark:text-slate-300 font-bold text-[13px] border border-slate-200 dark:border-[#33376b] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          title="Actualizar datos"
        >
          <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
          Actualizar
        </button>
      </div>

    </div>
  );
}
