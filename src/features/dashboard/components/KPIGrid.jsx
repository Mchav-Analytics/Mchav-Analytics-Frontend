import React, { useMemo } from "react";
import KPICard from "./KPICard";
import { Zap, CheckCircle, Clock, RotateCw } from "lucide-react";
import { isCompleted } from "../../../utils/issueHelpers";

export default function KPIGrid({
  activeKpi,
  prevKpi,
  issues = [],
}) {
  // Cálculos dinámicos basados en la lista de incidencias actual
  const { velocity, prevVelocity, completedCount, totalCount, prevCompletedCount, cycleTime, prevCycleTime, rework, prevRework } = useMemo(() => {
    // 1. Puntos Entregados (Story Points cerrados en este sprint)
    const completedSP = issues.filter(isCompleted).reduce((acc, i) => acc + Number(i.story_points || 3), 0);
    const prevCompletedSP = prevKpi ? Number(prevKpi.velocity_total_sp) : 30;
    
    // 2. Tareas Completadas
    const completed = issues.filter(isCompleted).length;
    const total = issues.length;
    const prevCompleted = prevKpi ? Number(prevKpi.throughput_issues) : 17;

    // 3. Tiempo de Ciclo Promedio
    const rawCycleTime = Number(activeKpi?.cycle_time_promedio_dias);
    const cycle = Number.isFinite(rawCycleTime) ? rawCycleTime : 2.4;
    const rawPrevCycleTime = Number(prevKpi?.cycle_time_promedio_dias);
    const prevCycle = Number.isFinite(rawPrevCycleTime) ? rawPrevCycleTime : 1.8;

    // 4. Tasa de Retrabajo (Porcentaje de bugs sobre total de tickets)
    const bugsCount = issues.filter(i => i.type === "Bug").length;
    const reworkPct = total > 0 ? Math.round((bugsCount / total) * 100) : 9;
    const prevBugsCount = 2;
    const prevReworkPct = prevKpi ? Math.round((prevBugsCount / (prevKpi.throughput_issues || 1)) * 100) : 12;

    return {
      velocity: completedSP,
      prevVelocity: prevCompletedSP,
      completedCount: completed,
      totalCount: total,
      prevCompletedCount: prevCompleted,
      cycleTime: cycle,
      prevCycleTime: prevCycle,
      rework: reworkPct,
      prevRework: prevReworkPct
    };
  }, [issues, activeKpi, prevKpi]);

  const prevSprintName = prevKpi?.sprintName ? prevKpi.sprintName.toLowerCase() : "sprint anterior";

  return (
    <section className="w-full">
      {/* Rejilla de 4 KPIs con nombres entendibles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* KPI 1: Puntos Entregados */}
        <KPICard
          title="Puntos Entregados (SP)"
          value={`${velocity}`}
          unit="sp"
          icon={Zap}
          colorClass="bg-violet-500/10 text-violet-400"
          tooltipText="Suma de Story Points (SP) de las tareas finalizadas en este sprint."
          current={velocity}
          previous={prevVelocity}
          comparisonText={`vs ${prevSprintName}`}
        />

        {/* KPI 2: Tareas Completadas */}
        <KPICard
          title="Tareas Completadas"
          value={`${completedCount}`}
          unit={`de ${totalCount}`}
          icon={CheckCircle}
          colorClass="bg-emerald-500/10 text-emerald-400"
          tooltipText="Cantidad de tareas completadas en relación al total planificado."
          current={completedCount}
          previous={prevCompletedCount}
          comparisonText="tareas cerradas"
        />

        {/* KPI 3: Tiempo de Ciclo */}
        <KPICard
          title="Tiempo de Ciclo"
          value={`${cycleTime.toFixed(1)}`}
          unit="días"
          icon={Clock}
          colorClass="bg-amber-500/10 text-amber-400"
          tooltipText="Días promedio que tarda una tarea en completarse desde que inicia desarrollo."
          current={cycleTime}
          previous={prevCycleTime}
          inverse={true}
          comparisonText={cycleTime > prevCycleTime ? "más lento" : "más rápido"}
        />

        {/* KPI 4: Tasa de Retrabajo */}
        <KPICard
          title="Tasa de Retrabajo (Bugs)"
          value={`${rework}`}
          unit="%"
          icon={RotateCw}
          colorClass="bg-sky-500/10 text-sky-400"
          tooltipText="Porcentaje de bugs reportados sobre el total de tareas en el sprint."
          current={rework}
          previous={prevRework}
          inverse={true}
          comparisonText="vs anterior"
        />

      </div>
    </section>
  );
}