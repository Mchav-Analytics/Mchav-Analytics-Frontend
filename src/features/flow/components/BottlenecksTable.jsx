import React from 'react';

const BottlenecksTable = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <h3 className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Cuellos de Botella (Bottlenecks)</h3>
        <p className="text-slate-500 text-sm">No hay datos suficientes para analizar cuellos de botella.</p>
      </div>
    );
  }

  const worstBottleneck = data[0];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col h-full">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-slate-700 dark:text-slate-300 font-semibold">Cuellos de Botella (Bottlenecks)</h3>
        {worstBottleneck && worstBottleneck.p75 > 3 && (
          <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-md">
            <div className="text-xs text-rose-400 font-semibold mb-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              BOTTLENECK DETECTADO: {worstBottleneck.state}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              El estado <span className="font-semibold text-slate-900 dark:text-white">{worstBottleneck.state}</span> concentra el {worstBottleneck.pct_of_total}% del tiempo total de flujo. 
              Los tickets pasan típicamente {worstBottleneck.p50} días allí, pero el 25% de los casos superan los {worstBottleneck.p75} días.
              Actualmente hay {worstBottleneck.current_issues} issues en este estado.
            </p>
          </div>
        )}
      </div>
      
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Promedio</th>
              <th className="px-4 py-3 font-medium text-emerald-400">P50</th>
              <th className="px-4 py-3 font-medium text-amber-400">P75</th>
              <th className="px-4 py-3 font-medium text-rose-400">P95</th>
              <th className="px-4 py-3 font-medium">WIP Actual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {data.map((row, i) => (
              <tr key={row.state} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    {i === 0 && row.p75 > 3 && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
                    {row.state}
                  </div>
                </td>
                <td className="px-4 py-3">{row.avg}d</td>
                <td className="px-4 py-3">{row.p50}d</td>
                <td className="px-4 py-3 text-amber-400/90">{row.p75}d</td>
                <td className="px-4 py-3 text-rose-400/90">{row.p95}d</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${row.current_issues > 5 ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {row.current_issues} issues
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BottlenecksTable;
