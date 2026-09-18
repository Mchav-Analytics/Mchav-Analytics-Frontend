import React, { useState } from 'react';
import { Target, AlertTriangle, Layers, Zap, ShieldAlert, BarChart2 } from 'lucide-react';
import { MetricInfoTooltip } from './ScorecardShared';
import ScopeCreepModal from './ScopeCreepModal';

export default function SprintHealthKpis({ 
  metrics = {}, 
  warning,
  sprints = [],
  selectedSprintId,
  setSelectedSprintId 
}) {
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);

  return (
    <>
      {/* BANNER DESTACADO DE ADVERTENCIA POR SCOPE CREEP */}
      {warning && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 p-4 rounded-2xl flex items-start gap-3 shadow-sm dark:shadow-lg mb-4">
          <ShieldAlert className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={22} />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">{warning.title}</h3>
            <p className="text-xs text-amber-700 dark:text-amber-200/80">{warning.message}</p>
          </div>
        </div>
      )}

      {/* SECCIÓN RESUMEN DE RENDIMIENTO DE TODOS LOS PROYECTOS */}
      <div className="w-full space-y-4 font-sans text-left">
        
        {/* ENCABEZADO SUPERIOR CON SELECTOR DE SPRINTS A LA DERECHA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100/80 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100/80 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/40 shrink-0">
              <BarChart2 size={18} />
            </div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Resumen de rendimiento (todos los proyectos)
              </h2>
              <MetricInfoTooltip align="left" text="Resumen consolidado de métricas de rendimiento, predictibilidad, variaciones de alcance, incompletos y entregas del equipo." />
            </div>
          </div>

          {/* SELECTOR DE SPRINT A LA DERECHA */}
          {sprints && sprints.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#12142e] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#33376b] shrink-0">
              <Layers size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
              <select
                value={selectedSprintId || ''}
                onChange={(e) => setSelectedSprintId && setSelectedSprintId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer pr-1"
              >
                {sprints.map((s) => (
                  <option key={s.id_sprint} value={s.id_sprint} className="bg-white dark:bg-[#141738] text-slate-800 dark:text-white font-bold">
                    {s.nombre || s.nombre_sprint || s.id_sprint}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* KPIS REORGANIZADOS: 2 TARJETAS ARRIBA (PREDICTIBILIDAD Y ALCANCE) Y 3 TARJETAS ABAJO (INCOMPLETOS, RIESGO Y THROUGHPUT) */}
        <div className="space-y-4">
          {/* FILA SUPERIOR: 2 TARJETAS PRINCIPALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* KPI 1: PREDICTIBILIDAD DEL SPRINT */}
            <div className="p-4 rounded-2xl bg-[#f4fbf7] dark:bg-emerald-950/20 border border-emerald-100/80 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700 flex flex-col justify-between space-y-3 shadow-sm shadow-emerald-500/10 hover:shadow-md hover:shadow-emerald-500/20 transition-all h-full">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 shadow-xs">
                  <Target size={15} />
                </div>
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 truncate">
                    Predictibilidad del Sprint
                  </span>
                  <MetricInfoTooltip align="left" text="Mide la capacidad del equipo para entregar lo comprometido." />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 flex-1 mt-1">
                <div className="flex flex-col space-y-1 shrink-0">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {metrics.commitment_reliability_pct || 0}%
                  </span>
                  {(metrics.sp_added_mid_sprint > 0 || metrics.sp_carryover > 0) && (
                    <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40 w-max">
                      PLAN ALTERADO
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 text-xs text-slate-700 dark:text-slate-200 leading-tight space-y-1.5 bg-white/90 dark:bg-slate-900/70 p-3 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                  <div className="flex justify-between items-center gap-1.5">
                    <span className="opacity-75 text-[11px] font-medium truncate">Plan inicial:</span>
                    <span className="font-bold text-[12px] shrink-0">{metrics.sp_initial_commitment || 0} SP</span>
                  </div>
                  <div className="flex justify-between items-center gap-1.5">
                    <span className="opacity-75 text-[11px] font-medium truncate">Plan ajustado:</span>
                    <span className="font-bold text-[12px] shrink-0">{metrics.sp_adjusted_commitment || 0} SP</span>
                  </div>
                  <div className="flex justify-between items-center gap-1.5 border-t border-slate-200/80 dark:border-slate-800 pt-1 mt-0.5">
                    <span className="opacity-75 text-[11px] font-medium truncate">Terminados:</span>
                    <span className="font-bold text-[12px] text-emerald-600 dark:text-emerald-400 shrink-0">{metrics.sp_completed || 0} SP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI 2: VARIACIÓN DEL ALCANCE (ESTILO CELESTE / SKY) */}
            <div 
              className="p-4 rounded-2xl bg-[#f4f9fd] dark:bg-sky-950/20 border border-sky-100/80 dark:border-sky-900/30 hover:border-sky-300 dark:hover:border-sky-700 flex flex-col justify-between space-y-3 shadow-sm shadow-sky-500/10 hover:shadow-md hover:shadow-sky-500/20 cursor-pointer transition-all h-full"
              onClick={() => setIsScopeModalOpen(true)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 font-bold flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle size={15} />
                </div>
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 truncate">
                    Variación del Alcance
                  </span>
                  <MetricInfoTooltip align="left" text="Porcentaje de SP añadidos o retirados. Haz clic para ver el detalle de incidencias." />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 flex-1 mt-1">
                <div className="flex flex-col shrink-0">
                  <span className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
                    {metrics.scope_creep_pct || 0}%
                  </span>
                </div>

                <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-700 dark:text-slate-200 leading-tight bg-white/90 dark:bg-slate-900/70 p-3 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                  <div className="flex flex-col min-w-0">
                    <span className="opacity-75 uppercase text-[9px] tracking-wide font-extrabold truncate">Agregados</span>
                    <span className="font-bold text-rose-500 text-[12px]">+{metrics.sp_added_mid_sprint || 0} SP</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="opacity-75 uppercase text-[9px] tracking-wide font-extrabold truncate">Retirados</span>
                    <span className="font-bold text-emerald-500 text-[12px]">-{metrics.sp_removed_mid_sprint || 0} SP</span>
                  </div>
                  <div className="flex flex-col min-w-0 border-t border-slate-200/80 dark:border-slate-800 pt-1 mt-0.5">
                    <span className="opacity-75 uppercase text-[9px] tracking-wide font-extrabold truncate">Neto</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400 text-[12px]">
                      {((metrics.sp_added_mid_sprint || 0) - (metrics.sp_removed_mid_sprint || 0)) > 0 ? '+' : ''}
                      {(metrics.sp_added_mid_sprint || 0) - (metrics.sp_removed_mid_sprint || 0)} SP
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0 border-t border-slate-200/80 dark:border-slate-800 pt-1 mt-0.5">
                    <span className="opacity-75 uppercase text-[9px] tracking-wide font-extrabold truncate" title="Interrupciones">Interrupciones</span>
                    <span className="font-bold text-slate-900 dark:text-white text-[12px]">{metrics.tickets_changed || 0} tks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FILA INFERIOR: 3 TARJETAS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* KPI 3: TASA DE INCOMPLETOS */}
            <div className="p-4 rounded-2xl bg-[#fff5f6] dark:bg-rose-950/20 border border-rose-100/80 dark:border-rose-900/30 hover:border-rose-300 dark:hover:border-rose-700 flex flex-col justify-between space-y-3 shadow-sm shadow-rose-500/10 hover:shadow-md hover:shadow-rose-500/20 transition-all h-full">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center shrink-0 shadow-xs">
                  <Layers size={15} />
                </div>
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 truncate">
                    Tasa de Incompletos
                  </span>
                  <MetricInfoTooltip align="right" text="Porcentaje de Story Points no entregados a tiempo." />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                    {metrics.carryover_pct || 0}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                  {metrics.sp_carryover || 0} SP Incompletos que pasan a otro sprint.
                </p>
              </div>
            </div>

            {/* KPI 4: NIVEL DE RIESGO */}
            <div className="p-4 rounded-2xl bg-[#fff8f3] dark:bg-orange-950/20 border border-orange-100/80 dark:border-orange-900/30 hover:border-orange-300 dark:hover:border-orange-700 flex flex-col justify-between space-y-3 shadow-sm shadow-orange-500/10 hover:shadow-md hover:shadow-orange-500/20 transition-all h-full">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldAlert size={15} />
                </div>
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 truncate">
                    Nivel de Riesgo
                  </span>
                  <MetricInfoTooltip align="right" text="Evaluación de riesgo basada en alcance y tiempo." />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                    {metrics.risk_level || 'MEDIO'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                  {metrics.risk_factors || 'Impactado por Scope Creep y Bloqueos.'}
                </p>
              </div>
            </div>

            {/* KPI 5: THROUGHPUT (ENTREGAS) */}
            <div className="p-4 rounded-2xl bg-[#f8f6ff] dark:bg-purple-950/20 border border-purple-100/80 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 flex flex-col justify-between space-y-3 shadow-sm shadow-purple-500/10 hover:shadow-md hover:shadow-purple-500/20 transition-all h-full">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center shrink-0">
                  <Target size={15} />
                </div>
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 truncate">
                    Throughput (Entregas)
                  </span>
                  <MetricInfoTooltip align="right" text="Cantidad de incidencias completadas en el sprint." />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {metrics.throughput || 0}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Tickets</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                  Promedio de {metrics.throughput_avg || 0} por sprint histórico.
                </p>
              </div>
            </div>
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
