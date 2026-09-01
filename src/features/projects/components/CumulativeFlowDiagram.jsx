import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

export const CumulativeFlowDiagram = ({ data, isAnimationActive = true, width, height }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
        <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">
          No hay datos suficientes para calcular el Flujo Acumulado (CFD)
        </span>
      </div>
    );
  }

  const renderCustomLegend = () => {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Completado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500 shadow-xs" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">En Revisión / QA</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-xs" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">En Progreso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-500 shadow-xs" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Por Hacer</span>
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const totalWork = payload.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

      return (
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-xl rounded-xl p-4 min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">{label}</h4>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Total: {totalWork}
            </span>
          </div>
          <div className="space-y-2">
            {[...payload].reverse().map((entry, index) => {
              let labelName = entry.name;
              let color = entry.color;
              if (entry.dataKey === 'completado') {
                labelName = 'Completado';
                color = '#10b981';
              } else if (entry.dataKey === 'en_revision') {
                labelName = 'En Revisión / QA';
                color = '#a855f7';
              } else if (entry.dataKey === 'en_progreso') {
                labelName = 'En Progreso';
                color = '#3b82f6';
              } else if (entry.dataKey === 'por_hacer') {
                labelName = 'Por Hacer';
                color = '#64748b';
              }

              return (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className="font-bold flex items-center gap-1.5" style={{ color }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                    {labelName}
                  </span>
                  <span className="font-black text-slate-700 dark:text-slate-300">
                    {entry.value} pts/unds
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

  const chartProps = width && height ? { width, height } : {};
  const Wrapper = width && height ? React.Fragment : ResponsiveContainer;
  const wrapperProps = width && height ? {} : { width: "100%", height: 360 };

  return (
    <div className={`w-full ${height ? '' : 'h-[360px] min-h-[360px]'}`}>
      <Wrapper {...wrapperProps}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          {...chartProps}
        >
          <defs>
            <linearGradient id="colorCompletado" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="colorEnRevision" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="colorEnProgreso" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="colorPorHacer" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#64748b" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#64748b" stopOpacity={0.2} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
          
          <XAxis 
            dataKey="fecha_real" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
            dy={10}
            label={{ value: 'Días del Sprint / Rango', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
            dx={-10}
            label={{ value: 'Trabajo Acumulado (Ítems / SP)', angle: -90, position: 'insideLeft', offset: -5, fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
          />

          <RechartsTooltip content={<CustomTooltip />} />
          <Legend content={renderCustomLegend} verticalAlign="top" />

          {/* Área apilada 1: Completado */}
          <Area
            isAnimationActive={isAnimationActive}
            type="monotone"
            dataKey="completado"
            stackId="1"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#colorCompletado)"
            name="Completado"
          />

          {/* Área apilada 2: En Revisión */}
          <Area
            isAnimationActive={isAnimationActive}
            type="monotone"
            dataKey="en_revision"
            stackId="1"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#colorEnRevision)"
            name="En Revisión / QA"
          />

          {/* Área apilada 3: En Progreso */}
          <Area
            isAnimationActive={isAnimationActive}
            type="monotone"
            dataKey="en_progreso"
            stackId="1"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorEnProgreso)"
            name="En Progreso"
          />

          {/* Área apilada 4: Por Hacer */}
          <Area
            isAnimationActive={isAnimationActive}
            type="monotone"
            dataKey="por_hacer"
            stackId="1"
            stroke="#64748b"
            strokeWidth={2}
            fill="url(#colorPorHacer)"
            name="Por Hacer"
          />
        </AreaChart>
      </Wrapper>
    </div>
  );
};
