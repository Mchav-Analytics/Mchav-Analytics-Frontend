import React from "react";
import { Users, FolderKanban, RotateCw, UserCheck, AlertTriangle, TrendingUp } from "lucide-react";

export default function AdminKPIGrid() {
  const adminMetrics = [
    {
      title: "Usuarios registrados",
      value: "54",
      subtext: "+5 esta semana",
      isTrendUp: true,
      icon: Users,
      bgClass: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
      borderClass: "border-blue-100 dark:border-blue-500/15"
    },
    {
      title: "Proyectos conectados",
      value: "12",
      subtext: "+2 este mes",
      isTrendUp: true,
      icon: FolderKanban,
      bgClass: "bg-purple-50 dark:bg-purple-500/10 text-purple-650 dark:text-purple-400",
      borderClass: "border-purple-100 dark:border-purple-500/15"
    },
    {
      title: "Sincronizaciones",
      value: "11 / 12",
      subtext: "91.7% exitosas",
      isSuccessful: true,
      icon: RotateCw,
      bgClass: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      borderClass: "border-emerald-100 dark:border-emerald-500/15"
    },
    {
      title: "Usuarios activos hoy",
      value: "37",
      subtext: "68.5% del total",
      isActiveSub: true,
      icon: UserCheck,
      bgClass: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-450",
      borderClass: "border-amber-100 dark:border-amber-500/15"
    },
    {
      title: "Alertas activas",
      value: "4",
      subtext: "Requieren atención",
      isAlert: true,
      icon: AlertTriangle,
      bgClass: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-450",
      borderClass: "border-rose-100 dark:border-rose-500/15"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full">
      {adminMetrics.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white dark:bg-slate-900 border ${card.borderClass} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4`}
          >
            {/* Círculo del Icono */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.bgClass} shrink-0`}>
              <Icon size={20} />
            </div>

            {/* Bloque de Textos */}
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
                {card.title}
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mt-1 select-none font-mono">
                {card.value}
              </h2>
              
              {/* Subtexto */}
              <div className="mt-1 flex items-center gap-1">
                {card.isTrendUp && (
                  <TrendingUp size={10} className="text-emerald-555 shrink-0" />
                )}
                <span className={`text-[10px] font-bold ${
                  card.isAlert 
                    ? 'text-rose-600 dark:text-rose-450' 
                    : card.isSuccessful || card.isTrendUp 
                      ? 'text-emerald-555 dark:text-emerald-450' 
                      : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {card.subtext}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
