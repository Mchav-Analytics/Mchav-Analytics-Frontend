import React, { useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { isCompleted } from '../../../utils/issueHelpers';

export default function BurndownChart({ issues = [], isDarkMode = true }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const { burndownData, totalSP, completedSP, remainingSP } = useMemo(() => {
    const totalSp = issues.reduce((acc, issue) => acc + Number(issue.story_points || 3), 0) || 120;
    const completedSp = issues.filter(isCompleted).reduce((acc, issue) => acc + Number(issue.story_points || 3), 0);
    const remainingSp = Math.max(0, totalSp - completedSp);

    const totalDays = 10;
    const todayIndex = 6; // Día 7 (índice 6)

    const data = [];
    const step = completedSp / todayIndex;

    for (let i = 0; i < totalDays; i++) {
      const ideal = Math.max(0, totalSp - i * (totalSp / (totalDays - 1)));
      let real = null;
      if (i <= todayIndex) {
        real = Math.max(0, totalSp - i * step);
      }
      data.push({
        day: `D${i + 1}`,
        ideal: Number(ideal.toFixed(1)),
        real: real !== null ? Number(real.toFixed(1)) : null,
      });
    }

    return {
      burndownData: data,
      totalSP: totalSp,
      completedSP: completedSp,
      remainingSP: remainingSp,
    };
  }, [issues]);

  // Dimensiones del SVG
  const width = 460;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index) => {
    return paddingLeft + (index * chartWidth) / (burndownData.length - 1);
  };

  const getY = (val) => {
    return paddingTop + chartHeight - (val / totalSP) * chartHeight;
  };

  const idealPath = useMemo(() => {
    return burndownData
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getY(d.ideal)}`)
      .join(' ');
  }, [burndownData, totalSP]);

  const realPath = useMemo(() => {
    const realPoints = burndownData.filter(d => d.real !== null);
    if (realPoints.length === 0) return '';
    return realPoints
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getY(d.real)}`)
      .join(' ');
  }, [burndownData, totalSP]);

  const areaPath = useMemo(() => {
    const realPoints = burndownData.filter(d => d.real !== null);
    if (realPoints.length === 0) return '';
    const pointsStr = realPoints.map((d, i) => `L${getX(i)},${getY(d.real)}`).join(' ');
    const firstX = getX(0);
    const lastX = getX(realPoints.length - 1);
    const zeroY = paddingTop + chartHeight;
    return `M${firstX},${zeroY} L${firstX},${getY(realPoints[0].real)} ${pointsStr} L${lastX},${zeroY} Z`;
  }, [burndownData, totalSP]);

  const projectionPath = useMemo(() => {
    const realPoints = burndownData.filter(d => d.real !== null);
    if (realPoints.length < 2) return '';
    const lastRealIdx = realPoints.length - 1;
    const lastReal = realPoints[lastRealIdx];
    return `M${getX(lastRealIdx)},${getY(lastReal.real)} L${getX(9)},${getY(remainingSP)}`;
  }, [burndownData, remainingSP, totalSP]);

  // Consejo del Coach Scrum dinámico
  const burndownAdvice = useMemo(() => {
    if (burndownData.length === 0) return '';
    const today = burndownData.filter(d => d.real !== null).pop();
    if (!today) return '';
    const diff = today.real - today.ideal;
    if (diff > 4) {
      return `Esfuerzo real por encima del ideal en ${diff.toFixed(0)} SP. Sugerencia: revisar en la Daily si hay bloqueos o dependencias.`;
    } else if (diff < -4) {
      return `¡Ritmo veloz! El esfuerzo restante está por debajo del ideal en ${Math.abs(diff).toFixed(0)} SP, previendo un cierre anticipado.`;
    }
    return `Avance óptimo. El ritmo real de quemado coincide casi a la perfección con la línea ideal de entrega.`;
  }, [burndownData]);

  return (
    <div className="rounded-[22px] border border-indigo-100 hover:border-indigo-300 dark:border-white/5 bg-white dark:bg-[#131B2E] p-6 shadow-md dark:shadow-xl hover:bg-slate-50 dark:hover:bg-[#17223F] relative select-none flex flex-col justify-between h-full transition-all duration-300">
      
      {/* Cabecera del Gráfico */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Progreso de tareas (Burndown)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-455 mt-0.5">
            Esfuerzo restante en story points vs. ideal
          </p>
        </div>

        {/* Leyenda */}
        <div className="flex gap-4 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-wider font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-[#4F46E5] dark:bg-[#6366F1]"></span>
            <span className="text-slate-700 dark:text-slate-300">Real</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-[#059669] dark:bg-[#10B981]"></span>
            <span className="text-slate-700 dark:text-slate-300">Ideal</span>
          </div>
        </div>
      </div>

      {/* SVG del Burndown */}
      <div className="relative w-full h-[180px]">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDarkMode ? "#6366F1" : "#4F46E5"} stopOpacity={isDarkMode ? 0.1 : 0.15} />
              <stop offset="100%" stopColor={isDarkMode ? "#6366F1" : "#4F46E5"} stopOpacity={0.01} />
            </linearGradient>

            <filter id="burnGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Cuadrícula horizontal */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const val = Math.round(totalSP * ratio);
            const y = getY(val);
            return (
              <g key={i} className="opacity-40">
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke={isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(15, 23, 42, 0.06)"} 
                  strokeDasharray="2 4"
                />
                <text 
                  x={paddingLeft - 10} 
                  y={y + 3} 
                  fill={isDarkMode ? "#9CA3AF" : "#64748B"} 
                  fontSize="9" 
                  textAnchor="end" 
                  className="font-mono font-bold"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Área sombreada real */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#areaGrad)"
              className="pointer-events-none"
            />
          )}

          {/* Línea Ideal */}
          <path
            d={idealPath}
            fill="none"
            stroke={isDarkMode ? "#10B981" : "#059669"}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="pointer-events-none"
            opacity={hoveredIdx === null ? 0.8 : 0.3}
          />

          {/* Línea Real con brillo */}
          {realPath && (
            <path
              d={realPath}
              fill="none"
              stroke={isDarkMode ? "#6366F1" : "#4F46E5"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={isDarkMode ? "url(#burnGlow)" : undefined}
              className="pointer-events-none"
              opacity={hoveredIdx === null ? 1 : 0.3}
            />
          )}

          {/* Línea de Proyección */}
          {projectionPath && (
            <path
              d={projectionPath}
              fill="none"
              stroke={isDarkMode ? "#E85D4E" : "#DC2626"}
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="pointer-events-none"
              opacity={hoveredIdx === null ? 0.7 : 0.2}
            />
          )}

          {/* Nodos de los Días */}
          {burndownData.map((d, i) => {
            const x = getX(i);
            const isToday = i === 6;
            
            return (
              <g key={i}>
                <rect
                  x={x - 20}
                  y={paddingTop}
                  width={40}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />

                {isToday && d.real !== null && (
                  <circle
                    cx={x}
                    cy={getY(d.real)}
                    r="4.5"
                    fill={isDarkMode ? "#6366F1" : "#4F46E5"}
                    stroke={isDarkMode ? "#131B2E" : "#FFFFFF"}
                    strokeWidth="1.5"
                    className="pointer-events-none animate-pulse"
                  />
                )}

                <text
                  x={x}
                  y={height - 5}
                  fill={isToday ? (isDarkMode ? "#6366F1" : "#4F46E5") : (isDarkMode ? "#9CA3AF" : "#55647A")}
                  fontSize="9"
                  textAnchor="middle"
                  className="font-mono font-black"
                >
                  {d.day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Consejo del Coach Scrum */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-white/5 flex items-start gap-2 text-slate-550 dark:text-slate-400">
        <Sparkles size={13} className="shrink-0 mt-0.5 text-[#4F46E5] dark:text-[#6366F1]" />
        <p className="text-[10px] leading-relaxed font-semibold">
          {burndownAdvice}
        </p>
      </div>

      {/* Tooltip Dinámico */}
      {hoveredIdx !== null && (
        <div 
          className={`absolute z-30 border p-3 rounded-xl shadow-2xl text-xs flex flex-col gap-1 pointer-events-none transition-all duration-150 animate-fade-in ${
            isDarkMode 
              ? 'bg-[#1B243B] border-white/10 text-white' 
              : 'bg-white border-slate-200 text-slate-900'
          }`}
          style={{
            left: `${getX(hoveredIdx) - 45}px`,
            top: `${getY(burndownData[hoveredIdx].ideal) - 35}px`
          }}
        >
          <div className="font-bold">Día {hoveredIdx + 1}</div>
          <div className="text-emerald-600 dark:text-emerald-500 font-semibold">Ideal: <span className="font-mono">{burndownData[hoveredIdx].ideal} SP</span></div>
          {burndownData[hoveredIdx].real !== null ? (
            <div className="text-indigo-650 dark:text-indigo-300 font-bold">Real: <span className="font-mono">{burndownData[hoveredIdx].real} SP</span></div>
          ) : (
            <div className="text-rose-600 dark:text-rose-455 font-bold">Proyección: <span className="font-mono">{remainingSP} SP</span></div>
          )}
        </div>
      )}

    </div>
  );
}