import React from 'react';
import { Search, MessageSquare, ArrowUp, ArrowDown, ChevronRight, Check, Send, TrendingUp, Clock, FileText, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';

export const AlertsCenterList = ({
  statusTab, setStatusTab, searchTerm, setSearchTerm, sortBy, setSortBy,
  filteredItems, expandedId, setExpandedId, handleToggleStatus,
  newCommentText, setNewCommentText, handleAddComment,
  setSidebarCategory, setSidebarPriority, setSidebarStatus, sidebarStatus = 'ALL',
  isDev: isDevProp,
  isAdmin: isAdminProp,
  isLeader: isLeaderProp
}) => {
  const { user } = useAuth();
  const userRole = (user?.rol || user?.role || '').toUpperCase();
  const isAdminCalculated = userRole.includes('ADMIN');
  const isLeaderCalculated = userRole.includes('MANAG') || userRole.includes('LIDER') || userRole.includes('LEAD');

  const isDevView = isDevProp !== undefined ? isDevProp : (!isAdminCalculated && !isLeaderCalculated);
  const isAdminView = isAdminProp !== undefined ? isAdminProp : isAdminCalculated;
  const isLeaderView = isLeaderProp !== undefined ? isLeaderProp : (!isAdminView && !isDevView);

  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = isAdminView ? 4 : 6;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredItems.length, statusTab, searchTerm, sidebarStatus]);

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  const displayedItems = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  return (
    <div className="lg:col-span-8 flex flex-col space-y-6">
      {/* ── TARJETA UNIFICADA: FEEDBACK RECIBIDOS ── */}
      <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] rounded-3xl p-6 shadow-xs flex flex-col space-y-4">
        
        <div className="space-y-4">
          {/* ENCABEZADO DENTRO DE LA TARJETA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Send size={18} className="rotate-45" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  {isAdminView ? 'Feedback recibidos de líderes' : isLeaderView ? 'Feedback recibidos de desarrolladores' : 'Feedback enviados'}
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {isAdminView ? 'Aquí puedes ver todos los feedback enviados por los líderes de equipo.' : isLeaderView ? 'Revisa, comenta y gestiona los feedback que te han enviado.' : 'Aquí puedes ver los feedback que has enviado al líder técnico.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sidebarStatus || 'ALL'}
                onChange={(e) => setSidebarStatus && setSidebarStatus(e.target.value)}
                className="bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:border-indigo-400 transition-colors"
              >
                <option value="ALL">Todos los estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="EN_PROCESO">En conversación</option>
                <option value="RESUELTO">Resueltos</option>
              </select>
            </div>
          </div>

          {/* LISTA DE ÍTEMS EN TARJETAS/FILAS ESTRUCTURADAS */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {displayedItems.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <MessageSquare className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
                <p className="text-sm font-bold text-slate-400">No se encontró feedback con los filtros aplicados.</p>
                <button
                  type="button"
                  onClick={() => { setStatusTab('ALL'); setSidebarCategory('ALL'); setSidebarPriority('ALL'); if (setSidebarStatus) setSidebarStatus('ALL'); setSearchTerm(''); }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 text-xs font-bold hover:bg-indigo-600/30 transition-colors cursor-pointer"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              displayedItems.map((item) => {
                const isExpanded = expandedId === item.id;
                const isResolved = item.status === 'RESUELTO';
                const isInProgress = item.status === 'EN_PROCESO';

                const itemRecipientLower = (item.recipient || '').toLowerCase();
                const recipientIsAdmin = itemRecipientLower.includes('admin') || itemRecipientLower.includes('administrador');
                const isLeaderToAdminItem = Boolean(item.isLeaderToAdmin || recipientIsAdmin);

                const renderAuthorOrRecipient = () => {
                  const userNorm = (user?.nombre || user?.email || '').trim().toLowerCase();
                  const authorNorm = (item.author || '').trim().toLowerCase();

                  const isSentByMe = Boolean(
                    (userNorm && authorNorm && (authorNorm.includes(userNorm) || userNorm.includes(authorNorm))) ||
                    (!isAdminView && !isLeaderView && isDevView)
                  );

                  const formatWithRole = (name, defaultRoleLabel) => {
                    if (!name) return '';
                    if (name.includes('(') && name.includes(')')) return name;
                    return `${name} (${defaultRoleLabel})`;
                  };

                  if (isSentByMe) {
                    let roleLabel = 'Líder Técnico';
                    if (isLeaderView || (item.recipient || '').toLowerCase().includes('admin')) {
                      roleLabel = 'Admin';
                    }
                    const formattedRecipient = formatWithRole(item.recipient || 'Líder Técnico', roleLabel);
                    return (
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        Para: {formattedRecipient}
                      </span>
                    );
                  } else {
                    let roleLabel = 'Desarrollador';
                    if (isAdminView || (item.author || '').toLowerCase().includes('líder') || (item.author || '').toLowerCase().includes('lider')) {
                      roleLabel = 'Líder Técnico';
                    }
                    const formattedAuthor = formatWithRole(item.author || 'Usuario', roleLabel);
                    return (
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        De: {formattedAuthor}
                      </span>
                    );
                  }
                };

                return (
                  <div
                    key={item.id}
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className={`py-3.5 px-3 rounded-2xl transition-all duration-200 cursor-pointer select-none my-1 ${
                      isExpanded 
                        ? 'bg-indigo-50/70 dark:bg-indigo-500/10 ring-1 ring-indigo-500/30 shadow-2xs' 
                        : 'hover:bg-slate-50/80 dark:hover:bg-[#1a1e3b]/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left Info */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="mt-0.5 shrink-0">
                          {item.priority === 'ALTA' ? (
                            <div className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                              <AlertTriangle size={18} />
                            </div>
                          ) : isResolved ? (
                            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                              <CheckCircle2 size={18} />
                            </div>
                          ) : item.category === 'Documentación' || item.category === 'UI/UX' ? (
                            <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                              <FileText size={18} />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
                              <Send size={16} className="rotate-45" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate leading-snug">
                            {item.title}
                          </h3>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {renderAuthorOrRecipient()}
                          </div>

                          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold">
                              {item.project}
                            </span>

                            <span className="px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-purple-600 dark:text-purple-400 text-[10px] font-extrabold">
                              #{item.category}
                            </span>

                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${
                              item.priority === 'ALTA'
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40'
                                : item.priority === 'MEDIA'
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                            }`}>
                              {item.priority === 'ALTA' ? 'Alta' : item.priority === 'MEDIA' ? 'Media' : 'Baja'}
                            </span>

                            <span className="text-[11px] font-medium text-slate-400">
                              {item.timeAgo}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Status Badge & Ver Button */}
                      <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${
                          isResolved
                            ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-500/30'
                            : isInProgress
                            ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-500/30'
                            : 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-500/30'
                        }`}>
                          {isResolved ? (
                            <>
                              <Check size={12} strokeWidth={2.5} />
                              <span>Resuelto</span>
                            </>
                          ) : isInProgress ? (
                            <>
                              <MessageSquare size={12} />
                              <span>En conversación</span>
                            </>
                          ) : (
                            <>
                              <Clock size={12} />
                              <span>Pendiente</span>
                            </>
                          )}
                        </span>

                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>Ver</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PAGINACIÓN PINADA AL PIE DE LA TARJETA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-auto">
          <div className="text-xs font-medium text-slate-400">
            {totalItems === 0 ? (
              <>Mostrando 0 feedback</>
            ) : (
              <>Mostrando <span className="font-extrabold text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalItems)}</span> de <span className="font-extrabold text-slate-900 dark:text-white">{totalItems}</span> feedback</>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-2 py-1 rounded-lg bg-white dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#252a4e] font-bold text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pNum => (
              <button
                key={pNum}
                type="button"
                onClick={() => setCurrentPage(pNum)}
                className={`w-7 h-7 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  currentPage === pNum
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#252a4e] text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {pNum}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-2 py-1 rounded-lg bg-white dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#252a4e] font-bold text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
