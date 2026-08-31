import React from 'react';
import { CheckCircle2, Circle, AlertTriangle } from 'lucide-react';

export default function DailyFocusTaskRow({ 
  task, 
  isOverdue = false, 
  highlightedTaskKey, 
  handleToggleDone 
}) {
  const isDone = task.status === 'FINALIZADO';
  const isHighlighted = task.key === highlightedTaskKey;

  return (
    <div 
      key={task.id} 
      className={`group flex flex-col sm:flex-row sm:items-center justify-between py-3.5 px-4 mb-2 border border-slate-100 dark:border-[#272b5c]/50 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md ${
        isDone ? 'bg-slate-50/50 dark:bg-[#0c0e21]/30 opacity-70' : 'bg-white dark:bg-[#1a1e47]/40 hover:bg-slate-50/80 dark:hover:bg-[#1c204d]/80'
      } ${isHighlighted ? 'ring-2 ring-indigo-500 shadow-indigo-500/20 animate-pulse' : ''} ${
        isOverdue && !isDone ? 'border-l-4 border-l-rose-500' : ''
      }`}
    >
      <div className="flex items-center gap-4 overflow-hidden min-w-0 flex-1">
        <button 
          onClick={() => handleToggleDone(task)}
          className={`shrink-0 cursor-pointer transition-all duration-300 p-1 rounded-full ${
            isDone 
              ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 scale-110' 
              : 'text-slate-300 dark:text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
          }`}
        >
          {isDone ? <CheckCircle2 size={22} className="drop-shadow-sm" /> : <Circle size={22} />}
        </button>
        
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={`text-xs font-mono font-bold shrink-0 px-2 py-0.5 rounded-md ${
              isDone 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 line-through' 
                : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
            }`}>
              {task.key}
            </span>
            {isOverdue && !isDone && (
              <span className="text-[10px] font-extrabold tracking-wide text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/50 flex items-center gap-1 shadow-sm">
                <AlertTriangle size={10} /> ATRASADA
              </span>
            )}
          </div>
          <span className={`text-sm sm:text-[15px] truncate ${isDone ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-100 font-bold'}`}>
            {task.text}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-11 sm:pl-4 mt-2 sm:mt-0">
        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border shadow-xs ${
          task.priority === 'Crítica' || task.priority === 'Critical' || task.priority === 'Highest' 
            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40' : 
          task.priority === 'Alta' || task.priority === 'High' 
            ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/40' : 
          'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700'
        }`}>
          {task.priority}
        </div>
        <div 
          className="flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-800 dark:text-indigo-300 font-mono font-black w-8 h-8 rounded-xl text-xs shadow-sm border border-indigo-200/50 dark:border-indigo-800/50"
          title={`${task.sp} Story Points`}
        >
          {task.sp}
        </div>
      </div>
    </div>
  );
}
