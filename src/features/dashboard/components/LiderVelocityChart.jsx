import React from 'react';
import { BarChart2, Info } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';

export const MetricInfoTooltip = ({ text, align = "auto" }) => {
  return (
    <div className="relative group/tooltip flex items-center inline-flex">
      <Info size={14} className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer ml-1 shrink-0" />
      <div className={`absolute bottom-full mb-2 ${align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"} hidden group-hover/tooltip:block w-64 p-3 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs rounded-xl shadow-2xl z-50 pointer-events-none text-left backdrop-blur-md font-normal leading-relaxed`}>
        {text}
        <div className={`absolute top-full ${align === "right" ? "right-3" : align === "left" ? "left-3" : "left-1/2 -translate-x-1/2"} border-4 border-transparent border-t-slate-900`}></div>
      </div>
    </div>
  );
};

const CustomVelocityTooltip = ({ active, payload, label, isDark }) => {
  if (active && payload && payload.length) {
    const compromisos = payload.find(p => p.dataKey === 'compromisos')?.value || 0;
    const entregados = payload.find(p => p.dataKey === 'entregados')?.value || 0;
    
    let pct = 0;
    let explanation = '';
    let pctColor = 'text-emerald-500 dark:text-emerald-400';

    if (compromisos > 0) {
      pct = Math.round((entregados / compromisos) * 100);
    }

    if (entregados === 0 && compromisos > 0) {
      explanation = 'Sprint activo en ejecución o proyectado. Las entregas finales se contarán al cierre.';
      pctColor = 'text-amber-500 dark:text-amber-400';
    } else if (pct >= 80) {
      explanation = `¡Gran desempeño! El equipo logró entregar el ${pct}% de los Story Points comprometidos en la planeación.`;
    } else {
      explanation = `Baja efectividad (${pct}%). Ocurrieron impedimentos o sobreestimación de capacidad en la planificación.`;
      pctColor = 'text-rose-500 dark:text-rose-400';
    }

    return (
      <div className={`p-3.5 rounded-xl border shadow-2xl max-w-xs font-sans text-xs space-y-2.5 backdrop-blur-md ${
        isDark ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{label}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 ${pctColor}`}>
            {entregados > 0 ? `${pct}% Entregado` : 'En Ejecución'}
          </span>
        </div>

        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
              SP Comprometidos:
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-100">{compromisos} SP</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span>
              SP Entregados:
            </span>
            <span className="font-extrabold text-cyan-600 dark:text-cyan-400">{entregados} SP</span>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
          💡 <strong>¿Qué significa?</strong> {explanation}
        </p>
      </div>
    );
  }
  return null;
};

export default function LiderVelocityChart({ velocityData, isDarkMode }) {
  return (
    <div className="lg:col-span-7 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-3xl p-5 shadow-sm flex flex-col h-fit space-y-4">
      <div className="flex flex-col space-y-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span>Histórico de Velocidad por Sprint</span>
            <MetricInfoTooltip text="Muestra la comparación histórica entre los Story Points comprometidos (planificados) y los realmente entregados (completados) en cada sprint para predecir la capacidad de entrega del equipo." />
          </h3>
        </div>

        {/* LEYENDA INTERACTIVA DE VELOCIDAD CON TOOLTIPS INFORMATIVOS */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="group/vel relative">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 cursor-help transition-all hover:scale-105">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              SP Comprometidos (Planificados)
            </span>
            <div className="absolute bottom-full mb-2 left-0 hidden group-hover/vel:block w-64 p-3 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs rounded-xl shadow-2xl z-50 pointer-events-none backdrop-blur-md leading-relaxed">
              <strong>🟣 SP Comprometidos:</strong> Story Points aceptados y pactados durante la reunión de Sprint Planning al arrancar el sprint.
            </div>
          </div>

          <div className="group/vel relative">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40 cursor-help transition-all hover:scale-105">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
              SP Entregados (Completados)
            </span>
            <div className="absolute bottom-full mb-2 left-0 hidden group-hover/vel:block w-64 p-3 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs rounded-xl shadow-2xl z-50 pointer-events-none backdrop-blur-md leading-relaxed">
              <strong>🔵 SP Entregados:</strong> Story Points realmente cerrados con éxito en la columna "Listo / Done" antes del fin del sprint.
            </div>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        {velocityData && velocityData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={velocityData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#475569" : "#cbd5e1"} opacity={0.4} />
              <XAxis 
                dataKey="sprint" 
                stroke={isDarkMode ? "#94a3b8" : "#475569"} 
                tickLine={false} 
                tick={{ fill: isDarkMode ? "#f8fafc" : "#1e293b", fontSize: 11, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}
              />
              <YAxis 
                stroke={isDarkMode ? "#94a3b8" : "#475569"} 
                tickLine={false} 
                tick={{ fill: isDarkMode ? "#f8fafc" : "#1e293b", fontSize: 11, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}
              />
              <RechartsTooltip content={<CustomVelocityTooltip isDark={isDarkMode} />} />
              <Bar dataKey="compromisos" fill="#4f46e5" radius={[6, 6, 0, 0]} name="SP Comprometidos" />
              <Bar dataKey="entregados" fill="#06b6d4" radius={[6, 6, 0, 0]} name="SP Entregados" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-medium">
            No hay datos de velocidad para este proyecto.
          </div>
        )}
      </div>
    </div>
  );
}
