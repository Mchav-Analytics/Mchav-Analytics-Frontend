import React from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, Activity } from 'lucide-react';
import { InfoTooltip } from './Tooltips';
import { ProjectsAssignedTeam } from './ProjectsAssignedTeam';

export const ProjectsTable = ({
  selectedProjectObj,
  searchTerm,
  setSearchTerm,
  displayProjects,
  selectedProjectId,
  setSelectedProjectId,
  expandedTeamProjectId,
  setExpandedTeamProjectId,
  assignedTeam,
  onNavigateToHealth
}) => {
  return (
    <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
      
      {/* Header Tabla */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {selectedProjectObj ? `Detalle del Proyecto: ${selectedProjectObj.name}` : 'Resumen de Proyectos'}
          </h3>
          <InfoTooltip text="Métricas consolidadas de incidencias, velocidad, tiempo de ciclo y nivel de avance por proyecto." />
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-60">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar proyecto..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#1a2138] border border-slate-200 dark:border-[#2c3757] text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition-all"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Tabla de Proyectos */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="pb-3 pr-2">
                <span className="flex items-center">
                  Proyecto
                  <InfoTooltip text="Nombre oficial y clave de Jira. Haz clic en la fila para filtrar métricas globales." align="left" />
                </span>
              </th>
              <th className="pb-3 px-2">
                <span className="flex items-center">
                  Clave
                  <InfoTooltip text="Identificador único del proyecto en Jira." align="left" />
                </span>
              </th>
              <th className="pb-3 px-2">
                <span className="flex items-center">
                  Estado
                  <InfoTooltip text="Estado del desarrollo: Activo o Pausado." />
                </span>
              </th>
              <th className="pb-3 px-2 text-right">
                <span className="flex items-center justify-end">
                  Incidencias
                  <InfoTooltip text="Total de tareas e incidencias registradas en el proyecto." />
                </span>
              </th>
              <th className="pb-3 px-2 text-right">
                <span className="flex items-center justify-end">
                  Velocidad
                  <InfoTooltip text="Story Points promedio entregados por Sprint." />
                </span>
              </th>
              <th className="pb-3 px-2 text-right">
                <span className="flex items-center justify-end">
                  T. Ciclo
                  <InfoTooltip text="Tiempo promedio de resolución de incidencias en días." />
                </span>
              </th>
              <th className="pb-3 px-2">
                <span className="flex items-center justify-center">
                  Avance General
                  <InfoTooltip text="Porcentaje global de completitud de tareas." align="center" />
                </span>
              </th>
              <th className="pb-3 px-2 text-right">
                <span className="flex items-center justify-end">
                  Última Sync
                  <InfoTooltip text="Tiempo transcurrido desde la última sincronización con Jira." align="right" />
                </span>
              </th>
              <th className="pb-3 pl-2 text-center">
                <span className="flex items-center justify-center">
                  Acción
                  <InfoTooltip text="Haz clic para desplegar u ocultar el equipo asignado al proyecto." align="right" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {displayProjects.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 font-medium text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span>Cargando proyectos reales desde Jira Cloud...</span>
                  </div>
                </td>
              </tr>
            ) : (
              displayProjects.map((proj) => (
                <React.Fragment key={proj.id}>
                  <tr
                    className={`hover:bg-indigo-50/40 dark:hover:bg-indigo-500/5 transition-colors cursor-pointer ${selectedProjectId === proj.id ? 'bg-indigo-50/60 dark:bg-indigo-500/10 font-bold' : ''
                      }`}
                    onClick={() => setSelectedProjectId(selectedProjectId === proj.id ? 'ALL' : proj.id)}
                  >
                    {/* Nombre Proyecto */}
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2.5">
                        <ChevronDown
                          size={14}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedTeamProjectId(expandedTeamProjectId === proj.id ? null : proj.id);
                          }}
                          className={`text-slate-400 hover:text-indigo-500 transition-transform ${expandedTeamProjectId === proj.id ? 'rotate-180 text-indigo-500' : ''}`}
                        />
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-extrabold shrink-0 shadow-2xs" style={{ backgroundColor: proj.color }}>
                          {proj.key.substring(0, 2)}
                        </div>
                        <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[160px]">
                          {proj.name}
                        </span>
                      </div>
                    </td>

                    {/* Clave */}
                    <td className="py-3 px-2 font-mono text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                      {proj.key}
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${proj.status === 'Activo'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${proj.status === 'Activo' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {proj.status}
                      </span>
                    </td>

                    {/* Incidencias */}
                    <td className="py-3 px-2 text-right font-extrabold text-slate-900 dark:text-white">
                      {proj.issuesCount}
                    </td>

                    {/* Velocidad */}
                    <td className="py-3 px-2 text-right font-bold text-slate-800 dark:text-slate-200">
                      {proj.velocity} <span className="text-[10px] text-slate-400 font-medium">SP</span>
                    </td>

                    {/* Tiempo Ciclo */}
                    <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-300 font-medium">
                      {proj.cycleTime}
                    </td>

                    {/* Avance */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2 max-w-[120px] mx-auto">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${proj.progress}%`,
                              backgroundColor: proj.color
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 w-8 text-right">
                          {proj.progress}%
                        </span>
                      </div>
                    </td>

                    {/* Última Sync */}
                    <td className="py-3 px-2 text-right text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      {proj.lastSync}
                    </td>

                    {/* Botones de Acción: Salud del Sprint & Flow + Ver equipo */}
                    <td className="py-3 pl-2 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (setSelectedProjectId) setSelectedProjectId(proj.id);
                            if (onNavigateToHealth) {
                              onNavigateToHealth(proj.id);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs border border-indigo-500 flex items-center gap-1 cursor-pointer whitespace-nowrap transition-all"
                          title={`Ver análisis de Salud del Sprint & Flow para el proyecto ${proj.name}`}
                        >
                          <Activity size={12} />
                          <span>Salud del Sprint & Flow</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedTeamProjectId(expandedTeamProjectId === proj.id ? null : proj.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all whitespace-nowrap border ${expandedTeamProjectId === proj.id
                              ? 'bg-slate-700 text-white border-slate-600 shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/20'
                            }`}
                        >
                          {expandedTeamProjectId === proj.id ? 'Ocultar equipo' : 'Ver equipo'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Sub-fila acordeón equipo asignado */}
                  {expandedTeamProjectId === proj.id && (
                    <tr className="bg-slate-50/80 dark:bg-[#181f36]/70">
                      <td colSpan={9} className="p-3 sm:p-4">
                        <ProjectsAssignedTeam assignedTeam={assignedTeam} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>Mostrando {displayProjects.length} proyectos</span>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronLeft size={14} />
            </button>
            <button type="button" className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </button>
            <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
