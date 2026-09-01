import React from 'react';
import { useSprintHealth } from '../hooks/useSprintHealth';

// Componentes extraídos
import SprintHealthHeader from '../components/SprintHealthHeader';
import SprintHealthNav from '../components/SprintHealthNav';
import SprintHealthKpis from '../components/SprintHealthKpis';
import SprintHealthChart from '../components/SprintHealthChart';

export default function SprintHealthView({ selectedProjectId = 'PROJ-01', onNavigateToProjects, onNavigateToMatrix, onNavigateToScorecards, isDarkMode }) {
  const {
    loading,
    sprints,
    selectedSprintId,
    setSelectedSprintId,
    metrics,
    healthScore,
    stages,
    insight,
    warning
  } = useSprintHealth(selectedProjectId);

  // Detección de tema oscuro/claro
  const isDark = isDarkMode !== undefined 
    ? Boolean(isDarkMode) 
    : typeof document !== 'undefined' && (
        document.documentElement.classList.contains('dark') || 
        Boolean(document.querySelector('.dark-theme.dark')) ||
        Boolean(document.querySelector('.dashboard-layout.dark'))
      );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Analizando Salud y Predictibilidad del Sprint ({selectedSprintId})...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans text-left">
      
      {/* 1. CABECERA PRINCIPAL DE SALUD DEL SPRINT */}
      <SprintHealthHeader 
        selectedProjectId={selectedProjectId}
        onNavigateToProjects={onNavigateToProjects}
        onNavigateToMatrix={onNavigateToMatrix}
        healthScore={healthScore}
      />

      {/* 2. BARRA DE NAVEGACIÓN Y ACCESO RÁPIDO CON SELECTOR DE SPRINT */}
      <SprintHealthNav 
        sprints={sprints}
        selectedSprintId={selectedSprintId}
        setSelectedSprintId={setSelectedSprintId}
        onNavigateToMatrix={onNavigateToMatrix}
        onNavigateToScorecards={onNavigateToScorecards}
      />

      {/* 3. KPIS Y ADVERTENCIAS DE SCOPE CREEP */}
      <SprintHealthKpis 
        metrics={metrics}
        warning={warning}
      />

      {/* 4. GRÁFICO DE EFICIENCIA DE FLUJO E INSIGHTS */}
      <SprintHealthChart 
        stages={stages}
        insight={insight}
        metrics={metrics}
        isDark={isDark}
      />

    </div>
  );
}
