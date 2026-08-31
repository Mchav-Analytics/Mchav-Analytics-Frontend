import React from 'react';
import { Activity } from 'lucide-react';
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

  return (
    <div className="rounded-2xl bg-blue-50/50 dark:bg-slate-900/50 border border-blue-100 dark:border-slate-800 p-4.5 space-y-3.5">
      
      {/* PARTE SUPERIOR DE RESULTADO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span className="flex items-center">
              Disponibilidad Neta: {netDays} días-persona <span className="text-slate-500 font-medium ml-1">(de {theoreticalDays} días teóricos)</span>
              <InfoTooltip text="Total de días laborables disponibles en el equipo descontando ausencias planificadas e incapacidades médicas." align="left" />
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center">
            Capacidad Estándar: <strong className="text-slate-700 dark:text-slate-300 ml-1">{standardCapacitySP} SP</strong> ➔ Ajustada por ausencias e incapacidades: <strong className="text-slate-900 dark:text-white ml-1">{adjustedCapacitySP} SP</strong>
            <InfoTooltip text="Capacidad teórica del equipo en Puntos de Historia frente a la capacidad real máxima recomendada." />
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
            {adjustedCapacitySP} SP
          </span>
          {spDiff !== 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 flex items-center" title="Pérdida neta de Puntos de Historia por incapacidades">
              {spDiff > 0 ? `+${spDiff}` : spDiff} SP ({spDiffPct > 0 ? `+${spDiffPct}` : spDiffPct}%)
            </span>
          )}
        </div>
      </div>

      {/* BARRA DEL MEDIDOR DE IMPACTO CON TOOLTIP */}
      <div className="space-y-1.5 pt-1 border-t border-blue-100/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700 dark:text-slate-300 flex items-center">
            Medidor de Impacto en la Capacidad del Sprint:
            <InfoTooltip text="Semáforo de riesgo que clasifica el impacto de la pérdida de capacidad en el cumplimiento de los objetivos." />
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${impactBadgeStyle}`}>
            {impactBadgeText}
          </span>
        </div>

        <div className="h-3 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden relative">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.max(6, Math.min(100, impactPct))}%` }}
          />
        </div>
      </div>

      {/* DESCRIPCIÓN DE DIAGNÓSTICO DE CAPACIDAD CON TOOLTIP */}
      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pt-1 flex items-start">
        <span className="flex-1">{diagnosticText}</span>
        <InfoTooltip text="Recomendación estratégica para la reunión de planificación o ajuste de alcance del sprint." align="right" />
      </p>

    </div>
  );
}
