import React, { useMemo } from "react";
import { ShieldAlert, AlertTriangle, Bug, Award, CheckCircle2, Bell, BellRing } from "lucide-react";
import { isCriticalBug, isBottleneck } from "../../../utils/issueHelpers";

export default function SprintHealth({
  healthScore = 0,
  issues = [],
  isDarkMode = true
}) {
  // 1. Determinar color y texto de salud original
  const { color, label, description } = useMemo(() => {
    let strokeColor = "#10B981"; // Emerald
    let healthLabel = "Excelente";
    let healthDesc = "El sprint avanza según lo esperado.";

    if (healthScore < 50) {
      strokeColor = "#EF4444"; // Red
      healthLabel = "Crítico";
      healthDesc = "Existen riesgos importantes para cumplir el sprint.";
    } else if (healthScore < 85) {
      strokeColor = "#F59E0B"; // Amber
      healthLabel = "Estable";
      healthDesc = "El sprint necesita seguimiento para evitar retrasos.";
    }

    return { color: strokeColor, label: healthLabel, description: healthDesc };
  }, [healthScore]);

  // 2. Calcular flags de tareas con sus detalles
  const { criticalBugsList, blockedList } = useMemo(() => {
    const criticalBugs = issues.filter(isCriticalBug);
    const blockedTasks = issues.filter(isBottleneck);
    return { criticalBugsList: criticalBugs, blockedList: blockedTasks };
  }, [issues]);

  // 3. Distribución por tipo con colores del tema
  const distribution = useMemo(() => {
    const total = issues.length || 1;
    const stories = issues.filter(i => i.type === "Story").length;
    const bugs = issues.filter(i => i.type === "Bug").length;
    const technical = issues.filter(i => i.type !== "Story" && i.type !== "Bug").length;

    return [
      { 
        name: "Historias de Usuario", 
        count: stories, 
        pct: Math.round((stories / total) * 100), 
        color: "bg-indigo-500",
        icon: Award
      },
      { 
        name: "Bugs y Defectos", 
        count: bugs, 
        pct: Math.round((bugs / total) * 100), 
        color: "bg-rose-500",
        icon: Bug
      },
      { 
        name: "Tareas / Deuda Técnica", 
        count: technical, 
        pct: Math.round((technical / total) * 100), 
        color: "bg-amber-500",
        icon: AlertTriangle
      }
    ];
  }, [issues]);

  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
      
      {/* PANEL 1: SALUD DEL SPRINT */}
      <div className="bg-white dark:bg-[#131B2E] border border-amber-100 hover:border-amber-300 dark:border-white/5 border-t-4 border-t-amber-500/50 rounded-[22px] p-6 flex flex-col justify-between shadow-md dark:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-slate-50 dark:hover:bg-[#17223F] relative overflow-hidden h-full">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-slate-400 dark:text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Salud del sprint
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-455 mt-0.5 mb-6">
            Salud calculada sobre bugs críticos y cuellos de botella
          </p>

          {/* Calibrador Circular */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <svg width="140" height="140" className="-rotate-90">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke={isDarkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(15, 23, 42, 0.04)"}
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke={color}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - healthScore / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white font-mono leading-none">
                  {healthScore}%
                </span>
                <span
                  className="mt-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: `${color}15`,
                    color,
                  }}
                >
                  {label}
                </span>
              </div>
            </div>
          </div>

          {/* Caja de descripción */}
          <div className="rounded-xl bg-slate-50 dark:bg-[#1B243B]/65 p-3.5 border border-slate-100 dark:border-white/[0.02] text-center mb-6">
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-350 font-medium">
              {description}
            </p>
          </div>
        </div>

        {/* Listado de Flags del Sprint (Alertas Didácticas Activas) */}
        <div className="flex flex-col gap-2.5 mt-2">
          {criticalBugsList.length > 0 ? (
            criticalBugsList.map(b => (
              <div key={b.key} className="flex items-start gap-2.5 text-[11px] text-rose-850 dark:text-slate-300 bg-rose-500/10 px-3.5 py-2.5 rounded-xl border border-rose-500/20 shadow-inner">
                <BellRing size={13} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                <span>
                  <strong className="text-rose-900 dark:text-white font-mono">{b.key}</strong>: Bug crítico asignado a <span className="font-bold text-indigo-650 dark:text-indigo-300">{b.assignee || 'sin asignar'}</span> requiere atención inmediata.
                </span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2.5 text-[11px] text-slate-650 dark:text-slate-400 bg-slate-50 dark:bg-[#1B243B]/15 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 opacity-80">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              <span>Sin bugs críticos abiertos en el sprint</span>
            </div>
          )}

          {blockedList.length > 0 ? (
            blockedList.map(b => (
              <div key={b.key} className="flex items-start gap-2.5 text-[11px] text-amber-850 dark:text-slate-300 bg-amber-500/10 px-3.5 py-2.5 rounded-xl border border-amber-500/20 shadow-inner">
                <Bell size={13} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-amber-900 dark:text-white font-mono">{b.key}</strong>: Tarea demorada ({Number(b.cycle_time).toFixed(1)}d en curso). Sugerencia: revisar con <span className="font-bold text-indigo-650 dark:text-indigo-300">{b.assignee || 'sin asignar'}</span> en la Daily.
                </span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2.5 text-[11px] text-slate-650 dark:text-slate-400 bg-slate-50 dark:bg-[#1B243B]/15 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 opacity-80">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              <span>Sin tareas demoradas o retrasos detectados</span>
            </div>
          )}
        </div>
      </div>

      {/* PANEL 2: DISTRIBUCIÓN DEL TRABAJO */}
      <div className="bg-white dark:bg-[#131B2E] border border-indigo-100 hover:border-indigo-300 dark:border-white/5 border-t-4 border-t-indigo-500/50 rounded-[22px] p-6 flex flex-col justify-between shadow-md dark:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-slate-50 dark:hover:bg-[#17223F] relative overflow-hidden h-full">
        <div>
          <div className="flex items-center gap-2">
            <Award size={16} className="text-slate-400 dark:text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Distribución del trabajo
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-455 mt-0.5 mb-6">
            Por tipo de incidencia, sprint actual
          </p>

          <div className="flex flex-col gap-5 mt-2">
            {distribution.map((dist, idx) => {
              const IconComp = dist.icon;
              return (
                <div key={idx} className="w-full">
                  <div className="flex justify-between items-center text-xs text-slate-700 dark:text-slate-350 mb-2">
                    <span className="font-bold flex items-center gap-2">
                      <IconComp size={14} className="text-slate-500 dark:text-slate-400" />
                      {dist.name}
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-[#1B243B]/60 px-2 py-0.5 rounded-md text-[10px]">
                      {dist.count} ({dist.pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-[#1B243B] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${dist.color} rounded-full transition-all duration-500`}
                      style={{ width: `${dist.pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}