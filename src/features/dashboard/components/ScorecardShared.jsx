import React from 'react';
import { Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

export const MetricInfoTooltip = ({ text, align = "auto", position = "top" }) => {
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
    <div className="group/tooltip relative inline-flex items-center cursor-help ml-1.5 shrink-0 z-[100]">
      <div className="p-1 rounded-full text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer border border-transparent hover:border-indigo-500/30">
        <Info size={14} className="shrink-0" />
      </div>
      <div className={`absolute ${posClass} ${alignClass} hidden group-hover/tooltip:block w-56 sm:w-64 p-3 bg-slate-900/95 dark:bg-slate-950/95 border border-slate-700/80 dark:border-indigo-500/50 text-slate-100 text-xs rounded-xl shadow-2xl z-[99999] pointer-events-none text-left backdrop-blur-md font-medium leading-relaxed`}>
        {text}
        <div className={`absolute ${arrowClass} ${align === "right" ? "right-3" : align === "left" ? "left-3" : "left-1/2 -translate-x-1/2"} border-4 border-transparent`}></div>
      </div>
    </div>
  );
};

export const SparklineMini = ({ color = "#10b981" }) => {
  const dummyData = [];
  return (
    <div className="w-20 h-7 inline-block">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dummyData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`grad_${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#grad_${color.replace('#', '')})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
