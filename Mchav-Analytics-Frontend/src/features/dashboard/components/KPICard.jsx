import React from "react";
import { TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react";

export default function KPICard({
  title,
  value,
  unit = "",
  icon: Icon,
  colorClass = "bg-indigo-500/10 text-indigo-400",
  tooltipText,
  current,
  previous,
  inverse = false,
  comparisonText = "vs anterior"
}) {
  
  const renderTrend = () => {
    if (current === undefined || previous === undefined || previous === null) {
      return null;
    }

    const diff = current - previous;

    if (diff === 0) {
      return (
        <span className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[9px] text-slate-500 dark:text-slate-400 font-bold font-mono shrink-0">
          <Minus size={9} />
          0%
        </span>
      );
    }

    const isPositiveChange = diff > 0;
    const isFavorable = inverse ? !isPositiveChange : isPositiveChange;
    const badgeColor = isFavorable 
      ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-450 border border-emerald-250 dark:border-emerald-500/25" 
      : "bg-red-500/10 text-red-650 dark:bg-red-500/15 dark:text-red-400 border border-red-250 dark:border-red-500/25";

    let labelVal = "";
    if (typeof current === 'number' && typeof previous === 'number') {
      const pct = previous === 0 ? 100 : Math.abs((diff / previous) * 100);
      labelVal = `${pct.toFixed(0)}%`;
    } else {
      labelVal = `${Math.abs(diff)}`;
    }

    return (
      <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-black font-mono tracking-wide uppercase shrink-0 ${badgeColor}`}>
        {isPositiveChange ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {labelVal}
      </span>
    );
  };

  // Determinar colores de borde y fondos degradados según el colorClass en Modo Claro y Oscuro
  let cardBorder = "border-slate-200 dark:border-white/5 hover:border-indigo-400";
  let hoverBg = "hover:bg-indigo-50/30 dark:hover:bg-[#17223F]";
  let borderColor = "border-b-indigo-500 group-hover:border-b-indigo-600";

  if (colorClass.includes("emerald")) {
    cardBorder = "border-slate-200 dark:border-white/5 hover:border-emerald-400";
    borderColor = "border-b-emerald-500 group-hover:border-b-emerald-600";
  } else if (colorClass.includes("amber")) {
    cardBorder = "border-slate-200 dark:border-white/5 hover:border-amber-400";
    borderColor = "border-b-amber-500 group-hover:border-b-amber-600";
  } else if (colorClass.includes("sky")) {
    cardBorder = "border-slate-200 dark:border-white/5 hover:border-sky-400";
    borderColor = "border-b-sky-500 group-hover:border-b-sky-600";
  }

  return (
    <div className={`group rounded-[22px] border ${cardBorder} border-b-4 ${borderColor} bg-white dark:bg-[#131B2E] p-6 shadow-md dark:shadow-xl transition-all duration-300 hover:-translate-y-1 ${hoverBg} flex flex-col justify-between h-full relative overflow-hidden`}>
      {/* Brillo de Fondo sutil en hover */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-900/5 dark:bg-white/2 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="space-y-4">
        {/* Cabecera: Sólo Icono y Título */}
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorClass} shadow-inner`}>
            {Icon && <Icon size={14} />}
          </div>
          <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-widest truncate">
            {title}
          </span>
        </div>

        {/* Valor Numérico + Tendencia */}
        <div className="pt-1 flex items-baseline justify-between gap-3">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
            {value}
            {unit && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1.5 normal-case font-sans">
                {unit}
              </span>
            )}
          </h2>
          {renderTrend()}
        </div>
      </div>

      {/* Explicación didáctica */}
      {tooltipText && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-start gap-1.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
          <HelpCircle size={12} className="shrink-0 mt-0.5 text-indigo-500 dark:text-indigo-400/80" />
          <p className="text-[10px] leading-normal font-medium">
            {tooltipText}
          </p>
        </div>
      )}
    </div>
  );
}