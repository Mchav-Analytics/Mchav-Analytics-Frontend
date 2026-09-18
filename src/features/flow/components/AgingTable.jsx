import React from 'react';
import { Clock, User, Folder } from 'lucide-react';

const AgingTable = ({ data }) => {
  const itemsList = (data || []).slice(0, 5);

  return (
    <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4 transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            Work Aging (Trabajo Estancado)
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-400">Top 5 más antiguas</span>
      </div>

      <div className="space-y-3">
        {itemsList.map((item) => (
          <div 
            key={item.issue_key} 
            className="p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                <a 
                  href={`https://mchav.atlassian.net/browse/${item.issue_key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {item.issue_key}
                </a>
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title={item.title}>
                {item.title}
              </p>
              <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <User size={12} className="text-slate-400" />
                  {item.assignee || 'Sin Asignar'}
                </span>
                <span className="flex items-center gap-1">
                  <Folder size={12} className="text-slate-400" />
                  {item.state || 'En curso'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 pl-2">
              <span className="text-base sm:text-lg font-black text-rose-500 leading-none">
                {item.aging_days}d
              </span>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">
                EDAD ACTUAL
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgingTable;
