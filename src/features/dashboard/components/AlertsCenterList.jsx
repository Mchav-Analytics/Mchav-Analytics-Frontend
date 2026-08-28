import React from 'react';
import { Search, MessageSquare, ArrowUp, ArrowDown, Check, Send } from 'lucide-react';

export const AlertsCenterList = ({
  statusTab, setStatusTab, searchTerm, setSearchTerm, sortBy, setSortBy,
  filteredItems, expandedId, setExpandedId, handleToggleStatus,
  newCommentText, setNewCommentText, handleAddComment,
  setSidebarCategory, setSidebarPriority, setSidebarStatus
}) => {
  return (
    <div className="lg:col-span-8 space-y-4">
      <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${statusTab === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('PENDING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${statusTab === 'PENDING'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            Pendientes
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('RESOLVED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${statusTab === 'RESOLVED'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            Resueltos
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('MY_ASSIGNED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${statusTab === 'MY_ASSIGNED'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
            Mis Asignados
          </button>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar feedback..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl outline-none focus:border-indigo-500 w-36 sm:w-44"
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
          >
            <option value="recent">Más recientes</option>
            <option value="priority">Por Prioridad</option>
            <option value="project">Por Proyecto</option>
          </select>
        </div>
      </div>

      <div className="space-y-3.5">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] rounded-2xl space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
            <p className="text-sm font-bold text-slate-400">No se encontró feedback con los filtros aplicados.</p>
            <button
              type="button"
              onClick={() => { setStatusTab('ALL'); setSidebarCategory('ALL'); setSidebarPriority('ALL'); setSidebarStatus('ALL'); setSearchTerm(''); }}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 text-xs font-bold hover:bg-indigo-600/30 transition-colors"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            const isResolved = item.status === 'RESUELTO';

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-[#13162b] border ${isExpanded ? 'border-indigo-500 shadow-md shadow-indigo-500/10' : 'border-slate-200 dark:border-[#252a4e] hover:border-indigo-500/50'
                  } rounded-2xl p-5 transition-all duration-200 space-y-4`}
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex items-start justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {item.priority === 'ALTA' ? (
                        <div className="w-9 h-9 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30">
                          <ArrowUp size={18} />
                        </div>
                      ) : item.priority === 'MEDIA' ? (
                        <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                          <ArrowUp size={18} />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                          <ArrowDown size={18} />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {item.tags?.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-md bg-purple-900/30 border border-purple-700/40 text-purple-300 text-[10px] font-bold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${isResolved
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : item.status === 'EN_PROCESO'
                            ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                            : 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                        }`}
                    >
                      {isResolved ? 'Resuelto' : item.status === 'EN_PROCESO' ? 'En Proceso' : 'Pendiente'}
                    </span>

                    <span className="text-[11px] font-medium text-slate-400">
                      {item.timeAgo}
                    </span>

                    <div
                      title={`Autor: ${item.author}`}
                      className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-[9px] flex items-center justify-center border-2 border-[#13162b]"
                    >
                      {item.avatar || 'U'}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-4 border-t border-slate-200 dark:border-[#252a4e] space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold text-slate-400">
                        Proyecto: <span className="text-slate-200 font-extrabold">{item.project}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${isResolved
                              ? 'bg-amber-600/20 text-amber-300 hover:bg-amber-600/30'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                        >
                          <Check size={14} />
                          <span>{isResolved ? 'Reabrir Feedback' : 'Marcar Resuelto'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] space-y-3">
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                        Conversación & Comentarios ({item.comments?.length || 0})
                      </h4>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {item.comments?.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No hay comentarios registrados en este feedback aún.</p>
                        ) : (
                          item.comments.map(c => (
                            <div key={c.id} className="p-2.5 rounded-lg bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-indigo-400">{c.author}</span>
                                <span className="text-slate-500">{c.time}</span>
                              </div>
                              <p className="text-xs text-slate-300">{c.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Escribe una respuesta o aclaración..."
                          value={newCommentText}
                          onChange={e => setNewCommentText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddComment(item.id); }}
                          className="flex-1 bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#2b305b] text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(item.id)}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
