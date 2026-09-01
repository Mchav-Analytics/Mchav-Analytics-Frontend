import React from 'react';
import { Layers } from 'lucide-react';

export default function SprintHealthNav({ 
  sprints, 
  selectedSprintId, 
  setSelectedSprintId 
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] p-3 px-4 rounded-xl shadow-sm dark:shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
        <span className="px-3 py-1.5 text-xs font-extrabold bg-indigo-600 text-white rounded-lg shadow border border-indigo-500 flex items-center gap-1.5 cursor-default">
          <span>Salud del Sprint & Flow</span>
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
        {/* SELECTOR DE SPRINT */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#12142e] px-3 py-1 rounded-lg border border-slate-200 dark:border-[#33376b]">
          <Layers size={14} className="text-indigo-600 dark:text-indigo-400" />
          {sprints.length > 0 ? (
            <select
              value={selectedSprintId || ''}
              onChange={(e) => setSelectedSprintId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer pr-1"
            >
              {sprints.map((s) => (
                <option key={s.id_sprint} value={s.id_sprint} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                  {s.nombre || s.nombre_sprint || s.id_sprint}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Kanban / Sin Sprints Scrum</span>
          )}
        </div>

        <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/40 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          ETL Sync Activa
        </span>
      </div>
    </div>
  );
}
