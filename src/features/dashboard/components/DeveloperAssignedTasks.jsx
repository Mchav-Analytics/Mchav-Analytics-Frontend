import React from 'react';
import { ListTodo, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const DeveloperAssignedTasks = ({ filteredTasks, taskFilter, setTaskFilter, currentPage, setCurrentPage, ITEMS_PER_PAGE, setSelectedIssueModal }) => {
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE) || 1;
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="lg:col-span-7 p-5 sm:p-7 rounded-3xl bg-white/80 dark:bg-[#141738]/80 backdrop-blur-md border border-slate-200/80 dark:border-[#272b5c]/80 shadow-sm space-y-4 flex flex-col justify-between min-w-0 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full blur-[60px] -z-10 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity"></div>
      
      {/* CABECERA Y FILTROS */}
      <div className="space-y-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ListTodo size={18} className="text-indigo-400 shrink-0" />
              <span>Mis Tareas Asignadas</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Listado completo de tus tareas asignadas con estado y esfuerzo.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg shrink-0">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'tarea' : 'tareas'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {[
            { key: 'ALL', label: 'Todas' },
            { key: 'IN_PROGRESS', label: 'En progreso' },
            { key: 'PENDING', label: 'Pendientes' },
            { key: 'BLOCKED', label: 'Bloqueadas' },
            { key: 'COMPLETED', label: 'Completadas' }
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setTaskFilter(f.key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer shrink-0 ${taskFilter === f.key
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                : 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* LISTADO / TABLA DE TAREAS RESPONSIVA */}
      <div className="flex-1 min-h-[220px]">
        {/* VISTA ESCRITORIO */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold uppercase text-slate-400">
                <th className="py-2.5 px-2.5">Clave</th>
                <th className="py-2.5 px-2.5">Resumen</th>
                <th className="py-2.5 px-2.5">Estado</th>
                <th className="py-2.5 px-2 text-center">SP</th>
                <th className="py-2.5 px-2 text-center">Cycle</th>
                <th className="py-2.5 px-2 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedTasks.length > 0 ? (
                paginatedTasks.map((t) => (
                  <tr key={t.key_issue} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-300 whitespace-nowrap">
                      {t.key_issue}
                    </td>
                    <td className="py-2.5 px-2.5 font-semibold text-slate-900 dark:text-slate-100 max-w-[180px] lg:max-w-[220px] truncate" title={t.summary}>
                      {t.summary}
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      {(() => {
                        const st = (t.status_actual || 'POR HACER').toUpperCase();
                        if (st.includes('LISTO') || st.includes('DONE') || st.includes('COMPLETADA') || st.includes('FINALIZADO')) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
                              <CheckCircle2 size={11} className="text-emerald-500" />
                              Listo
                            </span>
                          );
                        }
                        if (st.includes('PROGRESO') || st.includes('PROGRESS') || st.includes('CURSO')) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                              En Progreso
                            </span>
                          );
                        }
                        if (st.includes('BLOQUEADA') || st.includes('BLOCKED')) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/40">
                              <AlertTriangle size={11} className="text-rose-500" />
                              Bloqueada
                            </span>
                          );
                        }
                        if (st.includes('REVISI') || st.includes('REVIEW')) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40">
                              <Clock size={11} className="text-amber-500" />
                              En Revisión
                            </span>
                          );
                        }
                        return (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                            Por Hacer
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {t.story_points}
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-slate-400 text-[11px] whitespace-nowrap">
                      {t.cycle_time_days > 0 ? `${t.cycle_time_days}d` : '--'}
                    </td>
                    <td className="py-2.5 px-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedIssueModal(t)}
                        className="px-2.5 py-1 text-[11px] font-extrabold rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    No hay tareas que coincidan con este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* VISTA MÓVIL */}
        <div className="block sm:hidden space-y-2.5">
          {paginatedTasks.length > 0 ? (
            paginatedTasks.map((t) => (
              <div key={t.key_issue} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-300">
                    {t.key_issue}
                  </span>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const st = (t.status_actual || 'POR HACER').toUpperCase();
                      if (st.includes('LISTO') || st.includes('DONE') || st.includes('COMPLETADA') || st.includes('FINALIZADO')) {
                        return (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50">
                            <CheckCircle2 size={10} className="text-emerald-500" /> Listo
                          </span>
                        );
                      }
                      if (st.includes('PROGRESO') || st.includes('PROGRESS') || st.includes('CURSO')) {
                        return (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Progreso
                          </span>
                        );
                      }
                      if (st.includes('BLOQUEADA') || st.includes('BLOCKED')) {
                        return (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50">
                            <AlertTriangle size={10} className="text-rose-500" /> Bloqueada
                          </span>
                        );
                      }
                      return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Por Hacer
                        </span>
                      );
                    })()}
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                      {t.story_points} SP
                    </span>
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-relaxed">
                  {t.summary}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                  <span>Cycle: {t.cycle_time_days > 0 ? `${t.cycle_time_days}d` : '--'}</span>
                  <button
                    onClick={() => setSelectedIssueModal(t)}
                    className="px-3 py-1 text-[11px] font-extrabold rounded-lg bg-indigo-600 text-white cursor-pointer"
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No hay tareas que coincidan con este filtro.
            </div>
          )}
        </div>
      </div>

      {/* CONTROLES DE PAGINACIÓN */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs">
        <span className="text-slate-400 font-medium text-center sm:text-left">
          Mostrando {filteredTasks.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredTasks.length)} de {filteredTasks.length} tareas
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
          >
            Anterior
          </button>

          <span className="text-slate-400 font-bold text-xs px-1">
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </div>

    </div>
  );
};
