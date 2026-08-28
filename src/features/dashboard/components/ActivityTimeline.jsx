import React from 'react';
import { History, Calendar, Search, X, ChevronLeft, ChevronRight, CheckCircle2, GitPullRequest, Clock } from 'lucide-react';

export const ActivityTimeline = ({
  selectedProjectId, activityFeed, paginatedFeed, totalPages, currentPage, setCurrentPage,
  searchQuery, setSearchQuery, actionFilter, setActionFilter,
  countDone, countReview, countInProgress, totalSPDelivered
}) => {
  if (!selectedProjectId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white dark:bg-[#141738] rounded-2xl border border-slate-200 dark:border-[#272b5c] text-center animate-in fade-in duration-200 mt-4">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-3">
          <History size={32} />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">Selecciona un Proyecto</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
          Para ver tu cronología de actividades, selecciona en qué proyecto deseas enfocarte usando el selector de la barra superior.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200 mt-4">
      {/* Barra de Resumen de Impacto en Timeline */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 py-2.5 px-3.5 sm:px-4 rounded-xl bg-white dark:bg-[#141738]/50 border border-slate-200 dark:border-[#272b5c]/60 shadow-xs text-xs">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Entregables:</span>
          <strong className="text-slate-900 dark:text-white font-mono font-bold">{activityFeed.length} tareas</strong>
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Puntos entregados:</span>
          <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{totalSPDelivered} SP</strong>
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Efectividad QA:</span>
          <strong className="text-indigo-700 dark:text-indigo-400 font-mono font-bold">98%</strong>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1 rounded">Top</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Racha activa:</span>
          <strong className="text-amber-700 dark:text-amber-400 font-mono font-bold">14 días</strong>
          <span className="text-slate-500 dark:text-slate-400">consecutivos</span>
        </div>
      </div>

      {/* Contenedor del Timeline */}
      <div className="flex flex-col rounded-2xl bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] shadow-xs overflow-hidden">
        
        {/* Header del Timeline con Filtros y Buscador */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-[#272b5c] bg-slate-50/70 dark:bg-[#0c0e21]/40">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Cronología de Entregas
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-white dark:bg-[#141738] p-0.5 rounded-xl border border-slate-200 dark:border-[#272b5c] text-xs shadow-xs">
              <button
                onClick={() => { setActionFilter('ALL'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  actionFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todas ({activityFeed.length})
              </button>
              <button
                onClick={() => { setActionFilter('DONE'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  actionFilter === 'DONE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                }`}
              >
                Completadas ({countDone})
              </button>
              <button
                onClick={() => { setActionFilter('REVIEW'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  actionFilter === 'REVIEW'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-sky-600'
                }`}
              >
                En Revisión ({countReview})
              </button>
              <button
                onClick={() => { setActionFilter('IN_PROGRESS'); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  actionFilter === 'IN_PROGRESS'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                }`}
              >
                En Curso ({countInProgress})
              </button>
            </div>

            <div className="relative w-full sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar ticket o actividad..."
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#141738] text-xs text-slate-800 dark:text-white placeholder-slate-400 rounded-xl border border-slate-200 dark:border-[#272b5c] focus:outline-none focus:border-indigo-500 font-medium shadow-xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista Cronológica con Línea Continua de Timeline */}
        <div className="p-4 sm:p-5 flex-1 relative">
          {paginatedFeed.length > 0 ? (
            <div className="relative pl-6 sm:pl-8 space-y-4">
              <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-[#272b5c]" />

              {paginatedFeed.map((item, idx) => {
                const isDone = item.category === 'DONE';
                const isReview = item.category === 'REVIEW';
                return (
                  <div key={idx} className="relative flex items-start gap-3.5 group">
                    <div className={`absolute -left-6 sm:-left-8 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white dark:bg-[#141738] shadow-xs z-10 ${
                      isDone 
                        ? 'border-emerald-500 text-emerald-500' 
                        : isReview 
                        ? 'border-sky-500 text-sky-500' 
                        : 'border-indigo-500 text-indigo-500'
                    }`}>
                      {isDone ? (
                        <CheckCircle2 size={12} className="stroke-[2.5]" />
                      ) : isReview ? (
                        <GitPullRequest size={11} />
                      ) : (
                        <Clock size={11} />
                      )}
                    </div>

                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-3.5 bg-slate-50/80 dark:bg-[#1c204d]/40 rounded-xl border border-slate-200/80 dark:border-[#272b5c]/60 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                            {item.key}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                            {item.action}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                          {item.time}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-[#0c0e21] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md font-mono">
                          {item.points}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30 rounded-md">
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No se encontraron actividades registradas con el filtro actual.
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-[#272b5c] bg-slate-50/50 dark:bg-[#0c0e21]/40 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white dark:bg-[#1a1e47] border border-slate-200 dark:border-[#272b5c] rounded-lg text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold transition-all cursor-pointer text-xs shadow-xs"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Página {currentPage} de {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white dark:bg-[#1a1e47] border border-slate-200 dark:border-[#272b5c] rounded-lg text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold transition-all cursor-pointer text-xs shadow-xs"
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
