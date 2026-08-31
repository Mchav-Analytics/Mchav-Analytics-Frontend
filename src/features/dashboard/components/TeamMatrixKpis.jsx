import React from 'react';
import { TrendingUp, Award, Target, Clock } from 'lucide-react';

export default function TeamMatrixKpis({ teamSummary, developers, conteo }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

      {/* KPI 1: SCORE PROMEDIO */}
      <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Score Promedio Equipo</span>
          <TrendingUp size={18} className="text-emerald-500 dark:text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{teamSummary.promedio_score_equipo || 80.0}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">/ 100 Pts</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">Promedio móvil sobre {developers.length} desarrolladores.</p>
      </div>

      {/* KPI 2: DESARROLLADORES ESTRELLA */}
      <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Cuadrante Estrella</span>
          <Award size={18} className="text-emerald-500 dark:text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{conteo.ESTRELLA || 0}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Devs Top Performance</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">Cycle Time ágil y 0 devoluciones de QA.</p>
      </div>

      {/* KPI 3: METÓDICOS Y ALTO VOLUMEN */}
      <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Metódicos & Precisión</span>
          <Target size={18} className="text-indigo-500 dark:text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{conteo.METODICO || 0}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Devs de alta precisión</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">Código robusto con enfoque en calidad.</p>
      </div>

      {/* KPI 4: CYCLE TIME PROMEDIO */}
      <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Cycle Time Promedio</span>
          <Clock size={18} className="text-cyan-500 dark:text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">{teamSummary.team_avg_cycle_time || 0}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">días / ticket</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">Promedio de entrega del equipo.</p>
      </div>

    </div>
  );
}
