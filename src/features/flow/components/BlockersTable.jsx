import React from 'react';
import { AlertCircle } from 'lucide-react';

const BlockersTable = ({ data = [] }) => {
  const blockersCount = data ? data.length : 0;

  return (
    <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Blockers Activos
            </h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              {blockersCount === 0 ? 'No hay trabajo actualmente bloqueado.' : `Hay ${blockersCount} elementos bloqueados.`}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shrink-0">
          {blockersCount} activos
        </span>
      </div>

      {blockersCount > 0 && (
        <div className="mt-4 overflow-x-auto border-t border-slate-100 dark:border-slate-800/80 pt-3">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="text-[11px] font-extrabold text-slate-400 uppercase">
              <tr>
                <th className="py-2 px-2">Issue</th>
                <th className="py-2 px-2">Responsable</th>
                <th className="py-2 px-2">Estado</th>
                <th className="py-2 px-2 text-rose-500">Duración Bloqueo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {data.map((item) => (
                <tr key={item.issue_key} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 px-2 font-bold text-indigo-600 dark:text-indigo-400">{item.issue_key}</td>
                  <td className="py-2.5 px-2">{item.assignee}</td>
                  <td className="py-2.5 px-2">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
                      {item.state}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-bold text-rose-500">{item.duration_days}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BlockersTable;
