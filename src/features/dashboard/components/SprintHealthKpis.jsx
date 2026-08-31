import React from 'react';
import { Target, AlertTriangle, Layers, Zap, ShieldAlert } from 'lucide-react';
import { MetricInfoTooltip } from './ScorecardShared';

export default function SprintHealthKpis({ metrics, warning }) {
  return (
    <>
      {/* BANNER DESTACADO DE ADVERTENCIA POR SCOPE CREEP */}
      {warning && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 p-4 rounded-2xl flex items-start gap-3 shadow-sm dark:shadow-lg">
          <ShieldAlert className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={22} />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">{warning.title}</h3>
            <p className="text-xs text-amber-700 dark:text-amber-200/80">{warning.message}</p>
          </div>
        </div>
      )}

      {/* 4 TARJETAS KPIS DE PREDICTIBILIDAD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* KPI 1: CONFIABILIDAD DEL COMPROMISO */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Confiabilidad del Compromiso</span>
              <MetricInfoTooltip text="Mide el porcentaje de Story Points realmente entregados frente a los comprometidos al iniciar el sprint. Es la métrica principal de estabilidad operativa." />
            </div>
            <Target size={18} className="text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{metrics.commitment_reliability_pct || 0}%</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {metrics.sp_completed || 0} SP entregados de {metrics.sp_planned || 0} SP planificados.
          </p>
        </div>

        {/* KPI 2: VARIACIÓN DEL ALCANCE (SCOPE CREEP) */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Variación del Alcance</span>
              <MetricInfoTooltip text="Porcentaje de Story Points añadidos a mitad del sprint después de la planificación inicial. Un valor >15% indica alteraciones o emergencias no previstas." />
            </div>
            <AlertTriangle size={18} className="text-amber-500 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{metrics.scope_creep_pct || 0}%</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            +{metrics.sp_added_mid_sprint || 0} SP añadidos a mitad del sprint.
          </p>
        </div>

        {/* KPI 3: TASA DE INCOMPLETOS (CARRYOVER) */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Tasa de Incompletos (Carryover)</span>
              <MetricInfoTooltip text="Porcentaje de Story Points planificados que no lograron completarse a tiempo y deben ser trasladados (Carryover) al siguiente sprint." />
            </div>
            <Layers size={18} className="text-rose-500 dark:text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{metrics.carryover_pct || 0}%</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {metrics.sp_carryover || 0} SP incompletos que pasan a otro sprint.
          </p>
        </div>

        {/* KPI 4: EFICIENCIA DEL FLUJO */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Eficiencia del Flujo</span>
              <MetricInfoTooltip align="right" text="Proporción del tiempo en que las tareas estuvieron en desarrollo activo (In Progress) vs. el tiempo total incluyendo colas de espera (Review, QA, Bloqueos)." />
            </div>
            <Zap size={18} className="text-cyan-500 dark:text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">{metrics.flow_efficiency_pct || 0}%</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {metrics.active_dev_days || 0}d activos vs {metrics.waiting_queue_days || 0}d en colas.
          </p>
        </div>

      </div>
    </>
  );
}
