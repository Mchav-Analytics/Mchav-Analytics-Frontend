import React from 'react';
import { Clock, ClipboardList, CheckCircle, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { MetricInfoTooltip } from './ScorecardShared';

export default function TeamDevScorecardsDashboard({ scorecard }) {
  const sparklineCycleTime = [];
  const throughputDaily = scorecard?.throughput_daily || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {/* TARJETA 1: Cycle Time Personal */}
      <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#191c3d] p-7 shadow-sm dark:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-slate-200 dark:border-[#33376b] min-h-[220px] justify-between">
        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-600 shadow-md">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Cycle Time Dev</h3>
            </div>
            <MetricInfoTooltip align="left" text="Cycle Time del Desarrollador: Tiempo promedio en días dedicado por este integrante para resolver tickets." />
          </div>

          <div>
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {scorecard?.cycle_time_personal || 0} <span className="text-lg font-bold text-emerald-600 dark:text-emerald-500">días</span>
            </span>
            <div className="w-full h-12 mt-3">
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

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Promedio Equipo</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">3.8d</span>
          </div>
        </div>
      </div>

      {/* TARJETA 2: Tickets WIP */}
      <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#191c3d] p-7 shadow-sm dark:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-slate-200 dark:border-[#33376b] min-h-[220px] justify-between">
        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Tickets WIP</h3>
            </div>
            <MetricInfoTooltip align="left" text="Work In Progress del Desarrollador: Número de tareas en progreso asignadas a este desarrollador." />
          </div>

          <div>
            <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
              {scorecard?.wip_tickets || 0} <span className="text-sm font-bold text-purple-600 dark:text-purple-500">Tickets activos</span>
            </span>
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-3 rounded-full mt-4 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((scorecard?.wip_tickets || 7) / (scorecard?.wip_max || 10)) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Capacidad Máx</span>
            <span className="font-semibold text-purple-600 dark:text-purple-400">{scorecard?.wip_max || 0} Tickets</span>
          </div>
        </div>
      </div>

      {/* TARJETA 3: Throughput */}
      <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#191c3d] p-7 shadow-sm dark:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-slate-200 dark:border-[#33376b] min-h-[220px] justify-between">
        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 shadow-md">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Throughput Dev</h3>
            </div>
            <MetricInfoTooltip align="right" text="Throughput del Desarrollador: Entregables completados por este desarrollador en el sprint." />
          </div>

          <div>
            <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight">
              {scorecard?.throughput_tickets || 0} <span className="text-xs font-bold text-teal-600 dark:text-teal-500">Tickets</span>
            </span>
            <div className="w-full h-11 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={throughputDaily}>
                  <Bar dataKey="v" fill="#14b8a6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Promedio Diario</span>
            <span className="font-semibold text-teal-600 dark:text-teal-400">{scorecard?.throughput_avg_daily || 0}/día</span>
          </div>
        </div>
      </div>

      {/* TARJETA 4: Story Points */}
      <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#191c3d] p-7 shadow-sm dark:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-slate-200 dark:border-[#33376b] min-h-[220px] justify-between">
        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-md">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Story Points Dev</h3>
            </div>
            <MetricInfoTooltip align="right" text="Puntos de Historia del Desarrollador: Puntos de esfuerzo completados por este desarrollador." />
          </div>

          <div>
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
              {scorecard?.story_points_burned || 0} <span className="text-sm font-bold text-indigo-600 dark:text-indigo-500">SP</span>
            </span>
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-3 rounded-full mt-4 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
              <div 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${scorecard?.story_points_achieved_pct || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Meta Sprint</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{scorecard?.story_points_target || 0} SP</span>
          </div>
        </div>
      </div>

    </div>
  );
}
