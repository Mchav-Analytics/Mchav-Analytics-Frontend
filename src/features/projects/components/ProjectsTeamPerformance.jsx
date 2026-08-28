import React from 'react';
import { InfoTooltip, EnrichedChartTooltip } from './Tooltips';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Bar } from 'recharts';

export const ProjectsTeamPerformance = ({ statusDistributionData, computedMetrics, cycleTimeByTypeData }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
              {/* COLUMNA 1: DISTRIBUCIÓN DE ESTADOS (DONUT + TABLA EXPLICATIVA) */}
              <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Distribución de estados
                </h3>
      
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* Donut Chart con total en el centro */}
                  <div className="h-44 w-44 relative flex items-center justify-center shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusDistributionData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<EnrichedChartTooltip unit="issues" titlePrefix="Estado" />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-xl font-black text-slate-900 dark:text-white">{computedMetrics.totalIssues}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Total issues</span>
                    </div>
                  </div>
      
                  {/* Tabla Leyenda Derecha */}
                  <div className="space-y-2.5 flex-1 w-full text-xs font-semibold">
                    {statusDistributionData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1.5 last:border-0">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          {item.name}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-400 font-medium text-[11px] min-w-[40px] text-right">{item.percentage}</span>
                          <span className="font-extrabold text-slate-900 dark:text-white min-w-[28px] text-right">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
      
              {/* COLUMNA 2: TIEMPO DE CICLO POR TIPO DE INCIDENCIA */}
              <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Tiempo de ciclo por tipo
                    </h3>
                    <InfoTooltip text="Tiempo promedio en días desde que se inicia la tarea hasta su resolución completa según la categoría." />
                  </div>
      
                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    Días de resolución
                  </span>
                </div>
      
                <div className="h-48 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cycleTimeByTypeData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.15} />
                      <XAxis
                        type="number"
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        label={{ value: 'Días de resolución promedio', position: 'insideBottom', offset: -14, fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        width={75}
                      />
                      <RechartsTooltip content={<EnrichedChartTooltip unit="días" titlePrefix="Tipo" />} />
                      <Bar dataKey="dias" radius={[0, 6, 6, 0]} barSize={16}>
                        {cycleTimeByTypeData.map((entry, index) => (
                          <Cell key={`bar-cycle-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
      
            </div>
    </>
  );
};
