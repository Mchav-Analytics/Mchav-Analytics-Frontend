import React, { useState } from 'react';
import { Target, AlertTriangle, Layers, Zap, ShieldAlert } from 'lucide-react';
import { MetricInfoTooltip } from './ScorecardShared';
import ScopeCreepModal from './ScopeCreepModal';

export default function SprintHealthKpis({ metrics, warning }) {
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);

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

      {/* 6 TARJETAS KPIS DE PREDICTIBILIDAD Y RENDIMIENTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-4">
        
        {/* KPI 1: PREDICTIBILIDAD DEL SPRINT */}
        <div className="group bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-3 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/20">
              <Target size={18} />
            </div>
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                Predictibilidad del Sprint
              </span>
              <MetricInfoTooltip align="left" text="Mide la capacidad del equipo para entregar lo comprometido, diferenciando el plan original del plan ajustado por cambios de alcance a mitad del sprint." />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{metrics.commitment_reliability_pct || 0}%</span>
              {(metrics.sp_added_mid_sprint > 0 || metrics.sp_carryover > 0) && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 animate-pulse">
                  PLAN ALTERADO
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight space-y-1 bg-slate-50 dark:bg-[#20244f] p-2.5 rounded-xl border border-slate-100 dark:border-[#33376b]">
              <div className="flex justify-between items-center">
                <span className="opacity-80">Plan inicial:</span>
                <span className="font-bold">{metrics.sp_initial_commitment || 0} SP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-80">Plan ajustado:</span>
                <span className="font-bold">{metrics.sp_adjusted_commitment || 0} SP</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-600/50 pt-1.5 mt-1">
                <span className="opacity-80">Terminados:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{metrics.sp_completed || 0} SP</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 2: VARIACIÓN DEL ALCANCE (SCOPE CREEP) */}
        <div 
          className="group bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-3 flex flex-col justify-between cursor-pointer hover:border-amber-400/50 dark:hover:border-amber-500/50 transition-colors relative overflow-hidden"
          onClick={() => setIsScopeModalOpen(true)}
        >
          {/* Indicador sutil de clic */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] font-bold text-amber-600/60 dark:text-amber-400/60 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-500/20">VER DETALLE</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-500/20">
              <AlertTriangle size={18} />
            </div>
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                Variación del Alcance
              </span>
              <MetricInfoTooltip align="left" text="Porcentaje de Story Points añadidos a mitad del sprint después de la planificación inicial. Haz clic para ver la auditoría de cambios (Agregados y Retirados)." />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{metrics.scope_creep_pct || 0}%</span>
            </div>
            {/* GRID COMPACTO 2x2 PARA NO SATURAR LA TARJETA */}
            <div className="grid grid-cols-2 gap-1.5 text-[10.5px] text-slate-600 dark:text-slate-300 leading-tight bg-slate-50 dark:bg-[#20244f] p-2 rounded-xl border border-slate-100 dark:border-[#33376b] group-hover:bg-amber-50 dark:group-hover:bg-amber-900/10 transition-colors">
              <div className="flex flex-col">
                <span className="opacity-70 uppercase text-[9px] tracking-wider">Agregados</span>
                <span className="font-bold text-rose-500">+{metrics.sp_added_mid_sprint || 0} SP</span>
              </div>
              <div className="flex flex-col">
                <span className="opacity-70 uppercase text-[9px] tracking-wider">Retirados</span>
                <span className="font-bold text-emerald-500">-{metrics.sp_removed_mid_sprint || 0} SP</span>
              </div>
              <div className="flex flex-col border-t border-slate-200 dark:border-slate-700/50 pt-1.5">
                <span className="opacity-70 uppercase text-[9px] tracking-wider">Neto</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{((metrics.sp_added_mid_sprint || 0) - (metrics.sp_removed_mid_sprint || 0)) > 0 ? '+' : ''}{(metrics.sp_added_mid_sprint || 0) - (metrics.sp_removed_mid_sprint || 0)} SP</span>
              </div>
              <div className="flex flex-col border-t border-slate-200 dark:border-slate-700/50 pt-1.5">
                <span className="opacity-70 uppercase text-[9px] tracking-wider">Interrupciones</span>
                <span className="font-bold">{metrics.tickets_changed || 0} tickets</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3: TASA DE INCOMPLETOS (CARRYOVER) */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-3 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
              <Layers size={18} />
            </div>
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                Tasa de Incompletos
              </span>
              <MetricInfoTooltip align="right" text="Porcentaje de Story Points planificados que no lograron completarse a tiempo y deben ser trasladados (Carryover) al siguiente sprint." />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{metrics.carryover_pct || 0}%</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {metrics.sp_carryover || 0} SP incompletos que pasan a otro sprint.
            </p>
          </div>
        </div>

        {/* KPI 4: EFICIENCIA DEL FLUJO */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-3 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
              <Zap size={18} />
            </div>
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                Eficiencia del Flujo
              </span>
              <MetricInfoTooltip align="right" text="Proporción del tiempo en que las tareas estuvieron en desarrollo activo (In Progress) vs. el tiempo total incluyendo colas de espera (Review, QA, Bloqueos)." />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">{metrics.flow_efficiency_pct || 0}%</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {metrics.active_dev_days || 0}d activos vs {metrics.waiting_queue_days || 0}d en colas.
            </p>
          </div>
        </div>

        {/* KPI 5: RIESGO DEL SPRINT */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-3 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                Nivel de Riesgo
              </span>
              <MetricInfoTooltip align="right" text="Evaluación de riesgo basada en alcance, bloqueos y tiempo restante." />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">
                {metrics.risk_level || 'MEDIO'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {metrics.risk_factors || 'Impactado por Scope Creep y Bloqueos.'}
            </p>
          </div>
        </div>

        {/* KPI 6: THROUGHPUT (VELOCIDAD) */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-3 flex flex-col justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
              <Target size={18} />
            </div>
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                Throughput (Entregas)
              </span>
              <MetricInfoTooltip align="right" text="Cantidad de incidencias completadas en el sprint." />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {metrics.throughput || 0}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Tickets</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Promedio de {metrics.throughput_avg || 0} por sprint histórico.
            </p>
          </div>
        </div>

      </div>
      
      {/* MODAL DE AUDITORÍA DE SCOPE CREEP */}
      <ScopeCreepModal 
        isOpen={isScopeModalOpen}
        onClose={() => setIsScopeModalOpen(false)}
        sprintId={metrics.id_sprint}
        projectId={metrics.id_proyecto}
      />
    </>
  );
}
