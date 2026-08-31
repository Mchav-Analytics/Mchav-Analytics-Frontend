import React from 'react';
import { ListTodo, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export const DevWorkloadTable = ({
  paginatedTasks, setSelectedTaskModal, hasActiveFilters, clearFilters,
  totalItems, totalPages, currentPage, setCurrentPage, startItem, endItem
}) => {

  const renderTypeBadge = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('bug')) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/30">Bug</span>;
    if (t.includes('epic') || t.includes('épica')) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/30">Épica</span>;
    if (t.includes('story') || t.includes('historia')) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30">Historia</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/50">Tarea</span>;
  };

  const renderPriorityBadge = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p.includes('crít') || p.includes('crit') || p.includes('highest')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-transparent">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
          Crítica
        </span>
      );
    }
    if (p.includes('alt') || p.includes('high')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-transparent">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
          Alta
        </span>
      );
    }
    if (p.includes('med')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-transparent">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Media
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-transparent">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        Baja
      </span>
    );
  };

  const renderStatusBadge = (status, rawStatus) => {
    if (status === 'FINALIZADO') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/40 shadow-xs">
          <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
          Finalizado
        </span>
      );
    }
    if (status === 'EN CURSO') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/40 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500 animate-pulse"></span>
          En Curso
        </span>
      );
    }
    if (status === 'EN REVISIÓN') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/40 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-sky-600 dark:bg-sky-500"></span>
          En Revisión
        </span>
      );
    }
    if (status === 'BLOQUEADA') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40 shadow-xs">
          <AlertCircle size={13} className="text-amber-600 dark:text-amber-500" />
          Bloqueada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50">
        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        Por Hacer
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[480px]">
      <div className="overflow-x-auto flex-1 w-full">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#0c0e21]/70 border-b border-slate-200 dark:border-[#272b5c]/80 text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-3 sm:px-4 py-3 whitespace-nowrap">Clave</th>
              <th className="px-3 sm:px-4 py-3">Tarea / Resumen</th>
              <th className="px-3 sm:px-4 py-3 whitespace-nowrap">Tipo</th>
              <th className="px-3 sm:px-4 py-3 whitespace-nowrap">Prioridad</th>
              <th className="px-3 sm:px-4 py-3 whitespace-nowrap">Estado</th>
              <th className="px-3 sm:px-4 py-3 whitespace-nowrap hidden lg:table-cell">Sprint</th>
              <th className="px-3 sm:px-4 py-3 whitespace-nowrap hidden xl:table-cell">Fecha</th>
              <th className="px-2.5 sm:px-3 py-3 text-center whitespace-nowrap">SP</th>
              <th className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 dark:divide-[#272b5c]/50">
            {paginatedTasks.length > 0 ? paginatedTasks.map(task => (
              <tr 
                key={task.id} 
                onClick={() => setSelectedTaskModal(task)}
                className="hover:bg-slate-50/90 dark:hover:bg-[#1c204d]/50 transition-colors group cursor-pointer"
              >
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 rounded border border-indigo-200 dark:border-indigo-800/40 group-hover:border-indigo-400 transition-colors">
                    {task.key}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3 min-w-[160px]">
                  <div className="font-medium text-slate-900 dark:text-slate-200 leading-snug line-clamp-1" title={task.summary}>
                    {task.summary}
                  </div>
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                  {renderTypeBadge(task.type)}
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                  {renderPriorityBadge(task.priority)}
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                  {renderStatusBadge(task.status, task.rawStatus)}
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                  {task.sprint}
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs font-mono text-slate-600 dark:text-slate-400 hidden xl:table-cell">
                  {task.date}
                </td>
                <td className="px-2.5 sm:px-3 py-3 whitespace-nowrap text-center">
                  <span className="inline-flex items-center justify-center min-w-[22px] px-1.5 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 dark:bg-[#0c0e21] text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-[#272b5c]">
                    {task.sp}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTaskModal(task);
                    }}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-600 hover:text-white dark:bg-indigo-600/10 dark:text-indigo-400 dark:border-transparent dark:hover:bg-indigo-600 dark:hover:text-white transition-all cursor-pointer shadow-xs"
                  >
                    Gestionar
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="9" className="px-4 py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ListTodo size={28} className="text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">No se encontraron tareas con los filtros actuales.</span>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="mt-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                        Limpiar todos los filtros
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-5 py-3 border-t border-slate-200 dark:border-[#272b5c] bg-slate-50/80 dark:bg-[#0c0e21]/50 text-xs text-slate-600 dark:text-slate-400 font-medium gap-3">
          <div>
            Mostrando <span className="font-bold text-slate-900 dark:text-slate-200">{startItem}</span> a <span className="font-bold text-slate-900 dark:text-slate-200">{endItem}</span> de <span className="font-bold text-slate-900 dark:text-slate-200">{totalItems}</span> tareas
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white dark:bg-[#1a1e47] border border-slate-200 dark:border-[#272b5c] rounded-lg text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold transition-all cursor-pointer text-xs shadow-xs"
              >
                <ChevronLeft size={14} /> Anterior
              </button>
              
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-md font-bold text-xs transition-all cursor-pointer shrink-0 ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1a1e47]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-white dark:bg-[#1a1e47] border border-slate-200 dark:border-[#272b5c] rounded-lg text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold transition-all cursor-pointer text-xs shadow-xs"
              >
                Siguiente <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
