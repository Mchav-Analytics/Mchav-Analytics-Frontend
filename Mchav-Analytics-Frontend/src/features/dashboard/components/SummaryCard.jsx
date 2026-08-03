import React from "react";
import { Activity } from "lucide-react";

// Umbrales del badge de salud del sprint
const HEALTH_CRITICAL_THRESHOLD = 60;
const HEALTH_AT_RISK_THRESHOLD = 85;

export default function SummaryCard({
  sprintName,
  healthScore,
}) {
  let badgeColor = "bg-emerald-500/10 text-emerald-455 border border-emerald-500/20";
  let badgeText = "Sprint Saludable";

  if (healthScore < HEALTH_CRITICAL_THRESHOLD) {
    badgeColor = "bg-red-500/10 text-red-400 border border-red-500/20";
    badgeText = "Sprint Crítico";
  } else if (healthScore < HEALTH_AT_RISK_THRESHOLD) {
    badgeColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    badgeText = "Sprint en Riesgo";
  }

  return (
    <section className="w-full">
      {/* Header Panel Único (Resumen Ejecutivo) */}
      <div className="rounded-[22px] border border-white/5 bg-[#141C2F] p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Nombre y Título */}
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-550/10">
              <Activity className="text-indigo-400" size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold">
                Resumen Ejecutivo
              </p>
              <h1 className="text-xl font-black text-white leading-tight mt-0.5">
                {sprintName || "Resumen del Sprint"}
              </h1>
            </div>
          </div>

          {/* Estado de Salud */}
          <div className="flex flex-col lg:items-end gap-1.5">
            <div className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider self-start lg:self-auto ${badgeColor}`}>
              {badgeText}
            </div>
            <div className="text-left lg:text-right flex items-center lg:flex-col gap-1.5 mt-0.5">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                Sprint Health:
              </span>
              <span className="text-xl font-black text-white ml-1 lg:ml-0 font-mono">
                {healthScore}<span className="text-indigo-455">%</span>
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}