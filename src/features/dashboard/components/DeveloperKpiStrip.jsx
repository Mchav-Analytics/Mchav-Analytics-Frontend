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
      {/* CYCLE TIME DEV */}
      <div className="flex flex-col rounded-3xl bg-white dark:bg-[#14192b] p-5 shadow-sm border border-emerald-200 dark:border-emerald-500/30 justify-between transition-all duration-300 hover:shadow-md hover:shadow-emerald-500/10 min-h-[160px] relative group overflow-visible">
        <div className="absolute inset-0 bg-emerald-50/25 dark:bg-emerald-950/10 pointer-events-none rounded-3xl"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Clock size={16} />
              </div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">CYCLE TIME DEV</h3>
            </div>
            <MetricInfoTooltip align="left" text="Tu tiempo promedio en resolver incidencias desglosado individualmente." />
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{scorecard?.cycle_time_personal ?? '30.9'}</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-1">días</span>
            </div>
            <SparklineMini color="#10b981" />
          </div>
        </div>

        <div className="relative z-10 pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-400 dark:text-slate-500">Promedio Equipo</span>
          <span className="font-black text-emerald-600 dark:text-emerald-400">3.8d</span>
        </div>
      </div>

      {/* TICKETS WIP */}
      <div className="flex flex-col rounded-3xl bg-white dark:bg-[#14192b] p-5 shadow-sm border border-purple-200 dark:border-purple-500/30 justify-between transition-all duration-300 hover:shadow-md hover:shadow-purple-500/10 min-h-[160px] relative group overflow-visible">
        <div className="absolute inset-0 bg-purple-50/25 dark:bg-purple-950/10 pointer-events-none rounded-3xl"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <ClipboardList size={16} />
              </div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">TICKETS WIP</h3>
            </div>
            <MetricInfoTooltip text="Tus incidencias activas en progreso en tu tablero personal." />
          </div>

          <div className="space-y-1.5 pt-1">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400 tracking-tight">{scorecard?.wip_tickets ?? 0}</span>
              <span className="text-xs font-bold text-purple-500 ml-1.5">Tickets activos</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900/60 h-2.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-[#272b5c]/50">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full relative" style={{ width: `${scorecard?.wip_max ? Math.min(Math.round(((scorecard.wip_tickets ?? 0) / scorecard.wip_max) * 100), 100) : 15}%` }}></div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-400 dark:text-slate-500">Capacidad Máx</span>
          <span className="font-black text-purple-600 dark:text-purple-400">33 Tickets</span>
        </div>
      </div>

      {/* THROUGHPUT DEV */}
      <div className="flex flex-col rounded-3xl bg-white dark:bg-[#14192b] p-5 shadow-sm border border-cyan-200 dark:border-cyan-500/30 justify-between transition-all duration-300 hover:shadow-md hover:shadow-cyan-500/10 min-h-[160px] relative group overflow-visible">
        <div className="absolute inset-0 bg-cyan-50/25 dark:bg-cyan-950/10 pointer-events-none rounded-3xl"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <CheckCircle size={16} />
              </div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">THROUGHPUT DEV</h3>
            </div>
            <MetricInfoTooltip align="right" text="Total de entregas e historias completadas por ti en este sprint." />
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight">{scorecard?.throughput_tickets ?? 33}</span>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 ml-1.5">Tickets</span>
            </div>
            <SparklineMini color="#06b6d4" />
          </div>
        </div>

        <div className="relative z-10 pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-400 dark:text-slate-500">Promedio Diario</span>
          <span className="font-black text-cyan-600 dark:text-cyan-400">2.4/día</span>
        </div>
      </div>

      {/* VOLUMEN (SP) */}
      <div className="flex flex-col rounded-3xl bg-white dark:bg-[#14192b] p-5 shadow-sm border border-indigo-200 dark:border-indigo-500/30 justify-between transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/10 min-h-[160px] relative group overflow-visible">
        <div className="absolute inset-0 bg-indigo-50/25 dark:bg-indigo-950/10 pointer-events-none rounded-3xl"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Zap size={16} />
              </div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">VOLUMEN (SP)</h3>
            </div>
            <MetricInfoTooltip align="right" text="Puntos de historia completados versus tu meta del sprint." />
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{scorecard?.story_points_burned ?? 46}</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 ml-1.5">SP Entregados</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-400 dark:text-slate-500">Tipo de Métrica</span>
          <span className="font-black text-indigo-600 dark:text-indigo-400">Contexto Operativo</span>
        </div>
      </div>
    </div>
  );
};
