import React from 'react';
import { Search, MessageSquare, ArrowUp, ArrowDown, ChevronRight, Check, Send } from 'lucide-react';

export const AlertsCenterList = ({
  statusTab, setStatusTab, searchTerm, setSearchTerm, sortBy, setSortBy,
  filteredItems, expandedId, setExpandedId, handleToggleStatus,
  newCommentText, setNewCommentText, handleAddComment,
  setSidebarCategory, setSidebarPriority, setSidebarStatus
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 4;

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  const displayedItems = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const pendingItemsCount = React.useMemo(() => filteredItems.filter(i => i.status === 'PENDIENTE').length, [filteredItems]);
  const inProgressItemsCount = React.useMemo(() => filteredItems.filter(i => i.status === 'EN_PROCESO').length, [filteredItems]);
  const resolvedItemsCount = React.useMemo(() => filteredItems.filter(i => i.status === 'RESUELTO').length, [filteredItems]);

  return (
    <div className="lg:col-span-8 space-y-4">
      {/* ── FEED CARDS LIST ── */}
      <div className="space-y-3.5">
        {displayedItems.length === 0 ? (
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
          displayedItems.map((item) => {
            const isExpanded = expandedId === item.id;
            const isResolved = item.status === 'RESUELTO';
            const isInProgress = item.status === 'EN_PROCESO';

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-[#13162b] border ${
                  isExpanded ? 'border-indigo-500 shadow-md shadow-indigo-500/10' : 'border-slate-200 dark:border-[#252a4e] hover:border-indigo-500/50'
                } rounded-2xl p-5 transition-all duration-200 space-y-4`}
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="flex items-start justify-between gap-4 cursor-pointer select-none"
                >
                  {/* Left priority icon & main content */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Priority Circle Icon */}
                    <div className="mt-0.5 shrink-0">
                      {item.priority === 'ALTA' ? (
                        <div className="w-9 h-9 rounded-full bg-rose-500/15 text-rose-500 dark:text-rose-400 flex items-center justify-center border border-rose-500/30">
                          <ArrowUp size={18} strokeWidth={2.5} />
                        </div>
                      ) : item.priority === 'MEDIA' ? (
                        <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
                          <ArrowUp size={18} strokeWidth={2.5} />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                          <ArrowDown size={18} strokeWidth={2.5} />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>

                      {/* Tags & Metadata Row */}
                      <div className="flex items-center gap-2.5 pt-1.5 flex-wrap">
                        {/* Category tag */}
                        <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700/40 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold">
                          #{item.category}
                        </span>

                        {/* Priority tag */}
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${
                          item.priority === 'ALTA'
                            ? 'bg-rose-500/10 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40'
                            : item.priority === 'MEDIA'
                            ? 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40'
                            : 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                        }`}>
                          {item.priority === 'ALTA' ? 'Alta prioridad' : item.priority === 'MEDIA' ? 'Media prioridad' : 'Baja prioridad'}
                        </span>

                        {/* Author info */}
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[9px] flex items-center justify-center shrink-0">
                            {item.avatar || 'U'}
                          </div>
                          <span>{item.author}</span>
                        </div>

                        {/* Time ago */}
                        <span className="text-[11px] font-medium text-slate-400">
                          ⏱ {item.timeAgo}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side status badge, comment count & chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      isResolved
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                        : isInProgress
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40'
                        : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/40'
                    }`}>
                      {isResolved ? 'Resuelto' : isInProgress ? 'En proceso' : 'Pendiente'}
                    </span>

                    <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                      <MessageSquare size={14} />
                      <span>{item.comments?.length || 0}</span>
                    </div>

                    <ChevronRight size={16} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90 text-indigo-500' : ''}`} />
                  </div>
                </div>

                {/* Expanded Drawer for Conversations */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-200 dark:border-[#252a4e] space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Proyecto: <span className="text-slate-900 dark:text-white font-extrabold">{item.project}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isResolved
                            ? 'bg-amber-600/20 text-amber-700 dark:text-amber-300 hover:bg-amber-600/30'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <Check size={14} />
                        <span>{isResolved ? 'Reabrir Feedback' : 'Marcar Resuelto'}</span>
                      </button>
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
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{c.author}</span>
                                <span className="text-slate-400">{c.time}</span>
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-200">{c.text}</p>
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
                          className="flex-1 bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(item.id)}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
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

      {/* ── PAGINATION FOOTER ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div>
          Mostrando <span className="font-extrabold text-slate-900 dark:text-white">1 a {displayedItems.length}</span> de <span className="font-extrabold text-slate-900 dark:text-white">{totalItems}</span> feedback
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="w-8 h-8 rounded-xl bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] flex items-center justify-center font-extrabold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-500/40 transition-colors cursor-pointer"
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                currentPage === page
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] text-slate-700 dark:text-slate-300 hover:border-indigo-500/40'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="w-8 h-8 rounded-xl bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] flex items-center justify-center font-extrabold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-500/40 transition-colors cursor-pointer"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};
