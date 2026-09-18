import React from 'react';
import { Activity, ShieldAlert, TrendingDown, CheckCircle2, AlertTriangle, Info, Zap } from 'lucide-react';
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
  const clampedImpact = Math.min(100, Math.max(0, impactPct));

  // Cálculo del ángulo de rotación de la aguja (-90 deg a +90 deg)
  const needleRotation = -90 + (clampedImpact / 100) * 180;

  return (
    <div className="space-y-5 pt-4 border-t border-slate-100 dark:border-slate-800">
      
      {/* CABECERA DEL MEDIDOR */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            MEDIDOR DE IMPACTO EN LA CAPACIDAD
            <InfoTooltip text="Tacómetro que pondera en tiempo real el nivel de afectación sobre la capacidad de entrega del sprint." align="left" />
          </h4>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shadow-2xs shrink-0 flex items-center gap-1 ${impactBadgeStyle}`}>
          {impactPct >= 30 ? <ShieldAlert size={12} /> : impactPct >= 15 ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
          <span>{impactBadgeText}</span>
        </span>
      </div>

      {/* TACÓMETRO / VELOCÍMETRO SVG */}
      <div className="p-4 rounded-3xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden shadow-2xs">
        
        {/* GRÁFICO SVG SEMICIRCULAR */}
        <div className="w-full max-w-[240px] flex flex-col items-center justify-center">
          <svg viewBox="0 0 200 110" className="w-full h-auto overflow-visible">
            {/* Sombra suave de fondo del arco */}
            <path
              d="M 28 95 A 72 72 0 0 1 172 95"
              fill="none"
              stroke="currentColor"
              strokeWidth="14"
              className="text-slate-200 dark:text-slate-800 opacity-50"
              strokeLinecap="round"
            />

            {/* Segmento 1: Verde (Impacto Manejable <15%) */}
            <path
              d="M 28 95 A 72 72 0 0 1 50.2 44.1"
              fill="none"
              stroke="#10B981"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Segmento 2: Amarillo/Naranja (Impacto Moderado 15-30%) */}
            <path
              d="M 52.8 41.8 A 72 72 0 0 1 82 25"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Segmento 3: Rojo (Impacto Crítico >30%) - Color rojo suavizado para modo oscuro */}
            <path
              d="M 84.8 24.1 A 72 72 0 0 1 172 95"
              fill="none"
              stroke="#DE5454"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Marcas de porcentaje en el borde del tacómetro */}
            <text x="17" y="103" textAnchor="end" fill="#94A3B8" fontSize="8" fontWeight="bold">0%</text>
            <text x="34" y="30" textAnchor="end" fill="#10B981" fontSize="8" fontWeight="bold">15%</text>
            <text x="86" y="12" textAnchor="middle" fill="#F59E0B" fontSize="8" fontWeight="bold">30%</text>
            <text x="183" y="103" textAnchor="start" fill="#DE5454" fontSize="8" fontWeight="bold">100%</text>

            {/* Aguja Giratoria (Needle) */}
            <g transform="translate(100, 95)">
              <g 
                style={{ 
                  transform: `rotate(${needleRotation}deg)`, 
                  transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                }}
              >
                {/* Cuerpo de la aguja */}
                <line x1="0" y1="0" x2="0" y2="-55" stroke="#1E293B" className="dark:stroke-white" strokeWidth="3" strokeLinecap="round" />
                <polygon points="-2.5,-8 0,-57 2.5,-8" fill="#1E293B" className="dark:fill-white" />
                {/* Punta de la aguja destacada */}
                <circle cx="0" cy="-55" r="2.5" fill="#6366F1" />
              </g>

              {/* Centro de pivote de la aguja */}
              <circle cx="0" cy="0" r="5" fill="#1E293B" className="dark:fill-slate-100" />
              <circle cx="0" cy="0" r="2.5" fill="#6366F1" />
            </g>
          </svg>
        </div>

        {/* Valor Central de Capacidad Ajustada (Sin recuadro) */}
        <div className="mt-1 flex flex-col items-center text-center">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {adjustedCapacitySP}
            </span>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">SP</span>
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">
            Capacidad Ajustada
          </span>
        </div>

        {/* Métrica de Impacto Relativo */}
        <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <span>Afectación del Sprint:</span>
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${spDiff < 0 ? 'bg-rose-500/10 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300/90' : 'bg-emerald-500/10 text-emerald-600'}`}>
            {spDiff} SP ({spDiffPct}%)
          </span>
        </div>
      </div>

      {/* TRES TARJETAS RESUMEN DE CAPACIDAD */}
      <div className="grid grid-cols-3 gap-2">
        
        {/* KPI 1: TEÓRICA */}
        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5 shadow-2xs">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Teórica</span>
          <div className="text-sm font-black text-slate-800 dark:text-slate-100">{standardCapacitySP} SP</div>
          <span className="text-[9px] font-bold text-slate-400 block">{theoreticalDays}d-persona</span>
        </div>

        {/* KPI 2: PÉRDIDA */}
        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-rose-200 dark:border-rose-900/40 space-y-0.5 shadow-2xs">
          <span className="text-[9px] font-extrabold text-rose-500 dark:text-rose-400/90 uppercase block">Pérdida</span>
          <div className="text-sm font-black text-rose-600 dark:text-rose-300/90">{spDiff} SP</div>
          <span className="text-[9px] font-bold text-rose-500 dark:text-rose-400/80 block">-{lostDays}d ausente</span>
        </div>

        {/* KPI 3: NETA */}
        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 space-y-0.5 shadow-2xs">
          <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase block">Neta Real</span>
          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">{adjustedCapacitySP} SP</div>
          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 block">{netDays}d útiles</span>
        </div>

      </div>

      {/* DIAGNÓSTICO DE CAPACIDAD */}
      <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-slate-900/80 border border-indigo-100 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed flex items-start gap-2">
        <Zap size={14} className="text-indigo-600 shrink-0 mt-0.5" />
        <span className="flex-1">{diagnosticText}</span>
      </div>

    </div>
  );
}
