import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { developerService, jiraService } from '../../../services/api';

export const useDevWorkload = ({ projects, selectedProjectId }) => {
  const { user } = useAuth();
  const [tasksList, setTasksList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
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

  // Paginación
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

  // Cargar transiciones reales de Jira cuando se abre el modal
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
          console.warn("Transiciones reales de Jira no accesibles, usando catálogo estándar:", err);
          setAvailableTransitions([]);
        })
        .finally(() => {
          setLoadingTransitions(false);
        });
    }
  }, [selectedTaskModal?.key]);

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
    await fetchLocalScorecard();
    setLoading(false);

    if (syncWithJira) {
      setIsSyncing(true);
      try {
        await jiraService.triggerSync(true);
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
    const syncInterval = setInterval(() => {
      loadData(true);
    }, 20000);
    return () => clearInterval(syncInterval);
  }, [selectedProjectId]);

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
        sp: t.story_points || 0,
        cycle_time_days: t.cycle_time_days || 0,
        descripcion: t.descripcion || ''
      };
    });
  };

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
      const res = await jiraService.executeIssueTransition(selectedTaskModal.key, payload);
      
      const realStatus = res?.status || targetLabel;
      let normStatus = realStatus.toUpperCase();
      if (['FINALIZADO', 'DONE', 'COMPLETADA', 'LISTO', 'RESOLVED', 'CLOSED'].some(s => normStatus.includes(s))) normStatus = 'FINALIZADO';
      else if (['IN PROGRESS', 'EN CURSO', 'EN PROGRESO', 'IN DEVELOPMENT', 'DOING'].some(s => normStatus.includes(s))) normStatus = 'EN CURSO';
      else if (['EN REVISIÓN', 'EN REVISION', 'REVIEW', 'QA'].some(s => normStatus.includes(s))) normStatus = 'EN REVISIÓN';
      else if (['BLOQUEADA', 'BLOCKED'].some(s => normStatus.includes(s))) normStatus = 'BLOQUEADA';
      else normStatus = 'POR HACER';

      setSelectedTaskModal(prev => prev ? {
        ...prev,
        status: normStatus,
        rawStatus: realStatus
      } : null);

      setTasksList(prev => prev.map(t => {
        if (t.key === selectedTaskModal.key) {
          return { ...t, status: normStatus, rawStatus: realStatus };
        }
        return t;
      }));

      setToastMsg(`✅ Estado de ${selectedTaskModal.key} actualizado a "${realStatus}" en Jira Cloud`);
      setTimeout(() => setToastMsg(''), 4500);

      loadData();

      jiraService.getIssueTransitions(selectedTaskModal.key)
        .then(tRes => {
          if (tRes && Array.isArray(tRes.transitions)) setAvailableTransitions(tRes.transitions);
        })
        .catch(() => {});

    } catch (err) {
      console.error("Error al actualizar estado en Jira:", err);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter, sortBy, selectedProjectId]);

  const totalItems = filteredTasks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTasks, currentPage, itemsPerPage]);

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

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

  return {
    projectName, devName,
    loading, isSyncing,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    priorityFilter, setPriorityFilter,
    sortBy, setSortBy,
    hasActiveFilters, clearFilters,
    tasksList, filteredTasks, paginatedTasks,
    currentPage, setCurrentPage, totalPages, totalItems, startItem, endItem, itemsPerPage,
    totalSPAssigned, totalSPBurned, inProgressCount, pendingCount, burnedPct,
    selectedTaskModal, setSelectedTaskModal,
    availableTransitions, loadingTransitions,
    isStatusDropdownOpen, setIsStatusDropdownOpen,
    dropdownRef, updatingStatus, handleSelectTransition,
    copiedBranch, handleCopyGitBranch,
    toastMsg, errorMsg
  };
};
