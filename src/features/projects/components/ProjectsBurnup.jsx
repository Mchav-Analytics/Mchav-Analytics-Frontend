import React, { useState } from 'react';
import { ChevronRight, ChevronUp, Activity, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';
import { InfoTooltip } from './Tooltips';
import { SprintBurnupChart } from './SprintBurnupChart';

export const ProjectsBurnup = ({ activeBurnupData, setShowBurndownDocModal, selectedProjectObj }) => {
  const [showDetail, setShowDetail] = useState(false);

  const handleToggleDetail = () => {
    setShowDetail(prev => !prev);
    if (setShowBurndownDocModal) setShowBurndownDocModal(false);
  };

  return (
    <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 transition-all">
      
      {/* Header Burnup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Sprint Burnup Chart</span>
            {selectedProjectObj && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {selectedProjectObj.name} ({selectedProjectObj.key})
              </span>
            )}
          </h3>
          <InfoTooltip
            text="Seguimiento del trabajo completado acumulado frente al alcance total del sprint para identificar cambios de alcance (Scope Creep)."
          />
        </div>

        {/* Controles Derecha */}
        <div className="flex items-center gap-3">
          <select className="h-8 px-3 rounded-xl bg-slate-50 dark:bg-[#1a2138] border border-slate-200 dark:border-[#2c3757] text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer">
            <option value="ACTUAL">Sprint actual</option>
            <option value="PREV">Sprint anterior</option>
          </select>

          <button
            type="button"
            onClick={handleToggleDetail}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
              showDetail
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>{showDetail ? 'Ocultar detalle' : 'Ver detalle'}</span>
            {showDetail ? <ChevronUp size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>

      {/* Gráfica Burnup */}
      <div className="pt-2">
        <SprintBurnupChart data={activeBurnupData} />
      </div>

      {/* Panel Expandible de Justificación Técnica Inline */}
      {showDetail && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Justificación Técnica: Cálculo del Sprint Burnup Chart
              </h4>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">
              Seguimiento de Alcance vs Entregas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card 1 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#181c3d] border border-slate-200/80 dark:border-[#2a2f5e] space-y-2 text-left">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-indigo-500 shrink-0" />
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">1. Alcance vs Completado</h5>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Dibuja la curva de <strong className="text-slate-800 dark:text-slate-100 font-extrabold">Alcance Total (Total Scope)</strong> y el <strong className="text-slate-800 dark:text-slate-100 font-extrabold">Trabajo Completado</strong> diario para identificar variaciones por <em className="text-indigo-600 dark:text-indigo-400 font-semibold">Scope Creep</em>.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#181c3d] border border-slate-200/80 dark:border-[#2a2f5e] space-y-2 text-left">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-purple-500 shrink-0" />
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">2. Proyección Ideal</h5>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                La línea de ritmo ideal proyecta una trayectoria uniforme desde el inicio hasta el cierre del sprint.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#181c3d] border border-slate-200/80 dark:border-[#2a2f5e] space-y-2 text-left">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">3. Transiciones Jira Cloud</h5>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Las tareas en estado <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-[9px]">Done / Completado</span> incrementan el trabajo acumulado al instante.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/40 flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
            <p className="text-[11px] font-semibold text-indigo-950 dark:text-indigo-200">
              <strong className="font-extrabold">Recomendación:</strong> Si el alcance sube al final del sprint, verifica historias agregadas a mitad de ciclo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
