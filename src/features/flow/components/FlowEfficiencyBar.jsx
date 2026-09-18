import React from 'react';
import { ShoppingBag, Clock, Info } from 'lucide-react';

const FlowEfficiencyBar = ({ active_pct, waiting_pct, blocked_pct, total_days, activePct, waitingPct, blockedPct, totalDays, trendPct = 0 }) => {
  const active = Math.round(active_pct ?? activePct ?? 0);
  const waiting = Math.round(waiting_pct ?? waitingPct ?? 0);
  const blocked = Math.round(blocked_pct ?? blockedPct ?? 0);
  const days = parseFloat(total_days ?? totalDays ?? 0).toFixed(1);

  return (
    <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4 transition-all h-full flex flex-col justify-between">
      {/* CABECERA */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-indigo-500 shrink-0" />
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Eficiencia del Flujo</span>
              <Info size={14} className="text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors" />
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mt-0.5">
            % Activo
          </span>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">
            <Clock size={13} className="text-indigo-500 shrink-0" />
            <span>Tiempo total del flujo</span>
          </div>
          <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none">
            {days} días
          </span>
          <span className="mt-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 whitespace-nowrap">
            ↓ {trendPct}% vs. sprint anterior
          </span>
        </div>
      </div>

      {/* CONTENEDOR DE BARRA Y LEYENDA DINÁMICA */}
      <div className="space-y-3 my-2">
        {/* BARRA DE PROGRESO SEGMENTADA */}
        <div className="w-full h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
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
        </div>

        {/* LEYENDA POSICIONADA DINÁMICAMENTE DEBAJO DE CADA SEGMENTO */}
        <div className="w-full flex relative pt-2">
          {/* SEGMENTO ACTIVO */}
          <div 
            style={{ width: `${active}%` }} 
            className="flex flex-col items-center justify-start text-center px-1 min-w-[75px]"
          >
            <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center gap-1.5 text-[11px] whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 inline-block"></span>
              Activo (%)
            </span>
            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1">{active}%</span>
          </div>

          {/* SEGMENTO ESPERA */}
          <div 
            style={{ width: `${waiting}%` }} 
            className="flex flex-col items-center justify-start text-center px-1 min-w-[75px]"
          >
            <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center gap-1.5 text-[11px] whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 inline-block"></span>
              Espera (%)
            </span>
            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1">{waiting}%</span>
          </div>

          {/* SEGMENTO BLOQUEADO */}
          <div 
            style={{ width: `${blocked}%` }} 
            className="flex flex-col items-center justify-start text-center px-1 min-w-[75px]"
          >
            <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center gap-1.5 text-[11px] whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 inline-block"></span>
              Bloqueado (%)
            </span>
            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1">{blocked}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowEfficiencyBar;
