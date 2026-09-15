import React from 'react';

const AgingTable = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <h3 className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Work Aging (Trabajo Estancado)</h3>
        <p className="text-slate-500 text-sm">No hay trabajo activo para analizar su antigüedad.</p>
      </div>
    );
  }

  // Tomamos el top 5 para no saturar la vista si hay muchos
  const displayData = data.slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-700 dark:text-slate-300 font-semibold">Work Aging (Trabajo Estancado)</h3>
        <span className="text-xs text-slate-500">Top 5 más antiguos</span>
      </div>
      
      <div className="space-y-3">
        {displayData.map(item => (
          <div key={item.issue_key} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/50 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <a 
                  href={`https://mchav.atlassian.net/browse/${item.issue_key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-indigo-400 hover:underline"
                >
                  {item.issue_key}
                </a>
                <span className="text-xs text-slate-500 dark:text-slate-300 mt-1 line-clamp-1">{item.title}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-rose-400">{item.aging_days}d</span>
                <span className="text-[10px] uppercase text-slate-500">Edad Actual</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {item.assignee}
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 rounded">{item.state}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgingTable;
