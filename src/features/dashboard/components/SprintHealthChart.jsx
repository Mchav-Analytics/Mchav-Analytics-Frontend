import React from 'react';
import { BarChart3, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MetricInfoTooltip } from './ScorecardShared';
import { CustomFlowTooltip } from './SprintHealthShared';

export default function SprintHealthChart({ stages, insight, metrics, isDark }) {
  const axisLabelFill = isDark ? '#ffffff' : '#0f172a';
  const axisTickFill = isDark ? '#f8fafc' : '#1e293b';
  const gridLineStroke = isDark ? '#475569' : '#cbd5e1';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* GRÁFICO DE BARRAS DE TIEMPO ACUMULADO POR ETAPA */}
      <div className="lg:col-span-2 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span>Descomposición de Tiempo de Flujo por Etapa (Días Acumulados)</span>
            <MetricInfoTooltip text="Muestra los días acumulados que los tickets del sprint pasan en cada estado (Desarrollo, PR Review, QA, Cola de Espera). Pasa el cursor sobre las barras o botones flotantes para conocer el significado de cada etapa." />
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Tiempo Activo vs. Tiempos de Espera</span>
        </div>

        {/* LEYENDA INTERACTIVA DE ETAPAS CON TOOLTIPS INFORMATIVOS */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div className="group/stage relative">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 cursor-help transition-all hover:scale-105">
              ⚙️ Desarrollo Activo
            </span>
            <div className="absolute bottom-full mb-2 left-0 hidden group-hover/stage:block w-64 p-3 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs rounded-xl shadow-2xl z-50 pointer-events-none backdrop-blur-md leading-relaxed">
              <strong>⚙️ Desarrollo Activo:</strong> Tiempo real que los desarrolladores pasan programando en su entorno local, construyendo lógica o resolviendo bugs.
            </div>
          </div>

          <div className="group/stage relative">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 cursor-help transition-all hover:scale-105">
              🔍 Revisión de Código
            </span>
            <div className="absolute bottom-full mb-2 left-0 hidden group-hover/stage:block w-64 p-3 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs rounded-xl shadow-2xl z-50 pointer-events-none backdrop-blur-md leading-relaxed">
              <strong>🔍 Revisión de Código:</strong> Tiempo en que las Pull Requests (PRs) están abiertas esperando o recibiendo aprobación por pares o por el Líder Técnico.
            </div>
          </div>

          <div className="group/stage relative">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40 cursor-help transition-all hover:scale-105">
              🧪 Pruebas de Calidad (QA)
            </span>
            <div className="absolute bottom-full mb-2 left-0 hidden group-hover/stage:block w-64 p-3 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs rounded-xl shadow-2xl z-50 pointer-events-none backdrop-blur-md leading-relaxed">
              <strong>🧪 Pruebas de Calidad (QA):</strong> Tiempo en que el ticket se encuentra en ambiente de pruebas (Staging) siendo validado por el equipo de QA.
            </div>
          </div>

          <div className="group/stage relative">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 cursor-help transition-all hover:scale-105">
              ⏳ En Cola de Espera
            </span>
            <div className="absolute bottom-full mb-2 left-0 hidden group-hover/stage:block w-64 p-3 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs rounded-xl shadow-2xl z-50 pointer-events-none backdrop-blur-md leading-relaxed">
              <strong>⏳ En Cola de Espera:</strong> Tiempo inactivo o congelado en backlog (To Do) antes de que la tarea sea iniciada por un desarrollador.
            </div>
          </div>
        </div>

        <div className="w-full h-[290px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stages} layout="vertical" margin={{ top: 15, right: 35, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLineStroke} opacity={0.4} />
              <XAxis 
                type="number" 
                stroke={isDark ? "#94a3b8" : "#64748b"} 
                tick={{ fill: axisTickFill, fontSize: 11, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}
                label={{ value: 'Días Acumulados →', position: 'insideBottomRight', offset: -10, fill: axisLabelFill, fontSize: 11, fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }} 
              />
              <YAxis 
                type="category" 
                dataKey="spanishStage" 
                stroke={isDark ? "#94a3b8" : "#64748b"} 
                width={175}
                tick={{ fill: axisTickFill, fontSize: 12, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}
              />
              <Tooltip content={<CustomFlowTooltip isDark={isDark} />} />
              <Bar dataKey="days" radius={[0, 8, 8, 0]}>
                {stages.map((entry, index) => {
                  const isDevelopment = entry.stage && (entry.stage.includes("In Progress") || entry.stage.includes("Desarrollo"));
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isDevelopment ? '#10b981' : '#6366f1'} 
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CUELLO DE BOTELLA CLAVE E INSIGHT ANALÍTICO */}
      <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <Info size={18} />
            <span>Identificación de Cuellos de Botella</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Etapa de Mayor Fricción</span>
            <span className="text-base font-extrabold text-amber-600 dark:text-amber-300 block">{insight.main_stage || 'N/A'}</span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{insight.days_spent || 0} días</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">({insight.percentage || 0}% del tiempo total)</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-xl space-y-1 text-xs">
            <span className="font-bold text-indigo-700 dark:text-indigo-300 block">💡 Recomendación del Motor de Predictibilidad:</span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{insight.recommendation || 'Sin recomendaciones.'}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Proporción de Flujo Eficiente:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{metrics.flow_efficiency_pct || 0}% Útil</span>
        </div>
      </div>

    </div>
  );
}
