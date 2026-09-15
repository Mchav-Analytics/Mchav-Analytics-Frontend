import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CFDChart = ({ data }) => {
  if (!data || !data.cfd || data.cfd.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <h3 className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Cumulative Flow Diagram</h3>
        <p className="text-slate-500 text-sm">No hay datos históricos suficientes para el diagrama.</p>
      </div>
    );
  }

  const { cfd, wip } = data;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2 text-sm">{label}</p>
          <div className="flex flex-col gap-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-500 dark:text-slate-400">{entry.name}:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{entry.value}</span>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-400">Total:</span>
              <span className="text-slate-900 dark:text-white">
                {payload.reduce((sum, entry) => sum + entry.value, 0)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-slate-700 dark:text-slate-300 font-semibold">Cumulative Flow Diagram & WIP</h3>
          <p className="text-xs text-slate-500">Evolución histórica de estados (últimos 30 días)</p>
        </div>
        {wip && (
          <div className="flex gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400">Total WIP Actual</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{wip.total}</div>
            </div>
            {wip.distribution && wip.distribution.map(d => (
              <div key={d.state} className="text-right border-l border-slate-200 dark:border-slate-800 pl-4 hidden md:block">
                <div className="text-[10px] uppercase text-slate-500">{d.state}</div>
                <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">{d.count}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={cfd}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={11} 
              tickMargin={10} 
              tickFormatter={(val) => val.split('-').slice(1).join('/')}
            />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
            
            {/* Apilamos de abajo hacia arriba: Done -> To Do -> Waiting -> Blocked -> Active */}
            <Area type="monotone" dataKey="Done" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            <Area type="monotone" dataKey="To Do" stackId="1" stroke="#64748b" fill="#64748b" fillOpacity={0.2} />
            <Area type="monotone" dataKey="Waiting" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
            <Area type="monotone" dataKey="Blocked" stackId="1" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.5} />
            <Area type="monotone" dataKey="Active" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CFDChart;
