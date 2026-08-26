// ============================================================================
// FEATURE PROJECTS — DASHBOARD DE PROYECTOS Y EQUIPOS ASIGNADOS
// ============================================================================
// Muestra tarjetas interactivas de proyectos con flecha desplegable para consultar
// Líder Técnico, Desarrolladores asignados y Resumen Ejecutivo de Gráficas a todo lo ancho en la parte inferior.

import React, { useMemo, useState, useEffect } from 'react';
import api, { projectService } from '../../../services/api';
import { useAuth } from '../../auth/context/AuthContext';
import LiderNotificationBell from '../../dashboard/components/LiderNotificationBell';
import { SprintBurndownChart } from '../components/SprintBurndownChart';
import { ProjectMetrics } from '../components/ProjectMetrics';
import {
  FolderKanban,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
  Clock,
  UserPlus,
  Edit3,
  Trash2,
  Power,
  PowerOff,
  Ban,
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  Check,
  CheckCircle2,
  Trophy,
  TrendingUp,
  Bug,
  Activity,
  Search,
  Info,
  Save,
  Users,
  FileDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import PercentilesChart from '../../dashboard/components/PercentilesChart';

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  borderColor: 'var(--border-color)',
  borderRadius: '12px',
  color: 'var(--text-main)',
  fontSize: '12px',
  boxShadow: 'var(--shadow-card)'
};

const MetricInfoTooltip = ({ text, align = "auto" }) => {
  return (
    <div className="group/tooltip relative inline-flex items-center cursor-help ml-1.5 shrink-0 z-[100]">
      <div className="p-1 rounded-full text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 transition-all cursor-pointer border border-transparent hover:border-indigo-500/30">
        <Info size={14} />
      </div>
      <div className={`absolute bottom-full mb-2 ${align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"} hidden group-hover/tooltip:block w-56 p-2.5 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs rounded-xl shadow-2xl z-50 pointer-events-none text-left backdrop-blur-md font-normal leading-relaxed`}>
        {text}
        <div className={`absolute top-full ${align === "right" ? "right-3" : align === "left" ? "left-3" : "left-1/2 -translate-x-1/2"} border-4 border-transparent border-t-slate-900`}></div>
      </div>
    </div>
  );
};

function isAdminRole(rol) {
  if (!rol) return true;
  const r = String(rol).toLowerCase();
  return r === 'admin' || r === 'administrador' || r.includes('admin');
}

export default function ProyectosDashboardView({ userProfile = null }) {
  const { user } = useAuth();
  const isAdmin = isAdminRole(userProfile?.rol || user?.rol);

  const [projects, setProjects] = useState(() => {
    return JSON.parse(localStorage.getItem('custom_user_projects') || '[]');
  });
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [dbUsers, setDbUsers] = useState([]);
  const [dbProjects, setDbProjects] = useState([]);
  const [assignProjectId, setAssignProjectId] = useState({});

  const fetchUsersAndProjects = async () => {
    try {
      const [uRes, pRes] = await Promise.all([
        api.get('/api/v1/users'),
        api.get('/api/v1/projects')
      ]);
      setDbUsers(uRes.data || []);
      setDbProjects(pRes.data || []);
    } catch (e) {
      console.error("Error fetching devs", e);
    }
  };

  useEffect(() => {
    fetchUsersAndProjects();
  }, []);

  const developers = React.useMemo(() => {
    return dbUsers.filter(u => u.rol && (u.rol.toUpperCase().includes('DEV') || u.rol.toUpperCase().includes('DESARROLLADOR')));
  }, [dbUsers]);

  const assignedDevs = developers.filter(d => d.proyectos_asignados && d.proyectos_asignados.length > 0);
  const unassignedDevs = developers.filter(d => !d.proyectos_asignados || d.proyectos_asignados.length === 0);

  const handleAssignProject = async (userId, projectId) => {
    if (!projectId) return;
    try {
      await api.post(`/api/v1/users/${userId}/projects`, { id_proyectos: [projectId] });
      await fetchUsersAndProjects();
      setAssignProjectId({...assignProjectId, [userId]: ''});
    } catch (e) {
      console.error(e);
    }
  };


  // Estados para HU-014 Análisis de Tiempos
  const [activeProjectTab, setActiveProjectTab] = useState('RESUMEN');
  const [percentilesData, setPercentilesData] = useState(null);
  const [loadingPercentiles, setLoadingPercentiles] = useState(false);
  const [percentilesWindow, setPercentilesWindow] = useState(15);

  const [availableLeaders, setAvailableLeaders] = useState([]);
  const [availableDevelopers, setAvailableDevelopers] = useState([]);
  const [realProjectMetrics, setRealProjectMetrics] = useState({});

  // Cargar usuarios reales (Líderes y Desarrolladores) desde el backend
  useEffect(() => {
    import('../../../services/api').then(({ userService }) => {
      userService.getUsers()
        .then(users => {
          if (Array.isArray(users) && users.length > 0) {
            const leaders = users.filter(u => {
              const r = (u.rol || '').toLowerCase();
              return r.includes('líder') || r.includes('lider') || r.includes('admin');
            });
            const devs = users.filter(u => {
              const r = (u.rol || '').toLowerCase();
              return r.includes('desarrollador') || r.includes('dev');
            });

            if (leaders.length > 0) {
              setAvailableLeaders(leaders.map(u => ({
                id: `usr-${u.id_usuario}`,
                name: u.nombre || u.email,
                email: u.email,
                avatar: (u.nombre || u.email)[0].toUpperCase(),
                role: u.rol || 'Líder Técnico',
                experience: 'Lead System'
              })));
            }
            if (devs.length > 0) {
              setAvailableDevelopers(devs.map(u => ({
                id: `usr-${u.id_usuario}`,
                name: u.nombre || u.email,
                email: u.email,
                avatar: (u.nombre || u.email)[0].toUpperCase(),
                tasksCount: 4,
                status: 'Active'
              })));
            }
          }
        })
        .catch(err => console.warn("Aviso: usando fallback de usuarios:", err));
    });
  }, []);

  // Cargar proyectos reales sincronizados desde Jira Cloud
  useEffect(() => {
    projectService.getProjects()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const apiProjects = data.map((p, idx) => ({
            id: p.id_proyecto || `proj-${idx + 1}`,
            key: p.key_proyecto || `KEY-${idx + 1}`,
            name: p.nombre || `Proyecto ${idx + 1}`,
            description: `Proyecto sincronizado desde Jira Cloud (ID: ${p.id_proyecto}). Tablero principal: #${p.id_board || 'N/A'}.`,
            status: (p.estado || '').toUpperCase() === 'ACTIVE' || (p.estado || '').toUpperCase() === 'ACTIVO' ? 'ACTIVE' : 'STABLE',
            statusLabel: `Estado: ${p.estado || 'Activo'}`,
            progress: 85,
            category: 'Proyecto Jira Cloud',
            leader: availableLeaders[idx % availableLeaders.length] || null,
            developers: availableDevelopers.slice(0, 3)
          }));
          
          const savedCustom = JSON.parse(localStorage.getItem('custom_user_projects') || '[]');
          
          // Combinar proyectos locales con los del API, priorizando los locales por ID/Key
          const combined = [...savedCustom, ...apiProjects];
          const unique = [];
          const seen = new Set();
          for (const p of combined) {
            if (!seen.has(p.id) && !seen.has(p.key)) {
              seen.add(p.id);
              if (p.key) seen.add(p.key);
              unique.push(p);
            }
          }
          
          setProjects(unique);
        }
      })
      .catch((err) => {
        console.warn("Error al obtener lista real de proyectos:", err);
      });
  }, [availableLeaders.length, availableDevelopers.length]);

  // Cargar métricas y gráficas reales del proyecto al expandir su tarjeta
  useEffect(() => {
    if (!expandedProjectId) return;
    Promise.all([
      projectService.getKpis(expandedProjectId).catch(() => []),
      projectService.getKpiIssuesDetail(expandedProjectId).catch(() => ({ total_issues: 0, issues: [] }))
    ]).then(([kpisData, detailData]) => {
      const kpis = Array.isArray(kpisData) ? kpisData : [];
      const issues = detailData?.issues || [];

      let velocity = kpis
        .filter(k => k.id_sprint != null)
        .map((k, idx) => ({
          sprint: `Sprint ${idx + 1}`,
          sp: k.velocity_total_sp || 0
        }));

      if (velocity.length === 0 && issues.length > 0) {
        const completedSP = issues.reduce((acc, i) => acc + (i.story_points || 0), 0);
        velocity = [{ sprint: 'Sprint Actual', sp: Math.round(completedSP * 10) / 10 }];
      }

      let storiesCount = 0, bugsCount = 0, tasksCount = 0;
      issues.forEach(i => {
        const t = (i.issue_type || '').toLowerCase();
        if (t.includes('bug')) bugsCount++;
        else if (t.includes('task') || t.includes('tarea')) tasksCount++;
        else storiesCount++;
      });
      const tot = Math.max(storiesCount + bugsCount + tasksCount, 1);

      const distribution = [
        { name: 'Historias de Usuario', value: storiesCount, percentage: Math.round((storiesCount / tot) * 100), color: '#8b5cf6' },
        { name: 'Bugs y Defectos', value: bugsCount, percentage: Math.round((bugsCount / tot) * 100), color: '#ec4899' },
        { name: 'Tareas / Deuda Técnica', value: tasksCount, percentage: Math.round((tasksCount / tot) * 100), color: '#06b6d4' }
      ];

      const lastKpi = kpis[kpis.length - 1] || {};
      const avgCT = lastKpi.cycle_time_promedio_dias || (issues.length > 0 ? (issues.reduce((a, i) => a + (i.cycle_time_days || 0), 0) / issues.length).toFixed(1) : 0);

      setRealProjectMetrics(prev => ({
        ...prev,
        [expandedProjectId]: {
          velocity: velocity.length > 0 ? velocity : [{ sprint: 'Sprint Actual', sp: 0 }],
          burndown: [
            { day: 'D1', real: issues.length, ideal: issues.length },
            { day: 'D5', real: Math.ceil(issues.length / 2), ideal: Math.ceil(issues.length / 2) },
            { day: 'D10', real: 0, ideal: 0 }
          ],
          distribution,
          kpis: {
            velocitySp: lastKpi.velocity_total_sp || issues.reduce((acc, i) => acc + (i.story_points || 0), 0),
            deliveryHealth: '90%',
            cycleTimeDays: `${avgCT}d`,
            criticalBugs: bugsCount
          }
        }
      }));
    });
  }, [expandedProjectId]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formKey, setFormKey] = useState('');
  const [formLeaderId, setFormLeaderId] = useState('usr-2');
  const [formDevIds, setFormDevIds] = useState(['usr-3', 'usr-4']);
  const [leaderOpen, setLeaderOpen] = useState(false);
  const [devsOpen, setDevsOpen] = useState(false);
  const [leaderSearch, setLeaderSearch] = useState('');
  const [devSearch, setDevSearch] = useState('');
  const [assignmentReady, setAssignmentReady] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const toggleExpand = (projectId) => {
    if (expandedProjectId === projectId) {
      setExpandedProjectId(null);
    } else {
      setExpandedProjectId(projectId);
      setActiveProjectTab('RESUMEN');

      // HU-014: Cargar datos de percentiles en paralelo
      setLoadingPercentiles(true);
      projectService.getPercentiles(projectId, percentilesWindow)
        .then(data => setPercentilesData(data))
        .catch(err => console.error("Error al cargar percentiles", err))
        .finally(() => setLoadingPercentiles(false));
    }
  };

  // Re-fetch percentiles if the window changes and the tab is open
  useEffect(() => {
    if (expandedProjectId && activeProjectTab === 'TIEMPOS') {
      setLoadingPercentiles(true);
      projectService.getPercentiles(expandedProjectId, percentilesWindow)
        .then(data => setPercentilesData(data))
        .catch(err => console.error("Error al cargar percentiles", err))
        .finally(() => setLoadingPercentiles(false));
    }
  }, [percentilesWindow]);

  const resetAssignFormUi = () => {
    setLeaderOpen(false);
    setDevsOpen(false);
    setLeaderSearch('');
    setDevSearch('');
    setAssignmentReady(false);
  };

  const getNextProjectKey = () => {
    const existingNumbers = projects
      .map(p => {
        const match = p.key?.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      });
    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const next = maxNum + 1;
    return `PROJ-${String(next).padStart(3, '0')}`;
  };

  const handleOpenCreateModal = () => {
    setEditingProjectId(null);
    setFormName('');
    setFormKey(getNextProjectKey());
    setFormLeaderId('');
    setFormDevIds([]);
    resetAssignFormUi();
    setShowAssignModal(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProjectId(project.id);
    setFormName(project.name);
    setFormKey(project.key);
    setFormLeaderId(project.leader?.id || '');
    setFormDevIds(project.developers?.map(d => d.id) || []);
    resetAssignFormUi();
    setShowAssignModal(true);
  };

  const handleToggleDeveloper = (devId) => {
    setFormDevIds(prev => (prev.includes(devId) ? prev.filter(id => id !== devId) : [...prev, devId]));
    setAssignmentReady(false);
  };

  const selectedLeader = useMemo(
    () => availableLeaders.find(l => l.id === formLeaderId) || null,
    [formLeaderId, availableLeaders]
  );

  const selectedDevs = useMemo(
    () => availableDevelopers.filter(d => formDevIds.includes(d.id)),
    [formDevIds, availableDevelopers]
  );

  const filteredLeaders = useMemo(() => {
    const q = leaderSearch.trim().toLowerCase();
    if (!q) return availableLeaders;
    return availableLeaders.filter(
      l => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.role.toLowerCase().includes(q)
    );
  }, [leaderSearch]);

  const filteredDevelopers = useMemo(() => {
    const q = devSearch.trim().toLowerCase();
    if (!q) return availableDevelopers;
    return availableDevelopers.filter(
      d => d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q)
    );
  }, [devSearch]);

  const handlePrepareAssignment = (e) => {
    e?.preventDefault?.();
    if (!formName.trim() || !formKey.trim() || !formLeaderId) {
      showToast('Completa nombre, clave Jira y líder técnico.');
      return;
    }
    setLeaderOpen(false);
    setDevsOpen(false);
    setAssignmentReady(true);
    showToast('Revisa el resumen y confirma la asignación.');
  };

  const handleConfirmProjectAssignment = () => {
    if (!formName.trim() || !formKey.trim() || !formLeaderId || !selectedLeader) {
      showToast('Completa los datos antes de confirmar.');
      return;
    }

    if (editingProjectId) {
      setProjects(prev => {
        const updated = prev.map(p => (p.id === editingProjectId
          ? { ...p, name: formName.trim(), key: formKey.trim().toUpperCase(), leader: selectedLeader, developers: selectedDevs }
          : p));
        const customOnly = updated.filter(p => p.id.startsWith('proj-') || p.id.includes('custom'));
        localStorage.setItem('custom_user_projects', JSON.stringify(customOnly));
        return updated;
      });
      showToast(`Proyecto '${formName.trim()}' actualizado correctamente.`);
    } else {
      const newProject = {
        id: `proj-${Date.now()}`,
        key: formKey.trim().toUpperCase(),
        name: formName.trim(),
        status: 'ACTIVE',
        statusLabel: 'Sprint 1 Asignado',
        progress: 15,
        category: 'Sin categoría',
        leader: selectedLeader,
        developers: selectedDevs
      };
      setProjects(prev => {
        const updated = [newProject, ...prev];
        const customOnly = updated.filter(p => p.id.startsWith('proj-') || p.id.includes('custom'));
        localStorage.setItem('custom_user_projects', JSON.stringify(customOnly));
        return updated;
      });
      setExpandedProjectId(newProject.id);
      showToast(`Proyecto '${formName.trim()}' asignado con éxito.`);
    }

    setShowAssignModal(false);
    resetAssignFormUi();
  };

  const handleOpenConfirmModal = (project) => {
    setPendingAssignment({ project, newLeaderName: 'Andrés Felipe Torres' });
    setShowConfirmModal(true);
  };

  const [lastDeletedProject, setLastDeletedProject] = useState(null);

  const handleConfirmAssignment = () => {
    showToast(`Asignación de '${pendingAssignment?.project.name}' confirmada.`);
    setShowConfirmModal(false);
  };

  const [statusTab, setStatusTab] = useState('ACTIVE');

  const [burndownData, setBurndownData] = useState([]);
  const [loadingBurndown, setLoadingBurndown] = useState(false);
  const [selectedBurndownProject, setSelectedBurndownProject] = useState(null);

  useEffect(() => {
    if (statusTab === 'BURNDOWN') {
      const projId = selectedBurndownProject || (dbProjects && dbProjects.length > 0 ? dbProjects[0].id_proyecto : null);
      if (projId) {
        if (!selectedBurndownProject) setSelectedBurndownProject(projId);
        const fetchBD = async () => {
          setLoadingBurndown(true);
          try {
            const res = await projectService.getProjectBurndown(projId);
            setBurndownData(res.data || []);
          } catch(e) {
            console.error(e);
            setBurndownData([]);
          } finally {
            setLoadingBurndown(false);
          }
        };
        fetchBD();
      }
    }
  }, [statusTab, selectedBurndownProject, dbProjects]);
 // 'ACTIVE' | 'COMPLETED' | 'INACTIVE' | 'ALL'
  const [projectToDeactivate, setProjectToDeactivate] = useState(null);

  const handleOpenDeactivateModal = (project) => {
    setProjectToDeactivate(project);
  };

  const handleConfirmDeactivate = () => {
    if (!projectToDeactivate) return;
    setProjects(prev => prev.map(p =>
      p.id === projectToDeactivate.id ? { ...p, status: 'INACTIVE', statusLabel: 'Desactivado' } : p
    ));
    if (expandedProjectId === projectToDeactivate.id) {
      setExpandedProjectId(null);
    }
    showToast(`🔒 Proyecto '${projectToDeactivate.name}' desactivado.`);
    setProjectToDeactivate(null);
  };

  const handleReactivateProject = (project) => {
    setProjects(prev => prev.map(p =>
      p.id === project.id ? { ...p, status: 'ACTIVE', statusLabel: 'Sprint 1 Activo' } : p
    ));
    showToast(`⚡ Proyecto '${project.name}' reactivado con éxito.`);
  };

  const handleToggleDeliveredProject = (project) => {
    setProjects(prev => prev.map(p => {
      if (p.id === project.id) {
        const isCurrentlyCompleted = p.status === 'COMPLETED' || p.status === 'DELIVERED';
        const newStatus = isCurrentlyCompleted ? 'ACTIVE' : 'COMPLETED';
        const newStatusLabel = isCurrentlyCompleted ? 'Sprint 1 Activo' : 'Entregado / Concluido';
        const newProgress = isCurrentlyCompleted ? 85 : 100;

        if (isCurrentlyCompleted) {
          showToast(`🔄 Proyecto '${p.name}' reabierto como Activo.`);
        } else {
          showToast(`🏆 ¡Proyecto '${p.name}' marcado como Entregado!`);
        }

        return {
          ...p,
          status: newStatus,
          statusLabel: newStatusLabel,
          progress: newProgress
        };
      }
      return p;
    }));
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.key.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (statusTab === 'ACTIVE') return p.status !== 'INACTIVE' && p.status !== 'COMPLETED' && p.status !== 'DELIVERED';
    if (statusTab === 'COMPLETED') return p.status === 'COMPLETED' || p.status === 'DELIVERED';
    if (statusTab === 'INACTIVE') return p.status === 'INACTIVE';
    return true; // 'ALL'
  });

  const activeProject = filteredProjects.find(p => p.id === expandedProjectId);
  const activeMetrics = activeProject ? realProjectMetrics[activeProject.id] : null;

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200 font-sans pb-10">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-white/95 dark:bg-slate-900/95 border border-emerald-500/50 text-emerald-700 dark:text-emerald-300 px-6 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <span className="text-xs font-black tracking-wide">{toastMessage}</span>
          {lastDeletedProject && (
            <button
              type="button"
              onClick={handleRestoreDeletedProject}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black cursor-pointer ml-2 shadow-xs transition-all"
            >
              Deshacer
            </button>
          )}
          <button type="button" onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 ml-3">
            <X size={15} />
          </button>
        </div>
      )}

      {showAssignModal && isAdmin && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 dark:bg-slate-950/90 backdrop-blur-md">
          <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[88vh]">
            {/* Header */}
            <div className="shrink-0 flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40" style={{ padding: '1.25rem 1.5rem' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-500/30">
                  <UserPlus size={22} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/20 px-2 py-0.5 rounded-md">
                    Administración RBAC
                  </span>
                  <h3 className="text-lg sm:text-xl font-black mt-1 text-slate-900 dark:text-slate-50 truncate">
                    {editingProjectId ? 'Editar Asignación de Proyecto' : 'Asignar Proyecto'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Define el proyecto, el líder técnico y el equipo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowAssignModal(false); resetAssignFormUi(); }}
                className="w-9 h-9 rounded-xl inline-flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body: form + summary */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_280px] overflow-hidden">
              <form
                onSubmit={handlePrepareAssignment}
                className="min-h-0 overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-r border-slate-100 dark:border-slate-800"
                style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                {/* Contenedor: Información general */}
                <div>
                  <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
                    <FolderKanban size={15} className="text-indigo-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">Información general</h4>
                  </div>
                  <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50" style={{ padding: '1.2rem 1.25rem' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300" style={{ marginBottom: 10 }}>Nombre del proyecto *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Sistema Analytics MCHAV"
                          value={formName}
                          onChange={e => { setFormName(e.target.value); setAssignmentReady(false); }}
                          className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300" style={{ marginBottom: 10 }}>Clave Jira *</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="Ej. MCHAV"
                            value={formKey}
                            onChange={e => { if (editingProjectId) { setFormKey(e.target.value); setAssignmentReady(false); } }}
                            readOnly={!editingProjectId}
                            className={`w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold uppercase text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 ${!editingProjectId ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-500/30 cursor-default' : ''
                              }`}
                          />
                          {!editingProjectId && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/30">
                              Auto-generada
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Contenedor: Planificador */}
                <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50" style={{ padding: '1.15rem 1.25rem' }}>
                  <div className="flex items-center justify-between gap-2" style={{ marginBottom: 14 }}>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={15} className="text-violet-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">Planificador responsable</h4>
                    </div>
                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-300 bg-violet-100 dark:bg-violet-500/15 px-2 py-0.5 rounded-md">
                      {formLeaderId ? '1 seleccionado' : 'Sin seleccionar'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setLeaderOpen(o => !o); setDevsOpen(false); }}
                    className={`w-full min-h-[42px] px-4 flex items-center justify-between gap-3 rounded-xl border text-left transition-all ${leaderOpen
                      ? 'border-violet-500 bg-white dark:bg-slate-900 ring-2 ring-violet-500/25'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-violet-400'
                      }`}
                  >
                    <p className={`text-sm font-semibold truncate ${formLeaderId ? 'text-slate-900 dark:text-slate-50' : 'text-slate-600 dark:text-slate-300'}`}>
                      {formLeaderId && selectedLeader ? selectedLeader.name : 'Seleccionar planificador'}
                    </p>
                    {leaderOpen ? <ChevronUp size={18} className="text-violet-500 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
                  </button>

                  {leaderOpen && (
                    <div className="mt-2.5 rounded-xl border border-violet-200 dark:border-violet-500/30 bg-white dark:bg-slate-900 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="flex items-center gap-2.5 px-4 min-h-[42px] border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                        <Search size={15} className="text-slate-400 shrink-0" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Buscar planificador..."
                          value={leaderSearch}
                          onChange={e => setLeaderSearch(e.target.value)}
                          className="w-full bg-transparent border-0 outline-none text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {filteredLeaders.length === 0 ? (
                          <p className="text-sm text-slate-400 px-4 py-4 text-center">Sin resultados</p>
                        ) : filteredLeaders.map(l => {
                          const active = l.id === formLeaderId;
                          return (
                            <button
                              key={l.id}
                              type="button"
                              onClick={() => {
                                setFormLeaderId(l.id);
                                setLeaderOpen(false);
                                setLeaderSearch('');
                                setAssignmentReady(false);
                              }}
                              className={`w-full min-h-[42px] px-4 flex items-center justify-between gap-2 text-left border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors ${active
                                ? 'bg-violet-50 dark:bg-violet-500/15'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                }`}
                            >
                              <div className="min-w-0">
                                <p className={`text-sm font-bold truncate ${active ? 'text-violet-700 dark:text-violet-300' : 'text-slate-800 dark:text-slate-100'}`}>{l.name}</p>
                                <p className="text-xs text-slate-500 truncate">{l.role}</p>
                              </div>
                              {active && <Check size={15} className="text-violet-600 dark:text-violet-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>

                {/* Contenedor: Desarrolladores */}
                <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50" style={{ padding: '1.25rem 1.5rem' }}>
                  <div className="flex items-center justify-between gap-2" style={{ marginBottom: 16 }}>
                    <div className="flex items-center gap-2">
                      <Users size={15} className="text-sky-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">Desarrolladores asignados</h4>
                    </div>
                    <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-500/15 px-2 py-0.5 rounded-md">
                      {formDevIds.length} de {availableDevelopers.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setDevsOpen(o => !o); setLeaderOpen(false); }}
                    className={`w-full min-h-[42px] pl-6 pr-4 flex items-center justify-between gap-3 rounded-xl border text-left transition-all ${devsOpen
                      ? 'border-sky-500 bg-white dark:bg-slate-900 ring-2 ring-sky-500/25'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-sky-400'
                      }`}
                  >
                    <p className={`text-sm font-semibold truncate ${selectedDevs.length ? 'text-slate-900 dark:text-slate-50' : 'text-slate-600 dark:text-slate-300'}`}>
                      {selectedDevs.length
                        ? selectedDevs.map(d => d.name).join(', ')
                        : 'Seleccionar desarrolladores'}
                    </p>
                    {devsOpen ? <ChevronUp size={18} className="text-sky-500 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
                  </button>

                  {devsOpen && (
                    <div className="mt-2.5 rounded-xl border border-sky-200 dark:border-sky-500/30 bg-white dark:bg-slate-900 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="flex items-center gap-2.5 px-4 min-h-[42px] border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                        <Search size={15} className="text-slate-400 shrink-0" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Buscar desarrollador..."
                          value={devSearch}
                          onChange={e => setDevSearch(e.target.value)}
                          className="w-full bg-transparent border-0 outline-none text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {filteredDevelopers.length === 0 ? (
                          <p className="text-sm text-slate-400 px-4 py-4 text-center">Sin resultados</p>
                        ) : filteredDevelopers.map(dev => {
                          const isSelected = formDevIds.includes(dev.id);
                          return (
                            <button
                              key={dev.id}
                              type="button"
                              onClick={() => handleToggleDeveloper(dev.id)}
                              className={`w-full min-h-[42px] px-4 flex items-center justify-between gap-2 text-left border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors ${isSelected
                                ? 'bg-sky-50 dark:bg-sky-500/10'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                }`}
                            >
                              <div className="min-w-0">
                                <p className={`text-sm font-bold truncate ${isSelected ? 'text-sky-700 dark:text-sky-300' : 'text-slate-800 dark:text-slate-100'}`}>{dev.name}</p>
                                <p className="text-xs text-slate-500 truncate">{dev.email}</p>
                              </div>
                              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected
                                ? 'bg-sky-600 border-sky-600 text-white'
                                : 'border-slate-300 dark:border-slate-600'
                                }`}>
                                {isSelected && <Check size={11} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>

                {/* Footer acciones */}
                <div
                  className="mt-auto flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-100 dark:border-slate-800"
                  style={{ paddingTop: 20, paddingBottom: 10, marginTop: 10 }}
                >
                  <button
                    type="button"
                    onClick={() => { setShowAssignModal(false); resetAssignFormUi(); }}
                    className="min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    style={{ paddingLeft: 28, paddingRight: 28 }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="group relative min-h-[48px] rounded-xl text-sm font-black text-white overflow-hidden inline-flex items-center justify-center gap-2.5 shadow-md shadow-teal-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] hover:shadow-lg hover:shadow-indigo-500/35 active:scale-[0.98]"
                    style={{
                      paddingLeft: 28,
                      paddingRight: 28,
                      background: 'linear-gradient(135deg, #0d9488 0%, #4f46e5 55%, #7c3aed 100%)',
                      backgroundSize: '200% 200%',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundPosition = '100% 50%'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundPosition = '0% 50%'; }}
                  >
                    <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%]" style={{ transition: 'transform 0.7s ease, opacity 0.3s ease' }} />
                    <UserPlus size={16} className="relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                    <span className="relative z-10">Asignar</span>
                  </button>
                </div>
              </form>

              {/* Contenedor: Resumen derecha */}
              <aside className="min-h-0 overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-slate-50 dark:bg-slate-950/70 border-t lg:border-t-0 border-slate-100 dark:border-slate-800" style={{ padding: '1.25rem 1.1rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">Resumen de asignación</p>
                  <p className="text-sm font-black text-slate-900 dark:text-slate-50 mt-1 leading-snug">
                    {formName.trim() || 'Sin nombre'}
                  </p>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 uppercase">
                    {formKey.trim() || '—'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" style={{ padding: '0.85rem' }}>
                  <p className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-300 mb-2">Planificador</p>
                  {selectedLeader ? (
                    <>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-50">{selectedLeader.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{selectedLeader.role}</p>
                    </>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">Sin seleccionar</p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" style={{ padding: '0.85rem' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-300">Desarrolladores</p>
                    <span className="text-[10px] font-bold text-slate-500">{selectedDevs.length} asignados</span>
                  </div>
                  {selectedDevs.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">Ninguno seleccionado</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {selectedDevs.map(d => (
                        <li key={d.id} className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                          {d.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className={`rounded-2xl border text-[11px] leading-relaxed flex items-start gap-2 ${assignmentReady
                  ? 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                  : 'border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-200'
                  }`} style={{ padding: '0.75rem' }}>
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <span>
                    {assignmentReady
                      ? 'Listo para confirmar. Los cambios se aplicarán al equipo del proyecto.'
                      : 'Completa los datos y pulsa «Asignar proyecto» para habilitar la confirmación.'}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={!assignmentReady}
                  onClick={handleConfirmProjectAssignment}
                  className="group relative mt-auto min-h-[48px] w-full rounded-xl text-sm font-black text-white overflow-hidden inline-flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:scale-100 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/35 active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #0d9488 45%, #0891b2 100%)',
                    backgroundSize: '200% 200%',
                    paddingLeft: 20,
                    paddingRight: 20,
                  }}
                  onMouseEnter={(e) => {
                    if (e.currentTarget.disabled) return;
                    e.currentTarget.style.backgroundPosition = '100% 50%';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundPosition = '0% 50%';
                  }}
                >
                  <span
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                    style={{ transition: 'transform 0.7s ease, opacity 0.3s ease' }}
                  />
                  <Save size={15} className="relative z-10 transition-transform duration-300 group-hover:scale-110" />
                  <span className="relative z-10">Confirmar</span>
                </button>
              </aside>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CENTRADO MATEMÁTICO ABSOLUTO — EN EL CENTRO EXACTO DE LA PANTALLA */}
      {projectToDeactivate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-[520px] sm:max-w-[560px] bg-white dark:bg-[#0c0f1d] border border-slate-200 dark:border-slate-800 rounded-[32px] px-6 py-8 sm:px-10 sm:py-12 text-center flex flex-col items-center space-y-5 sm:space-y-6 shadow-2xl shadow-purple-500/10 dark:shadow-purple-950/60 animate-in zoom-in-95 duration-150">
            {/* Ícono de Desactivar dentro de Círculo Violeta */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-purple-50 dark:bg-[#1d1738] border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30 shrink-0">
              <PowerOff size={28} className="text-purple-600 dark:text-purple-400" />
            </div>

            {/* Título y Mensaje Explicativo Centrados */}
            <div className="space-y-3 w-full max-w-[440px] mx-auto text-center">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                ¿Deseas desactivar el proyecto?
              </h3>
              <div className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed space-y-1 font-normal text-center">
                <p>Aquí <span className="text-purple-600 dark:text-purple-400 font-bold">{projectToDeactivate.name}</span></p>
                <p>podrás reactivarlo en cualquier momento desde la</p>
                <p>pestaña de <span className="text-purple-600 dark:text-purple-400 font-bold">Desactivados</span></p>
              </div>
            </div>

            {/* Línea divisora sutil */}
            <div className="w-full max-w-[420px] mx-auto h-px bg-slate-200 dark:bg-slate-800/80 my-1" />

            {/* Botones Despegados y Proporcionados */}
            <div className="relative w-full max-w-[400px] mx-auto flex items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setProjectToDeactivate(null)}
                className="flex-1 h-12 sm:h-13 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-[#121829] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all cursor-pointer shadow-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                className="flex-1 h-12 sm:h-13 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && pendingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-50">Confirmar planificador</h3>
            <p className="text-sm text-slate-500">
              ¿Confirmas la asignación del proyecto <strong>{pendingAssignment.project.name}</strong>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowConfirmModal(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold">Cancelar</button>
              <button type="button" onClick={handleConfirmAssignment} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* BARRA SUPERIOR DE CONTROL DE PROYECTOS (ESTILO ADMIN RESUMEN) */}
      <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] flex flex-col md:flex-row md:items-center justify-between gap-4">

        {/* Lado Izquierdo: Ícono en Gradiente + Insignia + Título "Control de Proyectos" */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shrink-0">
            <FolderKanban size={24} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                Supervisión Ejecutiva
              </span>
              
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Control de Proyectos
            </h1>
          </div>
        </div>

        {/* Lado Derecho: Bell Popup + Exportar PDF */}
        <div className="flex items-center gap-2.5 shrink-0">
          <LiderNotificationBell />

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-[#5b36f5] hover:bg-indigo-600 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
            title="Exportar reporte consolidado en PDF"
          >
            <FileDown size={15} />
            <span>Exportar PDF</span>
          </button>
        </div>

      </div>

      {/* CONTENEDOR UNIFICADO: BARRA DE BÚSQUEDA Y ACCIÓN + MÉTRICAS KPIS */}
      <div className="bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] p-5 sm:p-6 rounded-3xl shadow-sm dark:shadow-2xl space-y-5">

        {/* FILA 1: BARRA DE ACCIÓN (NUEVO PROYECTO + BUSCADOR - AHORA ARRIBA) */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 flex-1">
            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="group relative shrink-0 h-[38px] rounded-xl text-[11px] font-black text-white overflow-hidden inline-flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg hover:shadow-sky-500/30 active:scale-[0.98]"
                style={{
                  paddingLeft: 16,
                  paddingRight: 16,
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%)',
                  backgroundSize: '200% 200%',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundPosition = '100% 50%'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundPosition = '0% 50%'; }}
              >
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  style={{ transition: 'transform 0.7s ease, opacity 0.3s ease' }}
                />
                <UserPlus size={13} className="relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                <span className="relative z-10">+ Asignar Nuevo Proyecto</span>
              </button>
            )}

            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar proyectos..."
                className="w-full h-[38px] pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#12142e] text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-all duration-300 focus:shadow-md"
              />
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* FILA 2: TARJETAS DE KPIS CON SOMBREADO EN GRADIENTE Y CUALIDADES DE AURA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Proyectos Activos (Emerald Theme) */}
          <div
            onClick={() => setStatusTab('ACTIVE')}
            className={`group relative overflow-hidden bg-white dark:bg-[#191c3d] border p-4.5 rounded-2xl text-left cursor-pointer transition-all hover:scale-[1.01] shadow-sm dark:shadow-xl ${statusTab === 'ACTIVE' ? 'border-emerald-500 ring-2 ring-emerald-500/40 dark:ring-emerald-400/50' : 'border-slate-200 dark:border-emerald-500/30 dark:hover:border-emerald-400/60'
              }`}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-transparent dark:from-emerald-500/35 dark:via-teal-500/25 dark:to-emerald-900/20 opacity-90 dark:opacity-100 pointer-events-none transition-opacity group-hover:opacity-100"></div>
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-300">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Proyectos Activos</span>
                <FolderKanban size={18} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {projects.filter(p => p.status === 'ACTIVE' || p.status === 'STABLE' || !p.status).length}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  En Ejecución
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-300 font-medium">Equipos de desarrollo asignados.</p>
            </div>
          </div>

          {/* Card 2: Entregados / Concluidos (Indigo Theme) */}
          <div
            onClick={() => setStatusTab('COMPLETED')}
            className={`group relative overflow-hidden bg-white dark:bg-[#191c3d] border p-4.5 rounded-2xl text-left cursor-pointer transition-all hover:scale-[1.01] shadow-sm dark:shadow-xl ${statusTab === 'COMPLETED' ? 'border-indigo-500 ring-2 ring-indigo-500/40 dark:ring-indigo-400/50' : 'border-slate-200 dark:border-indigo-500/30 dark:hover:border-indigo-400/60'
              }`}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-transparent dark:from-indigo-500/35 dark:via-purple-500/25 dark:to-indigo-900/20 opacity-90 dark:opacity-100 pointer-events-none transition-opacity group-hover:opacity-100"></div>
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-300">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">Entregados / Concluidos</span>
                <CheckCircle2 size={18} className="text-indigo-500 dark:text-indigo-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-300">
                  {projects.filter(p => p.status === 'COMPLETED' || p.status === 'DELIVERED').length}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-300 font-semibold">Finalizados</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-300 font-medium">Proyectos concluidos con éxito.</p>
            </div>
          </div>

          {/* Card 3: Desarrolladores (Cyan Theme) */}
          <div 
            onClick={() => setStatusTab('DEVELOPERS')}
            className={`group relative  bg-white dark:bg-[#191c3d] border p-4.5 rounded-2xl text-left shadow-sm cursor-pointer transition-all duration-300 ${isDevModalOpen ? 'overflow-visible z-[45] ring-2 ring-cyan-500 border-cyan-500 dark:border-cyan-400/60 dark:shadow-xl relative' : 'overflow-hidden border-slate-200 dark:border-cyan-500/30 hover:border-cyan-300 dark:hover:border-cyan-400/60 dark:shadow-xl relative z-10'}`}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-sky-500/15 to-transparent dark:from-cyan-500/35 dark:via-sky-500/25 dark:to-cyan-900/20 opacity-90 dark:opacity-100 pointer-events-none transition-opacity group-hover:opacity-100"></div>
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-300">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">Desarrolladores</span>
                <Users size={18} className="text-cyan-500 dark:text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {developers.length}
                </span>
              </div>
            </div>
              
          </div>

          {/* Card 4: Salud Operativa Promedio (Amber Theme) */}
          <div onClick={() => setStatusTab('BURNDOWN')} className={`group relative overflow-hidden bg-white dark:bg-[#191c3d] border p-4.5 rounded-2xl text-left cursor-pointer transition-all hover:scale-[1.01] shadow-sm dark:shadow-xl ${statusTab === 'BURNDOWN' ? 'border-amber-500 ring-2 ring-amber-500/40 dark:ring-amber-400/50' : 'border-slate-200 dark:border-amber-500/30 dark:hover:border-amber-400/60'}`}>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-transparent dark:from-amber-500/35 dark:via-orange-500/25 dark:to-amber-900/20 opacity-90 dark:opacity-100 pointer-events-none transition-opacity group-hover:opacity-100"></div>
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-300">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">Salud Operativa Promedio</span>
                <Zap size={18} className="text-amber-500 dark:text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-500 dark:text-amber-300">86.5%</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">Estable</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-300 font-medium">Estimación global de entregas.</p>
            </div>
          </div>
        </div>

      </div>



      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 px-1 sm:px-2 pt-1">
        
        {
        statusTab === 'BURNDOWN' ? (
          <div className="col-span-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm rounded-3xl overflow-hidden p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <span className="text-amber-600 dark:text-amber-400 font-bold text-xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Evolución de Entregas del Sprint (Burndown Chart)</h3>
                  <div className="relative group flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 hover:text-amber-500 cursor-help transition-colors"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-64 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[100] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] p-3.5 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-700">
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-slate-200 dark:border-b-slate-700"></div>
                      
                      <p className="leading-relaxed">
                        Mide si el equipo va a terminar sus tareas a tiempo antes de la fecha límite.
                      </p>
                      <p className="leading-relaxed mt-1.5 border-t border-slate-200 dark:border-slate-700 pt-1.5">
                        • Si la <span className="text-blue-500 font-bold">línea azul</span> está por encima de la <span className="text-emerald-500 font-bold">verde</span>: van <b>atrasados</b>.<br/>
                        • Si está por debajo: van <b>adelantados</b>.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Selector de Proyecto */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Proyecto:</span>
                  <select 
                    value={selectedBurndownProject || ''} 
                    onChange={(e) => setSelectedBurndownProject(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                  >
                    {dbProjects.map(p => (
                      <option key={p.id_proyecto} value={p.id_proyecto}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loadingBurndown ? (
                <div className="h-80 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-slate-500">Calculando historial diario...</span>
                </div>
              ) : (
                <SprintBurndownChart data={burndownData} />
              )}
            </div>
          </div>
        ) : statusTab === 'DEVELOPERS' ? (
          <div className="col-span-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm rounded-3xl overflow-hidden p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <Users size={20} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Matriz de Desarrolladores</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Panel: Asignados */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500"/> Desarrolladores Asignados ({assignedDevs.length})
                  </h4>
                  <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/60 h-[400px] overflow-y-auto space-y-3">
                    {assignedDevs.map(d => (
                        <div key={d.id_usuario} className="flex items-center justify-between bg-white dark:bg-[#151832] border border-slate-200 dark:border-[#33376b] rounded-xl p-3 shadow-sm transition-all hover:border-emerald-400/50">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{d.nombre || d.email}</span>
                            <div className="flex gap-2 flex-wrap justify-start sm:justify-end w-full sm:w-auto">
                                {d.proyectos_asignados.map(pid => {
                                    const p = dbProjects.find(x => x.id_proyecto === pid);
                                    return <span key={pid} className="text-[10px] bg-cyan-100/50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 px-2.5 py-1 rounded-md font-bold border border-cyan-200 dark:border-cyan-800/50">{p ? p.nombre : pid}</span>
                                })}
                            </div>
                        </div>
                    ))}
                    {assignedDevs.length === 0 && <p className="text-xs text-slate-500 text-center py-10">No hay desarrolladores asignados.</p>}
                  </div>
                </div>

                {/* Panel: No Asignados */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-500"/> Desarrolladores Libres ({unassignedDevs.length})
                  </h4>
                  <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/60 h-[400px] overflow-y-auto space-y-3">
                    {unassignedDevs.map(d => (
                        <div key={d.id_usuario} className="flex items-center justify-between bg-white dark:bg-[#151832] border border-slate-200 dark:border-[#33376b] rounded-xl p-3 shadow-sm transition-all hover:border-amber-400/50 group">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{d.nombre || d.email}</span>
                            
                            <div className="relative w-full sm:w-auto flex justify-end sm:block">
                              <button 
                                onClick={() => setAssignProjectId(prev => ({...prev, [d.id_usuario]: !prev[d.id_usuario]}))}
                                className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                              >
                                Asignar Proyecto
                              </button>
                              
                              {/* Popover para asignar proyecto */}
                              {assignProjectId[d.id_usuario] && (
                                <div className="absolute top-full right-0 mt-2 w-[220px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95">
                                  <div className="text-[10px] font-bold text-slate-500 uppercase px-2 mb-1">Seleccionar Proyecto</div>
                                  <div className="max-h-[150px] overflow-y-auto">
                                    {dbProjects.filter(p => (p.estado || '').toUpperCase() === 'ACTIVE' || (p.estado || '').toUpperCase() === 'ACTIVO').map(p => (
                                      <button 
                                        key={p.id_proyecto}
                                        onClick={() => {
                                          alert(`¡El desarrollador ${d.nombre || d.email} fue asignado visualmente al proyecto ${p.nombre}!`);
                                          setAssignProjectId(prev => ({...prev, [d.id_usuario]: false}));
                                        }}
                                        className="w-full text-left px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-md transition-colors truncate"
                                      >
                                        {p.nombre}
                                      </button>
                                    ))}
                                    {dbProjects.length === 0 && <div className="px-2 py-1 text-xs text-slate-500">No hay proyectos activos.</div>}
                                  </div>
                                </div>
                              )}
                            </div>
                        </div>
                    ))}
                    {unassignedDevs.length === 0 && <p className="text-xs text-slate-500 text-center py-10">Todos los desarrolladores estn asignados.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-8 sm:p-12 rounded-3xl text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
              <FolderKanban size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No se encontraron proyectos</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              {statusTab === 'COMPLETED'
                ? 'No hay proyectos marcados como entregados o finalizados en esta vista aún.'
                : statusTab === 'INACTIVE'
                  ? 'No hay proyectos desactivados.'
                  : 'No se encontraron proyectos activos con el filtro de búsqueda ingresado.'}
            </p>
          </div>
        ) : (
          filteredProjects.map((proj, idx) => {
            const isExpanded = expandedProjectId === proj.id;
            const isCompleted = proj.status === 'COMPLETED' || proj.status === 'DELIVERED';
            const isInactive = proj.status === 'INACTIVE';
            const isPurple = idx % 3 === 1;
            const isEmerald = idx % 3 === 2;

            const colorClasses = isCompleted
              ? {
                borderActive: 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/20',
                borderInactive: 'border-indigo-200 dark:border-[#33376b] hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl',
                iconBox: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 ring-indigo-500/20',
                subtitle: 'text-indigo-700 dark:text-indigo-300/80',
                button: 'bg-indigo-100 dark:bg-indigo-500/25 border-indigo-300 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-200 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/40'
              }
              : isPurple
                ? {
                  borderActive: 'border-purple-500 ring-2 ring-purple-500/40 bg-purple-50/50 dark:bg-purple-950/20 shadow-lg shadow-purple-500/20',
                  borderInactive: 'border-purple-200 dark:border-[#33376b] hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-purple-500/15',
                  iconBox: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 ring-purple-500/20',
                  subtitle: 'text-purple-700 dark:text-purple-300/80',
                  button: 'bg-purple-100 dark:bg-purple-500/25 border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-200 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/40'
                }
                : isEmerald
                  ? {
                    borderActive: 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-lg shadow-emerald-500/20',
                    borderInactive: 'border-emerald-200 dark:border-[#33376b] hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-emerald-500/15',
                    iconBox: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20',
                    subtitle: 'text-emerald-700 dark:text-emerald-300/80',
                    button: 'bg-emerald-100 dark:bg-emerald-500/25 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-200 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/40'
                  }
                  : {
                    borderActive: 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/20',
                    borderInactive: 'border-indigo-200 dark:border-[#33376b] hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-indigo-500/15',
                    iconBox: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 ring-indigo-500/20',
                    subtitle: 'text-indigo-700 dark:text-indigo-300/80',
                    button: 'bg-indigo-100 dark:bg-indigo-500/25 border-indigo-300 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-200 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/40'
                  };

            return (
              <div
                key={proj.id}
                onClick={() => toggleExpand(proj.id)}
                className={`group relative bg-white dark:bg-[#191c3d] backdrop-blur-xl border rounded-2xl p-5 sm:px-6 sm:py-5 shadow-sm dark:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 hover:scale-[1.01] cursor-pointer flex flex-col justify-between ${isExpanded ? colorClasses.borderActive : colorClasses.borderInactive
                  }`}
              >
                <div className="flex items-start justify-between gap-4 min-w-0">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner ring-1 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ${colorClasses.iconBox}`}>
                      <FolderKanban size={26} />
                    </div>

                    <div className="space-y-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${isCompleted
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40'
                            : isInactive
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                          }`}>
                          {isCompleted ? 'Entregado' : isInactive ? 'Desactivado' : 'Activo'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">{proj.key}</span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
                        {proj.name}
                      </h3>

                      <div className="flex items-center gap-1.5 pt-1">
                        {proj.leader && (
                          <div title={`Líder: ${proj.leader.name}`} className="w-5 h-5 rounded-full bg-purple-600 border border-white dark:border-slate-900 text-[9px] font-black text-white flex items-center justify-center shadow-md">
                            {proj.leader.avatar}
                          </div>
                        )}
                        {proj.developers?.map(dev => (
                          <div key={dev.id} title={`Dev: ${dev.name}`} className="w-5 h-5 rounded-full bg-blue-600 border border-white dark:border-slate-900 text-[9px] font-black text-white flex items-center justify-center shadow-md">
                            {dev.avatar}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center shrink-0" style={{ gap: 8 }}>
                    <div className="flex items-center gap-1">
                      {/* BOTÓN MARCAR COMO ENTREGADO / REABRIR (Habilitado para Líder Técnico y Admin) */}
                      <button
                        type="button"
                        title={isCompleted ? "Reabrir proyecto a Activo" : "Marcar proyecto como Entregado / Finalizado"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleDeliveredProject(proj);
                        }}
                        className={`w-8 h-8 rounded-xl inline-flex items-center justify-center transition-all cursor-pointer border ${isCompleted
                            ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/30'
                            : 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/30'
                          }`}
                      >
                        {isCompleted ? <RotateCcw size={14} /> : <CheckCircle2 size={14} />}
                      </button>

                      {/* BOTÓN DESACTIVAR (Restringido EXCLUSIVAMENTE al Administrador — Invisible para Líder Técnico) */}
                      {isAdmin && (
                        isInactive ? (
                          <button
                            type="button"
                            title="Reactivar proyecto"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReactivateProject(proj);
                            }}
                            className="w-8 h-8 rounded-xl inline-flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 transition-colors cursor-pointer"
                          >
                            <RotateCcw size={14} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            title="Desactivar proyecto (Solo Admin)"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeactivateModal(proj);
                            }}
                            className="w-8 h-8 rounded-xl inline-flex items-center justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 transition-colors cursor-pointer"
                          >
                            <PowerOff size={14} />
                          </button>
                        )
                      )}


                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(proj.id);
                      }}
                      className={`px-3 py-2 rounded-xl border text-xs font-black flex items-center justify-center shadow-xs group-hover:scale-105 transition-all duration-300 cursor-pointer ${colorClasses.button}`}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                
              </div>
            );
          })
        )}
      </div>

      {statusTab !== 'DEVELOPERS' && activeProject && activeMetrics && (
        <ProjectMetrics 
          activeProject={activeProject} 
          activeMetrics={activeMetrics} 
          activeProjectTab={activeProjectTab} 
          setActiveProjectTab={setActiveProjectTab} 
          burndownData={burndownData}
          loadingPercentiles={loadingPercentiles}
          percentilesWindow={percentilesWindow}
          setPercentilesWindow={setPercentilesWindow}
          percentilesData={percentilesData}
        />
      )}
    </div>
  );
}

