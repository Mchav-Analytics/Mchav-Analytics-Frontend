// ============================================================================
// COMPONENTE GRÁFICO DE 4 CUADRANTES (FOUR QUADRANT CHART) — RECHARTS
// ============================================================================

import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LabelList
} from 'recharts';

function FourQuadrantChart({ developers = [], onSelectDev }) {
  // Evitar solapamiento de puntos aplicando un offset visual único si comparten coordenadas
  const usedCoords = new Set();

  const data = developers.map((d, index) => {
    let rawX = Number(d.quality_pct) || 80;
    let rawY = Number(d.performance_score) || 70;

    // Jitter inteligente si dos o más desarrolladores caen en las mismas coordenadas exactas
    let coordKey = `${rawX.toFixed(1)}_${rawY.toFixed(1)}`;
    if (usedCoords.has(coordKey)) {
      rawX += (index % 2 === 0 ? 2.5 : -2.5) * (Math.floor(index / 2) + 1);
      rawY += (index % 2 === 0 ? -2.0 : 2.0) * (Math.floor(index / 2) + 1);
    }
    usedCoords.add(coordKey);

    const qCode = d.cuadrante?.codigo || 'METODICO';
    const colorMap = {
      ESTRELLA: '#10b981',    // Esmeralda / Verde
      METODICO: '#6366f1',    // Índigo / Azul
      ALTO_VOLUMEN: '#f59e0b',// Ámbar / Amarillo
      ATASCADO: '#f43f5e'     // Rosa / Rojo
    };

    return {
      x: Math.min(Math.max(rawX, 42), 98),
      y: Math.min(Math.max(rawY, 42), 98),
      z: (d.throughput_issues || 5) * 15 + 100,
      name: d.nombre ? d.nombre.split(' ')[0] : 'Dev',
      fullName: d.nombre,
      email: d.email,
      fillColor: colorMap[qCode] || '#6366f1',
      devData: d
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const dev = dataPoint.devData;
      const q = dev.cuadrante || {};

      return (
        <div className="bg-slate-900/95 border border-slate-700 text-white p-3.5 rounded-xl shadow-2xl max-w-xs text-xs space-y-2.5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span className="font-bold text-sm text-indigo-300">{dev.nombre}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
              #{dev.rank_posicion} {dev.badge_honor ? dev.badge_honor.split(' ')[0] : ''}
            </span>
          </div>

          <p className="text-slate-400 text-[11px] font-mono">{dev.email}</p>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Performance Score:</span>
              <span className="font-extrabold text-emerald-400">{dev.performance_score} / 100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Índice Calidad:</span>
              <span className="font-bold text-cyan-300">{dev.quality_pct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cycle Time:</span>
              <span className="font-semibold text-slate-200">{dev.cycle_time_dias} días/ticket</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-400">Cuadrante:</span>
              <span className="font-bold text-purple-300 text-[10px] px-2 py-0.5 rounded bg-purple-950/50 border border-purple-800/40">
                {q.nombre || 'N/A'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 italic text-center">
            Haz clic en el nodo para inspeccionar Scorecard
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full h-[400px] bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-2xl overflow-hidden">
      
      {/* Fondo Visual Elegante de los 4 Cuadrantes */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none opacity-15 p-6">
        <div className="flex items-start justify-start p-4 text-[11px] font-extrabold text-indigo-400 uppercase tracking-widest bg-indigo-950/20 rounded-tl-xl">
          🎯 METÓDICO (Calidad Impecable)
        </div>
        <div className="flex items-start justify-end p-4 text-[11px] font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-950/20 rounded-tr-xl">
          ⭐ ESTRELLA (Top Performance)
        </div>
        <div className="flex items-end justify-start p-4 text-[11px] font-extrabold text-rose-400 uppercase tracking-widest bg-rose-950/20 rounded-bl-xl">
          🐢 ATASCADO (Atención / Apoyo)
        </div>
        <div className="flex items-end justify-end p-4 text-[11px] font-extrabold text-amber-400 uppercase tracking-widest bg-amber-950/20 rounded-br-xl">
          ⚡ ALTO VOLUMEN (QA Risk)
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 25, right: 35, bottom: 25, left: 15 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
          
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Calidad %" 
            unit="%" 
            domain={[40, 100]}
            stroke="#94a3b8" 
            fontSize={11}
            tickCount={7}
            label={{ value: 'Índice de Calidad / Sin Devoluciones (%) →', position: 'insideBottomRight', offset: -12, fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
          />
          
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Score (0-100)" 
            domain={[40, 100]}
            stroke="#94a3b8" 
            fontSize={11}
            tickCount={7}
            label={{ value: '↑ Performance Score (0-100 pts)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
          />
          
          <ZAxis type="number" dataKey="z" range={[150, 450]} name="Throughput" />

          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#6366f1' }} />

          {/* Ejes Umbral de Cuadrantes (Intersección en Calidad=75, Score=70) */}
          <ReferenceLine x={75} stroke="#64748b" strokeWidth={1.5} strokeDasharray="5 5" label={{ value: 'Umbral Calidad 75%', position: 'top', fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
          <ReferenceLine y={70} stroke="#64748b" strokeWidth={1.5} strokeDasharray="5 5" label={{ value: 'Promedio Score 70 pts', position: 'right', fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />

          <Scatter 
            name="Desarrolladores" 
            data={data}
            onClick={(entry) => onSelectDev && onSelectDev(entry.devData)}
            cursor="pointer"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fillColor}
                stroke="#ffffff"
                strokeWidth={2}
                style={{ filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.4))', cursor: 'pointer' }}
              />
            ))}
            <LabelList dataKey="name" position="top" offset={10} fill="#f8fafc" fontSize={11} fontWeight={700} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

    </div>
  );
}

export default FourQuadrantChart;
