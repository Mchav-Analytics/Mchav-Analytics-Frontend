import React from 'react';
import { Activity, ShieldAlert, TrendingDown, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { InfoTooltip } from './CapacityShared';

export default function CapacityResults({ results }) {
  const {
    theoreticalDays,
    netDays,
    standardCapacitySP,
    adjustedCapacitySP,
    spDiff,
    spDiffPct,
    impactPct,
    impactBadgeText,
    impactBadgeStyle,
    barColor,
    diagnosticText
  } = results;

  const lostDays = theoreticalDays - netDays;

  return (
    <div className="space-y-4 py-2">
      
      {/* CABECERA CON TOOLTIP PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
            <Activity size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              RESUMEN EJECUTIVO Y DIAGNÓSTICO DE CAPACIDAD
              <InfoTooltip text="Métricas calculadas en tiempo real para determinar el compromiso óptimo en Story Points para el Sprint." align="left" />
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Comparativa entre la capacidad teórica sin ausencias y la capacidad neta disponible tras incapacidades.
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs shrink-0 flex items-center gap-1.5 ${impactBadgeStyle}`}>
          {impactPct >= 30 ? <ShieldAlert size={14} /> : impactPct >= 15 ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
          <span>{impactBadgeText}</span>
        </span>
      </div>

      {/* BLOQUE DE 3 KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* KPI 1: CAPACIDAD BRUTA TEÓRICA */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center">
              Capacidad Bruta Teórica
              <InfoTooltip text="Capacidad del 100% de los desarrolladores trabajando todos los días laborables del sprint sin imprevistos ni bajas." />
            </span>
            <span className="text-[10px] text-slate-400">100% Máx</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">{standardCapacitySP} SP</span>
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">{theoreticalDays} días-persona</span>
          </div>
        </div>

        {/* KPI 2: PÉRDIDA POR AUSENCIAS */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-rose-300 dark:border-rose-800 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-rose-700 dark:text-rose-300">
            <span className="flex items-center">
              Pérdida por Ausencias
              <InfoTooltip text="Descuento en Story Points causado por vacaciones planificadas e incapacidades médicas imprevistas." />
            </span>
            <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
              <TrendingDown size={12} /> {spDiffPct}%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-rose-600 dark:text-rose-400">{spDiff} SP</span>
            <span className="text-xs font-extrabold text-rose-700 dark:text-rose-300">-{lostDays} días en baja</span>
          </div>
        </div>

        {/* KPI 3: CAPACIDAD NETA DISPONIBLE */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-300 dark:border-emerald-800 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center">
              Capacidad Neta Real
              <InfoTooltip text="Capacidad efectiva máxima sugerida para planificar historias en este Sprint." />
            </span>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">Objetivo Real</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">{adjustedCapacitySP} SP</span>
            <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">{netDays} días-persona</span>
          </div>
        </div>

      </div>

      {/* MEDIDOR DE IMPACTO Y DIAGNÓSTICO ESTRATÉGICO */}
      <div className="pt-2 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700 dark:text-slate-300 flex items-center">
            Medidor de Riesgo en la Entrega del Sprint:
            <InfoTooltip text="Indicador visual que pondera el nivel de afectación en la entrega de compromisos." />
          </span>
          <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
            Impacto: {impactPct}%
          </span>
        </div>

        {/* BARRA DE PROGRESO CON GRADIENTE */}
        <div className="h-3.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-300/50 dark:border-slate-700/50">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${barColor} shadow-xs`}
            style={{ width: `${Math.max(6, Math.min(100, impactPct))}%` }}
          />
        </div>

        {/* MENSAJE DE DIAGNÓSTICO */}
        <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed pt-1 flex items-start gap-1.5">
          <span className="flex-1">{diagnosticText}</span>
          <InfoTooltip text="Recomendación estratégica para la reunión de planificación o ajuste de alcance del sprint." align="right" />
        </p>
      </div>

    </div>
  );
}
