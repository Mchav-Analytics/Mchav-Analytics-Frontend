import React, { useState } from 'react';
import { Layers, AlertTriangle, X, CheckCircle2, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import owlMascotImg from '../../../assets/owl_mascot.png';

const BottlenecksTable = ({ data, onOpenAiRecommendations }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tableRows = data || [];
  const worstBottleneck = tableRows.length > 0 ? tableRows[0] : null;

  const handleOpen = () => {
    if (onOpenAiRecommendations) {
      onOpenAiRecommendations(worstBottleneck);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4 transition-all h-full flex flex-col justify-between">
        <div>
          {/* CABECERA */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Cuellos de Botella (Bottlenecks)
              </h3>
            </div>
          </div>

          {/* ALERTA DE BOTTLENECK DETECTADO */}
          {worstBottleneck && (
            <div className="my-3.5 p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                <AlertTriangle size={15} className="shrink-0" />
                <span>BOTTLENECK DETECTADO: {worstBottleneck.state}</span>
              </div>
              <p className="text-[11.5px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                El estado <strong className="font-extrabold text-slate-900 dark:text-white">{worstBottleneck.state}</strong> concentra el {worstBottleneck.pct_of_total || '65.3'}% del tiempo total de flujo. Los tickets pasan típicamente {worstBottleneck.p50} días allí, pero el 25% de los casos superan los {worstBottleneck.p75} días. Actualmente hay {worstBottleneck.current_issues} issues en este estado.
              </p>
            </div>
          )}

          {/* TABLA DE DEGLOSE DE ESTADOS */}
          <div className="overflow-x-auto my-2">
            <table className="w-full text-left text-xs font-medium text-slate-600 dark:text-slate-300">
              <thead>
                <tr className="text-[11px] font-extrabold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800/60">
                  <th className="py-2.5 px-2">ESTADO</th>
                  <th className="py-2.5 px-2">PROMEDIO</th>
                  <th className="py-2.5 px-2 text-emerald-600 dark:text-emerald-400">P50</th>
                  <th className="py-2.5 px-2 text-amber-600 dark:text-amber-400">P75</th>
                  <th className="py-2.5 px-2 text-rose-600 dark:text-rose-400">P95</th>
                  <th className="py-2.5 px-2">WIP ACTUAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
                {tableRows.map((row, i) => (
                  <tr key={row.state} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-2 text-slate-900 dark:text-white font-extrabold flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${row.dotColor || (i === 0 ? 'bg-rose-500' : i === 1 ? 'bg-blue-500' : 'bg-emerald-500')}`} />
                      <span>{row.state}</span>
                    </td>
                    <td className="py-3 px-2 text-slate-700 dark:text-slate-300">{row.avg}d</td>
                    <td className="py-3 px-2 text-slate-700 dark:text-slate-300">{row.p50}d</td>
                    <td className="py-3 px-2 text-amber-600 dark:text-amber-400 font-bold">{row.p75}d</td>
                    <td className="py-3 px-2 text-rose-600 dark:text-rose-400 font-bold">{row.p95}d</td>
                    <td className="py-3 px-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {row.current_issues} issues
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER INSIGHTS BANNER CON BOTÓN CÁPSULA CON MASCOTA NUBI IA */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-slate-900/80 border border-indigo-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src={owlMascotImg} alt="Mascota Nubi IA" className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-indigo-400/30 shadow-xs" />
            <span className="font-black text-xs text-indigo-600 dark:text-indigo-400 border-r border-indigo-200 dark:border-indigo-800/80 pr-2.5 shrink-0">
              Nubi IA
            </span>
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
              El estado Por hacer concentra la mayor parte del tiempo del flujo. Se recomienda revisar y priorizar los tickets en este estado para reducir el tiempo de ciclo.
            </span>
          </div>

          <button 
            type="button"
            onClick={handleOpen}
            className="px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/30 text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-xs self-end sm:self-auto hover:scale-105 active:scale-95"
          >
            <img src={owlMascotImg} alt="Mascota Nubi IA" className="w-4 h-4 rounded-full object-cover shrink-0" />
            <span>Nubi IA</span>
          </button>
        </div>
      </div>

      {/* MODAL DE RECOMENDACIONES DE OPTIMIZACIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#14192b] border border-indigo-100 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 text-left relative overflow-hidden">
            {/* GRADIENTE DECORATIVO */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* CABECERA MODAL */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img src={owlMascotImg} alt="Nubi IA" className="w-9 h-9 rounded-2xl object-cover shrink-0 shadow-sm border border-indigo-200 dark:border-indigo-500/30" />
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    Recomendaciones de Optimización de Flujo
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    Diagnóstico NUBI IA para el estado <strong className="text-rose-500">{worstBottleneck?.state || 'Por hacer'}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* DIAGNÓSTICO GENERAL */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-2.5">
              <ShieldAlert size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                Se identificó que el <strong>65.3%</strong> de la duración del ciclo se desperdicia en la cola de espera previa al desarrollo. A continuación se presentan las mejores prácticas recomendadas:
              </p>
            </div>

            {/* LISTA DE ACCIONES RECOMENDADAS */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
                <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400">
                  <CheckCircle2 size={15} />
                  <span>1. Establecer Límites de WIP (Work in Progress)</span>
                </div>
                <p className="text-[11.5px] text-slate-600 dark:text-slate-300 font-medium pl-5">
                  Restringir el número máximo de tareas en paralelo a 3 tickets por desarrollador para evitar cuellos de botella masivos en la cola.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
                <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400">
                  <CheckCircle2 size={15} />
                  <span>2. Refinamiento y Criterios de Aceptación Listos</span>
                </div>
                <p className="text-[11.5px] text-slate-600 dark:text-slate-300 font-medium pl-5">
                  Garantizar que únicamente los tickets con historias refinadas y estimaciones claras pasen al estado activo del sprint.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-1">
                <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400">
                  <CheckCircle2 size={15} />
                  <span>3. Reasignación Dinámica durante la Daily Standup</span>
                </div>
                <p className="text-[11.5px] text-slate-600 dark:text-slate-300 font-medium pl-5">
                  Identificar tickets estancados (*Work Aging* &gt; 5 días) y reasignar pares para desatorar la cola de trabajo.
                </p>
              </div>
            </div>

            {/* BOTÓN DE CIERRE */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
              >
                Entendido / Aplicar Recomendaciones
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottlenecksTable;
