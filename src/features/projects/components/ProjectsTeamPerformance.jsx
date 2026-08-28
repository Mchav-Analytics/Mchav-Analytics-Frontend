import React from 'react';
import { InfoTooltip, EnrichedChartTooltip } from './Tooltips';
import { CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ScatterChart, Scatter, ReferenceLine, Cell } from 'recharts';

export const ProjectsTeamPerformance = ({ activeVelocityData, activePercentilesData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* COLUMNA 1: VELOCIDAD DEL EQUIPO (STORY POINTS) */}
      <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              VELOCIDAD DEL EQUIPO (STORY POINTS)
            </h3>
            <InfoTooltip text="Muestra la comparación entre los Story Points comprometidos y completados por el equipo al cierre de cada sprint." />
          </div>

          <div className="flex items-center gap-3 text-[11px] font-extrabold">
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#d8b4fe] shrink-0" />
              Comprometido
            </span>
            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#7c3aed] shrink-0" />
              Completado
            </span>
          </div>
        </div>

        {/* Gráfico de Barras Agrupadas */}
        <div className="h-52 w-full min-h-[210px] pt-2">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={activeVelocityData}
              margin={{ top: 20, right: 15, left: -10, bottom: 20 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
              <XAxis
                dataKey="sprint"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, 'auto']}
                label={{ value: 'Story Points', angle: -90, position: 'insideLeft', offset: 15, fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              />
              <RechartsTooltip content={<EnrichedChartTooltip unit="SP" titlePrefix="Sprint" />} />
              <Bar
                dataKey="comprometido"
                name="Comprometido"
                fill="#d8b4fe"
                radius={[4, 4, 0, 0]}
                barSize={18}
                label={{ position: 'top', fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              />
              <Bar
                dataKey="completado"
                name="Completado"
                fill="#7c3aed"
                radius={[4, 4, 0, 0]}
                barSize={18}
                label={{ position: 'top', fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* COLUMNA 2: TIEMPO DE ENTREGA Y PREDICTIBILIDAD */}
      <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              TIEMPO DE ENTREGA Y PREDICTIBILIDAD
            </h3>
            <InfoTooltip text="Muestra la dispersión del Cycle Time de cada issue resuelto y los percentiles de entrega (P50, P85, P95) para medir predictibilidad." />
          </div>

          <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            Días de resolución
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-4 pt-1">
          {/* Scatter Plot dispersión Cycle Time */}
          <div className="flex-1 space-y-1">
            <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block">
              Cycle Time (días)
            </span>

            <div className="h-44 w-full min-h-[180px]">
              <ResponsiveContainer width="100%" height={180}>
                <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                  <XAxis type="number" dataKey="x" name="Issue" stroke="#64748b" fontSize={9} tick={false} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis type="number" dataKey="y" name="Días" stroke="#64748b" fontSize={10} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                  <ReferenceLine y={activePercentilesData.p50} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1.5} />
                  <ReferenceLine y={activePercentilesData.p85} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1.5} />
                  <ReferenceLine y={activePercentilesData.p95} stroke="#f43f5e" strokeDasharray="3 3" strokeWidth={1.5} />
                  <Scatter name="Issues" data={activePercentilesData.scatterPoints} fill="#8884d8">
                    {activePercentilesData.scatterPoints.map((entry, index) => (
                      <Cell key={`cell-scatter-${index}`} fill={entry.y <= activePercentilesData.p50 ? '#10b981' : entry.y <= activePercentilesData.p85 ? '#f59e0b' : '#f43f5e'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] font-bold text-slate-400 text-center">
              Días de resolución promedio
            </div>
          </div>

          {/* Panel de Percentiles & Predictibilidad */}
          <div className="w-full sm:w-44 flex flex-col justify-between gap-3 shrink-0">
            
            {/* Sección Percentiles */}
            <div className="space-y-2 text-xs font-semibold">
              <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1">
                Percentiles (días)
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">P50 (mediana)</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{activePercentilesData.p50}</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">P85</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">{activePercentilesData.p85}</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">P95</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400">{activePercentilesData.p95}</span>
              </div>
            </div>

            {/* Caja Predictibilidad */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>Predictibilidad</span>
              </div>
              <p className="text-[10px] leading-tight font-semibold text-emerald-800 dark:text-emerald-200">
                {activePercentilesData.predictabilityText}
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
