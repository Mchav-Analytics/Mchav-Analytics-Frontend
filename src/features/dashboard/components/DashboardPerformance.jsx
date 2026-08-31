import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { MetricInfoTooltip } from '../../../components/ui/MetricInfoTooltip';

export default function DashboardPerformance({
  rendimientoTimeFilter, setRendimientoTimeFilter,
  rd,
  animVelocity, animThroughput, animCycle, animLead,
  openDrillDown
}) {
  return (
    <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-xl space-y-4">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <span>Rendimiento global <span className="text-xs text-slate-500 font-normal">(promedio)</span></span>
          <MetricInfoTooltip text="Métricas agregadas promedio del equipo: velocidad, throughput, cycle time y lead time." />
        </h2>
        <div className="relative">
          <select
            value={rendimientoTimeFilter}
            onChange={(e) => setRendimientoTimeFilter(e.target.value)}
            className="appearance-none bg-slate-50 dark:bg-[#12142e] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Último mes</option>
            <option value="90d">Últimos 3 meses</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* SPARKLINE 1: VELOCITY */}
        <div 
          onClick={() => openDrillDown('Velocity Promedio', 'velocity')}
          className="group relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#12142e] border border-slate-200 dark:border-slate-800 hover:border-purple-400 transition-all cursor-pointer shadow-xs dark:shadow-lg"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-transparent opacity-80 pointer-events-none transition-opacity group-hover:opacity-100"></div>
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wide">Velocity</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{animVelocity}</span>
              <span className="text-xs font-bold text-slate-500">SP</span>
            </div>
            <span className="text-xs font-extrabold text-indigo-500 flex items-center gap-1">
              {rd.velocity.trendIcon === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {rd.velocity.trend}
            </span>
            <div className="h-10 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rd.velocity.sparkline}>
                  <Line type="monotone" dataKey="v" stroke="#a855f7" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SPARKLINE 2: THROUGHPUT */}
        <div 
          onClick={() => openDrillDown('Throughput Promedio', 'throughput')}
          className="group relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#12142e] border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all cursor-pointer shadow-xs dark:shadow-lg"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent opacity-80 pointer-events-none transition-opacity group-hover:opacity-100"></div>
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wide">Throughput</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{animThroughput}</span>
              <span className="text-xs font-bold text-slate-500">issues</span>
            </div>
            <span className="text-xs font-extrabold text-indigo-500 flex items-center gap-1">
              {rd.throughput.trendIcon === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {rd.throughput.trend}
            </span>
            <div className="h-10 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rd.throughput.sparkline}>
                  <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SPARKLINE 3: CYCLE TIME */}
        <div 
          onClick={() => openDrillDown('Tiempo de Ciclo Promedio', 'cycle_time')}
          className="group relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#12142e] border border-slate-200 dark:border-slate-800 hover:border-cyan-400 transition-all cursor-pointer shadow-xs dark:shadow-lg"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/15 via-teal-500/10 to-transparent opacity-80 pointer-events-none transition-opacity group-hover:opacity-100"></div>
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wide">Cycle Time</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{animCycle}</span>
              <span className="text-xs font-bold text-slate-500">días</span>
            </div>
            <span className="text-xs font-extrabold text-indigo-500 flex items-center gap-1">
              {rd.cycle.trendIcon === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {rd.cycle.trend}
            </span>
            <div className="h-10 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rd.cycle.sparkline}>
                  <Line type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SPARKLINE 4: LEAD TIME */}
        <div 
          onClick={() => openDrillDown('Lead Time Promedio', 'lead_time')}
          className="group relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#12142e] border border-slate-200 dark:border-slate-800 hover:border-purple-400 transition-all cursor-pointer shadow-xs dark:shadow-lg"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-transparent opacity-80 pointer-events-none transition-opacity group-hover:opacity-100"></div>
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wide">Lead Time</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{animLead}</span>
              <span className="text-xs font-bold text-slate-500">días</span>
            </div>
            <span className="text-xs font-extrabold text-amber-500 flex items-center gap-1">
              {rd.lead.trendIcon === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {rd.lead.trend}
            </span>
            <div className="h-10 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rd.lead.sparkline}>
                  <Line type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
