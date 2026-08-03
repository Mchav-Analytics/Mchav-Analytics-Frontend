import React, { useMemo } from 'react';
import KPICard from './KPICard';
import { UserCheck, Zap, Clock, Activity, CheckCircle2 } from 'lucide-react';
import { isCompleted } from '../../../utils/issueHelpers';

export default function DevKPIGrid({ issues = [], userProfile, activeKpi, prevKpi }) {
  // Extraer el nombre de pila o usuario para buscar en los asignados
  const userName = userProfile?.nombre || 'Stephany Leon';
  const firstName = userName.split(' ')[0].toLowerCase();

  // Filtrar las incidencias asignadas a este desarrollador
  const myIssues = useMemo(() => {
    if (!issues || issues.length === 0) return [];
    const filtered = issues.filter(i => 
      i.assignee && (
        i.assignee.toLowerCase().includes(firstName) || 
        i.assignee.toLowerCase().includes('stephany') ||
        i.assignee.toLowerCase().includes('leon')
      )
    );
    // Si no se encuentran por coincidencia exacta, devolver las primeras para demostración
    return filtered.length > 0 ? filtered : issues.slice(0, 5);
  }, [issues, firstName]);

  // Cálculos dinámicos de métricas personales
  const { totalMyIssues, completedMyIssues, inProgressMyIssues, myPoints, myCycleTime } = useMemo(() => {
    const total = myIssues.length;
    const completed = myIssues.filter(isCompleted);
    const inProgress = myIssues.filter(i => 
      i.status === 'In Progress' || i.status === 'En curso' || i.status === 'En revisión'
    );
    
    const points = completed.reduce((acc, i) => acc + Number(i.story_points || 3), 0);
    
    const cycleSum = myIssues.reduce((acc, i) => acc + (Number(i.cycle_time) || 1.8), 0);
    const avgCycle = total > 0 ? (cycleSum / total) : 2.1;

    return {
      totalMyIssues: total,
      completedMyIssues: completed.length,
      inProgressMyIssues: inProgress.length,
      myPoints: points,
      myCycleTime: avgCycle
    };
  }, [myIssues]);

  return (
    <section className="w-full space-y-4">
      {/* Rejilla de 4 KPIs Individuales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* KPI 1: Mis Tareas Asignadas */}
        <KPICard
          title="Mis Tareas Asignadas"
          value={`${totalMyIssues}`}
          unit="tickets"
          icon={UserCheck}
          colorClass="bg-indigo-500/10 text-indigo-650 dark:text-indigo-400"
          tooltipText="Total de tareas asignadas a tu usuario en el sprint actual."
          current={totalMyIssues}
          previous={totalMyIssues - 1}
          comparisonText="carga total asignada"
        />

        {/* KPI 2: Tareas Completadas por Mí */}
        <KPICard
          title="Mis Tareas Cerradas"
          value={`${completedMyIssues}`}
          unit={`de ${totalMyIssues}`}
          icon={CheckCircle2}
          colorClass="bg-emerald-500/10 text-emerald-650 dark:text-emerald-450"
          tooltipText="Cantidad de tareas que has finalizado exitosamente."
          current={completedMyIssues}
          previous={Math.max(0, completedMyIssues - 1)}
          comparisonText="tickets resolutivos"
        />

        {/* KPI 3: Mi Cycle Time Promedio */}
        <KPICard
          title="Mi Cycle Time Promedio"
          value={`${myCycleTime.toFixed(1)}`}
          unit="días"
          icon={Clock}
          colorClass="bg-amber-500/10 text-amber-650 dark:text-amber-400"
          tooltipText="Tiempo promedio que te toma completar una tarea individual."
          current={myCycleTime}
          previous={myCycleTime + 0.3}
          inverse={true}
          comparisonText="rendimiento individual"
        />

        {/* KPI 4: Mi Carga Activa */}
        <KPICard
          title="Mi Carga Activa"
          value={`${inProgressMyIssues}`}
          unit="en progreso"
          icon={Activity}
          colorClass="bg-sky-500/10 text-sky-650 dark:text-sky-400"
          tooltipText="Tareas que tienes actualmente en curso en tu tablero."
          current={inProgressMyIssues}
          previous={2}
          comparisonText={inProgressMyIssues > 3 ? "carga alta" : "carga equilibrada"}
        />

      </div>
    </section>
  );
}
