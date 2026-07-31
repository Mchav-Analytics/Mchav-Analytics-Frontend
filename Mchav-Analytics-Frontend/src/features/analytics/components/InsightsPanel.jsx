import React, { useMemo } from "react";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Bug,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function InsightsPanel({
  activeKpi,
  prevKpi,
  issues = [],
}) {
  const insights = useMemo(() => {
    const list = [];

    if (!issues.length) return list;

    const total = issues.length;

    const completed = issues.filter((i) =>
      ["Done", "Finalizado", "Cerrado"].includes(i.status)
    ).length;

    const criticalBugs = issues.filter(
      (i) =>
        i.type === "Bug" &&
        ["Highest", "Critical"].includes(i.priority)
    ).length;

    // Velocidad

    if (activeKpi && prevKpi) {
      const diff =
        activeKpi.velocity_total_sp -
        prevKpi.velocity_total_sp;

      if (diff > 0) {
        const pct =
          prevKpi.velocity_total_sp > 0
            ? (
              (diff /
                prevKpi.velocity_total_sp) *
              100
            ).toFixed(0)
            : 100;

        list.push({
          title: "Velocidad",
          text: `La velocidad aumentó ${pct}% respecto al sprint anterior.`,
          icon: TrendingUp,
          color: "emerald",
        });
      } else if (diff < 0) {
        const pct =
          prevKpi.velocity_total_sp > 0
            ? (
              (Math.abs(diff) /
                prevKpi.velocity_total_sp) *
              100
            ).toFixed(0)
            : 100;

        list.push({
          title: "Velocidad",
          text: `La velocidad disminuyó ${pct}% por bloqueos temporales.`,
          icon: TrendingDown,
          color: "red",
        });
      } else {
        list.push({
          title: "Velocidad",
          text: `La velocidad se mantiene estable en ${activeKpi.velocity_total_sp} Story Points.`,
          icon: TrendingUp,
          color: "blue",
        });
      }
    }

    // Retrabajo

    const bugs = issues.filter(
      (i) => i.type === "Bug"
    ).length;

    const rework = Math.round((bugs / total) * 100);

    list.push({
      title: "Retrabajo",
      text:
        rework > 20
          ? `El retrabajo es del ${rework}%. Conviene revisar la calidad del desarrollo.`
          : `El retrabajo es saludable (${rework}%).`,
      icon: AlertTriangle,
      color: rework > 20 ? "yellow" : "emerald",
    });

    // Bugs

    list.push({
      title: "Bugs críticos",
      text:
        criticalBugs > 0
          ? `${criticalBugs} bugs críticos requieren atención inmediata.`
          : "No existen bugs críticos activos.",
      icon: Bug,
      color: criticalBugs ? "red" : "emerald",
    });

    // Finalización

    const completedPct = Math.round(
      (completed / total) * 100
    );

    list.push({
      title: "Estado del Sprint",
      text:
        completedPct >= 70
          ? "El sprint tiene una alta probabilidad de finalizar a tiempo."
          : "Existe riesgo de no completar el sprint en la fecha prevista.",
      icon: CheckCircle2,
      color: completedPct >= 70 ? "blue" : "yellow",
    });

    return list;
  }, [issues, activeKpi, prevKpi]);

  const colors = {
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
    },
    red: {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/20",
    },
    yellow: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
    },
    blue: {
      bg: "bg-sky-500/10",
      text: "text-sky-400",
      border: "border-sky-500/20",
    },
  };

  return (
    <section>

      <div className="flex items-center gap-3 mb-6">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">

          <Sparkles
            className="text-indigo-400"
            size={22}
          />

        </div>

        <div>

          <h2 className="text-xl font-bold text-white">
            Agile Insights
          </h2>

          <p className="text-sm text-slate-400">
            Análisis automático del sprint
          </p>

        </div>

      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        {insights.map((item, index) => {
          const style = colors[item.color];
          const Icon = item.icon;

          return (
            <div
              key={index}
              className={`rounded-3xl border ${style.border} bg-[#111827] p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
            >

              <div className="flex items-center justify-between">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.bg}`}
                >
                  <Icon
                    className={style.text}
                    size={22}
                  />
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${style.bg} ${style.text}`}
                >
                  Insight
                </span>

              </div>

              <h3 className="mt-5 text-lg font-bold text-white">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                {item.text}
              </p>

            </div>
          );
        })}

      </div>

    </section>
  );
}