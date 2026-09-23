import React from 'react';
import { Activity, Clock, Info } from 'lucide-react';

const FlowEfficiencyBar = ({ active_pct, waiting_pct, blocked_pct, total_days, activePct, waitingPct, blockedPct, totalDays, trendPct = 0 }) => {
  const active = Math.round(active_pct ?? activePct ?? 0);
  const waiting = Math.round(waiting_pct ?? waitingPct ?? 0);
  const blocked = Math.round(blocked_pct ?? blockedPct ?? 0);
  const days = parseFloat(total_days ?? totalDays ?? 0).toFixed(1);
  const totalPct = active + waiting + blocked;

  return (
    <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4 transition-all h-full flex flex-col justify-between">
      {/* CABECERA */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Activity className="w-4 h-4 shrink-0" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Eficiencia del Flujo</span>
              <Info size={14} className="text-slate-400 cursor-help hover:text-indigo-500 transition-colors" title="Relación entre tiempo de desarrollo activo y tiempos de espera o bloqueos." />
            </h3>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              {active}% Activo
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Ratio de trabajo neto
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
            <Clock size={13} className="text-indigo-500 shrink-0" />
            <span>Tiempo total de ciclo</span>
          </div>
          <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none">
            {days} días
          </span>
          {trendPct !== 0 && (
            <span className={`mt-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold whitespace-nowrap border ${
              trendPct <= 0 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
            }`}>
              {trendPct <= 0 ? `↓ ${Math.abs(trendPct)}%` : `↑ ${trendPct}%`} vs. sprint anterior
            </span>
          )}
        </div>
      </div>

      {/* CONTENEDOR DE BARRA Y LEYENDA DINÁMICA */}
      <div className="space-y-4 my-2">
        {/* BARRA DE PROGRESO SEGMENTADA */}
        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          {totalPct === 0 ? (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-700/50 flex items-center justify-center text-[10px] font-bold text-slate-400">
              Sin datos de flujo registrados
            </div>
          ) : (
            <>
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${active}%` }}
                title={`Activo: ${active}%`}
              />
              <div 
                className="h-full bg-amber-500 transition-all duration-500" 
                style={{ width: `${waiting}%` }}
                title={`En Espera: ${waiting}%`}
              />
              <div 
                className="h-full bg-rose-500 transition-all duration-500" 
                style={{ width: `${blocked}%` }}
                title={`Bloqueado: ${blocked}%`}
              />
            </>
          )}
        </div>

        {/* TARJETAS RESUMEN DE PROPORCIÓN */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {/* SEGMENTO ACTIVO */}
          <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40">
            <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center gap-1.5 text-[11px] whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 inline-block"></span>
              Activo
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">{active}%</span>
          </div>

          {/* SEGMENTO ESPERA */}
          <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/40">
            <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center gap-1.5 text-[11px] whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 inline-block"></span>
              En Espera
            </span>
            <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 mt-1">{waiting}%</span>
          </div>

          {/* SEGMENTO BLOQUEADO */}
          <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-800/40">
            <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center gap-1.5 text-[11px] whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 inline-block"></span>
              Bloqueado
            </span>
            <span className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 mt-1">{blocked}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowEfficiencyBar;
