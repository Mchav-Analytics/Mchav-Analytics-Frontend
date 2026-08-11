// src/features/dashboard/components/PercentilesChart.jsx
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { AlertCircle, Info } from 'lucide-react';

const InfoTooltip = ({ text, align = 'center' }) => {
  const [isHovered, React_setIsHovered] = React.useState(false);

  return (
    <div 
      onMouseEnter={() => React_setIsHovered(true)}
      onMouseLeave={() => React_setIsHovered(false)}
      onClick={(e) => e.stopPropagation()} 
      className="relative inline-flex items-center cursor-pointer ml-1.5 z-10"
    >
      <Info 
        size={14} 
        className="text-slate-400 dark:text-slate-400 hover:text-cyan-400 dark:hover:text-cyan-300 transition-colors shrink-0" 
      />
      
      {isHovered && (
        <div className={`absolute z-50 p-3 bg-slate-950/95 backdrop-blur-md text-slate-100 text-xs font-medium rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.9)] border border-slate-700/80 pointer-events-none leading-relaxed text-left w-64 animate-in fade-in duration-150 ${
          align === 'right' 
            ? 'top-full mt-2.5 right-0' 
            : 'bottom-full mb-2.5 left-1/2 -translate-x-1/2'
        }`}>
          <span className="block">{text}</span>
        </div>
      )}
    </div>
  );
};

/**
 * [HU-014] Componente reutilizable para renderizar un gráfico de barras agrupadas
 * con los percentiles (P25, P50, P75, P90) y el promedio.
 * Cumple con CA-04: Muestra una alerta si no hay suficientes datos (< 5 muestras).
 */
export default function PercentilesChart({ data, title, colorTheme = 'indigo' }) {
  // data viene del backend. Ejemplo de estructura:
  // {
  //   issue_type: "Story",
  //   has_enough_data: true,
  //   count: 12,
  //   lead_time: { avg: 5.2, p25: 2.1, p50: 4.5, p75: 7.2, p90: 10.5 },
  //   cycle_time: { avg: 3.1, p25: 1.5, p50: 2.8, p75: 4.2, p90: 6.1 }
  // }

  if (!data) return null;

  // Renderizado condicional para CA-04 (datos insuficientes)
  if (!data.has_enough_data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center mb-3 shadow-inner">
          <AlertCircle size={24} />
        </div>
        <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
          {title} — Datos Insuficientes
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs">
          Se requiere un mínimo de <strong>5 tareas</strong> resueltas en los últimos 15 días.
          <br/>(Actual: {data.count} tareas)
        </p>
      </div>
    );
  }

  // Transformar los datos para el BarChart
  // El eje X serán las métricas: "Lead Time" y "Cycle Time"
  const chartData = [
    {
      name: 'Lead Time',
      Avg: data.lead_time.avg,
      P25: data.lead_time.p25,
      P50: data.lead_time.p50,
      P75: data.lead_time.p75,
      P90: data.lead_time.p90,
    },
    {
      name: 'Cycle Time',
      Avg: data.cycle_time.avg,
      P25: data.cycle_time.p25,
      P50: data.cycle_time.p50,
      P75: data.cycle_time.p75,
      P90: data.cycle_time.p90,
    }
  ];

  // Definir colores según el tema
  const colors = {
    indigo: { avg: '#94a3b8', p25: '#c7d2fe', p50: '#818cf8', p75: '#4f46e5', p90: '#312e81' },
    emerald: { avg: '#94a3b8', p25: '#a7f3d0', p50: '#34d399', p75: '#059669', p90: '#064e3b' },
    rose: { avg: '#94a3b8', p25: '#fecdd3', p50: '#fb7185', p75: '#e11d48', p90: '#881337' }
  };
  
  const theme = colors[colorTheme] || colors.indigo;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-black uppercase text-slate-800 dark:text-slate-100">
            {title}
          </h4>
          <InfoTooltip text="Métrica calculada sobre los últimos 15 días. Conocer los percentiles (P90) te permite saber con qué rapidez se atiende el 90% de las tareas, evitando que los picos aíslados afecten el promedio." align="left" />
        </div>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
          {data.count} muestras (15 días)
        </span>
      </div>
      
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight="bold" />
            <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }} 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            
            {/* CA-02: Los percentiles se muestran junto a su promedio actual */}
            <Bar dataKey="Avg" name="Promedio" fill={theme.avg} radius={[4, 4, 0, 0]} />
            <Bar dataKey="P25" name="P25 (Rápido)" fill={theme.p25} radius={[4, 4, 0, 0]} />
            <Bar dataKey="P50" name="P50 (Mediana)" fill={theme.p50} radius={[4, 4, 0, 0]} />
            <Bar dataKey="P75" name="P75 (Lento)" fill={theme.p75} radius={[4, 4, 0, 0]} />
            <Bar dataKey="P90" name="P90 (Atípico)" fill={theme.p90} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
