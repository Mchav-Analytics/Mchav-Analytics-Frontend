import React from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import owlMascot from '../../../assets/owl_mascot.png';

export default function AiDevCoach({ message, loading = false, actionLabel = null, onActionClick = null }) {
  return (
    <div className="flex flex-col bg-slate-50 dark:bg-[#141738] rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-[#272b5c] transition-all">
      <div className="flex items-center gap-3 mb-2.5">
        <div className="w-9 h-9 overflow-hidden flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 rounded-full shrink-0">
          <img 
            src={owlMascot} 
            alt="NUBIIA" 
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600 dark:text-indigo-400"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>';
            }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <Sparkles size={14} className="text-indigo-500 animate-pulse" /> NUBIIA
          </h3>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">✨</span>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center gap-2 py-3 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          <Loader2 size={15} className="animate-spin text-indigo-500" />
          <span>NUBIIA está analizando tu agenda…</span>
        </div>
      ) : (
        <>
          <div className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            {message}
          </div>
          
          {actionLabel && onActionClick && (
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-[#232752]">
              <button 
                onClick={onActionClick} 
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer group"
              >
                <span>{actionLabel}</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
