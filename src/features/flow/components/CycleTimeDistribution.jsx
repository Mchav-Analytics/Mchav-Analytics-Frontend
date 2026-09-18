import React from 'react';
import { Clock, ChevronDown, Info } from 'lucide-react';

const CycleTimeDistribution = ({ data }) => {
  const p50 = data?.p50 ?? 0;
  const p75 = data?.p75 ?? 0;
  const p85Commit = data?.p85 ?? 0;
  const p95Extreme = data?.p95Extreme ?? data?.p95 ?? 0;
  const count = data?.count ?? 0;

  return (
    <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4 transition-all h-full flex flex-col justify-between">
      {/* CABECERA */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1 cursor-pointer">
              <span>Cycle Time (Percentiles)</span>
              <ChevronDown size={14} className="text-slate-400" />
            </h3>
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Distribución de tiempo de entrega típico
          </p>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none">
            P75 · {p75}d
          </span>
          <span className="mt-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 whitespace-nowrap">
            ↓ 12% vs. sprint anterior
          </span>
        </div>
      </div>

      {/* TARJETAS DE PERCENTILES (4 COLUMNAS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-2">
        {/* P50 */}
        <div className="bg-slate-50/80 dark:bg-slate-900/60 p-2.5 sm:p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 text-center space-y-1">
          <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
            <span>P50 (Típico)</span>
            <div className="relative group/tooltip inline-flex items-center">
              <Info size={11} className="text-slate-400 cursor-pointer hover:text-blue-500 transition-colors" />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:flex flex-col items-center z-50 pointer-events-none w-48">
                <div className="bg-slate-900 dark:bg-slate-800 text-white text-[10.5px] font-medium leading-snug p-2 rounded-xl shadow-xl text-center border border-slate-700/80 whitespace-normal">
                  El 50% de los tickets se completan en este tiempo o menos (mediana).
                </div>
                <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 -mt-1 border-r border-b border-slate-700/80"></div>
              </div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400">{p50}d</div>
        </div>

        {/* P75 */}
        <div className="bg-slate-50/80 dark:bg-slate-900/60 p-2.5 sm:p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 text-center space-y-1">
          <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
            <span>P75</span>
            <div className="relative group/tooltip inline-flex items-center">
              <Info size={11} className="text-slate-400 cursor-pointer hover:text-blue-500 transition-colors" />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:flex flex-col items-center z-50 pointer-events-none w-48">
                <div className="bg-slate-900 dark:bg-slate-800 text-white text-[10.5px] font-medium leading-snug p-2 rounded-xl shadow-xl text-center border border-slate-700/80 whitespace-normal">
                  El 75% de los tickets se completan dentro de este tiempo.
                </div>
                <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 -mt-1 border-r border-b border-slate-700/80"></div>
              </div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400">{p75}d</div>
        </div>

        {/* P85 (Compromiso) */}
        <div className="bg-emerald-50/60 dark:bg-emerald-500/10 p-2.5 sm:p-3 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 text-center space-y-1">
          <div className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
            <span>P85 (Compromiso)</span>
            <div className="relative group/tooltip inline-flex items-center">
              <Info size={11} className="text-emerald-500/70 cursor-pointer hover:text-emerald-600 transition-colors" />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:flex flex-col items-center z-50 pointer-events-none w-52">
                <div className="bg-slate-900 dark:bg-slate-800 text-white text-[10.5px] font-medium leading-snug p-2 rounded-xl shadow-xl text-center border border-slate-700/80 whitespace-normal">
                  Nivel recomendado para compromisos de entrega y SLA con el equipo (85% previsibilidad).
                </div>
                <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 -mt-1 border-r border-b border-slate-700/80"></div>
              </div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">{p85Commit}d</div>
        </div>

        {/* P95 (Casos Extremos) */}
        <div className="bg-rose-50/60 dark:bg-rose-500/10 p-2.5 sm:p-3 rounded-2xl border border-rose-200 dark:border-rose-500/30 text-center space-y-1">
          <div className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
            <span>P95 (Casos Extremos)</span>
            <div className="relative group/tooltip inline-flex items-center">
              <Info size={11} className="text-rose-400 cursor-pointer hover:text-rose-600 transition-colors" />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:flex flex-col items-center z-50 pointer-events-none w-52">
                <div className="bg-slate-900 dark:bg-slate-800 text-white text-[10.5px] font-medium leading-snug p-2 rounded-xl shadow-xl text-center border border-slate-700/80 whitespace-normal">
                  Tiempo límite para el 95% de las tareas. Muestra casos anómalos o bloqueos severos.
                </div>
                <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45 -mt-1 border-r border-b border-slate-700/80"></div>
              </div>
            </div>
          </div>
          <div className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400">{p95Extreme}d</div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-slate-400 dark:text-slate-500 text-left">
        Basado en {count} tickets completados
      </div>
    </div>
  );
};

export default CycleTimeDistribution;
