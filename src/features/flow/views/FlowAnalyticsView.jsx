import React, { useState } from 'react';
import { useFlowMetrics } from '../hooks/useFlowMetrics';
import FlowEfficiencyBar from '../components/FlowEfficiencyBar';
import CycleTimeDistribution from '../components/CycleTimeDistribution';
import BottlenecksTable from '../components/BottlenecksTable';
import BlockersTable from '../components/BlockersTable';
import AgingTable from '../components/AgingTable';
import { Activity, Calendar, Filter, RotateCw } from 'lucide-react';

const FlowAnalyticsView = ({ selectedProjectId, onNavigateTab }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [issueTypeFilter, setIssueTypeFilter] = useState('all');

  const { 
    cycleTime, 
    efficiency, 
    bottlenecks, 
    blockers, 
    aging, 
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
          onClick={() => onNavigateTab && onNavigateTab('proyectos')}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors cursor-pointer"
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
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-sm rounded transition-colors font-bold cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10 w-full font-sans text-left">
      
      {/* BARRA SUPERIOR PREMIUM CON FILTROS Y CONTROL DE ALCANCE */}
      <div className="w-full rounded-3xl bg-[#f8faff] dark:bg-[#14192b] p-5 sm:p-6 shadow-2xs border border-indigo-100/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shrink-0">
            <Activity size={24} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                Analítica Avanzada
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Proyecto: <strong className="text-slate-900 dark:text-white font-black">{selectedProjectId}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Análisis de Flujo (Flow Analytics)
            </h1>
          </div>
        </div>

        {/* CONTROLES DE FILTRADO Y PERÍODO */}
        <div className="flex items-center gap-3 flex-wrap self-end md:self-auto">
          {/* SELECTOR DE PERÍODO */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-[#191c3d] p-1 rounded-2xl border border-slate-200/80 dark:border-[#33376b]">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pl-2 flex items-center gap-1 shrink-0">
              <Calendar size={13} className="text-indigo-500" />
              Período:
            </span>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-xl border-0 outline-none cursor-pointer shadow-xs focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="30d">Últimos 30 días</option>
              <option value="60d">Últimos 60 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="all">Todo el Histórico</option>
            </select>
          </div>

          {/* FILTRO DE TIPO DE ISSUE */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-[#191c3d] p-1 rounded-2xl border border-slate-200/80 dark:border-[#33376b]">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pl-2 flex items-center gap-1 shrink-0">
              <Filter size={13} className="text-indigo-500" />
              Tipo:
            </span>
            <select 
              value={issueTypeFilter}
              onChange={(e) => setIssueTypeFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-xl border-0 outline-none cursor-pointer shadow-xs focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="all">Todos los tipos</option>
              <option value="story">Historias de Usuario</option>
              <option value="bug">Errores (Bugs)</option>
              <option value="task">Tareas (Tasks)</option>
            </select>
          </div>

          <button 
            onClick={refetch}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center gap-1.5 font-bold text-xs shadow-sm shadow-indigo-500/20 cursor-pointer active:scale-95 shrink-0"
            title="Actualizar datos con los filtros seleccionados"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Actualizar
          </button>
        </div>
      </div>

      {/* FILA 1: Flow Efficiency & Cycle Time Percentiles (2 columnas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <FlowEfficiencyBar {...efficiency} />
        <CycleTimeDistribution data={cycleTime} />
      </div>

      {/* FILA 2: Cuellos de Botella (Izquierda) vs. Blockers + Work Aging (Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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
