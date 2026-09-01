import React from 'react';
import { Trophy, ChevronRight, Sparkles } from 'lucide-react';

export default function TeamMatrixLeaderboard({ 
  developers, 
  teamSummary, 
  onSelectDevForScorecard,
  onOpenAiAnalysis
}) {
  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy size={20} className="text-amber-500 dark:text-amber-400" />
          Ranking General & Diagnóstico Nubi IA por Desarrollador
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">Puntuación ponderada de 0 a 100 puntos</span>
      </div>

      <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-[#12142e] text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-[#33376b]">
              <tr>
                <th className="px-4 py-3 text-center">Rank</th>
                <th className="px-4 py-3">Desarrollador</th>
                <th className="px-4 py-3">Cuadrante Operativo</th>
                <th className="px-4 py-3 text-center">Performance Score</th>
                <th className="px-4 py-3 text-center">Throughput</th>
                <th className="px-4 py-3 text-center">Cycle Time</th>
                <th className="px-4 py-3 text-center">Calidad %</th>
                <th className="px-4 py-3 text-center">Diagnóstico IA</th>
                <th className="px-4 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {developers.map((dev) => {
                const q = dev.cuadrante || {};

                return (
                  <tr
                    key={dev.assignee_id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* RANK POSICIÓN */}
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${dev.rank_posicion === 1 ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/40' :
                          dev.rank_posicion === 2 ? 'bg-slate-200 text-slate-700 dark:bg-slate-400/20 dark:text-slate-300 border border-slate-300 dark:border-slate-400/40' :
                            dev.rank_posicion === 3 ? 'bg-amber-700/15 text-amber-800 dark:text-amber-500 border border-amber-700/40' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                        {dev.rank_posicion}
                      </span>
                    </td>

                    {/* NOMBRE Y AVATAR */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-teal-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
                          {dev.nombre ? dev.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'DEV'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{dev.nombre || 'Desarrollador'}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{dev.email || ''}</span>
                        </div>
                      </div>
                    </td>

                    {/* CUADRANTE BADGE */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${q.codigo === 'ESTRELLA' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30' :
                          q.codigo === 'METODICO' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30' :
                            q.codigo === 'ALTO_VOLUMEN' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30' :
                              'bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                        }`}>
                        {q.nombre || 'Desconocido'}
                      </span>
                    </td>

                    {/* SCORE (BARRA Y NÚMERO) */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{dev.performance_score} pts</span>
                        <div className="w-20 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                            style={{ width: `${Math.min(dev.performance_score, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* THROUGHPUT */}
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-slate-900 dark:text-white">{dev.throughput_issues}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">({dev.velocity_sp} SP)</span>
                    </td>

                    {/* CYCLE TIME */}
                    <td className="px-4 py-4 text-center font-medium">
                      <span className={dev.cycle_time_dias <= teamSummary.team_avg_cycle_time ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>
                        {dev.cycle_time_dias}d
                      </span>
                    </td>

                    {/* CALIDAD */}
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-cyan-600 dark:text-cyan-300">{dev.quality_pct}%</span>
                    </td>

                    {/* BOTÓN NUBI IA PARA DIAGNÓSTICO PERSONALIZADO */}
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenAiAnalysis && onOpenAiAnalysis(dev)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200/90 dark:border-purple-800/60 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer group mx-auto"
                        title={`Ver análisis Nubi IA personalizado para ${dev.nombre}`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-500 group-hover:scale-110 transition-transform animate-pulse" />
                        <span>Análisis Nubi IA</span>
                      </button>
                    </td>

                    {/* ACCIÓN: VER SCORECARD */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => onSelectDevForScorecard && onSelectDevForScorecard(dev.assignee_id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white border border-indigo-200 dark:border-indigo-500/30 transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Ver Scorecard</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
