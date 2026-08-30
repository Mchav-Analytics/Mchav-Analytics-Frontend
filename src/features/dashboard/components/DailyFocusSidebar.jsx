import React from 'react';
import { CheckCircle2, Pin, Trash2 } from 'lucide-react';

export default function DailyFocusSidebar({
  completedToday,
  totalToday,
  progressPct,
  newNoteText,
  setNewNoteText,
  handleAddNote,
  filteredNotes,
  handleDeleteNote
}) {
  return (
    <div className="lg:col-span-4 flex flex-col gap-5 sm:gap-6">
      {/* Progreso */}
      <div className="bg-white/80 dark:bg-[#141738]/80 backdrop-blur-sm rounded-3xl border border-slate-200/80 dark:border-[#272b5c]/80 shadow-sm p-5 sm:p-7 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400 rounded-full blur-[60px] -z-10 opacity-10 group-hover:opacity-20 transition-opacity"></div>
        <h3 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-500" /> Progreso del día
        </h3>
        <div className="flex items-end justify-between mb-3.5">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white font-black">{completedToday.length}</strong> de {totalToday}
          </span>
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
            {progressPct}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-[#0c0e21] rounded-full overflow-hidden border border-slate-200/50 dark:border-[#272b5c]/50 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000 ease-out relative" 
            style={{ width: `${progressPct}%` }}
          >
            <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="bg-white/80 dark:bg-[#141738]/80 backdrop-blur-sm rounded-3xl border border-slate-200/80 dark:border-[#272b5c]/80 shadow-sm p-5 sm:p-7 flex flex-col min-h-[300px] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400 rounded-full blur-[70px] -z-10 opacity-10 group-hover:opacity-15 transition-opacity"></div>
        
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Pin size={14} className="text-amber-500" /> Bloc de Notas
          </h3>
        </div>
        
        <form onSubmit={handleAddNote} className="mb-5 relative group">
          <input 
            type="text" 
            value={newNoteText} 
            onChange={(e) => setNewNoteText(e.target.value)} 
            placeholder="Añadir nueva nota rápida..." 
            className="w-full pl-4 pr-10 py-3 bg-slate-50/80 dark:bg-[#0c0e21]/60 text-sm font-medium rounded-xl border border-slate-200/80 dark:border-[#272b5c]/80 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all shadow-sm placeholder:text-slate-400" 
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-[10px] bg-white dark:bg-[#141738] px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#272b5c]">
            ↵
          </div>
        </form>
        
        <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar max-h-64">
          {filteredNotes.length > 0 ? filteredNotes.map(note => (
            <div key={note.id} className="group/note relative flex justify-between items-start gap-3 p-3.5 bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl border border-amber-200/60 dark:border-amber-800/40 text-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 rounded-l-xl opacity-50"></div>
              <span className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed pl-1">{note.text}</span>
              <button onClick={() => handleDeleteNote(note.id)} className="text-slate-400 hover:text-rose-500 opacity-0 group-hover/note:opacity-100 transition-opacity shrink-0 cursor-pointer p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/30 bg-white/50 dark:bg-[#141738]/50">
                <Trash2 size={14}/>
              </button>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center h-32 text-center opacity-70">
              <Pin size={20} className="text-slate-300 dark:text-slate-600 mb-2 rotate-45" />
              <span className="text-xs text-slate-400 font-medium">El bloc de notas está vacío.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
