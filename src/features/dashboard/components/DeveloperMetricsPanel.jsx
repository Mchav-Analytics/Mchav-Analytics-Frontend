import React from 'react';
import { Clock, ClipboardList, CheckCircle, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MetricInfoTooltip } from '../../../components/ui/MetricInfoTooltip';
import { SparklineMini } from '../../../components/ui/SparklineMini';

export default function DeveloperMetricsPanel({ scorecard }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CYCLE TIME */}
      <div className="flex flex-col rounded-2xl bg-white dark:bg-[#141738] p-5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#272b5c] justify-between transition-all duration-300 hover:border-emerald-500/60 min-h-[150px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Clock size={16} />
            </div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">CYCLE TIME</h3>
          </div>
          <MetricInfoTooltip align="left" text="Tu tiempo promedio en resolver incidencias desglosado individualmente." />
        </div>

        <div className="flex items-baseline justify-between mt-2">
          <div>
            <span className="text-3xl font-black text-emerald-500 tracking-tight">{scorecard?.cycle_time_personal ?? '3.2'}</span>
            <span className="text-xs font-bold text-emerald-500 ml-1">días</span>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{scorecard?.cycle_time_prev && scorecard?.cycle_time_personal ? (scorecard.cycle_time_personal <= scorecard.cycle_time_prev ? '↓' : '↑') + ' ' + Math.abs(scorecard.cycle_time_personal - scorecard.cycle_time_prev).toFixed(1) + 'd vs sprint previo' : '↓ 0.3d vs sprint previo'}</p>
          </div>
          <SparklineMini color="#00f5d4" />
        </div>
      </div>

      {/* TICKETS WIP */}
      <div className="flex flex-col rounded-2xl bg-white dark:bg-[#141738] p-5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#272b5c] justify-between transition-all duration-300 hover:border-purple-500/60 min-h-[150px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ClipboardList size={16} />
            </div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">TICKETS WIP</h3>
          </div>
          <MetricInfoTooltip text="Tus incidencias activas en progreso en tu tablero personal." />
        </div>

        <div className="mt-2 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{scorecard?.wip_tickets ?? 7}</span>
              <span className="text-xs font-bold text-purple-400 ml-1">tickets activos</span>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
              {scorecard?.wip_max ? Math.round(((scorecard.wip_tickets ?? 0) / scorecard.wip_max) * 100) : 70}% de capacidad
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full" style={{ width: `${scorecard?.wip_max ? Math.min(Math.round(((scorecard.wip_tickets ?? 0) / scorecard.wip_max) * 100), 100) : 70}%` }}></div>
          </div>
        </div>
      </div>

      {/* THROUGHPUT */}
      <div className="flex flex-col rounded-2xl bg-white dark:bg-[#141738] p-5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#272b5c] justify-between transition-all duration-300 hover:border-cyan-500/60 min-h-[150px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CheckCircle size={16} />
            </div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">THROUGHPUT</h3>
          </div>
          <MetricInfoTooltip align="right" text="Total de entregas e historias completadas por ti en este sprint." />
        </div>

        <div className="flex items-baseline justify-between mt-2">
          <div>
            <span className="text-3xl font-black text-cyan-400 tracking-tight">{scorecard?.throughput_tickets ?? 14}</span>
            <span className="text-xs font-bold text-cyan-400 ml-1">tickets</span>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Promedio: {scorecard?.throughput_avg_daily ?? '2.3'}/día</p>
          </div>
          <div className="w-16 h-7">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ v: 2 }, { v: 3 }, { v: 1 }, { v: 4 }, { v: 4 }]}>
                <Bar dataKey="v" fill="#00c2ff" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* STORY POINTS */}
      <div className="flex flex-col rounded-2xl bg-white dark:bg-[#141738] p-5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-[#272b5c] justify-between transition-all duration-300 hover:border-pink-500/60 min-h-[150px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Zap size={16} />
            </div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">STORY POINTS</h3>
          </div>
          <MetricInfoTooltip align="right" text="Puntos de historia completados versus tu meta del sprint." />
        </div>

        <div className="mt-2 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{scorecard?.story_points_burned ?? 65}</span>
              <span className="text-xs font-bold text-pink-400 ml-1">SP</span>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30">
              {scorecard?.story_points_target > 0 ? `${scorecard?.story_points_achieved_pct ?? 0}% de la meta` : 'Sin meta de sprint'}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 h-full" style={{ width: scorecard?.story_points_target > 0 ? `${Math.min(scorecard?.story_points_achieved_pct ?? 0, 100)}%` : (scorecard?.story_points_burned > 0 ? '100%' : '0%') }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
