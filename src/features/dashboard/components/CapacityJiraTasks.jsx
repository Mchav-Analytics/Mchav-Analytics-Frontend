import React from 'react';
import { Search, FolderKanban } from 'lucide-react';

export default function CapacityJiraTasks({
  adjustedCapacitySP,
  taskStatusTab, setTaskStatusTab,
  taskSearchTerm, setTaskSearchTerm,
  selectedTaskProject, setSelectedTaskProject,
  filteredTasks
}) {
  return (
    <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 text-left">
      
      {/* Header & Resumen de Carga vs Capacidad */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderKanban size={18} className="text-indigo-500" />
              Incidencias y Carga de Trabajo en Vivo (Jira)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              187 Tareas en DB
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visualiza la carga real de tareas activas asignadas en Jira comparadas contra la capacidad disponible ajustada (<strong className="text-indigo-500">{adjustedCapacitySP} SP</strong>).
          </p>
        </div>

        {/* Selector de Proyecto & Buscador */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <select
            value={selectedTaskProject}
            onChange={(e) => setSelectedTaskProject(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#1a2138] border border-slate-200 dark:border-[#2c3757] text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="ALL">🌐 Todos los Proyectos</option>
            <option value="10000">MCHAV ANALITYCS (100)</option>
            <option value="10033">Prueba ASD (87)</option>
          </select>

          <div className="relative flex-1 md:w-56">
            <input
              type="text"
              value={taskSearchTerm}
              onChange={(e) => setTaskSearchTerm(e.target.value)}
              placeholder="Buscar por clave o título..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#1a2138] border border-slate-200 dark:border-[#2c3757] text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition-all"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Tabs de Filtro por Estado */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setTaskStatusTab('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
            taskStatusTab === 'ALL'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          🌐 Todas (187)
        </button>
        <button
          type="button"
          onClick={() => setTaskStatusTab('Por Hacer')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            taskStatusTab === 'Por Hacer'
              ? 'bg-[#64748b] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#64748b]"></span>
          Por Hacer (22)
        </button>
        <button
          type="button"
          onClick={() => setTaskStatusTab('En Progreso')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            taskStatusTab === 'En Progreso'
              ? 'bg-[#3b82f6] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
          En Progreso (26)
        </button>
        <button
          type="button"
          onClick={() => setTaskStatusTab('En Revisión')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            taskStatusTab === 'En Revisión'
              ? 'bg-[#f59e0b] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
          En Revisión (48)
        </button>
        <button
          type="button"
          onClick={() => setTaskStatusTab('Completados')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            taskStatusTab === 'Completados'
              ? 'bg-[#10b981] text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
          Completados (91)
        </button>
      </div>

      {/* Tabla de Incidencias Jira */}
      <div className="border border-slate-200 dark:border-[#242b45] rounded-2xl overflow-hidden bg-white dark:bg-[#14192b]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-800/30 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-3">Clave Jira</th>
                <th className="py-3 px-2">Resumen / Incidencia</th>
                <th className="py-3 px-2">Estado Jira</th>
                <th className="py-3 px-2">Proyecto</th>
                <th className="py-3 px-2">Desarrollador</th>
                <th className="py-3 px-3 text-right">SP</th>
                <th className="py-3 pr-6 pl-3 text-right">Prioridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                    No hay tareas coincidentes con los filtros de capacidad.
                  </td>
                </tr>
              ) : (
                filteredTasks.slice(0, 15).map((task, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-[#192038] transition-colors group">
                    <td className="py-3 px-3 font-black text-indigo-600 dark:text-indigo-400">
                      {task.key}
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                      {task.summary}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black ${
                        task.status === 'Por Hacer'
                          ? 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/20'
                          : task.status === 'En Progreso'
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : task.status === 'En Revisión'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          task.status === 'Por Hacer' ? 'bg-[#64748b]' : task.status === 'En Progreso' ? 'bg-[#3b82f6]' : task.status === 'En Revisión' ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
                        }`}></span>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-medium text-slate-500 dark:text-slate-400">
                      {task.project}
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-700 dark:text-slate-300">
                      {task.assignee}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-purple-600 dark:text-purple-400">
                      {task.sp} SP
                    </td>
                    <td className="py-3 pr-6 pl-3 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        task.priority === 'Alta'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : task.priority === 'Media'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
