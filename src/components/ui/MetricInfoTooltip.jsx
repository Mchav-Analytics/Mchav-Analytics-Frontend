import React from 'react';
import { Info } from 'lucide-react';

export const MetricInfoTooltip = ({ text, align = "auto" }) => {
  const alignClass =
    align === "left" ? "left-0 md:left-0 md:translate-x-0" :
      align === "right" ? "right-0 md:right-0 md:translate-x-0" :
        "left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0";

  return (
    <div className="group/tooltip relative inline-flex items-center cursor-help ml-1.5 shrink-0 z-[100]">
      <div className="p-1 rounded-full text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 transition-all cursor-pointer border border-transparent hover:border-indigo-500/30">
        <Info size={14} className="shrink-0" />
      </div>
      <div className={`opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 absolute top-full ${alignClass} mt-2 w-60 sm:w-68 p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 text-xs font-medium rounded-xl shadow-2xl border border-indigo-500/60 pointer-events-none leading-relaxed text-left z-[999999]`}>
        {text}
      </div>
    </div>
  );
};
