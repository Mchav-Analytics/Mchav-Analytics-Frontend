import React from 'react';
import { Clock, ClipboardList, CheckCircle, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { MetricInfoTooltip } from './ScorecardShared';

export default function TeamDevScorecardsDashboard({ scorecard }) {
  const sparklineCycleTime = [{ v: 3.8 }, { v: 3.5 }, { v: 4.1 }, { v: 3.2 }, { v: 2.9 }, { v: 3.8 }];
  const throughputDaily = scorecard?.throughput_daily?.length ? scorecard.throughput_daily : [{ v: 2 }, { v: 4 }, { v: 3 }, { v: 5 }, { v: 2 }];
  const volumeDaily = [{ v: 3 }, { v: 6 }, { v: 4 }, { v: 8 }, { v: 5 }];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* TARJETA 1: Cycle Time Dev */}
      <div className="group relative flex flex-col rounded-3xl bg-white dark:bg-[#14192b] p-5 shadow-xs border border-emerald-200/90 dark:border-emerald-500/30 justify-between transition-all duration-300 hover:shadow-md hover:shadow-emerald-500/10 min-h-[160px] overflow-visible">
        <div className="absolute inset-0 bg-emerald-50/20 dark:bg-emerald-950/10 pointer-events-none rounded-3xl"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-wider">CYCLE TIME (DEV)</h3>
            </div>
            <MetricInfoTooltip align="left" text="Tiempo promedio en resolver incidencias desglosado individualmente." />
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {scorecard?.cycle_time_personal || 30.9} <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500">días</span>
              </span>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">↓ 12% vs. sprint anterior</p>
            </div>
            <div className="w-16 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineCycleTime}>
                  <defs>
                    <linearGradient id="ctGradDev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.5}/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="url(#ctGradDev)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-400 dark:text-slate-500">Promedio Equipo</span>
          <span className="font-black text-emerald-600 dark:text-emerald-400">3.8d</span>
        </div>
      </div>

      {/* TARJETA 2: Tickets WIP */}
      <div className="group relative flex flex-col rounded-3xl bg-white dark:bg-[#14192b] p-5 shadow-xs border border-purple-200/90 dark:border-purple-500/30 justify-between transition-all duration-300 hover:shadow-md hover:shadow-purple-500/10 min-h-[160px] overflow-visible">
        <div className="absolute inset-0 bg-purple-50/20 dark:bg-purple-950/10 pointer-events-none rounded-3xl"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
                <ClipboardList className="h-4 w-4" />
              </div>
              <h3 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-wider">TICKETS WIP</h3>
            </div>
            <MetricInfoTooltip align="left" text="Tareas activas en progreso actualmente asignadas a este desarrollador." />
          </div>

          <div className="space-y-1.5 pt-1">
            <div>
              <span className="text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                {scorecard?.wip_tickets || 0} <span className="text-xs font-bold text-purple-500">Tickets activos</span>
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900/60 h-2.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-[#272b5c]/50">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(15, ((scorecard?.wip_tickets || 0) / (scorecard?.wip_max || 33)) * 100))}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-400 dark:text-slate-500">Capacidad Máx</span>
          <span className="font-black text-purple-600 dark:text-purple-400">{scorecard?.wip_max || 33} Tickets</span>
        </div>
      </div>

      {/* TARJETA 3: Throughput Dev */}
      <div className="group relative flex flex-col rounded-3xl bg-white dark:bg-[#14192b] p-5 shadow-xs border border-cyan-200/90 dark:border-cyan-500/30 justify-between transition-all duration-300 hover:shadow-md hover:shadow-cyan-500/10 min-h-[160px] overflow-visible">
        <div className="absolute inset-0 bg-cyan-50/20 dark:bg-cyan-950/10 pointer-events-none rounded-3xl"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-white shadow-xs">
                <CheckCircle className="h-4 w-4" />
              </div>
              <h3 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-wider">THROUGHPUT (DEV)</h3>
            </div>
            <MetricInfoTooltip align="right" text="Total de entregas e historias completadas en el sprint." />
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-3xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight">
                {scorecard?.throughput_tickets || 33} <span className="text-xs font-bold text-cyan-600 dark:text-cyan-500">Tickets</span>
              </span>
              <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">↑ 8% vs. sprint anterior</p>
            </div>
            <div className="w-16 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={throughputDaily}>
                  <Bar dataKey="v" fill="#06b6d4" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-400 dark:text-slate-500">Promedio Diario</span>
          <span className="font-black text-cyan-600 dark:text-cyan-400">{scorecard?.throughput_avg_daily || 2.4}/día</span>
        </div>
      </div>

      {/* TARJETA 4: Volumen (SP) */}
      <div className="group relative flex flex-col rounded-3xl bg-white dark:bg-[#14192b] p-5 shadow-xs border border-indigo-200/90 dark:border-indigo-500/30 justify-between transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/10 min-h-[160px] overflow-visible">
        <div className="absolute inset-0 bg-indigo-50/20 dark:bg-indigo-950/10 pointer-events-none rounded-3xl"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-wider">VOLUMEN (SP)</h3>
            </div>
            <MetricInfoTooltip align="right" text="Puntos de historia completados en el contexto operativo." />
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                {scorecard?.story_points_burned || 46} <span className="text-xs font-bold text-indigo-600 dark:text-indigo-500">SP Entregados</span>
              </span>
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">↑ 15% vs. sprint anterior</p>
            </div>
            <div className="w-16 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeDaily}>
                  <Bar dataKey="v" fill="#6366f1" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-400 dark:text-slate-500">Tipo de Métrica</span>
          <span className="font-black text-indigo-600 dark:text-indigo-400">Contexto Operativo</span>
        </div>
      </div>

    </div>
  );
}
