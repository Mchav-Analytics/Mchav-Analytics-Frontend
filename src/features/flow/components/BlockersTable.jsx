import React from 'react';

const BlockersTable = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <h3 className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Blockers Activos</h3>
        <p className="text-slate-500 text-sm">No hay trabajo actualmente bloqueado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col h-full">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h3 className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Blockers Activos
        </h3>
        <span className="px-2 py-1 bg-rose-500/20 text-rose-400 text-xs font-semibold rounded">
          {data.length} tickets
        </span>
      </div>
      
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Issue</th>
              <th className="px-4 py-3 font-medium">Responsable</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-rose-400">Duración Bloqueo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {data.map((item) => (
              <tr key={item.issue_key} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <a 
                      href={`https://mchav.atlassian.net/browse/${item.issue_key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-indigo-400 hover:underline"
                    >
                      {item.issue_key}
                    </a>
                    <span className="text-xs text-slate-500 dark:text-slate-300 mt-0.5 line-clamp-1" title={item.title}>
                      {item.title}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">{item.assignee}</td>
                <td className="px-4 py-3">
                  <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 text-xs rounded border dark:border-rose-800/50">
                    {item.state}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-rose-400">
                  {item.duration_days}d
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlockersTable;
