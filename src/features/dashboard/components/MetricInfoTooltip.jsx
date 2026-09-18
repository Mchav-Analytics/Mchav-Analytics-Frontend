import React from 'react';
import { Info } from 'lucide-react';

export const MetricInfoTooltip = ({ text, align = "auto", position = "bottom" }) => {
  const alignClass =
    align === "right" ? "right-0" :
      align === "left" ? "left-0" :
        "left-1/2 -translate-x-1/2";

  const posClass =
    position === "top"
      ? "bottom-full mb-2"
      : "top-full mt-2";

  const arrowClass =
    position === "top"
      ? "top-full border-t-slate-900 dark:border-t-slate-950"
      : "bottom-full border-b-slate-900 dark:border-b-slate-950";

  return (
    <div className="relative group/tooltip inline-flex items-center z-[100]">
      <Info size={14} className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer ml-1 shrink-0" />
      <div className={`absolute ${posClass} ${alignClass} hidden group-hover/tooltip:block w-56 sm:w-64 p-3 bg-slate-900/95 dark:bg-slate-950/95 border border-slate-700/80 dark:border-indigo-500/50 text-slate-100 text-xs rounded-xl shadow-2xl z-[99999] pointer-events-none text-left backdrop-blur-md font-medium leading-relaxed`}>
        {text}
        <div className={`absolute ${arrowClass} ${align === "right" ? "right-3" : align === "left" ? "left-3" : "left-1/2 -translate-x-1/2"} border-4 border-transparent`}></div>
      </div>
    </div>
  );
};
