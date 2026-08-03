import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
} from "recharts";
import { TrendingUp, Info } from "lucide-react";

function InfoTooltip({ text, isDarkMode }) {
  return (
    <div className="group relative">
      <Info
        size={15}
        className="cursor-help text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors"
      />
      <div
        className={`
        invisible
        absolute
        left-7
        top-0
        z-50
        w-72
        rounded-2xl
        border
        p-4
        text-xs
        leading-6
        opacity-0
        shadow-xl
        transition-all
        duration-200
        group-hover:visible
        group-hover:opacity-100
        ${isDarkMode 
          ? 'bg-[#1A2238] border-slate-700 text-slate-350' 
          : 'bg-white border-slate-200 text-slate-650'
        }
      `}
      >
        {text}
      </div>
    </div>
  );
}

export default function VelocityChart({ kpis = [], isDarkMode = true }) {
  // Filtrar sprints válidos
  const chartData = kpis.filter(
    (k) => k.id_sprint !== null && k.id_sprint !== undefined
  );

  return (
    <div className="rounded-3xl border border-indigo-100 hover:border-indigo-300 dark:border-slate-700/40 bg-white dark:bg-[#131B2E] p-6 shadow-md dark:shadow-xl hover:bg-slate-50 dark:hover:bg-[#17223F] flex flex-col justify-between h-full transition-all duration-300">
      
      {/* Cabecera */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">
            <TrendingUp size={22} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Velocidad por Sprint
              </h2>
              <InfoTooltip 
                text="Compara los Story Points entregados por sprint con la velocidad histórica del equipo para evaluar si la capacidad se mantiene estable." 
                isDarkMode={isDarkMode}
              />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Evolución del rendimiento en story points
            </p>
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-indigo-600 dark:bg-indigo-500"></span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">Story Points</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-[3px] w-6 rounded-full bg-emerald-600 dark:bg-emerald-450"></span>
            <span className="text-slate-700 dark:text-slate-350 font-semibold">Promedio histórico</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="colorSpBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isDarkMode ? "#818cf8" : "#4f46e5"} stopOpacity={0.9} />
                <stop offset="100%" stopColor={isDarkMode ? "#4f46e5" : "#a5b4fc"} stopOpacity={0.6} />
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(15, 23, 42, 0.06)"} 
              vertical={false} 
            />
            <XAxis
              dataKey="sprintName"
              stroke={isDarkMode ? "#9CA3AF" : "#64748B"}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => val.replace("Sprint ", "S")}
              className="font-mono font-bold"
            />
            <YAxis 
              stroke={isDarkMode ? "#9CA3AF" : "#64748B"} 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              className="font-mono"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? "#1B243B" : "#FFFFFF",
                borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.08)",
                borderRadius: "12px",
                color: isDarkMode ? "#fff" : "#0F172A",
                fontSize: "11px",
                boxShadow: isDarkMode ? "0 10px 30px rgba(0, 0, 0, 0.4)" : "0 10px 25px rgba(0, 0, 0, 0.05)"
              }}
            />
            <Bar
              dataKey="velocity_total_sp"
              name="Story Points"
              fill="url(#colorSpBar)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Line
              type="monotone"
              dataKey="velocity_promedio_historico"
              name="Promedio histórico"
              stroke={isDarkMode ? "#10B981" : "#059669"}
              strokeWidth={2.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}