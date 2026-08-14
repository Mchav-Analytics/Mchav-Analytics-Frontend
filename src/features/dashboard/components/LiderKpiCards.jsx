import React, { useState } from 'react';
import { Zap, Clock, CheckCircle2, AlertTriangle, TrendingDown, Info } from 'lucide-react';

export default function LiderKpiCards({ kpis }) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Valores predeterminados si no hay datos de la API
  const sprintCompliance = kpis?.sprintCompliance || 0;
  const leadTime = kpis?.leadTime || 0;
  const cycleTime = kpis?.cycleTime || 0;
  const scopeCreep = kpis?.scopeCreep || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Cumplimiento del Sprint */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm relative transition-all hover:border-indigo-500/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cumplimiento del Sprint</span>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'velocity' ? null : 'velocity')}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 cursor-pointer"
            >
              <Info size={12} />
            </button>
          </div>
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Zap size={15} />
          </div>
        </div>

        {activeTooltip === 'velocity' && (
          <div className="mb-2 p-2 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-slate-300 leading-snug">
            Puntos de Historia entregados en relación a la meta del Sprint.
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{sprintCompliance.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(sprintCompliance, 100)}%` }} />
        </div>
      </div>

      {/* KPI 2: Tiempo de Entrega (Lead Time) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm relative transition-all hover:border-cyan-500/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tiempo de Entrega (Lead)</span>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'lead' ? null : 'lead')}
              className="text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 p-0.5 cursor-pointer"
            >
              <Info size={12} />
            </button>
          </div>
          <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Clock size={15} />
          </div>
        </div>

        {activeTooltip === 'lead' && (
          <div className="mb-2 p-2 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-slate-300 leading-snug">
            Días desde la creación de la tarea en Jira hasta su cierre final.
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{leadTime.toFixed(1)} días</span>
        </div>
        <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-500 font-semibold flex items-center gap-1">
          <TrendingDown size={13} /> Tendencia histórica
        </div>
      </div>

      {/* KPI 3: Tiempo de Desarrollo (Cycle Time) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm relative transition-all hover:border-purple-500/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tiempo de Desarrollo (Cycle)</span>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'cycle' ? null : 'cycle')}
              className="text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 p-0.5 cursor-pointer"
            >
              <Info size={12} />
            </button>
          </div>
          <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <CheckCircle2 size={15} />
          </div>
        </div>

        {activeTooltip === 'cycle' && (
          <div className="mb-2 p-2 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-slate-300 leading-snug">
            Días de trabajo activo desde <i>En Progreso</i> hasta su resolución.
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{cycleTime.toFixed(1)} días</span>
        </div>
      </div>

      {/* KPI 4: Cambio de Alcance (Scope Creep) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm relative transition-all hover:border-amber-500/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cambio de Alcance</span>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'scope' ? null : 'scope')}
              className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 p-0.5 cursor-pointer"
            >
              <Info size={12} />
            </button>
          </div>
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle size={15} />
          </div>
        </div>

        {activeTooltip === 'scope' && (
          <div className="mb-2 p-2 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-slate-300 leading-snug">
            Puntos agregados al Sprint posterior al compromiso inicial.
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{scopeCreep}%</span>
        </div>
      </div>
    </div>
  );
}
