import React from 'react';
import { Info } from 'lucide-react';

// Tooltip explicativo genérico controlado con estado React
export const InfoTooltip = ({ text, align = "center", position = "bottom" }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => e.stopPropagation()}
      className="relative inline-flex items-center cursor-pointer ml-1 shrink-0 z-40"
    >
      <div className="p-0.5 rounded-full text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
        <Info size={13} />
      </div>

      {isHovered && (
        <div className={`absolute z-50 w-60 p-3 bg-slate-950/95 text-slate-100 text-[11px] font-medium leading-relaxed rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.85)] border border-slate-700/80 pointer-events-none text-left backdrop-blur-md normal-case tracking-normal ${
          position === "bottom" ? "top-full mt-2.5" : "bottom-full mb-2.5"
        } ${
          align === "right"
            ? "right-0"
            : align === "left"
            ? "left-0"
            : "left-1/2 -translate-x-1/2"
        }`}>
          <span className="block">{text}</span>
          <div className={`absolute border-4 border-transparent ${
            position === "bottom"
              ? "bottom-full border-b-slate-950"
              : "top-full border-t-slate-950"
          } ${
            align === "right"
              ? "right-3"
              : align === "left"
              ? "left-3"
              : "left-1/2 -translate-x-1/2"
          }`}></div>
        </div>
      )}
    </div>
  );
};

// Tooltip flotante de gráficas
export const EnrichedChartTooltip = ({ active, payload, label, unit = "incidencias", titlePrefix = "Información" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-[#11152a]/95 text-white border border-slate-700/80 rounded-2xl p-3.5 text-xs shadow-2xl backdrop-blur-md min-w-[200px] text-left space-y-2">
        <div className="font-extrabold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center justify-between">
          <span>{label ? `${titlePrefix}: ${label}` : titlePrefix}</span>
          <span className="text-[10px] text-indigo-400 font-mono">Jira Cloud</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5" style={{ color: item.color || item.fill }}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color || item.fill }} />
                {item.name || item.dataKey}:
              </span>
              <span className="font-extrabold text-slate-100">
                {item.value} <span className="text-[10px] text-slate-400 font-normal">{unit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};
