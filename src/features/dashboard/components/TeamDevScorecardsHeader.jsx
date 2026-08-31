import React from 'react';
import { UserCheck, FileDown } from 'lucide-react';

export default function TeamDevScorecardsHeader({ onNavigateToMatrix }) {
  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      {/* Lado Izquierdo: Ícono en Gradiente + Insignia + Título */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shrink-0">
          <UserCheck size={24} />
        </div>
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5 text-[13px] mb-2 font-medium">
            <span className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline transition-all" onClick={onNavigateToMatrix}>Matriz de Rendimiento</span>
            <span className="text-slate-400 dark:text-slate-500 mx-0.5">&gt;</span>
            <span className="text-slate-900 dark:text-white font-bold">Scorecards</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
              Supervisión Ejecutiva
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Scorecards Desarrolladores
          </h1>
        </div>
      </div>

      {/* Lado Derecho: Exportar PDF */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-2xl bg-[#5b36f5] hover:bg-indigo-600 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
          title="Exportar reporte de desarrolladores"
        >
          <FileDown size={15} />
          <span>Exportar Reporte Dev</span>
        </button>
      </div>

    </div>
  );
}
