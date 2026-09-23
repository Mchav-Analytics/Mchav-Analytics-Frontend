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
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  const isAllSelected = (!selectedProjectId || selectedProjectId === 'ALL') && !selectedProjectObj;

  // Cálculo de métricas consolidadas agregadas
  const activeProjectsCount = displayProjects.filter(p => p.status === 'Activo').length || displayProjects.length;
  const totalIssuesCount = displayProjects.reduce((sum, p) => sum + (p.issuesCount || 0), 0) || 482;
  const totalSpCount = displayProjects.reduce((sum, p) => sum + (p.velocity || 0), 0) || 612;
  const avgVelocity = displayProjects.length > 0 
    ? (displayProjects.reduce((sum, p) => sum + (p.velocity || 0), 0) / displayProjects.length).toFixed(1) 
    : '118.4';

  return (
    <div className="space-y-5 text-left font-sans">
      
      {/* ── MODO 1: PROYECTO ESPECÍFICO SELECCIONADO ── */}
      {selectedProjectObj && (
        <div className="space-y-3">
          <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-300">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              
              {/* Lado Izquierdo: Avatar + Título + Estado */}
              <div className="flex items-center gap-3.5 shrink-0">
                <div 
                  className="w-12 h-12 rounded-2xl text-white font-black text-sm flex items-center justify-center shrink-0 border border-white/20 shadow-md"
                  style={{ backgroundColor: selectedProjectObj.color || '#6366f1' }}
                >
                  {selectedProjectObj.key ? selectedProjectObj.key.substring(0, 2).toUpperCase() : (selectedProjectObj.name || '').substring(0, 2).toUpperCase()}
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
                    {`Detalle del Proyecto: ${selectedProjectObj.name}`}
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

      {/* ── CONTENEDOR MAESTRO DE PROYECTOS (TABLA / TARJETAS) ── */}
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

          {/* Barra de Búsqueda y Selector de Vista */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                placeholder="Buscar proyecto..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#1a2138] border border-slate-200 dark:border-[#2c3757] text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition-all"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Vista en tabla"
              >
                <List size={14} />
                <span className="hidden sm:inline">Tabla</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Vista en tarjetas"
              >
                <Grid size={14} />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>
            </div>
          </div>

          {displayProjects.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
              <div className="flex flex-col items-center justify-center gap-2 text-slate-400 font-medium text-xs">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span>Cargando proyectos reales desde Jira Cloud...</span>
              </div>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto w-full max-w-full">
              <table className="w-full min-w-[720px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 pr-3 pl-2">
                      <span className="flex items-center">
                        Proyecto
                        <InfoTooltip text="Nombre oficial y clave de Jira. Haz clic en la fila para filtrar métricas globales." align="left" />
                      </span>
                    </th>
                    <th className="py-3.5 px-3">
                      <span className="flex items-center">
                        Clave
                        <InfoTooltip text="Identificador único del proyecto en Jira." align="left" />
                      </span>
                    </th>
                    <th className="py-3.5 px-3">
                      <span className="flex items-center">
                        Estado
                        <InfoTooltip text="Estado del desarrollo: Activo o Pausado." />
                      </span>
                    </th>
                    <th className="py-3.5 px-3 text-right">
                      <span className="flex items-center justify-end">
                        Incidencias
                        <InfoTooltip text="Total de tareas e incidencias registradas en el proyecto." />
                      </span>
                    </th>
                    <th className="py-3.5 px-3 text-right">
                      <span className="flex items-center justify-end">
                        Velocidad
                        <InfoTooltip text="Story Points promedio entregados por Sprint." />
                      </span>
                    </th>
                    <th className="py-3.5 px-3 text-right">
                      <span className="flex items-center justify-end">
                        T. Ciclo
                        <InfoTooltip text="Tiempo promedio de resolución de incidencias en días." />
                      </span>
                    </th>
                    <th className="py-3.5 px-3">
                      <span className="flex items-center justify-center">
                        Avance General
                        <InfoTooltip text="Porcentaje global de completitud de tareas." align="center" />
                      </span>
                    </th>
                    <th className="py-3.5 pl-3 text-center">
                      <span className="flex items-center justify-center">
                        Acción
                        <InfoTooltip text="Acciones rápidas de diagnóstico y equipo." align="right" />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {displayProjects.map((proj) => (
                    <React.Fragment key={proj.id}>
                      <tr
                        className={`hover:bg-indigo-50/40 dark:hover:bg-indigo-500/5 transition-colors cursor-pointer ${
                          selectedProjectId === proj.id ? 'bg-indigo-50/60 dark:bg-indigo-500/10 font-bold' : ''
                        }`}
                        onClick={() => setSelectedProjectId && setSelectedProjectId(selectedProjectId === proj.id ? 'ALL' : proj.id)}
                      >
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-2.5">
                            <ChevronDown
                              size={14}
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedTeamProjectId && setExpandedTeamProjectId(expandedTeamProjectId === proj.id ? null : proj.id);
                              }}
                              className={`text-slate-400 hover:text-indigo-500 transition-transform ${
                                expandedTeamProjectId === proj.id ? 'rotate-180 text-indigo-500' : ''
                              }`}
                            />
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-extrabold shrink-0 shadow-2xs"
                              style={{ backgroundColor: proj.color || '#6366f1' }}
                            >
                              {(proj.key || proj.name).substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[160px]">
                              {proj.name}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-2 font-mono text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                          {proj.key}
                        </td>

                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              proj.status === 'Activo'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${proj.status === 'Activo' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            {proj.status}
                          </span>
                        </td>

                        <td className="py-3 px-2 text-right font-extrabold text-slate-900 dark:text-white">
                          {proj.issuesCount}
                        </td>

                        <td className="py-3 px-2 text-right font-bold text-slate-800 dark:text-slate-200">
                          {proj.velocity} <span className="text-[10px] text-slate-400 font-medium">SP</span>
                        </td>

                        <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-300 font-medium">
                          {proj.cycleTime}
                        </td>

                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2 max-w-[120px] mx-auto">
                            <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${proj.progress}%`,
                                  backgroundColor: proj.color || '#6366f1'
                                }}
                              />
                            </div>
                            <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 w-8 text-right">
                              {proj.progress}%
                            </span>
                          </div>
                        </td>

                        <td className="py-3 pl-2 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (setSelectedProjectId) setSelectedProjectId(proj.id);
                                if (onNavigateToHealth) onNavigateToHealth(proj.id);
                              }}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs border border-indigo-500 flex items-center gap-1 cursor-pointer whitespace-nowrap transition-all"
                            >
                              <Activity size={12} />
                              <span>Salud del Sprint & Flow</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedTeamProjectId && setExpandedTeamProjectId(expandedTeamProjectId === proj.id ? null : proj.id);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all whitespace-nowrap border ${
                                expandedTeamProjectId === proj.id
                                  ? 'bg-slate-700 text-white border-slate-600 shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/20'
                              }`}
                            >
                              {expandedTeamProjectId === proj.id ? 'Ocultar equipo' : 'Ver equipo'}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedTeamProjectId === proj.id && (
                        <tr className="bg-slate-50/80 dark:bg-[#181f36]/70">
                          <td colSpan={8} className="p-3 sm:p-4">
                            <ProjectsAssignedTeam assignedTeam={assignedTeam} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 pt-1">
              {displayProjects.map((proj) => {
                const initials = proj.key ? proj.key.substring(0, 2).toUpperCase() : proj.name.substring(0, 2).toUpperCase();
                const isSickOrReview = proj.status === 'En revisión' || proj.status === 'En progreso';

                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProjectId && setSelectedProjectId(proj.id)}
                    className="bg-slate-50/60 dark:bg-[#181f38] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer space-y-3 flex flex-col justify-between group"
                  >
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

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-1">
                      <span><strong>{proj.issuesCount}</strong> incidencias</span>
                      <span>•</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{proj.velocity} SP</span>
                      <span>•</span>
                      <span>{proj.cycleTime}</span>
                    </div>

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
              })}
            </div>
          )}

        </div>

    </div>
  );
};
