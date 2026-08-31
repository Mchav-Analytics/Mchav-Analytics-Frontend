import React from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingUp, CheckCircle2 } from 'lucide-react';

export const ActivityModals = ({ selectedBadgeModal, setSelectedBadgeModal }) => {
  if (!selectedBadgeModal) return null;

  return createPortal(
    <div 
      className="fixed top-0 bottom-0 right-0 left-0 md:left-64 z-[999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10, 12, 28, 0.65)', backdropFilter: 'blur(4px)' }}
      onClick={() => setSelectedBadgeModal(null)}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-[#141738] rounded-2xl border border-slate-200 dark:border-[#272b5c] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#272b5c] bg-slate-50 dark:bg-[#0c0e21]/50">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${selectedBadgeModal.gradient} text-white shadow-sm`}>
              {React.createElement(selectedBadgeModal.icon, { size: 20 })}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span>{selectedBadgeModal.tierIcon}</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedBadgeModal.title}
                </h3>
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Insignia de {selectedBadgeModal.category} · Nivel {selectedBadgeModal.tier}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setSelectedBadgeModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1c204d] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
              Requisito de Desbloqueo
            </span>
            <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-[#0c0e21]/40 p-3 rounded-xl border border-slate-200/80 dark:border-[#272b5c]/60">
              {selectedBadgeModal.description}
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
              Impacto y Recompensa en tu Perfil
            </span>
            <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40 font-semibold">
              <TrendingUp size={15} className="shrink-0 mt-0.5" />
              <span>{selectedBadgeModal.reward}</span>
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
              Estado Actual
            </span>
            {selectedBadgeModal.status === 'UNLOCKED' ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold p-2.5 bg-slate-50 dark:bg-[#0c0e21] rounded-xl border border-slate-200 dark:border-[#272b5c]">
                <CheckCircle2 size={16} />
                <span>¡Medalla desbloqueada y activa en tu perfil de desarrollador!</span>
              </div>
            ) : (
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-[#0c0e21] rounded-xl border border-slate-200 dark:border-[#272b5c]">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-amber-600 dark:text-amber-400">Progreso: {selectedBadgeModal.progress}%</span>
                  <span className="text-slate-500">{selectedBadgeModal.currentCount}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" 
                    style={{ width: `${selectedBadgeModal.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-[#272b5c] bg-slate-50 dark:bg-[#0c0e21]/50 flex justify-end">
          <button
            onClick={() => setSelectedBadgeModal(null)}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
