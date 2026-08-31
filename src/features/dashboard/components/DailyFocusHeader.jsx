import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTodayStr, addDays } from '../utils/agendaLogic';

export default function DailyFocusHeader({ 
  projectName, 
  selectedDate, 
  setSelectedDate 
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#272b5c]/70">
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold shadow-sm shrink-0">
          <Calendar size={22} />
        </div>
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Mi Trabajo / Mi Agenda
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            Mi Agenda de Hoy
          </h1>
          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Proyecto: <strong className="text-indigo-600 dark:text-indigo-400 font-bold uppercase">{projectName}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-start gap-1.5 bg-slate-100 dark:bg-[#0c0e21] p-1.5 rounded-2xl border border-slate-200 dark:border-[#272b5c] w-full lg:w-auto shadow-xs">
        <button 
          onClick={() => setSelectedDate(addDays(selectedDate, -1))} 
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-[#1a1e47] rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
        >
          <ChevronLeft size={16} /> Ayer
        </button>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-white dark:bg-[#1a1e47] rounded-xl border border-slate-200 dark:border-[#272b5c] font-bold text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
          <Calendar size={14} className="text-indigo-500 dark:text-indigo-400" />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="bg-transparent border-none outline-none cursor-pointer uppercase font-mono w-[100px] sm:w-[110px]"
          />
        </div>

        <button 
          onClick={() => setSelectedDate(addDays(selectedDate, 1))} 
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-[#1a1e47] rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
        >
          Mañana <ChevronRight size={16} />
        </button>
        <div className="w-px h-6 bg-slate-200 dark:bg-[#272b5c] mx-0.5 hidden sm:block"></div>
        <button 
          onClick={() => setSelectedDate(getTodayStr())} 
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all cursor-pointer flex items-center justify-center font-black uppercase tracking-widest text-xs"
        >
          HOY
        </button>
      </div>
    </div>
  );
}
