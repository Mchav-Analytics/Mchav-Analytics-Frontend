import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Download, X, Clock, ShieldAlert, ArrowRight, User, Tag, Activity } from 'lucide-react';
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
  const [sortConfig, setSortConfig] = useState({ key: 'key', direction: 'asc' });

  const handleCloseDrawer = () => {
    setSelectedIssue(null);
  };

  // Buscar y ordenar
  const sortedAndFilteredIssues = useMemo(() => {
    let result = [...issues];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
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
  }, [issues, searchTerm, sortConfig]);

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
    <div className="w-full">
      
      {/* Etiqueta de Metadatos de Tareas */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Detalle de Tareas ({sortedAndFilteredIssues.length} de {issues.length} total)
        </span>
      </div>

      {/* BARRA DE CONTROLES PRINCIPAL (TIPO JIRA/LINEAR CON ANCHO COMPLETO) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full mb-10">
        
        {/* Buscador Amplio y Visible */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por clave, título, responsable o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700/60 hover:border-slate-400 dark:hover:border-slate-500 focus:border-indigo-550 dark:focus:border-indigo-500/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none transition-all shadow-sm"
          />
        </div>

        {/* Botón de Exportación Premium al lado */}
        <button
          onClick={exportToCSV}
          disabled={issues.length === 0}
          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-[#0052CC] hover:bg-[#0065FF] text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer border-none"
        >
          <Download size={15} /> Exportar CSV
        </button>
      </div>

      {/* LISTADO DE TAREAS DIRECTO EN EL CANVAS (DISEÑO LIBRE / SIN BORDE OVULADO) */}
      {issuesLoading ? (
        <div className="py-24 text-center text-slate-500 animate-pulse text-xs font-bold">
          Cargando listado de tareas del sprint...
        </div>
      ) : sortedAndFilteredIssues.length === 0 ? (
        <div className="py-24 text-center text-slate-500 text-xs font-bold border-t border-white/5">
          No se encontraron tareas con el término ingresado.
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[750px] text-left border-collapse text-xs table-fixed">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-transparent">
                <th onClick={() => requestSort('key')} className="w-[10%] py-4 px-2 cursor-pointer hover:text-indigo-400 select-none">
                  Clave {sortConfig.key === 'key' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th onClick={() => requestSort('summary')} className="w-[42%] py-4 px-2 cursor-pointer hover:text-indigo-400 select-none">
                  Título / Resumen {sortConfig.key === 'summary' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th onClick={() => requestSort('assignee')} className="w-[20%] py-4 px-2 cursor-pointer hover:text-indigo-400 select-none">
                  Responsable {sortConfig.key === 'assignee' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th onClick={() => requestSort('status')} className="w-[12%] py-4 px-2 cursor-pointer hover:text-indigo-400 select-none text-center">
                  Estado {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th onClick={() => requestSort('cycle_time')} className="w-[8%] py-4 px-2 cursor-pointer hover:text-indigo-400 select-none text-right">
                  Tiempo {sortConfig.key === 'cycle_time' ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th className="w-[8%] py-4 px-2 text-center select-none">Alerta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {sortedAndFilteredIssues.map((iss) => {
                const isBugActive = isCriticalBug(iss);
                const isDelayActive = isBottleneck(iss);

                return (
                  <tr
                    key={iss.key}
                    className="hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors border-slate-100 dark:border-white/5"
                    onClick={() => setSelectedIssue(iss)}
                  >
                    {/* Clave */}
                    <td className="py-5 px-2 font-mono font-black text-indigo-600 dark:text-indigo-400">{iss.key}</td>
                    
                    {/* Título */}
                    <td className="py-5 px-2 font-semibold text-slate-800 dark:text-white truncate pr-4" title={iss.summary}>
                      {iss.summary}
                    </td>

                    {/* Responsable con Avatar */}
                    <td className="py-5 px-2 truncate">
                      <div className="flex items-center gap-2">
                        {iss.assignee ? (
                          <>
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/25 text-[9px] font-black text-indigo-650 dark:text-indigo-300 font-mono">
                              {iss.assignee.split(" ").map(n => n[0]).join("")}
                            </span>
                            <span className="truncate text-slate-700 dark:text-slate-200">{iss.assignee}</span>
                          </>
                        ) : (
                          <span className="italic text-slate-500 dark:text-slate-650">Sin asignar</span>
                        )}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-5 px-2 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase ${
                        iss.status === 'Done' || iss.status === 'Finalizado' || iss.status === 'Cerrado'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20'
                          : iss.status === 'In Progress' || iss.status === 'En curso' || iss.status === 'En revisión'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/20'
                            : 'bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-500 border border-slate-200 dark:border-slate-805/85'
                      }`}>
                        {iss.status}
                      </span>
                    </td>

                    {/* Tiempo de Ciclo */}
                    <td className="py-5 px-2 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      {Number(iss.cycle_time).toFixed(1)}d
                    </td>
                    
                    {/* Alerta */}
                    <td className="py-5 px-2 text-center">
                      {isBugActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/20">
                          Bug Crítico
                        </span>
                      ) : isDelayActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                          Demorado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-650 dark:text-emerald-455 border border-emerald-500/20 opacity-70">
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

      {/* DRAWER LATERAL DE DETALLES DEL TICKET */}
      {selectedIssue && createPortal(
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/10 backdrop-blur-[1px] animate-fade-in">
          <div className="flex-1" onClick={handleCloseDrawer} />

          <div className="w-full max-w-lg bg-white dark:bg-[#0B0F19] shadow-2xl h-full flex flex-col border-l border-slate-200 dark:border-white/5 animate-slide-in-right overflow-hidden">
            
            {/* Cabecera */}
            <div 
              className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0e1422] shrink-0"
              style={{ padding: '32px 32px 20px 32px' }}
            >
              <div className="flex items-center gap-3">
                {selectedIssue.type === 'Bug' ? (
                  <span className="bg-red-500/10 text-red-650 dark:text-red-405 border border-red-500/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md">
                    Bug
                  </span>
                ) : (
                  <span className="bg-violet-500/10 text-violet-650 dark:text-violet-400 border border-violet-500/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md">
                    {selectedIssue.type || 'Tarea'}
                  </span>
                )}
                <span className="font-mono font-black text-slate-500 dark:text-slate-400 text-sm tracking-wider">
                  {selectedIssue.key}
                </span>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="p-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition-all border-none cursor-pointer"
                title="Cerrar Detalles"
              >
                <X size={16} />
              </button>
            </div>

            {/* Cuerpo */}
            <div 
              className="flex-1 overflow-y-auto space-y-7"
              style={{ padding: '32px' }}
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-450 uppercase tracking-widest block">Resumen</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
                  {selectedIssue.summary}
                </h3>
              </div>

              <div className="space-y-2.5 pt-5 border-t border-slate-150 dark:border-white/5">
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-455 uppercase tracking-widest block">Descripción</span>
                <p className="text-xs text-slate-650 dark:text-slate-400 font-medium leading-relaxed">
                  {selectedIssue.type === 'Bug' 
                    ? `Se reportó un fallo crítico relacionado con "${selectedIssue.summary}". El equipo de desarrollo debe revisar los logs del servidor y verificar si existe fuga de memoria o excepciones no controladas en el endpoint correspondiente.`
                    : `Incidencia planificada para el sprint actual: "${selectedIssue.summary}". Incluye el análisis de requisitos, maquetación de la interfaz de usuario, pruebas unitarias y validación con el Product Owner.`
                  }
                </p>
              </div>

              {/* Lista Vertical de Detalles con Separación Limpia */}
              <div className="space-y-1.5 pt-6 border-t border-slate-150 dark:border-white/5">
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-455 uppercase tracking-widest block pb-1">Detalles de la Tarea</span>
                
                <div className="space-y-1">
                  
                  {/* Fila 1: Estado */}
                  <div className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-extrabold text-slate-550 dark:text-slate-450 uppercase tracking-wider flex items-center gap-2">
                      <Activity size={13} className="text-slate-450 dark:text-slate-500" /> Estado
                    </span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase ${
                      selectedIssue.status === 'Done' || selectedIssue.status === 'Finalizado' || selectedIssue.status === 'Cerrado'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-455 border border-emerald-500/20'
                        : selectedIssue.status === 'In Progress' || selectedIssue.status === 'En curso' || selectedIssue.status === 'En revisión'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-455 border border-amber-500/20'
                          : 'bg-slate-200/50 dark:bg-slate-800/40 text-slate-650 dark:text-slate-500 border border-slate-200 dark:border-slate-800/80'
                    }`}>
                      {selectedIssue.status}
                    </span>
                  </div>

                  {/* Fila 2: Responsable */}
                  <div className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-extrabold text-slate-555 dark:text-slate-455 uppercase tracking-wider flex items-center gap-2">
                      <User size={13} className="text-slate-450 dark:text-slate-500" /> Responsable
                    </span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      {selectedIssue.assignee ? (
                        <>
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-650 dark:text-indigo-300">
                            {selectedIssue.assignee.split(" ").map(n => n[0]).join("")}
                          </span>
                          <span className="truncate">{selectedIssue.assignee}</span>
                        </>
                      ) : (
                        <span className="italic text-slate-500">Sin asignar</span>
                      )}
                    </div>
                  </div>

                  {/* Fila 3: Prioridad */}
                  <div className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-extrabold text-slate-555 dark:text-slate-455 uppercase tracking-wider flex items-center gap-2">
                      <Tag size={13} className="text-slate-455 dark:text-slate-500" /> Prioridad
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase ${
                      selectedIssue.priority === 'Highest' || selectedIssue.priority === 'Critical'
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                        : selectedIssue.priority === 'High'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-455 border border-amber-500/20'
                          : 'bg-yellow-500/10 text-amber-700 dark:text-yellow-455 border border-yellow-500/20'
                    }`}>
                      {selectedIssue.priority}
                    </span>
                  </div>

                  {/* Fila 4: Cycle Time */}
                  <div className="flex items-center justify-between py-3.5">
                    <span className="text-[10px] font-extrabold text-slate-555 dark:text-slate-455 uppercase tracking-wider flex items-center gap-2">
                      <Clock size={13} className="text-slate-455 dark:text-slate-500" /> Cycle Time
                    </span>
                    <div className="text-xs font-mono font-bold text-slate-750 dark:text-slate-200">
                      {Number(selectedIssue.cycle_time).toFixed(1)} días
                    </div>
                  </div>

                </div>
              </div>

              {selectedIssue.type === 'Bug' && (selectedIssue.priority === 'Highest' || selectedIssue.priority === 'Critical') && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-650 dark:text-rose-455 text-xs font-semibold leading-relaxed flex items-start gap-3">
                  <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Este es un bug crítico de soporte. Requiere resolución inmediata y de alta prioridad.</span>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div 
              className="bg-slate-50 dark:bg-[#0e1422] border-t border-slate-200 dark:border-white/5 flex flex-col gap-4 shrink-0"
              style={{ padding: '24px 32px 48px 32px' }}
            >
              <div className="flex items-center justify-between text-[10px] font-black text-slate-550 dark:text-slate-500 uppercase tracking-widest">
                <span>Acciones Rápidas</span>
                <span className="text-indigo-650 dark:text-indigo-400 font-mono text-[9px] font-bold">{selectedIssue.key}</span>
              </div>
              
              <div className="flex gap-4">
                <a
                  href={`https://beltrancamilo592.atlassian.net/browse/${selectedIssue.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#0052CC] hover:bg-[#0065FF] text-white font-bold text-sm py-4 px-4 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer no-underline text-center shadow-md border-none"
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
                      className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white font-bold text-sm py-4 px-4 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-sm"
                    >
                      Reabrir Ticket
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onUpdateIssueStatus(selectedIssue.key, 'Done');
                        setSelectedIssue(prev => ({ ...prev, status: 'Done' }));
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-4 px-4 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-md"
                    >
                      ✓ Completar
                    </button>
                  )
                )}
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
