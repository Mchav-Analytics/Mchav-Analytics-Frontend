import React from 'react';

const FlowEfficiencyBar = ({ activePct, waitingPct, blockedPct, totalDays }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
      <h3 className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Flow Efficiency</h3>
      <div className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        {activePct}% <span className="text-sm font-normal text-slate-500">Activo</span>
      </div>
      
      <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex mb-3">
        <div 
          className="h-full bg-emerald-500" 
          style={{ width: `${activePct}%` }}
          title={`Activo: ${activePct}%`}
        />
        <div 
          className="h-full bg-amber-500" 
          style={{ width: `${waitingPct}%` }}
          title={`En Espera: ${waitingPct}%`}
        />
        <div 
          className="h-full bg-rose-500" 
          style={{ width: `${blockedPct}%` }}
          title={`Bloqueado: ${blockedPct}%`}
        />
      </div>
      
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          Activo ({activePct}%)
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          Espera ({waitingPct}%)
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
          Bloqueado ({blockedPct}%)
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
        Tiempo Total del Flujo: <span className="font-semibold text-slate-900 dark:text-white">{totalDays} días</span>
      </div>
    </div>
  );
};

export default FlowEfficiencyBar;
