import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  Download, 
  X, 
  Clock, 
  ShieldAlert, 
  ArrowRight, 
  User, 
  Tag, 
  Activity, 
  ClipboardList, 
  Filter, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { isCriticalBug, isBottleneck } from '../../../utils/issueHelpers';

export default function IssuesTable({ 
  issues = [], 
  issuesLoading, 
  sprintName, 
  onUpdateIssueStatus,
  selectedIssue,
  setSelectedIssue
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'MY_ISSUES' | 'IN_PROGRESS' | 'DONE' | 'CRITICAL'
  const [sortConfig, setSortConfig] = useState({ key: 'key', direction: 'asc' });

  const handleCloseDrawer = () => {
    setSelectedIssue(null);
  };

  // Buscar y ordenar
  const sortedAndFilteredIssues = useMemo(() => {
    let result = [...issues];

    // Filtros rápidos por estado o mis tareas
    if (statusFilter === 'MY_ISSUES') {
      result = result.filter(iss => 
        iss.assignee && (
          iss.assignee.toLowerCase().includes('stephany') ||
          iss.assignee.toLowerCase().includes('leon')
        )
      );
    } else if (statusFilter === 'IN_PROGRESS') {
      result = result.filter(iss => ['In Progress', 'En curso', 'En revisión'].includes(iss.status));
    } else if (statusFilter === 'DONE') {
      result = result.filter(iss => ['Done', 'Finalizado', 'Cerrado'].includes(iss.status));
    } else if (statusFilter === 'CRITICAL') {
      result = result.filter(iss => isCriticalBug(iss) || isBottleneck(iss));
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(iss =>
        iss.key.toLowerCase().includes(term) ||
        iss.summary.toLowerCase().includes(term) ||
        (iss.assignee && iss.assignee.toLowerCase().includes(term)) ||
        iss.status.toLowerCase().includes(term)
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;

        if (typeof aVal === 'string') {
          return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        } else {
          return sortConfig.direction === 'asc'
            ? aVal - bVal
            : bVal - aVal;
        }
      });
    }

    return result;
  }, [issues, searchTerm, statusFilter, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportToCSV = () => {
    if (issues.length === 0) return;
    const headers = ["Clave", "Resumen", "Estado", "Tipo", "Prioridad", "Asignado", "Lead Time", "Cycle Time"];
    const rows = issues.map(iss => [
      iss.key,
      `"${iss.summary.replace(/"/g, '""')}"`,
      iss.status,
      iss.type,
      iss.priority,
      iss.assignee || 'Sin asignar',
      iss.lead_time,
      iss.cycle_time
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_${sprintName || 'sprint'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* TARJETA CONTENEDORA PRINCIPAL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden transition-all duration-300">
        
        {/* CABECERA CON TÍTULO Y BOTÓN EXPORTAR */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ClipboardList size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                Tareas del Sprint ({sprintName || 'Sprint Activo'})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {sortedAndFilteredIssues.length} de {issues.length} tareas en este filtro.
              </p>
            </div>
          </div>

          <button
            onClick={exportToCSV}
            disabled={issues.length === 0}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer border-none disabled:opacity-50"
          >
            <Download size={14} /> Exportar CSV
          </button>
        </div>

        {/* CONTROLES DE BÚSQUEDA Y PÍLDORAS DE FILTRO */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Campo de Búsqueda Limpio y Espacioso */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por clave (PA-101), título, responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer border-none bg-transparent"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Píldoras de Filtro Rápido */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                Todas ({issues.length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('MY_ISSUES')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  statusFilter === 'MY_ISSUES'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <UserCheck size={13} /> Solo Mis Tareas
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('IN_PROGRESS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  statusFilter === 'IN_PROGRESS'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                En Progreso
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('DONE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  statusFilter === 'DONE'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                Completadas
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('CRITICAL')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  statusFilter === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <AlertTriangle size={13} className="text-rose-500" /> Alertas
              </button>
            </div>

          </div>
        </div>

        {/* TABLA DE TAREAS ESTRUCTURADA Y ELEGANTE */}
        {issuesLoading ? (
          <div className="py-20 text-center text-slate-400 animate-pulse text-xs font-bold">
            Cargando listado de tareas del sprint...
          </div>
        ) : sortedAndFilteredIssues.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs font-semibold">
            {searchTerm || statusFilter !== 'ALL'
              ? 'No se encontraron tareas que coincidan con los filtros seleccionados.'
              : 'No hay tareas registradas en este sprint.'}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50/70 dark:bg-slate-955 text-slate-500 dark:text-slate-450 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase tracking-wider font-bold">
                <tr>
                  <th onClick={() => requestSort('key')} className="px-6 py-4 cursor-pointer hover:text-indigo-500 select-none w-28">
                    Clave {sortConfig.key === 'key' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => requestSort('summary')} className="px-6 py-4 cursor-pointer hover:text-indigo-500 select-none">
                    Título / Resumen {sortConfig.key === 'summary' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => requestSort('assignee')} className="px-6 py-4 cursor-pointer hover:text-indigo-500 select-none w-48">
                    Responsable {sortConfig.key === 'assignee' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => requestSort('status')} className="px-6 py-4 cursor-pointer hover:text-indigo-500 select-none text-center w-32">
                    Estado {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => requestSort('cycle_time')} className="px-6 py-4 cursor-pointer hover:text-indigo-500 select-none text-right w-24">
                    Tiempo {sortConfig.key === 'cycle_time' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="px-6 py-4 text-center select-none w-28">Alerta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                {sortedAndFilteredIssues.map((iss) => {
                  const isBugActive = isCriticalBug(iss);
                  const isDelayActive = isBottleneck(iss);

                  return (
                    <tr
                      key={iss.key}
                      onClick={() => setSelectedIssue(iss)}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                    >
                      {/* Clave */}
                      <td className="px-6 py-4 font-mono font-black text-indigo-600 dark:text-indigo-400">
                        {iss.key}
                      </td>

                      {/* Título */}
                      <td className="px-6 py-4 font-semibold text-slate-850 dark:text-slate-100" title={iss.summary}>
                        {iss.summary}
                      </td>

                      {/* Responsable */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {iss.assignee ? (
                            <>
                              <span className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono shrink-0">
                                {iss.assignee.split(" ").map(n => n[0]).join("")}
                              </span>
                              <span className="truncate text-slate-700 dark:text-slate-200 font-medium">{iss.assignee}</span>
                            </>
                          ) : (
                            <span className="italic text-slate-400">Sin asignar</span>
                          )}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          iss.status === 'Done' || iss.status === 'Finalizado' || iss.status === 'Cerrado'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                            : iss.status === 'In Progress' || iss.status === 'En curso' || iss.status === 'En revisión'
                              ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 border border-slate-200 dark:border-slate-700'
                        }`}>
                          {iss.status}
                        </span>
                      </td>

                      {/* Tiempo de Ciclo */}
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        {Number(iss.cycle_time).toFixed(1)}d
                      </td>

                      {/* Alerta */}
                      <td className="px-6 py-4 text-center">
                        {isBugActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                            Bug Crítico
                          </span>
                        ) : isDelayActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 animate-pulse">
                            Demorado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 opacity-80">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* DRAWER LATERAL DE DETALLES DEL TICKET */}
      {selectedIssue && createPortal(
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="flex-1" onClick={handleCloseDrawer} />

          <div className="w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200 overflow-hidden">
            
            {/* Cabecera */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedIssue.type === 'Bug' ? (
                  <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                    Bug
                  </span>
                ) : (
                  <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                    {selectedIssue.type || 'Tarea'}
                  </span>
                )}
                <span className="font-mono font-black text-slate-800 dark:text-slate-100 text-sm">
                  {selectedIssue.key}
                </span>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Resumen</span>
                <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 leading-snug">
                  {selectedIssue.summary}
                </h3>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Descripción</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedIssue.type === 'Bug' 
                    ? `Se reportó un fallo crítico relacionado con "${selectedIssue.summary}". El equipo de desarrollo debe revisar los logs del servidor y verificar si existe excepción no controlada.`
                    : `Incidencia planificada para el sprint actual: "${selectedIssue.summary}". Incluye análisis de requisitos, maquetación de la interfaz y validación con el equipo.`
                  }
                </p>
              </div>

              {/* Lista Vertical de Detalles */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Detalles de la Tarea</span>
                
                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 space-y-3 text-xs">
                  
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                      <Activity size={13} className="text-indigo-500" /> Estado
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedIssue.status}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-2.5">
                    <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                      <User size={13} className="text-indigo-500" /> Responsable
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedIssue.assignee || 'Sin asignar'}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-2.5">
                    <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                      <Tag size={13} className="text-indigo-500" /> Prioridad
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedIssue.priority}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-2.5">
                    <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                      <Clock size={13} className="text-indigo-500" /> Cycle Time
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{Number(selectedIssue.cycle_time).toFixed(1)} días</span>
                  </div>

                </div>
              </div>

              {selectedIssue.type === 'Bug' && (selectedIssue.priority === 'Highest' || selectedIssue.priority === 'Critical') && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs font-semibold leading-relaxed flex items-start gap-3">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5 text-rose-500" />
                  <span>Este es un bug crítico de soporte. Requiere atención prioritaria.</span>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center gap-3">
              <a
                href={`https://beltrancamilo592.atlassian.net/browse/${selectedIssue.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-colors text-center cursor-pointer no-underline border-none"
              >
                Abrir en Jira ↗
              </a>

              {onUpdateIssueStatus && (
                ['Done', 'Finalizado', 'Cerrado'].includes(selectedIssue.status) ? (
                  <button
                    onClick={() => {
                      onUpdateIssueStatus(selectedIssue.key, 'In Progress');
                      setSelectedIssue(prev => ({ ...prev, status: 'In Progress' }));
                    }}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 font-bold text-xs py-3 px-4 rounded-xl transition-colors cursor-pointer border-none"
                  >
                    Reabrir Ticket
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onUpdateIssueStatus(selectedIssue.key, 'Done');
                      setSelectedIssue(prev => ({ ...prev, status: 'Done' }));
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-colors cursor-pointer border-none"
                  >
                    ✓ Completar
                  </button>
                )
              )}
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
