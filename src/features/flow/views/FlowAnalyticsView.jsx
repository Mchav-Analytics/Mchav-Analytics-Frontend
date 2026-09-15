import React from 'react';
import { useFlowMetrics } from '../hooks/useFlowMetrics';
import FlowEfficiencyBar from '../components/FlowEfficiencyBar';
import CycleTimeDistribution from '../components/CycleTimeDistribution';
import BottlenecksTable from '../components/BottlenecksTable';
import BlockersTable from '../components/BlockersTable';
import AgingTable from '../components/AgingTable';
import CFDChart from '../components/CFDChart';
import { Target, Activity } from 'lucide-react';

const FlowAnalyticsView = ({ selectedProjectId, onNavigateTab }) => {
  const { 
    cycleTime, 
    efficiency, 
    bottlenecks, 
    blockers, 
    aging, 
    cfdWip, 
    isLoading, 
    isError,
    refetch
  } = useFlowMetrics(selectedProjectId);

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
        <svg className="w-16 h-16 text-slate-400 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Selecciona un proyecto para ver sus métricas de flujo.</p>
        <button 
          onClick={() => onNavigateTab('proyectos')}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
        >
          Ir a Proyectos
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-20">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Analizando flujo de trabajo y procesando histórico...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 rounded-2xl flex flex-col items-center justify-center">
        <h3 className="text-rose-600 dark:text-rose-400 font-bold mb-2">Error al cargar las métricas de flujo</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">No se pudo procesar el histórico de transiciones para este proyecto.</p>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-sm rounded transition-colors font-bold"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10 w-full font-sans text-left">
      
      {/* BARRA SUPERIOR PREMIUM */}
      <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shrink-0">
            <Activity size={24} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                Analítica Avanzada
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Análisis de Flujo (Flow Analytics)
            </h1>
          </div>
        </div>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#191c3d] dark:hover:bg-[#272b5c] rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors flex items-center gap-2 font-semibold text-xs border border-slate-200 dark:border-[#33376b] cursor-pointer"
          title="Actualizar datos"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* METRICA PRINCIPAL - Flow Efficiency (Row 1) */}
      <div className="grid grid-cols-1 gap-6">
        <FlowEfficiencyBar {...efficiency} />
      </div>

      {/* MÉTRICAS SECUNDARIAS (Row 2) */}
      <div className="grid grid-cols-1 gap-6">
        <CycleTimeDistribution data={cycleTime} />
      </div>

      {/* TABLAS Y LISTADOS (Row 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BottlenecksTable data={bottlenecks} />
        
        <div className="flex flex-col gap-6">
          <BlockersTable data={blockers} />
          <AgingTable data={aging} />
        </div>
      </div>
    </div>
  );
};

export default FlowAnalyticsView;
