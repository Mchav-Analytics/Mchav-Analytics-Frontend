import React from 'react';
import { Clock, ClipboardList, CheckCircle, Zap, Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

const MetricInfoTooltip = ({ text, align = "auto" }) => {
  const alignClass =
    align === "left" ? "left-0 md:left-0 md:translate-x-0" :
      align === "right" ? "right-0 sm:right-0 sm:translate-x-0 -translate-x-3/4 sm:-translate-x-0" :
        "left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0";

  return (
    <div className="group/tooltip relative inline-flex items-center cursor-help ml-1.5 shrink-0 z-30">
      <div className="p-1 rounded-full text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer border border-transparent hover:border-indigo-500/30">
        <Info size={14} className="shrink-0" />
      </div>
      <div className={`opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 absolute top-full ${alignClass} mt-2 w-56 sm:w-68 max-w-[calc(100vw-3rem)] p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 text-xs font-medium rounded-xl shadow-2xl border border-indigo-500/60 pointer-events-none leading-relaxed text-left z-40`}>
        {text}
      </div>
    </div>
  );
};

const SparklineMini = ({ color = "#00f5d4" }) => {
  const data = [{ v: 4.2 }, { v: 3.8 }, { v: 4.5 }, { v: 3.1 }, { v: 2.8 }, { v: 3.2 }];
  return (
    <div className="w-16 h-7 inline-block">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 1, right: 1, left: 1, bottom: 1 }}>
          <defs>
            <linearGradient id={`grad_${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.5} fill={`url(#grad_${color.replace('#', '')})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DeveloperKpiStrip = ({ scorecard }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* CYCLE TIME */}
      <div className="flex flex-col rounded-3xl bg-white/80 dark:bg-[#141738]/80 backdrop-blur-md p-5 shadow-sm border border-slate-200/80 dark:border-[#272b5c]/80 justify-between transition-all duration-300 hover:shadow-emerald-500/10 hover:border-emerald-500/30 min-h-[140px] sm:min-h-[150px] relative group z-10 hover:z-50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] -z-10 opacity-[0.07] group-hover:opacity-[0.15] transition-opacity"></div>
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
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 tracking-tight drop-shadow-sm">{scorecard?.cycle_time_personal ?? '3.2'}</span>
            <span className="text-xs font-bold text-emerald-500 ml-1">días</span>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{scorecard?.cycle_time_prev && scorecard?.cycle_time_personal ? (scorecard.cycle_time_personal <= scorecard.cycle_time_prev ? '↓' : '↑') + ' ' + Math.abs(scorecard.cycle_time_personal - scorecard.cycle_time_prev).toFixed(1) + 'd vs sprint previo' : '↓ 0.3d vs sprint previo'}</p>
          </div>
          <SparklineMini color="#10b981" />
        </div>
      </div>

      {/* TICKETS WIP */}
      <div className="flex flex-col rounded-3xl bg-white/80 dark:bg-[#141738]/80 backdrop-blur-md p-5 shadow-sm border border-slate-200/80 dark:border-[#272b5c]/80 justify-between transition-all duration-300 hover:shadow-purple-500/10 hover:border-purple-500/30 min-h-[140px] sm:min-h-[150px] relative group z-10 hover:z-50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-[60px] -z-10 opacity-[0.07] group-hover:opacity-[0.15] transition-opacity"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ClipboardList size={16} />
            </div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">TICKETS WIP</h3>
          </div>
          <MetricInfoTooltip text="Tus incidencias activas en progreso en tu tablero personal." />
        </div>
        <div className="mt-2 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-sm">{scorecard?.wip_tickets ?? 7}</span>
              <span className="text-xs font-bold text-purple-400 ml-1">activos</span>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
              {scorecard?.wip_max ? Math.round(((scorecard.wip_tickets ?? 0) / scorecard.wip_max) * 100) : 70}% cap.
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900/60 h-2.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-[#272b5c]/50">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full relative" style={{ width: `${scorecard?.wip_max ? Math.min(Math.round(((scorecard.wip_tickets ?? 0) / scorecard.wip_max) * 100), 100) : 70}%` }}>
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* THROUGHPUT */}
      <div className="flex flex-col rounded-3xl bg-white/80 dark:bg-[#141738]/80 backdrop-blur-md p-5 shadow-sm border border-slate-200/80 dark:border-[#272b5c]/80 justify-between transition-all duration-300 hover:shadow-cyan-500/10 hover:border-cyan-500/30 min-h-[140px] sm:min-h-[150px] relative group z-10 hover:z-50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500 rounded-full blur-[60px] -z-10 opacity-[0.07] group-hover:opacity-[0.15] transition-opacity"></div>
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
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight drop-shadow-sm">{scorecard?.throughput_tickets ?? 14}</span>
            <span className="text-xs font-bold text-cyan-500 ml-1">tickets</span>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Promedio: {scorecard?.throughput_avg_daily ?? '2.3'}/día</p>
          </div>
          <div className="w-16 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ v: 2 }, { v: 3 }, { v: 1 }, { v: 4 }, { v: 4 }]}>
                <Bar dataKey="v" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* STORY POINTS */}
      <div className="flex flex-col rounded-3xl bg-white/80 dark:bg-[#141738]/80 backdrop-blur-md p-5 shadow-sm border border-slate-200/80 dark:border-[#272b5c]/80 justify-between transition-all duration-300 hover:shadow-pink-500/10 hover:border-pink-500/30 min-h-[140px] sm:min-h-[150px] relative group z-10 hover:z-50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500 rounded-full blur-[60px] -z-10 opacity-[0.07] group-hover:opacity-[0.15] transition-opacity"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20">
              <Zap size={16} />
            </div>
            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">STORY POINTS</h3>
          </div>
          <MetricInfoTooltip align="right" text="Puntos de historia completados versus tu meta del sprint." />
        </div>
        <div className="mt-2 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-sm">{scorecard?.story_points_burned ?? 65}</span>
              <span className="text-xs font-bold text-pink-500 ml-1">SP</span>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/30">
              {scorecard?.story_points_target > 0 ? `${scorecard?.story_points_achieved_pct ?? 0}% de la meta` : 'Sin meta'}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-900/60 h-2.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-[#272b5c]/50">
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 h-full relative" style={{ width: scorecard?.story_points_target > 0 ? `${Math.min(scorecard?.story_points_achieved_pct ?? 0, 100)}%` : (scorecard?.story_points_burned > 0 ? '100%' : '0%') }}>
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
