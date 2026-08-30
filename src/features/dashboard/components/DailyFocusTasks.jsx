import React from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import DailyFocusTaskRow from './DailyFocusTaskRow';

export default function DailyFocusTasks({
  todayTasks,
  overdueTasks,
  paginatedTasks,
  totalPages,
  currentPage,
  setCurrentPage,
  highlightedTaskKey,
  handleToggleDone
}) {
  return (
    <div className="lg:col-span-8 flex flex-col gap-5 sm:gap-6">
      {/* Tareas de Hoy */}
      <div className="bg-white/80 dark:bg-[#141738]/80 backdrop-blur-sm rounded-3xl border border-slate-200/80 dark:border-[#272b5c]/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-[#272b5c]">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
            Tareas de Hoy
            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 px-2.5 py-0.5 rounded-full text-xs shadow-sm">
              {todayTasks.length}
            </span>
          </h3>
        </div>
        
        <div className="flex flex-col">
          {paginatedTasks.length > 0 ? (
            paginatedTasks.map(task => (
              <DailyFocusTaskRow 
                key={task.id}
                task={task}
                highlightedTaskKey={highlightedTaskKey}
                handleToggleDone={handleToggleDone}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 dark:bg-[#0c0e21]/30 rounded-2xl border border-dashed border-slate-200 dark:border-[#272b5c]">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-3">
                <CheckCircle2 size={24} />
              </div>
              <span className="text-sm text-slate-500 font-medium">No tienes tareas programadas para esta fecha.</span>
            </div>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8 text-sm text-slate-500 font-medium">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1a1e47]"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span className="bg-slate-100 dark:bg-[#0c0e21] px-3 py-1 rounded-lg border border-slate-200 dark:border-[#272b5c] font-bold text-slate-700 dark:text-slate-300">
              {currentPage} / {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1a1e47]"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Tareas Atrasadas */}
      <div className="bg-rose-50/40 dark:bg-rose-950/20 backdrop-blur-sm rounded-3xl border border-rose-100 dark:border-rose-900/30 shadow-sm p-5 sm:p-7 relative overflow-hidden group transition-all duration-500 hover:shadow-rose-500/10 hover:border-rose-200 dark:hover:border-rose-800/50">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500 rounded-full blur-[80px] -z-10 opacity-10 translate-x-1/3 -translate-y-1/3"></div>
        
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-rose-200/60 dark:border-rose-900/30">
          <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle size={18} className="drop-shadow-sm" /> Tareas Atrasadas 
            {overdueTasks.length > 0 && (
              <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-400 px-2.5 py-0.5 rounded-full text-xs shadow-sm shadow-rose-500/20">
                {overdueTasks.length}
              </span>
            )}
          </h3>
        </div>
        
        <div className="flex flex-col">
          {overdueTasks.length > 0 ? (
            overdueTasks.map(task => (
              <DailyFocusTaskRow 
                key={task.id}
                task={task}
                isOverdue={true}
                highlightedTaskKey={highlightedTaskKey}
                handleToggleDone={handleToggleDone}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">¡Excelente! No tienes tareas atrasadas.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
