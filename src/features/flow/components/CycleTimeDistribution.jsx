import React from 'react';

const CycleTimeDistribution = ({ data }) => {
  if (!data || data.count === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex items-center justify-center h-48">
        <span className="text-slate-500">No hay datos suficientes de tickets completados</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-slate-700 dark:text-slate-300 font-semibold">Cycle Time (Percentiles)</h3>
          <p className="text-xs text-slate-500">Distribución de tiempo de entrega típico</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{data.p85}d</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">El 85% se entrega en este tiempo o menos</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-center border border-slate-200 dark:border-slate-700/50">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">P50 (Típico)</div>
          <div className="text-lg font-bold text-indigo-400">{data.p50}d</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-center border border-slate-200 dark:border-slate-700/50">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">P75</div>
          <div className="text-lg font-bold text-blue-400">{data.p75}d</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-center border border-slate-200 dark:border-slate-700/50 ring-1 ring-emerald-500/30">
          <div className="text-xs text-emerald-400 mb-1 font-semibold">P85 (Compromiso)</div>
          <div className="text-lg font-bold text-emerald-400">{data.p85}d</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-center border border-slate-200 dark:border-slate-700/50">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">P95 (Casos Extremos)</div>
          <div className="text-lg font-bold text-rose-400">{data.p95}d</div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 text-xs text-slate-500 text-center">
        Basado en {data.count} tickets completados
      </div>
    </div>
  );
};

export default CycleTimeDistribution;
