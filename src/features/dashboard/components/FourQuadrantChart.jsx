// ============================================================================
// COMPONENTE GRÁFICO DE 4 CUADRANTES (FOUR QUADRANT CHART) — RECHARTS ENHANCED
// ============================================================================

import React, { useState, useMemo } from 'react';
import { Info, Trophy, BarChart2, Table, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
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
  ReferenceArea,
  Cell,
  LabelList
} from 'recharts';

function FourQuadrantChart({ developers = [], onSelectDev, isDarkMode }) {
  const [selectedQuadrant, setSelectedQuadrant] = useState('ALL');
  const [viewMode, setViewMode] = useState('CHART'); // 'CHART' | 'TABLE'

  // Detección de modo oscuro: evalúa prop isDarkMode o clases globales
  const isDark = isDarkMode !== undefined 
    ? Boolean(isDarkMode) 
    : typeof document !== 'undefined' && (
        document.documentElement.classList.contains('dark') || 
        Boolean(document.querySelector('.dark-theme.dark')) ||
        Boolean(document.querySelector('.dashboard-layout.dark'))
      );

  const axisLabelFill = isDark ? '#ffffff' : '#0f172a';
  const axisTickFill = isDark ? '#f8fafc' : '#1e293b';

  // Identificar el desarrollador con mayor puntuación (#1 Top Performer del equipo)
  const topPerformerScore = useMemo(() => {
    if (!developers.length) return 0;
    return Math.max(...developers.map(d => Number(d.performance_score) || 0));
  }, [developers]);

  // Posiciones radiales en abanico amplio alrededor de los nodos con conectores
  const radialPositions = [
    { dx: 52, dy: -22 },  // 0: Arriba-Derecha
    { dx: -52, dy: -22 }, // 1: Arriba-Izquierda
    { dx: 52, dy: 22 },   // 2: Abajo-Derecha
    { dx: -55, dy: 22 },  // 3: Abajo-Izquierda
    { dx: 0, dy: -32 },   // 4: Arriba-Centro
    { dx: 0, dy: 32 }     // 5: Abajo-Centro
  ];

  const usedCoords = new Set();

  const data = useMemo(() => {
    return developers.map((d, index) => {
      let rawX = Number(d.quality_pct) || 80;
      let rawY = Number(d.performance_score) || 70;

      // Jitter / Dispersión inteligente si dos o más desarrolladores caen en un rango de coordenadas muy cercano
      let coordKey = `${Math.round(rawX / 3.5)}_${Math.round(rawY / 3.5)}`;
      if (usedCoords.has(coordKey)) {
        const multiplier = Math.floor(index / 2) + 1;
        rawX += (index % 2 === 0 ? 3.2 : -3.2) * multiplier;
        rawY += (index % 2 === 0 ? -3.2 : 3.2) * multiplier;
      }
      usedCoords.add(coordKey);

      const displayName = d.nombre 
        ? d.nombre.split(' ')[0] 
        : (d.email ? d.email.split('@')[0].substring(0, 10) : 'Dev');

      const qCode = d.cuadrante?.codigo || 'METODICO';
      const colorMap = {
        ESTRELLA: '#10b981',    // Esmeralda / Verde
        METODICO: '#6366f1',    // Índigo / Azul
        ALTO_VOLUMEN: '#f59e0b',// Ámbar / Amarillo
        ATASCADO: '#f43f5e'     // Rosa / Rojo
      };

      const isTopPerformer = (Number(d.performance_score) || 0) === topPerformerScore && topPerformerScore > 0;
      const isSelected = selectedQuadrant === 'ALL' || qCode === selectedQuadrant;

      const pos = radialPositions[index % radialPositions.length];

      return {
        x: Math.min(Math.max(rawX, 44), 96),
        y: Math.min(Math.max(rawY, 44), 96),
        z: (d.throughput_issues || 5) * 15 + 100,
        name: displayName,
        fullName: d.nombre || d.email,
        email: d.email,
        qCode,
        fillColor: colorMap[qCode] || '#6366f1',
        isTopPerformer,
        isSelected,
        dx: pos.dx,
        dy: pos.dy,
        devData: d
      };
    });
  }, [developers, selectedQuadrant, topPerformerScore]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const dev = dataPoint.devData;
      const q = dev.cuadrante || {};

      return (
        <div className="bg-slate-900 border border-slate-700 text-white p-3.5 rounded-xl shadow-2xl max-w-xs text-xs space-y-2.5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              {dataPoint.isTopPerformer && <Trophy size={14} className="text-amber-400 shrink-0" />}
              <span className="font-bold text-sm text-indigo-300">{dev.nombre || dataPoint.name}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
              #{dev.rank_posicion || '1'} {dev.badge_honor ? dev.badge_honor.split(' ')[0] : ''}
            </span>
          </div>

          <p className="text-slate-400 text-[11px] font-mono">{dev.email || 'N/A'}</p>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Performance Score:</span>
              <span className="font-extrabold text-emerald-400">{dev.performance_score || dataPoint.y} / 100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Índice Calidad:</span>
              <span className="font-bold text-cyan-300">{dev.quality_pct || dataPoint.x}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cycle Time:</span>
              <span className="font-semibold text-slate-200">{dev.cycle_time_dias || 2.5} días/ticket</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-400">Cuadrante:</span>
              <span className="font-bold text-purple-300 text-[10px] px-2 py-0.5 rounded bg-purple-950/50 border border-purple-800/40">
                {q.nombre || 'Metódico'}
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

  // Renderizador personalizado de etiquetas en abanico con conector sutil
  const renderBadgeLabel = (props) => {
    const { x, y, value, payload } = props;
    if (!value || !payload?.isSelected) return null;

    const dx = payload?.dx ?? 0;
    const dy = payload?.dy ?? -24;
    const xPos = x + dx;
    const yPos = y + dy;
    const labelText = String(value);

    const pillWidth = Math.max(labelText.length * 6.5 + (payload.isTopPerformer ? 26 : 14), 42);

    return (
      <g className="pointer-events-none">
        {/* Línea conectora sutil hacia el nodo del desarrollador */}
        <line
          x1={x}
          y1={y}
          x2={xPos}
          y2={yPos}
          stroke={payload.isTopPerformer ? '#f59e0b' : payload?.fillColor || '#6366f1'}
          strokeWidth={payload.isTopPerformer ? 1.8 : 1.2}
          strokeDasharray="2 2"
          opacity={0.75}
        />
        {/* Fondo Pill Elegante */}
        <rect
          x={xPos - pillWidth / 2}
          y={yPos - 9}
          width={pillWidth}
          height={18}
          rx={9}
          fill={isDark ? '#0f172a' : '#ffffff'}
          fillOpacity={0.94}
          stroke={payload.isTopPerformer ? '#f59e0b' : payload?.fillColor || '#6366f1'}
          strokeWidth={payload.isTopPerformer ? 2 : 1.5}
          style={{ filter: payload.isTopPerformer ? 'drop-shadow(0px 0px 8px rgba(245, 158, 11, 0.6))' : 'drop-shadow(0px 2px 5px rgba(0, 0, 0, 0.25))' }}
        />
        {/* Texto nítido con alto contraste */}
        <text
          x={xPos}
          y={yPos + 1}
          fill={isDark ? '#f8fafc' : '#0f172a'}
          textAnchor="middle"
          fontSize={10}
          fontWeight={800}
          dominantBaseline="middle"
        >
          {payload.isTopPerformer ? `👑 ${labelText}` : labelText}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-2xl p-5 shadow-sm dark:shadow-2xl space-y-4">
      
      {/* CABECERA DEL COMPONENTE GRÁFICO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 size={18} className="text-indigo-500" />
            Matriz de Rendimiento & Calidad del Equipo
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Distribución de desarrolladores en 4 cuadrantes analíticos según su desempeño y calidad de código.
          </p>
        </div>
      </div>

      {/* 💡 GUÍA EXPLICATIVA CLARA PARA USUARIOS */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
            <Info size={15} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">¿Cómo interpretar este gráfico?</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
              • <strong>Eje Vertical (Y): Performance Score (0-100 pts)</strong> = Mide el rendimiento general y velocidad de entrega.<br />
              • <strong>Eje Horizontal (X): Calidad (%)</strong> = Porcentaje de entregas sin errores ni devoluciones.
            </p>
          </div>
        </div>
        <div className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 shrink-0 self-stretch md:self-auto flex items-center justify-center">
          Más arriba = Más rápido | Más a la derecha = Mejor calidad
        </div>
      </div>

      {/* 🌟 LEYENDA SUPERIOR CON FILTRADO INTERACTIVO CLICABLE */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pb-1">
        <button
          type="button"
          onClick={() => setSelectedQuadrant('ALL')}
          className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            selectedQuadrant === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 shadow-sm'
              : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Filter size={12} />
          Todos ({developers.length})
        </button>

        <div className="group relative">
          <button
            type="button"
            onClick={() => setSelectedQuadrant('ESTRELLA')}
            className={`w-full flex items-center justify-between gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
              selectedQuadrant === 'ESTRELLA'
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-200 hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="text-xs font-bold truncate">ESTRELLA</span>
            </div>
            <Info size={13} className="opacity-60 group-hover:opacity-100 shrink-0" />
          </button>
          
          {/* Tooltip Explicativo Flotante */}
          <div className="absolute top-full mt-2 left-0 hidden group-hover:block w-72 p-3.5 bg-slate-900/95 border border-slate-700 text-slate-100 text-xs rounded-2xl shadow-2xl z-50 pointer-events-none backdrop-blur-md leading-relaxed space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-black text-emerald-400">Cuadrante Estrella</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">Calidad ≥75% | Score ≥70</span>
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>• Qué mide:</strong> Desarrolladores con alto rendimiento y máxima precisión en entregas.
            </p>
            <p className="text-[11px] text-slate-400">
              <strong>• Significado:</strong> Referentes del equipo. Producen alto volumen de valor rápido y sin devoluciones en QA.
            </p>
          </div>
        </div>

        <div className="group relative">
          <button
            type="button"
            onClick={() => setSelectedQuadrant('METODICO')}
            className={`w-full flex items-center justify-between gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
              selectedQuadrant === 'METODICO'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                : 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-500/30 text-indigo-950 dark:text-indigo-200 hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
              <span className="text-xs font-bold truncate">METÓDICO</span>
            </div>
            <Info size={13} className="opacity-60 group-hover:opacity-100 shrink-0" />
          </button>

          {/* Tooltip Explicativo Flotante */}
          <div className="absolute top-full mt-2 left-0 hidden group-hover:block w-72 p-3.5 bg-slate-900/95 border border-slate-700 text-slate-100 text-xs rounded-2xl shadow-2xl z-50 pointer-events-none backdrop-blur-md leading-relaxed space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-black text-indigo-400">Cuadrante Metódico</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">Calidad ≥75% | Score &lt;70</span>
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>• Qué mide:</strong> Desarrolladores con excelente calidad de código y tasa de fallos casi nula.
            </p>
            <p className="text-[11px] text-slate-400">
              <strong>• Significado:</strong> Programadores minuciosos. Priorizan código limpio y robusto sobre la velocidad pura.
            </p>
          </div>
        </div>

        <div className="group relative">
          <button
            type="button"
            onClick={() => setSelectedQuadrant('ALTO_VOLUMEN')}
            className={`w-full flex items-center justify-between gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
              selectedQuadrant === 'ALTO_VOLUMEN'
                ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/30 text-amber-950 dark:text-amber-200 hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
              <span className="text-xs font-bold truncate">ALTO VOLUMEN</span>
            </div>
            <Info size={13} className="opacity-60 group-hover:opacity-100 shrink-0" />
          </button>

          {/* Tooltip Explicativo Flotante */}
          <div className="absolute top-full mt-2 right-0 hidden group-hover:block w-72 p-3.5 bg-slate-900/95 border border-slate-700 text-slate-100 text-xs rounded-2xl shadow-2xl z-50 pointer-events-none backdrop-blur-md leading-relaxed space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-black text-amber-400">Cuadrante Alto Volumen</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">Calidad &lt;75% | Score ≥70</span>
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>• Qué mide:</strong> Desarrolladores con entrega acelerada y alto volumen de tareas completadas.
            </p>
            <p className="text-[11px] text-slate-400">
              <strong>• Significado:</strong> Producen rápido pero requieren apoyo en revisión de PRs y QA para evitar devoluciones.
            </p>
          </div>
        </div>

        <div className="group relative">
          <button
            type="button"
            onClick={() => setSelectedQuadrant('ATASCADO')}
            className={`w-full flex items-center justify-between gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
              selectedQuadrant === 'ATASCADO'
                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30 text-rose-950 dark:text-rose-200 hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
              <span className="text-xs font-bold truncate">ATASCADO</span>
            </div>
            <Info size={13} className="opacity-60 group-hover:opacity-100 shrink-0" />
          </button>

          {/* Tooltip Explicativo Flotante */}
          <div className="absolute top-full mt-2 right-0 hidden group-hover:block w-72 p-3.5 bg-slate-900/95 border border-slate-700 text-slate-100 text-xs rounded-2xl shadow-2xl z-50 pointer-events-none backdrop-blur-md leading-relaxed space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-black text-rose-400">Cuadrante Atascado</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">Calidad &lt;75% | Score &lt;70</span>
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>• Qué mide:</strong> Desarrolladores con rendimiento moderado y tasa de retrabajo que requiere atención.
            </p>
            <p className="text-[11px] text-slate-400">
              <strong>• Significado:</strong> Indicio de bloqueo técnico o complejidad. Requiere mentoría o apoyo del Líder Técnico.
            </p>
          </div>
        </div>
      </div>

      {/* ÁREA DE CONTENIDO GRÁFICO */}
      <div className="w-full h-[440px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 30, right: 130, bottom: 45, left: 35 }}>
              
              {/* ÁREAS SOMBREADAS DE LOS 4 CUADRANTES (ZONAS DE SALUD) */}
              {/* Cuadrante 1: ESTRELLA (Top Right) */}
              <ReferenceArea x1={75} x2={100} y1={70} y2={100} fill="#10b981" fillOpacity={isDark ? 0.07 : 0.04} />
              {/* Cuadrante 2: ALTO VOLUMEN (Top Left) */}
              <ReferenceArea x1={40} x2={75} y1={70} y2={100} fill="#f59e0b" fillOpacity={isDark ? 0.07 : 0.04} />
              {/* Cuadrante 3: METÓDICO (Bottom Right) */}
              <ReferenceArea x1={75} x2={100} y1={40} y2={70} fill="#6366f1" fillOpacity={isDark ? 0.07 : 0.04} />
              {/* Cuadrante 4: ATASCADO (Bottom Left) */}
              <ReferenceArea x1={40} x2={75} y1={40} y2={70} fill="#f43f5e" fillOpacity={isDark ? 0.07 : 0.04} />

              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Calidad %" 
                unit="%" 
                domain={[40, 100]}
                stroke={isDark ? "#94a3b8" : "#64748b"} 
                tickCount={7}
                tick={{ fill: axisTickFill, fontSize: 11, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}
                label={{ value: 'Calidad del Código / Entregas sin Devoluciones (%)', position: 'insideBottomRight', offset: -10, fill: axisLabelFill, fontSize: 11, fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}
              />
              
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Performance Score" 
                domain={[40, 100]}
                stroke={isDark ? "#94a3b8" : "#64748b"} 
                tickCount={7}
                tick={{ fill: axisTickFill, fontSize: 11, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}
                label={{ value: 'Rendimiento y Velocidad (Score 0-100 pts)', angle: -90, position: 'insideLeft', offset: 10, fill: axisLabelFill, fontSize: 11, fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}
              />
              
              <ZAxis type="number" dataKey="z" range={[160, 480]} name="Throughput" />

              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#6366f1' }} />

              {/* Ejes Umbral de Cuadrantes (Intersección en Calidad=75, Score=70) */}
              <ReferenceLine x={75} stroke="#38bdf8" strokeWidth={2} strokeDasharray="4 4" label={{ value: 'Umbral Calidad 75%', position: 'top', fill: '#38bdf8', fontSize: 11, fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }} />
              <ReferenceLine y={70} stroke="#a855f7" strokeWidth={2} strokeDasharray="4 4" label={{ value: 'Promedio Score 70 pts', position: 'insideTopRight', fill: '#e9d5ff', fontSize: 11, fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }} />

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
                    fillOpacity={entry.isSelected ? 1 : 0.2}
                    stroke={entry.isTopPerformer ? '#f59e0b' : '#ffffff'}
                    strokeWidth={entry.isTopPerformer ? 3.5 : 2.5}
                    style={{ filter: entry.isTopPerformer ? 'drop-shadow(0px 0px 10px rgba(245, 158, 11, 0.8))' : 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.4))', cursor: 'pointer' }}
                  />
                ))}
                <LabelList dataKey="name" content={renderBadgeLabel} />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
    </div>
  );
}

export default FourQuadrantChart;
