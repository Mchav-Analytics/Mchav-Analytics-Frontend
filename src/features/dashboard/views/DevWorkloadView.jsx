import React, { useState, useEffect, useMemo } from 'react';
import { Layers, Clock, Search, ListTodo, Filter, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Bookmark, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { developerService, jiraService } from '../../../services/api';

export default function DevWorkloadView({ 
  projects = [],
  selectedProjectId,
  setSelectedProjectId
}) {
  const { user } = useAuth();
  const [tasksList, setTasksList] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [priorityFilter, setPriorityFilter] = useState('TODAS');

  // Paginación (Máximo 10 por página)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const projectName = projects.find(p => String(p.id_proyecto) === String(selectedProjectId))?.nombre || `Proyecto ${selectedProjectId}`;

  const loadData = async () => {
    setLoading(true);
    try {
      try { await jiraService.triggerSync(); } catch (e) {}
      const data = await developerService.getMyScorecard(selectedProjectId);
      
      let finalData = [];
      if (data && data.assigned_issues && data.assigned_issues.length > 0) {
        finalData = data.assigned_issues.map((t, idx) => {
          let st = (t.status_actual || t.estado || 'POR HACER').toUpperCase();
          if (['FINALIZADO', 'DONE', 'COMPLETADA', 'LISTO', 'RESOLVED', 'CLOSED'].includes(st)) st = 'FINALIZADO';
          else if (['IN PROGRESS', 'EN CURSO', 'EN PROGRESO', 'IN DEVELOPMENT', 'DOING'].includes(st)) st = 'EN CURSO';
          else if (['BLOQUEADA', 'BLOCKED'].includes(st)) st = 'BLOQUEADA';
          else st = 'POR HACER';
          
          return {
            id: t.id_jira || idx,
            key: t.key_issue,
            summary: t.summary || t.resumen,
            type: t.issue_type || t.tipo || 'Story',
            priority: t.priority || t.prioridad || 'Media',
            status: st,
            rawStatus: t.status_actual || t.estado,
            sprint: 'Sprint Actual',
            date: t.created_at ? t.created_at.substring(0, 10) : (t.fecha_creacion ? new Date(t.fecha_creacion).toISOString().split('T')[0] : 'N/A'),
            sp: t.story_points || 0
          };
        });
      } else {
        finalData = [
          { id: 1, key: 'SCRUM-150', summary: 'Crear usuarios reales en base de datos', type: 'Story', priority: 'Media', status: 'FINALIZADO', sprint: 'Sprint Actual', date: '2026-08-20', sp: 2 },
          { id: 2, key: 'SCRUM-151', summary: 'Módulo de Historial de Reportes', type: 'Story', priority: 'Media', status: 'EN CURSO', sprint: 'Sprint Actual', date: '2026-08-21', sp: 5 },
          { id: 3, key: 'SCRUM-152', summary: 'Actualización del Dashboard de Desarrollador', type: 'Task', priority: 'Alta', status: 'EN CURSO', sprint: 'Sprint Actual', date: '2026-08-21', sp: 5 }
        ];
      }
      setTasksList(finalData);
    } catch (error) {
      console.error("Error cargando Plan de Trabajo", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  // Filtrado
  const filteredTasks = useMemo(() => {
    return tasksList.filter(task => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || task.key.toLowerCase().includes(q) || (task.summary && task.summary.toLowerCase().includes(q));
      if (!matchesSearch) return false;
      
      if (statusFilter !== 'TODOS' && task.status !== statusFilter) return false;
      
      if (priorityFilter !== 'TODAS') {
        const p = task.priority.toLowerCase();
        const f = priorityFilter.toLowerCase();
        if (f === 'crítica' && !p.includes('crít') && !p.includes('crit') && !p.includes('high')) return false;
        if (f === 'alta' && !p.includes('alt') && !p.includes('high')) return false;
        if (f === 'media' && !p.includes('med')) return false;
        if (f === 'baja' && !p.includes('baj') && !p.includes('low')) return false;
      }

      return true;
    });
  }, [tasksList, searchQuery, statusFilter, priorityFilter]);

  // Reset de página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter, selectedProjectId]);

  // Paginación calculada
  const totalItems = filteredTasks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTasks, currentPage, itemsPerPage]);

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // KPIs Calculados
  const totalSPAssigned = tasksList.reduce((acc, curr) => acc + (parseFloat(curr.sp) || 0), 0);
  const totalSPBurned = tasksList.filter(t => t.status === 'FINALIZADO').reduce((acc, curr) => acc + (parseFloat(curr.sp) || 0), 0);
  const inProgressCount = tasksList.filter(t => t.status === 'EN CURSO').length;
  const pendingCount = tasksList.filter(t => t.status === 'POR HACER').length;
  const burnedPct = totalSPAssigned > 0 ? Math.round((totalSPBurned / totalSPAssigned) * 100) : 0;

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'TODOS' || priorityFilter !== 'TODAS';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('TODOS');
    setPriorityFilter('TODAS');
  };

  const renderTypeBadge = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('bug')) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30">Bug</span>;
    }
    if (t.includes('epic') || t.includes('épica')) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-900/30">Épica</span>;
    }
    if (t.includes('story') || t.includes('historia')) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30">Historia</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50">Tarea</span>;
  };

  const renderPriorityBadge = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p.includes('crít') || p.includes('crit') || p.includes('highest')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100/70 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
          Crítica
        </span>
      );
    }
    if (p.includes('alt') || p.includes('high')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-100/70 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
          Alta
        </span>
      );
    }
    if (p.includes('med')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Media
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        Baja
      </span>
    );
  };

  const renderStatusBadge = (status, rawStatus) => {
    if (status === 'FINALIZADO') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs">
          <CheckCircle2 size={13} className="text-emerald-500" />
          Finalizado
        </span>
      );
    }
    if (status === 'EN CURSO') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          En Curso
        </span>
      );
    }
    if (status === 'BLOQUEADA') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40 shadow-xs">
          <AlertCircle size={13} className="text-rose-500" />
          Bloqueada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/50">
        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        Por Hacer
      </span>
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-6 text-left font-sans text-slate-800 dark:text-slate-100 pb-12">
      
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-end justify-between bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] p-6 rounded-2xl shadow-sm gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Mi Trabajo / Plan de Trabajo / {projectName}
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Plan de Trabajo
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Inventario consolidado de entregables asignados en Jira para el sprint en curso.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0c0e21] px-4 py-2 rounded-xl border border-slate-200 dark:border-[#272b5c]">
          <Bookmark size={16} className="text-indigo-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {totalItems} Tareas registradas
          </span>
        </div>
      </div>

      {/* Tarjetas de Resumen KPI (Diseño amplio y moderno) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SP */}
        <div className="bg-white dark:bg-[#141738] p-5 rounded-2xl border border-slate-200 dark:border-[#272b5c] shadow-sm flex items-center justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Puntos</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalSPAssigned} SP</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Carga asignada total</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-xs">
            <Layers size={24} />
          </div>
        </div>

        {/* SP Completados */}
        <div className="bg-white dark:bg-[#141738] p-5 rounded-2xl border border-slate-200 dark:border-[#272b5c] shadow-sm flex items-center justify-between hover:border-emerald-300 dark:hover:border-emerald-800 transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completados</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{totalSPBurned} SP</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">{burnedPct}% quemado</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
            <ListTodo size={24} />
          </div>
        </div>

        {/* En Progreso */}
        <div className="bg-white dark:bg-[#141738] p-5 rounded-2xl border border-slate-200 dark:border-[#272b5c] shadow-sm flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-800 transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">En Progreso</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{inProgressCount} Tareas</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">En desarrollo activo</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
            <Clock size={24} />
          </div>
        </div>

        {/* Pendientes */}
        <div className="bg-white dark:bg-[#141738] p-5 rounded-2xl border border-slate-200 dark:border-[#272b5c] shadow-sm flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pendientes</span>
            <span className="text-2xl font-black text-slate-700 dark:text-slate-300 font-mono">{pendingCount} Tareas</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Por iniciar en sprint</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 shadow-xs">
            <Sparkles size={24} />
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white dark:bg-[#141738] p-4 rounded-2xl border border-slate-200 dark:border-[#272b5c] shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Input Buscador */}
        <div className="flex flex-1 items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-[#0c0e21] rounded-xl border border-slate-200 dark:border-[#232752] focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar por clave (ej. SCRUM-152) o resumen..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* Selects de Filtrado */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0c0e21] border border-slate-200 dark:border-[#232752] rounded-xl px-3 py-2">
            <Filter size={15} className="text-indigo-500" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer pr-1"
            >
              <option value="TODOS" className="dark:bg-[#141738]">Todos los Estados</option>
              <option value="POR HACER" className="dark:bg-[#141738]">Por Hacer (Pendientes)</option>
              <option value="EN CURSO" className="dark:bg-[#141738]">En Curso</option>
              <option value="BLOQUEADA" className="dark:bg-[#141738]">Bloqueadas</option>
              <option value="FINALIZADO" className="dark:bg-[#141738]">Finalizados</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0c0e21] border border-slate-200 dark:border-[#232752] rounded-xl px-3 py-2">
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)} 
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer pr-1"
            >
              <option value="TODAS" className="dark:bg-[#141738]">Todas las Prioridades</option>
              <option value="Crítica" className="dark:bg-[#141738]">Crítica</option>
              <option value="Alta" className="dark:bg-[#141738]">Alta</option>
              <option value="Media" className="dark:bg-[#141738]">Media</option>
              <option value="Baja" className="dark:bg-[#141738]">Baja</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
            >
              <X size={14} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Trabajo Completa con Paginación */}
      <div className="bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[480px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-[#0c0e21]/80 border-b border-slate-200 dark:border-[#232752] text-[11px] uppercase font-black tracking-wider text-slate-400">
                <th className="px-6 py-4">Clave</th>
                <th className="px-6 py-4">Tarea / Resumen</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Prioridad</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Sprint</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-center">SP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#232752]/70">
              {paginatedTasks.length > 0 ? paginatedTasks.map(task => (
                <tr 
                  key={task.id} 
                  className="hover:bg-indigo-50/40 dark:hover:bg-[#1c204d]/60 transition-colors group"
                >
                  {/* Issue Key */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/50 dark:border-indigo-800/40 group-hover:border-indigo-400 transition-colors">
                      {task.key}
                    </span>
                  </td>

                  {/* Summary */}
                  <td className="px-6 py-4.5">
                    <div className="font-medium text-slate-800 dark:text-slate-200 leading-snug max-w-[340px] truncate" title={task.summary}>
                      {task.summary}
                    </div>
                  </td>

                  {/* Tipo */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    {renderTypeBadge(task.type)}
                  </td>

                  {/* Prioridad */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    {renderPriorityBadge(task.priority)}
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    {renderStatusBadge(task.status, task.rawStatus)}
                  </td>

                  {/* Sprint */}
                  <td className="px-6 py-4.5 whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
                    {task.sprint}
                  </td>

                  {/* Fecha */}
                  <td className="px-6 py-4.5 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                    {task.date}
                  </td>

                  {/* Story Points */}
                  <td className="px-6 py-4.5 whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl font-mono font-bold text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {task.sp}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ListTodo size={32} className="text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                      <span className="text-sm font-medium">No se encontraron tareas con los filtros actuales.</span>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="mt-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                          Limpiar todos los filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Barra de Paginación Pulida */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-[#272b5c] bg-slate-50/50 dark:bg-[#0c0e21]/50 text-xs text-slate-500 font-medium gap-3">
            <div>
              Mostrando <span className="font-bold text-slate-800 dark:text-slate-200">{startItem}</span> a <span className="font-bold text-slate-800 dark:text-slate-200">{endItem}</span> de <span className="font-bold text-slate-800 dark:text-slate-200">{totalItems}</span> tareas
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 bg-white dark:bg-[#1a1e47] border border-slate-200 dark:border-[#272b5c] rounded-xl hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 font-bold transition-all shadow-xs cursor-pointer"
                >
                  <ChevronLeft size={15} /> Anterior
                </button>
                
                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1a1e47]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 bg-white dark:bg-[#1a1e47] border border-slate-200 dark:border-[#272b5c] rounded-xl hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 font-bold transition-all shadow-xs cursor-pointer"
                >
                  Siguiente <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
