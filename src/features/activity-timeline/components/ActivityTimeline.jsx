import React from "react";
import {
  Bug,
  CheckCircle2,
  Clock3,
  PlusCircle,
  AlertTriangle,
} from "lucide-react";

const activityConfig = {
  created: {
    icon: <PlusCircle size={10} />,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    badgeBg: "bg-sky-500",
    title: "Tarea Creada",
  },
  closed: {
    icon: <CheckCircle2 size={10} />,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    badgeBg: "bg-emerald-500",
    title: "Tarea Completada",
  },
  bug: {
    icon: <Bug size={10} />,
    color: "text-rose-600 dark:text-rose-450",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    badgeBg: "bg-rose-500",
    title: "Bug Reportado",
  },
  blocked: {
    icon: <AlertTriangle size={10} />,
    color: "text-amber-600 dark:text-amber-450",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    badgeBg: "bg-amber-500",
    title: "Alerta / Impedimento",
  },
};

// Generar iniciales del usuario
const getInitials = (name = "") => {
  if (name.toLowerCase() === "sistema") return "SYS";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

// Asignar gradiente único por usuario
const getUserGradient = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("stephany")) {
    return "from-violet-500 to-indigo-600 text-white";
  }
  if (lower.includes("carlos")) {
    return "from-amber-500 to-orange-600 text-white";
  }
  if (lower.includes("sistema")) {
    return "from-slate-600 to-slate-800 text-white";
  }
  return "from-emerald-500 to-teal-600 text-white";
};

export default function ActivityTimeline({ recentActivity = [] }) {
  if (!recentActivity.length) {
    return (
      <div className="w-full rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#131B2E] p-16 shadow-md dark:shadow-xl text-center transition-all duration-300">
        <Clock3 size={44} className="text-slate-400 dark:text-slate-500 mx-auto mb-4 animate-pulse" />
        <h3 className="text-base font-bold text-slate-800 dark:text-white">No hay actividad registrada</h3>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
          Los eventos y cambios que realice el equipo durante este sprint aparecerán aquí organizados cronológicamente.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#131B2E] p-6 sm:p-8 shadow-md dark:shadow-xl space-y-7 transition-all duration-300">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
            <Clock3 size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Historial de Actividad del Sprint
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-455 mt-0.5">
              Línea de tiempo cronológica de incidencias y cambios
            </p>
          </div>
        </div>
        <span className="self-start sm:self-center rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 px-3.5 py-1 text-[10px] font-black text-slate-650 dark:text-slate-350 uppercase tracking-wider font-mono">
          {recentActivity.length} eventos registrados
        </span>
      </div>

      {/* Flujo de Línea de Tiempo Vertical */}
      <div className="relative pl-1 sm:pl-3 py-2">
        {/* Línea de conexión vertical central */}
        <div className="absolute left-[20px] sm:left-[28px] top-4 bottom-8 w-0.5 bg-slate-150 dark:bg-white/5" />

        <div className="space-y-6">
          {recentActivity.map((act, index) => {
            const cfg = activityConfig[act.type] || activityConfig.created;
            const isFirst = index === 0;

            return (
              <div key={index} className="relative flex items-start gap-4 sm:gap-5 group">
                
                {/* 1. NODO AVATAR DEL DESARROLLADOR */}
                <div className="relative shrink-0 z-10">
                  <div className={`
                    flex h-10 w-10 items-center justify-center rounded-full 
                    bg-gradient-to-br ${getUserGradient(act.user)}
                    font-mono font-black text-[11px] tracking-wider
                    shadow-md transition-all duration-300 group-hover:scale-105
                  `}>
                    {getInitials(act.user)}
                  </div>

                  {/* Icono de Estado Overlapping (Diseño Slack) */}
                  <div className={`
                    absolute -bottom-0.5 -right-0.5 h-4.5 w-4.5 rounded-full 
                    bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-white/10
                    flex items-center justify-center ${cfg.color} shadow-sm z-20
                  `}>
                    {cfg.icon}
                  </div>

                  {/* Anillo de pulso sutil para el evento más reciente */}
                  {isFirst && (
                    <span className="absolute -inset-0.5 rounded-full bg-indigo-500/25 dark:bg-indigo-500/10 animate-ping -z-10" />
                  )}
                </div>

                {/* 2. BURBUJA DE EVENTO ESTILIZADA */}
                <div className={`
                  flex-1 min-w-0 p-4.5 rounded-2xl border
                  bg-slate-50/50 dark:bg-[#1B243B]/30 
                  border-slate-200/60 dark:border-white/5
                  transition-all duration-300 
                  group-hover:bg-slate-50 dark:group-hover:bg-[#1B243B]/55
                  group-hover:border-slate-300 dark:group-hover:border-white/10
                  group-hover:shadow-sm
                `}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    
                    {/* Detalles */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-bold text-slate-900 dark:text-white">
                          {act.user}
                        </strong>
                        <span className={`
                          text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md
                          ${cfg.bg} ${cfg.color}
                        `}>
                          {cfg.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                        {act.desc}
                      </p>
                    </div>

                    {/* Metadata y Tag de Jira */}
                    <div className="flex items-center gap-3 sm:self-start shrink-0">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-mono">
                        {act.time}
                      </span>
                      <span className="rounded-lg bg-indigo-50 dark:bg-indigo-550/10 px-2.5 py-0.5 text-[10px] font-mono font-black tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/15 shadow-sm">
                        {act.key}
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}