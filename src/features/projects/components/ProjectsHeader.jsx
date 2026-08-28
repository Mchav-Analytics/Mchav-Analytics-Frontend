import React from 'react';
import { Filter } from 'lucide-react';

export const ProjectsHeader = ({ userProfile, user, selectedProjectId, setSelectedProjectId, allProjectsList }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          Bienvenido de nuevo, {userProfile?.first_name || user?.email?.split('@')[0] || 'Camilo'}
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
          Resumen general del rendimiento de tus proyectos
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-xl shadow-2xs">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-slate-800 dark:text-slate-100 outline-none cursor-pointer pr-4"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 font-bold">
                Todos los proyectos
              </option>
              {allProjectsList.map(p => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 font-semibold">
                  {p.name} ({p.key})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
