import React from 'react';
import { Info } from 'lucide-react';

export const MetricInfoTooltip = ({ text, align = "auto" }) => {
  return (
    <div className="relative group/tooltip flex items-center inline-flex">
      <Info size={13} className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer ml-1 shrink-0" />
      <div className={`absolute bottom-full mb-2 ${align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"} hidden group-hover/tooltip:block w-56 p-2.5 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs rounded-xl shadow-2xl z-50 pointer-events-none text-left backdrop-blur-md font-normal leading-relaxed`}>
        {text}
        <div className={`absolute top-full ${align === "right" ? "right-3" : align === "left" ? "left-3" : "left-1/2 -translate-x-1/2"} border-4 border-transparent border-t-slate-900`}></div>
      </div>
    </div>
  );
};
