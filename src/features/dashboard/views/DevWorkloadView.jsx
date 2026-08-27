import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Layers, 
  Clock, 
  Search, 
  ListTodo, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Bookmark, 
  Sparkles, 
  X, 
  ExternalLink, 
  GitBranch, 
  Copy, 
  Check, 
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { developerService, jiraService, projectService } from '../../../services/api';

export default function DevWorkloadView({ 
  projects = [],
  selectedProjectId,
  setSelectedProjectId
}) {
  const { user } = useAuth();
  const [tasksList, setTasksList] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal de Detalle y Gestión de Tarea
  const [selectedTaskModal, setSelectedTaskModal] = useState(null);
  const [availableTransitions, setAvailableTransitions] = useState([]);
  const [loadingTransitions, setLoadingTransitions] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [copiedBranch, setCopiedBranch] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const dropdownRef = useRef(null);

  // Filtros y Ordenamiento
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [priorityFilter, setPriorityFilter] = useState('TODAS');
  const [sortBy, setSortBy] = useState('RECENT'); // 'RECENT', 'OLDEST', 'SP_DESC', 'PRIORITY'

  // Paginación (Máximo 10 por página)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const projectName = projects.find(p => String(p.id_proyecto) === String(selectedProjectId))?.nombre || (selectedProjectId ? `Proyecto ${selectedProjectId}` : 'MCHAV ANALYTICS');
  const devName = user?.nombre || user?.name || 'Stephany León';



  // Cerrar popover al hacer clic fuera
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsStatusDropdownOpen(false);
      }
    };
    if (isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isStatusDropdownOpen]);

  // Cerrar modal o popover con tecla Escape (ESC)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isStatusDropdownOpen) {
          setIsStatusDropdownOpen(false);
        } else if (selectedTaskModal) {
          setSelectedTaskModal(null);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isStatusDropdownOpen, selectedTaskModal]);

  // Cargar transiciones reales de Jira cuando se abre el modal de una tarea
  useEffect(() => {
    if (selectedTaskModal?.key) {
      setIsStatusDropdownOpen(false);
      setErrorMsg('');
      setLoadingTransitions(true);
      jiraService.getIssueTransitions(selectedTaskModal.key)
        .then(res => {
          if (res && Array.isArray(res.transitions)) {
            setAvailableTransitions(res.transitions);
          } else {
            setAvailableTransitions([]);
          }
        })
        .catch(err => {
          console.warn("Transiciones reales de Jira no accesibles en este momento, usando catálogo estándar:", err);
          setAvailableTransitions([]);
        })
        .finally(() => {
          setLoadingTransitions(false);
        });
    }
  }, [selectedTaskModal?.key]);

  // Ejecución real del cambio de estado contra la API de Jira Cloud vía backend
  const handleSelectTransition = async (transitionOrStatus) => {
    if (!selectedTaskModal || updatingStatus) return;

    setIsStatusDropdownOpen(false);
    setUpdatingStatus(true);
    setErrorMsg('');

    const previousStatus = selectedTaskModal.status;
    const previousRawStatus = selectedTaskModal.rawStatus;

    const payload = typeof transitionOrStatus === 'object' && transitionOrStatus.id
      ? { transition_id: String(transitionOrStatus.id), target_status: transitionOrStatus.to_status || transitionOrStatus.name }
      : { target_status: String(transitionOrStatus) };

    const targetLabel = typeof transitionOrStatus === 'object'
      ? (transitionOrStatus.to_status || transitionOrStatus.name)
      : String(transitionOrStatus);

    try {
      // 1. Llamada asíncrona real al backend FastAPI
      const res = await jiraService.executeIssueTransition(selectedTaskModal.key, payload);
      
      const realStatus = res?.status || targetLabel;
      let normStatus = realStatus.toUpperCase();
      if (['FINALIZADO', 'DONE', 'COMPLETADA', 'LISTO', 'RESOLVED', 'CLOSED'].some(s => normStatus.includes(s))) normStatus = 'FINALIZADO';
      else if (['IN PROGRESS', 'EN CURSO', 'EN PROGRESO', 'IN DEVELOPMENT', 'DOING'].some(s => normStatus.includes(s))) normStatus = 'EN CURSO';
      else if (['EN REVISIÓN', 'EN REVISION', 'REVIEW', 'QA'].some(s => normStatus.includes(s))) normStatus = 'EN REVISIÓN';
      else if (['BLOQUEADA', 'BLOCKED'].some(s => normStatus.includes(s))) normStatus = 'BLOQUEADA';
      else normStatus = 'POR HACER';

      // 2. Actualizar estado en el modal
      setSelectedTaskModal(prev => prev ? {
        ...prev,
        status: normStatus,
        rawStatus: realStatus
      } : null);

      // 3. Actualizar fila correspondiente en la tabla
      setTasksList(prev => prev.map(t => {
        if (t.key === selectedTaskModal.key) {
          return { ...t, status: normStatus, rawStatus: realStatus };
        }
        return t;
      }));

      // 4. Confirmación visual de éxito
      setToastMsg(`✅ Estado de ${selectedTaskModal.key} actualizado a "${realStatus}" en Jira Cloud`);
      setTimeout(() => setToastMsg(''), 4500);

      // Refrescar datos y métricas automáticamente
      loadData();

      // Refrescar transiciones disponibles tras el cambio
      jiraService.getIssueTransitions(selectedTaskModal.key)
        .then(tRes => {
          if (tRes && Array.isArray(tRes.transitions)) setAvailableTransitions(tRes.transitions);
        })
        .catch(() => {});

    } catch (err) {
      console.error("Error al actualizar estado en Jira:", err);
      // Si Jira rechaza la transición: restaurar estado anterior y mostrar error
      setSelectedTaskModal(prev => prev ? {
        ...prev,
        status: previousStatus,
        rawStatus: previousRawStatus
      } : null);

      const statusErr = err?.response?.status;
      let msg = err?.response?.data?.detail;
      if (msg && (msg.includes('scope does not match') || msg.includes('Unauthorized; scope'))) {
        msg = 'Tu sesión de Jira no cuenta con permisos de escritura. Por favor cierra sesión y vuelve a ingresar con Jira para actualizar los permisos.';
      } else if (!msg) {
        if (statusErr === 401 || statusErr === 403) {
          msg = "Se perdió la conexión con Jira. Verifica la autenticación.";
        } else if (statusErr === 502 || statusErr === 503 || statusErr === 504) {
          msg = "No fue posible comunicarse con Jira. Intenta nuevamente.";
        } else {
          msg = "Jira no pudo actualizar el estado. El estado actual se mantiene.";
        }
      }
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 6500);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCopyGitBranch = (task) => {
    const slug = (task.summary || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);
    const branchName = `git checkout -b feature/${task.key}-${slug}`;
    navigator.clipboard.writeText(branchName);
    setCopiedBranch(true);
    setToastMsg(`📋 Comando de Git copiado: ${branchName}`);
    setTimeout(() => {
      setCopiedBranch(false);
      setToastMsg('');
    }, 3000);
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const formatIssues = (assignedIssues) => {
    if (!assignedIssues || assignedIssues.length === 0) return [];
    return assignedIssues.map((t, idx) => {
      const raw = (t.status_actual || t.estado || 'POR HACER').toUpperCase();
      let st = 'POR HACER';
      if (['FINALIZADO', 'DONE', 'COMPLETADA', 'LISTO', 'RESOLVED', 'CLOSED', 'TERMINADO'].some(s => raw.includes(s))) st = 'FINALIZADO';
      else if (['IN PROGRESS', 'EN CURSO', 'EN PROGRESO', 'IN DEVELOPMENT', 'DOING'].some(s => raw.includes(s))) st = 'EN CURSO';
      else if (['EN REVISIÓN', 'EN REVISION', 'REVIEW', 'QA'].some(s => raw.includes(s))) st = 'EN REVISIÓN';
      else if (['BLOQUEADA', 'BLOCKED', 'IMPEDIMENT'].some(s => raw.includes(s))) st = 'BLOQUEADA';
      else st = 'POR HACER';
      
      return {
        id: t.id_jira || idx,
        key: t.key_issue,
        summary: t.summary || t.resumen,
        type: t.issue_type || t.tipo || 'Story',
        priority: t.priority || t.prioridad || 'Media',
        status: st,
        rawStatus: t.status_actual || t.estado || st,
        sprint: 'Sprint Actual',
        date: t.created_at ? t.created_at.substring(0, 10) : (t.fecha_creacion ? new Date(t.fecha_creacion).toISOString().split('T')[0] : 'N/A'),
        sp: t.story_points || 0
      };
    });
  };

  const fetchLocalScorecard = async () => {
    try {
      const data = await developerService.getMyScorecard(selectedProjectId);
      if (data && data.assigned_issues) {
        const formatted = formatIssues(data.assigned_issues);
        setTasksList(formatted);
      }
    } catch (e) {
      console.warn("Error leyendo scorecard local:", e);
    }
  };

  const loadData = async (syncWithJira = true) => {
    setLoading(true);
    // 1. Cargar de inmediato los datos locales de la BD (sin demoras)
    await fetchLocalScorecard();
    setLoading(false);

    // 2. Si se solicita sincronización con Jira, ejecutarla y refrescar al finalizar
    if (syncWithJira) {
      setIsSyncing(true);
      try {
        await jiraService.triggerSync(true);
        // 3. Volver a consultar tras la sincronización para mostrar los cambios reales de Jira
        await fetchLocalScorecard();
      } catch (err) {
        console.warn("Sincronización en segundo plano:", err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  useEffect(() => {
    loadData(true);

    // Sincronización automática periódica cada 20 segundos
    const syncInterval = setInterval(() => {
      loadData(true);
    }, 20000);

    return () => clearInterval(syncInterval);
  }, [selectedProjectId]);

  // Filtrado y Ordenamiento
  const filteredTasks = useMemo(() => {
    const list = tasksList.filter(task => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        task.key.toLowerCase().includes(q) || 
        (task.summary && task.summary.toLowerCase().includes(q)) ||
        (task.type && task.type.toLowerCase().includes(q)) ||
        (task.status && task.status.toLowerCase().includes(q));
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

    // Ordenamiento
    return list.sort((a, b) => {
      if (sortBy === 'RECENT') {
        if (a.date && b.date && a.date !== b.date && a.date !== 'N/A' && b.date !== 'N/A') {
          return b.date.localeCompare(a.date);
        }
        const numA = parseInt((a.key || '').replace(/\D/g, '') || '0', 10);
        const numB = parseInt((b.key || '').replace(/\D/g, '') || '0', 10);
        return numB - numA;
      }
      if (sortBy === 'OLDEST') {
        if (a.date && b.date && a.date !== b.date && a.date !== 'N/A' && b.date !== 'N/A') {
          return a.date.localeCompare(b.date);
        }
        const numA = parseInt((a.key || '').replace(/\D/g, '') || '0', 10);
        const numB = parseInt((b.key || '').replace(/\D/g, '') || '0', 10);
        return numA - numB;
      }
      if (sortBy === 'SP_DESC') {
        return (parseFloat(b.sp) || 0) - (parseFloat(a.sp) || 0);
      }
      if (sortBy === 'PRIORITY') {
        const pMap = { 'crítica': 4, 'critica': 4, 'alta': 3, 'high': 3, 'media': 2, 'medium': 2, 'baja': 1, 'low': 1 };
        const pA = pMap[a.priority?.toLowerCase()] || 0;
        const pB = pMap[b.priority?.toLowerCase()] || 0;
        return pB - pA;
      }
      return 0;
    });
  }, [tasksList, searchQuery, statusFilter, priorityFilter, sortBy]);

  // Reset de página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter, sortBy, selectedProjectId]);

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
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/30">Bug</span>;
    }
    if (t.includes('epic') || t.includes('épica')) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/30">Épica</span>;
    }
    if (t.includes('story') || t.includes('historia')) {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30">Historia</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/50">Tarea</span>;
  };

  const renderPriorityBadge = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p.includes('crít') || p.includes('crit') || p.includes('highest')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-transparent">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
          Crítica
        </span>
      );
    }
    if (p.includes('alt') || p.includes('high')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-transparent">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
          Alta
        </span>
      );
    }
    if (p.includes('med')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-transparent">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Media
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-transparent">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        Baja
      </span>
    );
  };

  const getStatusDotColor = (st) => {
    const s = (st || '').toLowerCase();
    if (s.includes('finaliz') || s.includes('done') || s.includes('listo') || s.includes('complet')) return 'bg-emerald-500 shadow-[0_0_6px_#10b981]';
    if (s.includes('bloque') || s.includes('block') || s.includes('imped')) return 'bg-amber-500 shadow-[0_0_6px_#f59e0b]';
    if (s.includes('revis') || s.includes('review') || s.includes('qa')) return 'bg-sky-500 shadow-[0_0_6px_#0ea5e9]';
    if (s.includes('curso') || s.includes('prog') || s.includes('dev') || s.includes('doing')) return 'bg-indigo-500 shadow-[0_0_6px_#6366f1]';
    return 'bg-slate-400';
  };

  const renderStatusBadge = (status, rawStatus) => {
    if (status === 'FINALIZADO') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/40 shadow-xs">
          <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
          Finalizado
        </span>
      );
    }
    if (status === 'EN CURSO') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/40 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500 animate-pulse"></span>
          En Curso
        </span>
      );
    }
    if (status === 'EN REVISIÓN') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/40 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-sky-600 dark:bg-sky-500"></span>
          En Revisión
        </span>
      );
    }
    if (status === 'BLOQUEADA') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40 shadow-xs">
          <AlertCircle size={13} className="text-amber-600 dark:text-amber-500" />
          Bloqueada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50">
        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        Por Hacer
      </span>
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-4 text-left font-sans text-slate-800 dark:text-slate-100 pb-10">
      
      {/* 1. Encabezado Sobrio con Proyecto y Desarrollador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#272b5c]/70">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold shadow-sm shrink-0">
            <Layers size={22} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Desarrollador: <strong className="text-slate-800 dark:text-slate-200 font-bold">{devName}</strong>
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Plan de Trabajo
            </h1>
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Proyecto: <strong className="text-indigo-600 dark:text-indigo-400 font-bold uppercase">{projectName}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0 self-start sm:self-center">
          <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            {isSyncing ? (
              <>
                <Loader2 size={13} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Sincronizando con Jira...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">Sincronizado con Jira</span>
              </>
            )}
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-bold text-slate-800 dark:text-slate-300">
            {totalItems} {totalItems === 1 ? 'tarea' : 'tareas'}
          </span>
        </div>
      </div>

      {/* 2. Resumen Horizontal Compacto del Sprint */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 py-2.5 px-3.5 sm:px-4 rounded-xl bg-white dark:bg-[#141738]/50 border border-slate-200 dark:border-[#272b5c]/60 shadow-xs text-xs">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Asignados:</span>
          <strong className="text-slate-900 dark:text-white font-mono font-bold">{totalSPAssigned} SP</strong>
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Completados:</span>
          <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{totalSPBurned} SP</strong>
          {totalSPAssigned > 0 && (
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">({burnedPct}%)</span>
          )}
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-600 dark:text-slate-400 font-medium">En progreso:</span>
          <strong className="text-indigo-700 dark:text-indigo-400 font-mono font-bold">{inProgressCount}</strong>
          <span className="text-slate-600 dark:text-slate-400">{inProgressCount === 1 ? 'tarea' : 'tareas'}</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Pendientes:</span>
          <strong className="text-slate-800 dark:text-slate-300 font-mono font-bold">{pendingCount}</strong>
          <span className="text-slate-600 dark:text-slate-400">{pendingCount === 1 ? 'tarea' : 'tareas'}</span>
        </div>
      </div>

      {/* 3. Barra de Búsqueda y Filtros Compacta y Adaptable */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 pt-1">
        {/* Input Buscador */}
        <div className="flex flex-1 items-center gap-2 px-3 py-2 bg-white dark:bg-[#141738] rounded-xl border border-slate-200 dark:border-[#272b5c] focus-within:border-indigo-500 transition-colors shadow-xs">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar por clave (ej. SCRUM-152) o resumen..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Controles de Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Select Estado */}
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="flex-1 sm:flex-none bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors shadow-xs"
          >
            <option value="TODOS" className="dark:bg-[#141738]">Todos los Estados</option>
            <option value="POR HACER" className="dark:bg-[#141738]">Por Hacer</option>
            <option value="EN CURSO" className="dark:bg-[#141738]">En Curso</option>
            <option value="EN REVISIÓN" className="dark:bg-[#141738]">En Revisión</option>
            <option value="BLOQUEADA" className="dark:bg-[#141738]">Bloqueadas</option>
            <option value="FINALIZADO" className="dark:bg-[#141738]">Finalizados</option>
          </select>

          {/* Select Prioridad */}
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)} 
            className="flex-1 sm:flex-none bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors shadow-xs"
          >
            <option value="TODAS" className="dark:bg-[#141738]">Todas las Prioridades</option>
            <option value="Crítica" className="dark:bg-[#141738]">Crítica</option>
            <option value="Alta" className="dark:bg-[#141738]">Alta</option>
            <option value="Media" className="dark:bg-[#141738]">Media</option>
            <option value="Baja" className="dark:bg-[#141738]">Baja</option>
          </select>

          {/* Select Orden */}
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="flex-1 sm:flex-none bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors shadow-xs"
          >
            <option value="RECENT" className="dark:bg-[#141738]">Más recientes</option>
            <option value="OLDEST" className="dark:bg-[#141738]">Más antiguas</option>
            <option value="SP_DESC" className="dark:bg-[#141738]">Mayor SP</option>
            <option value="PRIORITY" className="dark:bg-[#141738]">Mayor Prioridad</option>
          </select>

          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-500 dark:hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* 4. Lista / Tabla Principal de Tareas Adaptable */}
      <div className="bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[480px]">
        <div className="overflow-x-auto flex-1 w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0c0e21]/70 border-b border-slate-200 dark:border-[#272b5c]/80 text-[11px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-3 sm:px-4 py-3 whitespace-nowrap">Clave</th>
                <th className="px-3 sm:px-4 py-3">Tarea / Resumen</th>
                <th className="px-3 sm:px-4 py-3 whitespace-nowrap">Tipo</th>
                <th className="px-3 sm:px-4 py-3 whitespace-nowrap">Prioridad</th>
                <th className="px-3 sm:px-4 py-3 whitespace-nowrap">Estado</th>
                <th className="px-3 sm:px-4 py-3 whitespace-nowrap hidden lg:table-cell">Sprint</th>
                <th className="px-3 sm:px-4 py-3 whitespace-nowrap hidden xl:table-cell">Fecha</th>
                <th className="px-2.5 sm:px-3 py-3 text-center whitespace-nowrap">SP</th>
                <th className="px-3 sm:px-4 py-3 text-right whitespace-nowrap">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-[#272b5c]/50">
              {paginatedTasks.length > 0 ? paginatedTasks.map(task => (
                <tr 
                  key={task.id} 
                  onClick={() => setSelectedTaskModal(task)}
                  className="hover:bg-slate-50/90 dark:hover:bg-[#1c204d]/50 transition-colors group cursor-pointer"
                >
                  {/* Clave */}
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 rounded border border-indigo-200 dark:border-indigo-800/40 group-hover:border-indigo-400 transition-colors">
                      {task.key}
                    </span>
                  </td>

                  {/* Resumen */}
                  <td className="px-3 sm:px-4 py-3 min-w-[160px]">
                    <div className="font-medium text-slate-900 dark:text-slate-200 leading-snug line-clamp-1" title={task.summary}>
                      {task.summary}
                    </div>
                  </td>

                  {/* Tipo */}
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    {renderTypeBadge(task.type)}
                  </td>

                  {/* Prioridad */}
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    {renderPriorityBadge(task.priority)}
                  </td>

                  {/* Estado */}
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    {renderStatusBadge(task.status, task.rawStatus)}
                  </td>

                  {/* Sprint */}
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                    {task.sprint}
                  </td>

                  {/* Fecha */}
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs font-mono text-slate-600 dark:text-slate-400 hidden xl:table-cell">
                    {task.date}
                  </td>

                  {/* Story Points */}
                  <td className="px-2.5 sm:px-3 py-3 whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center min-w-[22px] px-1.5 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 dark:bg-[#0c0e21] text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-[#272b5c]">
                      {task.sp}
                    </span>
                  </td>

                  {/* Acción */}
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskModal(task);
                      }}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-600 hover:text-white dark:bg-indigo-600/10 dark:text-indigo-400 dark:border-transparent dark:hover:bg-indigo-600 dark:hover:text-white transition-all cursor-pointer shadow-xs"
                    >
                      Gestionar
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" className="px-4 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ListTodo size={28} className="text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">No se encontraron tareas con los filtros actuales.</span>
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

        {/* Barra de Paginación */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-5 py-3 border-t border-slate-200 dark:border-[#272b5c] bg-slate-50/80 dark:bg-[#0c0e21]/50 text-xs text-slate-600 dark:text-slate-400 font-medium gap-3">
            <div>
              Mostrando <span className="font-bold text-slate-900 dark:text-slate-200">{startItem}</span> a <span className="font-bold text-slate-900 dark:text-slate-200">{endItem}</span> de <span className="font-bold text-slate-900 dark:text-slate-200">{totalItems}</span> tareas
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white dark:bg-[#1a1e47] border border-slate-200 dark:border-[#272b5c] rounded-lg text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold transition-all cursor-pointer text-xs shadow-xs"
                >
                  <ChevronLeft size={14} /> Anterior
                </button>
                
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-md font-bold text-xs transition-all cursor-pointer shrink-0 ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1a1e47]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white dark:bg-[#1a1e47] border border-slate-200 dark:border-[#272b5c] rounded-lg text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold transition-all cursor-pointer text-xs shadow-xs"
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TOAST DE CONFIRMACIÓN FLOTANTE */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-[99999] bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MODAL DE DETALLE DE TAREA */}
      {selectedTaskModal && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setSelectedTaskModal(null)}
          className="fixed top-0 bottom-0 right-0 left-0 md:left-64 z-[999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#141738] border border-[#272b5c] w-[95vw] sm:max-w-3xl rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6 text-left"
          >
            {/* 1. ENCABEZADO CON BADGES Y BOTÓN CERRAR */}
            <div className="flex items-center justify-between border-b border-[#272b5c]/80 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 rounded">
                  {selectedTaskModal.key}
                </span>
                <span className="px-2.5 py-1 text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded uppercase">
                  {selectedTaskModal.rawStatus || selectedTaskModal.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* 2. TÍTULO Y DESCRIPCIÓN */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {selectedTaskModal.summary}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#0c0e21]/70 p-3.5 rounded-xl border border-[#232752]">
                {selectedTaskModal.descripcion || 'Sin descripción detallada de Jira.'}
              </p>

              {/* 3. METADATOS: PRIORIDAD, STORY POINTS, TIEMPO DE CICLO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-3 rounded-xl bg-[#0c0e21] border border-[#232752]">
                  <span className="text-slate-400 font-semibold block">Prioridad</span>
                  <strong className="text-white font-bold">{selectedTaskModal.priority || 'Media'}</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#0c0e21] border border-[#232752]">
                  <span className="text-slate-400 font-semibold block">Story Points</span>
                  <strong className="text-white font-bold">{selectedTaskModal.sp || 0} SP</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#0c0e21] border border-[#232752]">
                  <span className="text-slate-400 font-semibold block">Tiempo de Ciclo</span>
                  <strong className="text-white font-bold">
                    {selectedTaskModal.cycle_time_days > 0 ? `${selectedTaskModal.cycle_time_days} días` : (selectedTaskModal.date ? `Creado: ${selectedTaskModal.date}` : '--')}
                  </strong>
                </div>
              </div>

              {/* 4. ACTUALIZAR ESTADO EN JIRA INTERACTIVO */}
              <div className="p-4 rounded-xl bg-[#191c3d]/70 border border-[#272b5c] space-y-2.5 relative">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    Tipo: <strong className="text-slate-200">{selectedTaskModal.type || 'Historia'}</strong>
                  </span>
                  {updatingStatus ? (
                    <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                      <Loader2 size={11} className="animate-spin" /> Sincronizando con Jira...
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">
                      Estado actual: <strong className="text-emerald-400 font-bold uppercase">{selectedTaskModal.rawStatus || selectedTaskModal.status}</strong>
                    </span>
                  )}
                </div>

                {/* SELECTOR DE ESTADO INTERACTIVO */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#0c0e21] border ${
                      isStatusDropdownOpen 
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                        : 'border-[#33376b] hover:border-indigo-500'
                    } text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-400 text-xs font-normal">Cambiar estado a:</span>
                      <div className="flex items-center gap-2 font-extrabold text-white">
                        <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(selectedTaskModal.rawStatus || selectedTaskModal.status)}`}></span>
                        <span>{selectedTaskModal.rawStatus || selectedTaskModal.status}</span>
                      </div>
                    </div>
                    {updatingStatus ? (
                      <Loader2 size={15} className="animate-spin text-indigo-400" />
                    ) : (
                      <ChevronDown size={15} className={`text-slate-400 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                    )}
                  </button>

                  {/* POPOVER FLOTANTE HACIA ARRIBA */}
                  {isStatusDropdownOpen && (
                    <div className="absolute left-0 right-0 bottom-full mb-2 z-50 bg-[#191c3d] border border-[#3b3f78] rounded-2xl shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
                      {loadingTransitions ? (
                        <div className="py-3 px-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 size={13} className="animate-spin text-indigo-400" />
                          <span>Consultando transiciones en Jira...</span>
                        </div>
                      ) : availableTransitions.length > 0 ? (
                        availableTransitions.map((t) => {
                          const isCurrent = (selectedTaskModal.rawStatus || selectedTaskModal.status).toLowerCase() === (t.to_status || t.name).toLowerCase();
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleSelectTransition(t)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-indigo-600/30 text-indigo-300 font-extrabold border border-indigo-500/30'
                                  : 'text-slate-200 hover:bg-[#252a5c] font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(t.to_status || t.name)}`}></span>
                                <span>{t.name}</span>
                              </div>
                              {isCurrent && <Check size={14} className="text-indigo-400" />}
                            </button>
                          );
                        })
                      ) : (
                        [
                          { key: 'Por hacer', label: 'Por hacer', dot: 'bg-slate-400' },
                          { key: 'En curso', label: 'En curso', dot: 'bg-indigo-500 shadow-[0_0_6px_#6366f1]' },
                          { key: 'En revisión', label: 'En revisión', dot: 'bg-sky-500 shadow-[0_0_6px_#0ea5e9]' },
                          { key: 'Finalizado', label: 'Finalizado', dot: 'bg-emerald-500 shadow-[0_0_6px_#10b981]' }
                        ].map((st) => {
                          const isCurrent = (selectedTaskModal.rawStatus || selectedTaskModal.status).toLowerCase().includes(st.key.toLowerCase());
                          return (
                            <button
                              key={st.key}
                              type="button"
                              onClick={() => handleSelectTransition(st.key)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-indigo-600/30 text-indigo-300 font-extrabold border border-indigo-500/30'
                                  : 'text-slate-200 hover:bg-[#252a5c] font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${st.dot}`}></span>
                                <span>{st.label}</span>
                              </div>
                              {isCurrent && <Check size={14} className="text-indigo-400" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-900/60 flex items-center gap-2 text-rose-300 text-xs font-semibold animate-in fade-in">
                    <AlertTriangle size={15} className="text-rose-500 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 5. ACCIONES INFERIORES */}
            <div className="flex items-center justify-between pt-3 border-t border-[#272b5c]/80">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleCopyGitBranch(selectedTaskModal)}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#0c0e21] hover:bg-[#1e224f] text-slate-200 border border-[#272b5c] transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Copiar comando git checkout para crear la rama"
                >
                  {copiedBranch ? <Check size={13} className="text-emerald-500" /> : <GitBranch size={13} className="text-indigo-400" />}
                  <span>{copiedBranch ? '¡Rama copiada!' : 'Copiar rama Git'}</span>
                </button>
                <a
                  href={`https://beltrancamilo592.atlassian.net/browse/${selectedTaskModal.key}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Abrir en Jira ↗</span>
                </a>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskModal(null)}
                className="px-5 py-2 text-xs font-bold bg-[#1e224f] hover:bg-[#272c66] text-white rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
