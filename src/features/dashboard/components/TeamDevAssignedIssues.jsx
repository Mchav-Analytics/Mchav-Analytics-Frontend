import React from 'react';
import { MetricInfoTooltip, SparklineMini } from './ScorecardShared';

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

  return (
    <div className="relative rounded-2xl bg-white dark:bg-[#191c3d] p-8 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#33376b] transition-all duration-300 space-y-6">
      <div className="relative z-10 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Incidencias Asignadas a {selectedDev.nombre}
            </h2>
            <MetricInfoTooltip text="Incidencias asignadas activas e históricas a este desarrollador." />
          </div>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3.5 py-1.5 rounded-full">
            {assignedIssuesList.length} Tareas Totales
          </span>
        </div>

        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4">CLAVE</th>
                <th className="px-5 py-4">RESUMEN</th>
                <th className="px-5 py-4 text-center">ESTADO ACTUAL</th>
                <th className="px-5 py-4 text-right">Story Points</th>
                <th className="px-5 py-4 text-right">Cycle Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {currentIssues.map((issue, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    {issue.key_issue}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer max-w-md truncate">
                    {issue.summary}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {(() => {
                      const status = (issue.status_actual || '').toUpperCase();
                      let bgClass = "bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/20";
                      
                      if (status.includes('LISTO') || status.includes('DONE') || status.includes('FINALIZADO') || status.includes('COMPLETADO')) {
                        bgClass = "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
                      } else if (status.includes('CURSO') || status.includes('PROGRESS') || status.includes('HACIENDO') || status.includes('PROGRESO')) {
                        bgClass = "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20";
                      } else if (status.includes('REVISI') || status.includes('REVIEW') || status.includes('TEST')) {
                        bgClass = "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20";
                      } else if (status.includes('BLOCK') || status.includes('BLOQUEADO')) {
                        bgClass = "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
                      }

                      return (
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase border ${bgClass}`}>
                          {issue.status_actual}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-slate-200 text-sm">
                    {issue.story_points}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold flex items-center justify-end gap-3">
                    {(() => {
                      const days = issue.cycle_time_days || 0;
                      let colorClass = "text-emerald-600 dark:text-emerald-400";
                      let sparklineColor = "#10b981";

                      if (days > 14) {
                        colorClass = "text-rose-600 dark:text-rose-400";
                        sparklineColor = "#f43f5e";
                      } else if (days > 7) {
                        colorClass = "text-amber-600 dark:text-amber-400";
                        sparklineColor = "#f59e0b";
                      }

                      return (
                        <>
                          <span className={`text-sm ${colorClass}`}>{days > 0 ? `${days}d` : '-'}</span>
                          <SparklineMini color={sparklineColor} />
                        </>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Controles de paginación */}
        {assignedIssuesList.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, assignedIssuesList.length)} a {Math.min(currentPage * itemsPerPage, assignedIssuesList.length)} de {assignedIssuesList.length} tareas (Página {currentPage} de {Math.ceil(assignedIssuesList.length / itemsPerPage) || 1})
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
              >
                Anterior
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(assignedIssuesList.length / itemsPerPage), p + 1))}
                disabled={currentPage >= Math.ceil(assignedIssuesList.length / itemsPerPage)}
                className="px-3.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
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
