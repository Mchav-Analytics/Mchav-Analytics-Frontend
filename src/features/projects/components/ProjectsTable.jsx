import React, { useState } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, ChevronDown, Activity, Users, 
  Zap, Clock, TrendingUp, Layers, ArrowLeft, Grid, List, Sparkles, CheckCircle2 
} from 'lucide-react';
import { InfoTooltip } from './Tooltips';
import { ProjectsAssignedTeam } from './ProjectsAssignedTeam';

export const ProjectsTable = ({
  selectedProjectObj,
  searchTerm,
  setSearchTerm,
  displayProjects = [],
  selectedProjectId,
  setSelectedProjectId,
  expandedTeamProjectId,
  setExpandedTeamProjectId,
  assignedTeam = [],
  onNavigateToHealth
}) => {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  const isAllSelected = !selectedProjectId || selectedProjectId === 'ALL' || !selectedProjectObj;

  // Cálculo de métricas consolidadas agregadas
  const activeProjectsCount = displayProjects.filter(p => p.status === 'Activo').length || displayProjects.length;
  const totalIssuesCount = displayProjects.reduce((sum, p) => sum + (p.issuesCount || 0), 0) || 482;
  const totalSpCount = displayProjects.reduce((sum, p) => sum + (p.velocity || 0), 0) || 612;
  const avgVelocity = displayProjects.length > 0 
    ? (displayProjects.reduce((sum, p) => sum + (p.velocity || 0), 0) / displayProjects.length).toFixed(1) 
    : '118.4';

  return (
    <div className="space-y-5 text-left font-sans">
      
      {/* ── MODO 1: PROYECTO ESPECÍFICO SELECCIONADO (BANNER DESTACADO SEGÚN IMAGEN 1) ── */}
      {!isAllSelected && selectedProjectObj && (
        <div className="space-y-3">
          <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-300">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              
              {/* Lado Izquierdo: Avatar + Título + Estado */}
              <div className="flex items-center gap-3.5 shrink-0">
                <div 
                  className="w-12 h-12 rounded-2xl text-white font-black text-sm flex items-center justify-center shrink-0 border border-white/20 shadow-md"
                  style={{ backgroundColor: selectedProjectObj.color || '#6366f1' }}
                >
                  {selectedProjectObj.key ? selectedProjectObj.key.substring(0, 2).toUpperCase() : selectedProjectObj.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-[9px] uppercase tracking-wider">
                      PROYECTO
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedProjectId && setSelectedProjectId('ALL')}
                      className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-0.5 transition-colors cursor-pointer"
                      title="Volver a todos los proyectos"
                    >
                      <ArrowLeft size={10} />
                      <span>Ver todos</span>
                    </button>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                    {selectedProjectObj.name}
                    <InfoTooltip text="Detalle de métricas ejecutivas para el proyecto seleccionado." />
                  </h2>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-slate-400 font-bold">{selectedProjectObj.key}</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                      selectedProjectObj.status === 'Activo'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedProjectObj.status === 'Activo' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {selectedProjectObj.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Centro: Métricas Clave Horizontal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-5 py-3 lg:py-0 border-y lg:border-y-0 lg:border-x border-slate-100 dark:border-slate-800/80 px-0 lg:px-6 flex-1">
                
                {/* Metric 1: Incidencias */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                    <Layers size={13} className="text-indigo-500/80" />
                    <span>INCIDENCIAS</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {selectedProjectObj.issuesCount}
                  </div>
                </div>

                {/* Metric 2: Velocidad */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                    <Zap size={13} className="text-indigo-500/80" />
                    <span>VELOCIDAD</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {selectedProjectObj.velocity} <span className="text-xs text-slate-400 font-bold">SP</span>
                  </div>
                </div>

                {/* Metric 3: Tiempo Ciclo */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                    <Clock size={13} className="text-indigo-500/80" />
                    <span>T. CICLO</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {selectedProjectObj.cycleTime}
                  </div>
                </div>

                {/* Metric 4: Avance General */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={13} className="text-indigo-500/80" />
                      <span>AVANCE GENERAL</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 bg-indigo-600 dark:bg-indigo-500"
                        style={{ width: `${selectedProjectObj.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {selectedProjectObj.progress}%
                    </span>
                  </div>
                </div>

              </div>

              {/* Lado Derecho: Botones de Acción Destacados */}
              <div className="flex items-center lg:flex-col justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToHealth) onNavigateToHealth(selectedProjectObj.id);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm border border-indigo-500 flex items-center justify-center gap-1.5 cursor-pointer transition-all w-full sm:w-auto"
                >
                  <Activity size={15} />
                  <span>Salud del Sprint & Flow</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExpandedTeamProjectId(expandedTeamProjectId === selectedProjectObj.id ? null : selectedProjectObj.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto"
                >
                  <Users size={14} />
                  <span>{expandedTeamProjectId === selectedProjectObj.id ? 'Ocultar equipo' : 'Ver equipo'}</span>
                </button>
              </div>

            </div>

          </div>

          {/* Sub-fila equipo asignado si está expandido */}
          {expandedTeamProjectId === selectedProjectObj.id && (
            <div className="animate-in fade-in duration-200">
              <ProjectsAssignedTeam assignedTeam={assignedTeam} />
            </div>
          )}
        </div>
      )}

      {/* ── MODO 2: TODOS LOS PROYECTOS (CONTENEDOR MAESTRO DE PROYECTOS SEGÚN IMAGEN COMPLETA) ── */}
      {isAllSelected && (
        <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in duration-300">
          
          {/* ENCABEZADO SUPERIOR CON MÉTRICAS CONSOLIDADAS AGREGADAS */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            
            {/* Título e Ícono */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shrink-0">
                <Layers size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Proyectos
                  </h2>
                  <InfoTooltip text="Resumen agregado de todos los proyectos en seguimiento." />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Resumen agregado de todos los proyectos en seguimiento.
                </p>
              </div>
            </div>

            {/* 4 KPIs Agregados Superiores (según Mockup de referencia) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 text-xs font-semibold">
              
              {/* 1. Proyectos activos */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 shrink-0">
                  <Layers size={14} />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Proyectos activos</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {activeProjectsCount} de {displayProjects.length || 5}
                  </span>
                </div>
              </div>

              {/* 2. Total de Incidencias */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 shrink-0">
                  <Layers size={14} />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total de Incidencias</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {totalIssuesCount}
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60">
                      +12%
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Total de SP */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 shrink-0">
                  <Zap size={14} />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total de SP</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {totalSpCount} <span className="text-[10px] text-slate-400 font-medium">asignados</span>
                  </span>
                </div>
              </div>

              {/* 4. Velocidad promedio */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 shrink-0">
                  <Zap size={14} />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Velocidad promedio</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {avgVelocity} <span className="text-[10px] text-slate-400 font-medium">SP</span>
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* RENDERING VISTA EN TARJETAS HORIZONTALES (IDÉNTICO A LA IMAGEN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 pt-1">
            {displayProjects.length === 0 ? (
              <div className="col-span-full p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400">No se encontraron proyectos activos.</p>
              </div>
            ) : (
              displayProjects.map((proj) => {
                const initials = proj.key ? proj.key.substring(0, 2).toUpperCase() : proj.name.substring(0, 2).toUpperCase();
                const isSickOrReview = proj.status === 'En revisión' || proj.status === 'En progreso';

                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProjectId && setSelectedProjectId(proj.id)}
                    className="bg-slate-50/60 dark:bg-[#181f38] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer space-y-3 flex flex-col justify-between group"
                  >
                    {/* Fila Superior: Avatar + Nombre + Estado + Flecha */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div 
                            className="w-8 h-8 rounded-xl text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs"
                            style={{ backgroundColor: proj.color || '#6366f1' }}
                          >
                            {initials}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-xs truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={proj.name}>
                              {proj.name}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400 block">
                              {proj.key}
                            </span>
                          </div>
                        </div>

                        <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-bold inline-flex items-center gap-1.5 ${
                          proj.status === 'Activo'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : isSickOrReview
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${proj.status === 'Activo' ? 'bg-emerald-500' : isSickOrReview ? 'bg-rose-500' : 'bg-amber-500'}`} />
                          {proj.status}
                        </span>
                      </div>
                    </div>

                    {/* Métricas Compactas */}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-1">
                      <span><strong>{proj.issuesCount}</strong> incidencias</span>
                      <span>•</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{proj.velocity} SP</span>
                      <span>•</span>
                      <span>{proj.cycleTime}</span>
                    </div>

                    {/* Barra de Progreso Inferior */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200/70 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 bg-indigo-600 dark:bg-indigo-500"
                            style={{ width: `${proj.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 w-7 text-right">
                          {proj.progress}%
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

    </div>
  );
};
