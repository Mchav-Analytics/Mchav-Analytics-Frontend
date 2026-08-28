import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

export const SprintBurnupChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
        <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">
          No hay datos suficientes para calcular el Burnup del Sprint
        </span>
      </div>
    );
  }

  const renderCustomLegend = () => {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Alcance Total (Total Scope)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Trabajo Completado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-xs" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Ritmo Ideal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-xs bg-amber-400 shadow-xs" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Tareas Terminadas Ese Día</span>
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-xl rounded-xl p-4 min-w-[210px]">
          <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">{label}</h4>
          <div className="space-y-2">
            {payload.map((entry, index) => {
              let labelName = entry.name;
              let color = entry.color;
              if (entry.dataKey === 'alcance_total') {
                labelName = 'Alcance Total';
                color = '#f59e0b';
              } else if (entry.dataKey === 'trabajo_completado') {
                labelName = 'Trabajo Completado';
                color = '#10b981';
              } else if (entry.dataKey === 'ritmo_ideal') {
                labelName = 'Ritmo Ideal';
                color = '#6366f1';
              } else if (entry.dataKey === 'tareas_completadas') {
                labelName = 'Tareas Terminadas';
                color = '#fbbf24';
              }

              return (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className="font-bold flex items-center gap-1.5" style={{ color: color }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                    {labelName}
                  </span>
                  <span className="font-black text-slate-700 dark:text-slate-300">
                    {entry.value} {entry.dataKey === 'tareas_completadas' ? 'unds' : 'pts'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
          
          <XAxis 
            dataKey="fecha_real" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
            dy={10}
            label={{ value: 'Días del Sprint', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
          />
          
          <YAxis 
            yAxisId="left"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
            dx={-10}
            label={{ value: 'Puntos de Esfuerzo / Alcance', angle: -90, position: 'insideLeft', offset: -5, fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
          />

          <YAxis 
            yAxisId="right"
            orientation="right"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
            dx={10}
            label={{ value: 'Cantidad de Tareas', angle: 90, position: 'insideRight', offset: -10, fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
          />

          <RechartsTooltip content={<CustomTooltip />} />
          <Legend content={renderCustomLegend} verticalAlign="top" />

          {/* Barras de Tareas entregadas por día */}
          <Bar 
            yAxisId="right"
            dataKey="tareas_completadas" 
            fill="#fbbf24" 
            radius={[4, 4, 0, 0]} 
            barSize={20}
            name="Tareas Terminadas Ese Día"
          />

          {/* Alcance Total (Línea superior Ámbar) */}
          <Line 
            yAxisId="left"
            type="stepAfter" 
            dataKey="alcance_total" 
            stroke="#f59e0b" 
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={false}
            name="Alcance Total (Total Scope)"
          />

          {/* Ritmo Ideal (Línea de Proyección Indigo) */}
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="ritmo_ideal" 
            stroke="#6366f1" 
            strokeWidth={2}
            strokeDasharray="3 3"
            dot={false}
            name="Ritmo Ideal"
          />

          {/* Trabajo Real Completado (Línea Esmeralda) */}
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="trabajo_completado" 
            stroke="#10b981" 
            strokeWidth={3.5}
            dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#10b981' }}
            activeDot={{ r: 6, strokeWidth: 2, fill: '#fff', stroke: '#10b981' }}
            name="Trabajo Completado"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
