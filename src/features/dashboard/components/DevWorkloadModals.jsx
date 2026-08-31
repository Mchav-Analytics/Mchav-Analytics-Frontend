import React from 'react';
import { createPortal } from 'react-dom';
import { X, GitBranch, Check, AlertTriangle, Loader2, ChevronDown } from 'lucide-react';

export const DevWorkloadModals = ({
  selectedTaskModal, setSelectedTaskModal, updatingStatus, isStatusDropdownOpen, setIsStatusDropdownOpen,
  dropdownRef, loadingTransitions, availableTransitions, handleSelectTransition,
  copiedBranch, handleCopyGitBranch, errorMsg
}) => {
  if (!selectedTaskModal) return null;

  const getStatusDotColor = (st) => {
    const s = (st || '').toLowerCase();
    if (s.includes('finaliz') || s.includes('done') || s.includes('listo') || s.includes('complet')) return 'bg-emerald-500 shadow-[0_0_6px_#10b981]';
    if (s.includes('bloque') || s.includes('block') || s.includes('imped')) return 'bg-amber-500 shadow-[0_0_6px_#f59e0b]';
    if (s.includes('revis') || s.includes('review') || s.includes('qa')) return 'bg-sky-500 shadow-[0_0_6px_#0ea5e9]';
    if (s.includes('curso') || s.includes('prog') || s.includes('dev') || s.includes('doing')) return 'bg-indigo-500 shadow-[0_0_6px_#6366f1]';
    return 'bg-slate-400';
  };

  return createPortal(
    <div 
      onClick={() => setSelectedTaskModal(null)}
      className="fixed top-0 bottom-0 right-0 left-0 md:left-64 z-[999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#141738] border border-[#272b5c] w-[95vw] sm:max-w-3xl rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6 text-left"
      >
        <div className="flex items-center justify-between border-b border-[#272b5c]/80 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 rounded">
              {selectedTaskModal.key}
            </span>
            <span className="px-2.5 py-1 text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded uppercase">
              {selectedTaskModal.rawStatus || selectedTaskModal.status}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedTaskModal(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-white">
            {selectedTaskModal.summary}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-[#0c0e21]/70 p-3.5 rounded-xl border border-[#232752]">
            {selectedTaskModal.descripcion || 'Sin descripción detallada de Jira.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
            <div className="p-3 rounded-xl bg-[#0c0e21] border border-[#232752]">
              <span className="text-slate-400 font-semibold block">Prioridad</span>
              <strong className="text-white font-bold">{selectedTaskModal.priority || 'Media'}</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0e21] border border-[#232752]">
              <span className="text-slate-400 font-semibold block">Story Points</span>
              <strong className="text-white font-bold">{selectedTaskModal.sp || 0} SP</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0e21] border border-[#232752]">
              <span className="text-slate-400 font-semibold block">Tiempo de Ciclo</span>
              <strong className="text-white font-bold">
                {selectedTaskModal.cycle_time_days > 0 ? `${selectedTaskModal.cycle_time_days} días` : (selectedTaskModal.date ? `Creado: ${selectedTaskModal.date}` : '--')}
              </strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#191c3d]/70 border border-[#272b5c] space-y-2.5 relative">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                Tipo: <strong className="text-slate-200">{selectedTaskModal.type || 'Historia'}</strong>
              </span>
              {updatingStatus ? (
                <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                  <Loader2 size={11} className="animate-spin" /> Sincronizando con Jira...
                </span>
              ) : (
                <span className="text-slate-400 text-xs">
                  Estado actual: <strong className="text-emerald-400 font-bold uppercase">{selectedTaskModal.rawStatus || selectedTaskModal.status}</strong>
                </span>
              )}
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#0c0e21] border ${
                  isStatusDropdownOpen 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                    : 'border-[#33376b] hover:border-indigo-500'
                } text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-400 text-xs font-normal">Cambiar estado a:</span>
                  <div className="flex items-center gap-2 font-extrabold text-white">
                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(selectedTaskModal.rawStatus || selectedTaskModal.status)}`}></span>
                    <span>{selectedTaskModal.rawStatus || selectedTaskModal.status}</span>
                  </div>
                </div>
                {updatingStatus ? (
                  <Loader2 size={15} className="animate-spin text-indigo-400" />
                ) : (
                  <ChevronDown size={15} className={`text-slate-400 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                )}
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute left-0 right-0 bottom-full mb-2 z-50 bg-[#191c3d] border border-[#3b3f78] rounded-2xl shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
                  {loadingTransitions ? (
                    <div className="py-3 px-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <Loader2 size={13} className="animate-spin text-indigo-400" />
                      <span>Consultando transiciones en Jira...</span>
                    </div>
                  ) : availableTransitions.length > 0 ? (
                    availableTransitions.map((t) => {
                      const isCurrent = (selectedTaskModal.rawStatus || selectedTaskModal.status).toLowerCase() === (t.to_status || t.name).toLowerCase();
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectTransition(t)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-indigo-600/30 text-indigo-300 font-extrabold border border-indigo-500/30'
                              : 'text-slate-200 hover:bg-[#252a5c] font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(t.to_status || t.name)}`}></span>
                            <span>{t.name}</span>
                          </div>
                          {isCurrent && <Check size={14} className="text-indigo-400" />}
                        </button>
                      );
                    })
                  ) : (
                    [
                      { key: 'Por hacer', label: 'Por hacer', dot: 'bg-slate-400' },
                      { key: 'En curso', label: 'En curso', dot: 'bg-indigo-500 shadow-[0_0_6px_#6366f1]' },
                      { key: 'En revisión', label: 'En revisión', dot: 'bg-sky-500 shadow-[0_0_6px_#0ea5e9]' },
                      { key: 'Finalizado', label: 'Finalizado', dot: 'bg-emerald-500 shadow-[0_0_6px_#10b981]' }
                    ].map((st) => {
                      const isCurrent = (selectedTaskModal.rawStatus || selectedTaskModal.status).toLowerCase().includes(st.key.toLowerCase());
                      return (
                        <button
                          key={st.key}
                          type="button"
                          onClick={() => handleSelectTransition(st.key)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-indigo-600/30 text-indigo-300 font-extrabold border border-indigo-500/30'
                              : 'text-slate-200 hover:bg-[#252a5c] font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${st.dot}`}></span>
                            <span>{st.label}</span>
                          </div>
                          {isCurrent && <Check size={14} className="text-indigo-400" />}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-900/60 flex items-center gap-2 text-rose-300 text-xs font-semibold animate-in fade-in">
                <AlertTriangle size={15} className="text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#272b5c]/80">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => handleCopyGitBranch(selectedTaskModal)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#0c0e21] hover:bg-[#1e224f] text-slate-200 border border-[#272b5c] transition-all flex items-center gap-1.5 cursor-pointer"
              title="Copiar comando git checkout para crear la rama"
            >
              {copiedBranch ? <Check size={13} className="text-emerald-500" /> : <GitBranch size={13} className="text-indigo-400" />}
              <span>{copiedBranch ? '¡Rama copiada!' : 'Copiar rama Git'}</span>
            </button>
            <a
              href={`https://beltrancamilo592.atlassian.net/browse/${selectedTaskModal.key}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Abrir en Jira ↗</span>
            </a>
          </div>
          <button
            type="button"
            onClick={() => setSelectedTaskModal(null)}
            className="px-5 py-2 text-xs font-bold bg-[#1e224f] hover:bg-[#272c66] text-white rounded-xl transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
