import React from 'react';
import { Info } from 'lucide-react';

export const MetricInfoTooltip = ({ text, align = "auto", position = "top" }) => {
  const alignClass =
    align === "left" ? "left-0" :
      align === "right" ? "right-0" :
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
    <div className="group/tooltip relative inline-flex items-center cursor-help ml-1.5 shrink-0 z-[100]">
      <div className="p-1 rounded-full text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer border border-transparent hover:border-indigo-500/30">
        <Info size={14} className="shrink-0" />
      </div>
      <div className={`opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 absolute ${posClass} ${alignClass} w-60 sm:w-68 p-3 bg-slate-900/95 dark:bg-slate-950/95 text-slate-100 text-xs font-medium rounded-xl shadow-2xl border border-indigo-500/60 pointer-events-none leading-relaxed text-left z-[999999] backdrop-blur-md`}>
        {text}
        <div className={`absolute ${arrowClass} ${align === "right" ? "right-3" : align === "left" ? "left-3" : "left-1/2 -translate-x-1/2"} border-4 border-transparent`}></div>
      </div>
    </div>
  );
};
