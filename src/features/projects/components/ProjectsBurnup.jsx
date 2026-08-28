import React from 'react';
import { ChevronRight } from 'lucide-react';
import { InfoTooltip } from './Tooltips';
import { SprintBurnupChart } from './SprintBurnupChart';

export const ProjectsBurnup = ({ realBurnupData, MOCK_BURNUP_DATA, setShowBurndownDocModal }) => {
  return (
    <>
      <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              
              {/* Header Burnup */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Sprint Burnup Chart
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
                    onClick={() => setShowBurndownDocModal(true)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
                  >
                    <span>Ver detalle</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
      
              {/* Gráfica Burnup */}
              <div className="pt-2">
                <SprintBurnupChart data={realBurnupData.length > 0 ? realBurnupData : MOCK_BURNUP_DATA} />
              </div>
            </div>
    </>
  );
};
