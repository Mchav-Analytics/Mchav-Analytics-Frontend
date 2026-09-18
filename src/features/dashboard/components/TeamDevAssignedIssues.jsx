import React from 'react';
import { Info, ChevronRight, ChevronLeft } from 'lucide-react';

export default function TeamDevAssignedIssues({ 
  selectedDev, 
  assignedIssuesList, 
  currentPage, 
  setCurrentPage, 
  itemsPerPage 
}) {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentIssues = assignedIssuesList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(assignedIssuesList.length / itemsPerPage) || 1;

  return (
    <div className="relative rounded-3xl bg-[#f8faff] dark:bg-[#14192b] p-5 sm:p-6 shadow-2xs border border-indigo-100/80 dark:border-slate-800 transition-all duration-300 space-y-5">
      <div className="relative z-10 space-y-4">
        {/* ENCABEZADO DE TABLA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Info size={16} />
            </div>
            <h2 className="text-[17px] font-black text-slate-800 dark:text-white uppercase tracking-wider">
              INCIDENCIAS ASIGNADAS A {selectedDev?.nombre || 'DESARROLLADOR'}
            </h2>
            <Info size={14} className="text-slate-400 cursor-pointer hidden sm:inline" />
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 rounded-full w-fit">
            ● {assignedIssuesList.length} Tareas Totales
          </span>
        </div>

        {/* TABLA DE TAREAS */}
        <div className="w-full max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 dark:bg-slate-900/80 text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800 text-xs">
              <tr>
                <th className="px-4 py-3">CLAVE</th>
                <th className="px-4 py-3">RESUMEN</th>
                <th className="px-4 py-3 text-center">ESTADO ACTUAL</th>
                <th className="px-4 py-3 text-center">STORY POINTS</th>
                <th className="px-4 py-3 text-right">CYCLE TIME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {currentIssues.map((issue, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    {issue.key_issue}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer max-w-md truncate text-sm">
                    {issue.summary}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {(() => {
                      const status = (issue.status_actual || '').toUpperCase();
                      let bgClass = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
                      
                      if (status.includes('LISTO') || status.includes('DONE') || status.includes('FINALIZADO') || status.includes('COMPLETADO')) {
                        bgClass = "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
                      } else if (status.includes('CURSO') || status.includes('PROGRESS') || status.includes('HACIENDO') || status.includes('PROGRESO')) {
                        bgClass = "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30";
                      } else if (status.includes('REVISI') || status.includes('REVIEW') || status.includes('TEST')) {
                        bgClass = "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/30";
                      } else if (status.includes('BLOCK') || status.includes('BLOQUEADO')) {
                        bgClass = "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/30";
                      }

                      return (
                        <span className={`px-3 py-0.5 rounded-full text-xs font-black tracking-wide uppercase border ${bgClass}`}>
                          {issue.status_actual}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3.5 text-center font-black text-slate-800 dark:text-slate-200 text-sm">
                    {issue.story_points}
                  </td>
                  <td className="px-4 py-3.5 text-right font-black flex items-center justify-end gap-2 text-sm">
                    {(() => {
                      const days = issue.cycle_time_days || 63.2;
                      return (
                        <>
                          <span className="text-rose-600 dark:text-rose-400 font-extrabold">{days}d</span>
                          <ChevronRight size={14} className="text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors" />
                        </>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINACIÓN */}
        {assignedIssuesList.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, assignedIssuesList.length)}-{Math.min(currentPage * itemsPerPage, assignedIssuesList.length)} de {assignedIssuesList.length} tareas (Página {currentPage} de {totalPages})
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* NÚMEROS DE PÁGINA */}
              <div className="flex items-center gap-1 mr-2">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                {totalPages > 3 && <span className="text-slate-400 text-xs px-1">...</span>}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 text-xs font-bold bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200/80 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
              >
                Anterior
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3.5 py-1.5 text-xs font-bold bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200/80 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
