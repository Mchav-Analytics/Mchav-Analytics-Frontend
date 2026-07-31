import React, { useMemo } from 'react';
import { isCompleted } from '../../utils/issueHelpers';

export default function SprintRibbon({ issues = [] }) {
  const totalDays = 10;
  const todayIndex = 6; // Día 7 (índice 6)

  const dayPoints = useMemo(() => {
    const pts = Array(totalDays).fill(0);
    const completedIssues = issues.filter(isCompleted);
    const workingDayIndices = [0, 1, 2, 3, 4, 7, 8, 9];
    
    completedIssues.forEach((iss, idx) => {
      const dayIdx = workingDayIndices[idx % workingDayIndices.length];
      const sp = Number(iss.story_points || 3);
      pts[dayIdx] += sp;
    });

    return pts;
  }, [issues]);

  return (
    <div className="w-full mt-2 mb-6">
      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 px-1">
        Ritmo del sprint • puntos cerrados por día
      </div>
      
      <div className="grid grid-cols-10 gap-3">
        {Array.from({ length: totalDays }).map((_, i) => {
          const isWeekend = i === 5 || i === 6;
          const isToday = i === todayIndex;
          const points = dayPoints[i];
          const barHeight = isWeekend ? 0 : Math.max(6, points * 8);

          return (
            <div
              key={i}
              className={`
                flex flex-col justify-end items-start
                p-3.5 pb-3
                relative
                min-h-[78px]
                rounded-[16px]
                bg-[#131B2E]
                border
                transition-all
                duration-300
                ${isWeekend 
                  ? 'bg-transparent border-dashed border-white/5 opacity-30' 
                  : 'border-white/5'
                }
                ${isToday 
                  ? 'border-indigo-550 shadow-[0_0_12px_rgba(99,102,241,0.2)]' 
                  : ''
                }
              `}
            >
              {/* Número de Día */}
              <span 
                className={`
                  absolute top-2.5 left-2.5 
                  font-bold text-[10px] 
                  ${isToday ? 'text-indigo-400 font-black' : 'text-slate-500'}
                `}
              >
                {i + 1}
              </span>

              {/* Barra de Progreso Vertical */}
              {!isWeekend && (
                <div 
                  className={`
                    w-full 
                    rounded-[3px] 
                    transition-all 
                    duration-500
                    ${isToday ? 'bg-indigo-400' : 'bg-indigo-650'}
                  `}
                  style={{ height: `${barHeight}px` }}
                  title={`${points} SP cerrados`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
