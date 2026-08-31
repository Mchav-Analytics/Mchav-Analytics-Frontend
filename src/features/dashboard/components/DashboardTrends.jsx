import React from 'react';
import { RefreshCw, User } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { MetricInfoTooltip } from '../../../components/ui/MetricInfoTooltip';

export default function DashboardTrends({
  trendMetric, setTrendMetric,
  trendTimeframe, setTrendTimeframe,
  tendenciaData,
  setActiveTab,
  lastSyncInfo,
  totalProjectsCount,
  estadoDonutData
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      
      {/* COLUMNA 1 (7 COLS): TENDENCIA GENERAL CON GRÁFICO DE ÁREA DE GRADIENTE */}
      <div className="lg:col-span-7 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Tendencia general</span>
            <MetricInfoTooltip text="Evolución histórica del volumen de incidencias completadas a lo largo de los últimos meses." />
          </h2>

          {/* SELECTORES DE FILTRO Y TIEMPO */}
          <div className="flex items-center gap-2">
            <select 
              value={trendMetric}
              onChange={(e) => setTrendMetric(e.target.value)}
              className="bg-slate-100 dark:bg-[#12142e] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:border-indigo-400 transition-colors"
            >
              <option value="completed">Issues completadas</option>
              <option value="created">Issues creadas</option>
            </select>

            <select 
              value={trendTimeframe}
              onChange={(e) => setTrendTimeframe(e.target.value)}
              className="bg-slate-100 dark:bg-[#12142e] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:border-indigo-400 transition-colors"
            >
              <option value="6m">Últimos 6 meses</option>
              <option value="3m">Últimos 3 meses</option>
              <option value="30d">Últimos 30 días</option>
            </select>
          </div>
        </div>

        {/* GRÁFICO DE ÁREA CON GRADIENTE */}
        <div className="w-full h-[230px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tendenciaData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompletadas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={trendMetric === 'created' ? '#06b6d4' : '#6366f1'} stopOpacity={0.5}/>
                  <stop offset="95%" stopColor={trendMetric === 'created' ? '#06b6d4' : '#6366f1'} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 'auto']} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                formatter={(val) => [`${val} issues`, trendMetric === 'created' ? 'Creadas' : 'Completadas']}
              />
              <Area 
                type="monotone" 
                dataKey="valor" 
                stroke={trendMetric === 'created' ? '#06b6d4' : '#818cf8'} 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorCompletadas)" 
                dot={{ r: 4, fill: trendMetric === 'created' ? '#06b6d4' : '#818cf8', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* COLUMNA 2 (5 COLS): SINCRONIZACIÓN + ESTADO GENERAL APILADOS */}
      <div className="lg:col-span-5 flex flex-col gap-4">

        {/* TARJETA: ÚLTIMA SINCRONIZACIÓN */}
        <div
          onClick={() => setActiveTab && setActiveTab('sincronizacion')}
          className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-4 rounded-2xl shadow-sm dark:shadow-xl cursor-pointer hover:border-indigo-400 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <RefreshCw size={11} className="text-emerald-500" />
              Última sincronización
            </span>
            <MetricInfoTooltip text="Fecha, hora y usuario de la última sincronización ejecutada con Jira Cloud." align="right" />
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                {lastSyncInfo.dateText}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <User size={12} className="shrink-0" />
                <span>{lastSyncInfo.user}</span>
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold border border-emerald-500/20 shrink-0">
              {lastSyncInfo.status}
            </span>
          </div>
        </div>

        {/* TARJETA: ESTADO GENERAL */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-4 rounded-2xl shadow-sm dark:shadow-xl flex-1 flex flex-col justify-between">
          
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
            <span>Estado general</span>
            <MetricInfoTooltip text="Proporción global de proyectos según su nivel de salud operativa." />
          </h2>

          <div className="flex items-center gap-5">
            
            {/* DONUT — tamaño medio */}
            <div className="h-[110px] w-[110px] relative flex items-center justify-center shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estadoDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={34}
                    outerRadius={52}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {estadoDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{totalProjectsCount}</span>
                <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Proyectos</span>
              </div>
            </div>

            {/* LEYENDA — icono · count · nombre · % */}
            <div className="flex-1 space-y-2.5">
              {estadoDonutData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-base font-black text-slate-900 dark:text-white leading-none">{item.value}</span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex-1 truncate">{item.name}</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">{item.percentage}%</span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
