// ============================================================================
// FEATURE PROJECTS — DASHBOARD DE PROYECTOS Y EQUIPOS ASIGNADOS
// ============================================================================
// Muestra tarjetas interactivas de proyectos con flecha desplegable para consultar
// Líder Técnico, Desarrolladores asignados y Resumen Ejecutivo de Gráficas a todo lo ancho en la parte inferior.

import React, { useMemo, useState } from 'react';
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
  AlertTriangle,
  RotateCcw,
  Check,
  TrendingUp,
  Bug,
  Activity,
  Search,
  Info,
  Save,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { projectService } from '../../../services/api';
import PercentilesChart from '../../dashboard/components/PercentilesChart';

// Líderes Técnicos disponibles para asignación
const AVAILABLE_LEADERS = [
  {
    id: 'usr-2',
    name: 'Andrés Felipe Torres',
    email: 'andres.torres@mchav.com',
    avatar: 'A',
    role: 'Líder Técnico',
    experience: 'Senior Tech Lead'
  },
  {
    id: 'usr-1',
    name: 'Mauricio Salamanca',
    email: 'mauricio.salamanca@mchav.com',
    avatar: 'M',
    role: 'Administrador / Lead System',
    experience: 'Architect'
  },
  {
    id: 'usr-6',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@mchav.com',
    avatar: 'C',
    role: 'Líder Técnico Mobile',
    experience: 'Tech Lead Cloud'
  }
];

// Desarrolladores disponibles para asignación
const AVAILABLE_DEVELOPERS = [
  { id: 'usr-3', name: 'Clara Gómez', email: 'clara.gomez@mchav.com', avatar: 'C', tasksCount: 5, status: 'Active' },
  { id: 'usr-4', name: 'Diana Patarroyo', email: 'diana.patarroyo@mchav.com', avatar: 'D', tasksCount: 4, status: 'Active' },
  { id: 'usr-5', name: 'Eduardo Martínez', email: 'eduardo.m@mchav.com', avatar: 'E', tasksCount: 3, status: 'Active' },
  { id: 'usr-7', name: 'Fernando Ruiz', email: 'fernando.ruiz@mchav.com', avatar: 'F', tasksCount: 4, status: 'Active' },
  { id: 'usr-8', name: 'Gabriela López', email: 'gabriela.lopez@mchav.com', avatar: 'G', tasksCount: 2, status: 'Active' }
];

// Datos Mock de Métricas y Gráficos por Proyecto
const MOCK_PROJECT_METRICS = {
  'proj-1': {
    velocity: [
      { sprint: 'SP 11', sp: 32 },
      { sprint: 'SP 12', sp: 38 },
      { sprint: 'SP 13', sp: 50 },
      { sprint: 'SP 14', sp: 46 }
    ],
    burndown: [
      { day: 'D1', real: 46, ideal: 46 },
      { day: 'D3', real: 38, ideal: 37 },
      { day: 'D5', real: 28, ideal: 27 },
      { day: 'D7', real: 16, ideal: 18 },
      { day: 'D9', real: 6, ideal: 9 },
      { day: 'D10', real: 0, ideal: 0 }
    ],
    distribution: [
      { name: 'Historias de Usuario', value: 14, percentage: 70, color: '#8b5cf6' },
      { name: 'Bugs y Defectos', value: 4, percentage: 20, color: '#ec4899' },
      { name: 'Deuda Técnica', value: 2, percentage: 10, color: '#06b6d4' }
    ],
    kpis: { velocitySp: 46, deliveryHealth: '88%', cycleTimeDays: '2.4d', criticalBugs: 1 }
  },
  'proj-2': {
    velocity: [
      { sprint: 'SP 5', sp: 25 },
      { sprint: 'SP 6', sp: 30 },
      { sprint: 'SP 7', sp: 36 },
      { sprint: 'SP 8', sp: 40 }
    ],
    burndown: [
      { day: 'D1', real: 40, ideal: 40 },
      { day: 'D3', real: 35, ideal: 32 },
      { day: 'D5', real: 26, ideal: 24 },
      { day: 'D7', real: 18, ideal: 16 },
      { day: 'D9', real: 8, ideal: 8 },
      { day: 'D10', real: 2, ideal: 0 }
    ],
    distribution: [
      { name: 'Historias de Usuario', value: 10, percentage: 62, color: '#8b5cf6' },
      { name: 'Bugs y Defectos', value: 4, percentage: 25, color: '#ec4899' },
      { name: 'Deuda Técnica', value: 2, percentage: 13, color: '#06b6d4' }
    ],
    kpis: { velocitySp: 40, deliveryHealth: '75%', cycleTimeDays: '3.1d', criticalBugs: 2 }
  },
  'proj-3': {
    velocity: [
      { sprint: 'SP 1', sp: 20 },
      { sprint: 'SP 2', sp: 28 },
      { sprint: 'SP 3', sp: 34 },
      { sprint: 'SP 4', sp: 42 }
    ],
    burndown: [
      { day: 'D1', real: 42, ideal: 42 },
      { day: 'D3', real: 30, ideal: 33 },
      { day: 'D5', real: 20, ideal: 25 },
      { day: 'D7', real: 10, ideal: 16 },
      { day: 'D9', real: 2, ideal: 8 },
      { day: 'D10', real: 0, ideal: 0 }
    ],
    distribution: [
      { name: 'Historias de Usuario', value: 16, percentage: 80, color: '#8b5cf6' },
      { name: 'Bugs y Defectos', value: 2, percentage: 10, color: '#ec4899' },
      { name: 'Deuda Técnica', value: 2, percentage: 10, color: '#06b6d4' }
    ],
    kpis: { velocitySp: 42, deliveryHealth: '92%', cycleTimeDays: '1.8d', criticalBugs: 0 }
  }
};

const getProjectMetrics = (projId) => MOCK_PROJECT_METRICS[projId] || {
  velocity: [{ sprint: 'SP 1', sp: 24 }, { sprint: 'SP 2', sp: 30 }, { sprint: 'SP 3', sp: 38 }, { sprint: 'SP 4', sp: 44 }],
  burndown: [{ day: 'D1', real: 44, ideal: 44 }, { day: 'D3', real: 36, ideal: 35 }, { day: 'D5', real: 25, ideal: 26 }, { day: 'D7', real: 14, ideal: 17 }, { day: 'D10', real: 0, ideal: 0 }],
  distribution: [{ name: 'Historias de Usuario', value: 12, percentage: 75, color: '#8b5cf6' }, { name: 'Bugs y Defectos', value: 3, percentage: 18, color: '#ec4899' }, { name: 'Deuda Técnica', value: 1, percentage: 7, color: '#06b6d4' }],
  kpis: { velocitySp: 44, deliveryHealth: '85%', cycleTimeDays: '2.1d', criticalBugs: 0 }
};

const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    key: 'MCHAV-01',
    name: 'Sistema Analytics MCHAV',
    description: 'Plataforma de métricas ejecutivas, rendimiento de equipo y gobernanza RBAC.',
    status: 'ACTIVE',
    statusLabel: 'Sprint 14 Activo',
    progress: 88,
    category: 'Backend & Frontend',
    leader: AVAILABLE_LEADERS[0],
    developers: [AVAILABLE_DEVELOPERS[0], AVAILABLE_DEVELOPERS[1], AVAILABLE_DEVELOPERS[2]]
  },
  {
    id: 'proj-2',
    key: 'RBAC-02',
    name: 'Portal de Clientes & Seguridad RBAC',
    description: 'Módulo de autenticación segura, control de matriz de permisos y auditoría.',
    status: 'ACTIVE',
    statusLabel: 'Sprint 8 en Proceso',
    progress: 75,
    category: 'Seguridad & Permisos',
    leader: AVAILABLE_LEADERS[0],
    developers: [AVAILABLE_DEVELOPERS[0], AVAILABLE_DEVELOPERS[1]]
  },
  {
    id: 'proj-3',
    key: 'ETL-03',
    name: 'API Gateway & Sincronización Jira ETL',
    description: 'Motor de extracción y carga de tareas Jira con webhooks en tiempo real.',
    status: 'STABLE',
    statusLabel: 'Optimización y Mantenimiento',
    progress: 92,
    category: 'Integración & Datos',
    leader: AVAILABLE_LEADERS[1],
    developers: [AVAILABLE_DEVELOPERS[2]]
  }
];

function isAdminRole(rol) {
  if (!rol) return true;
  const r = String(rol).toLowerCase();
  return r === 'admin' || r === 'administrador' || r.includes('admin');
}

export default function ProyectosDashboardView({ userProfile = null }) {
  const isAdmin = isAdminRole(userProfile?.rol);

  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cargar proyectos reales del backend para que tengan el ID correcto al consultar percentiles
  React.useEffect(() => {
    projectService.getProjects()
      .then(realProjects => {
        if (realProjects && realProjects.length > 0) {
          const mappedProjects = realProjects.map((rp, i) => {
            const baseMock = INITIAL_PROJECTS[i % INITIAL_PROJECTS.length];
            return {
              ...baseMock,
              id: rp.key_proyecto, // Usamos la key real (Ej. MCHAV) para que el backend la encuentre
              key: rp.key_proyecto,
              name: rp.nombre
            };
          });
          setProjects(mappedProjects);
        }
      })
      .catch(err => console.error("Error al cargar proyectos reales:", err));
  }, []);
  
  // Estados para HU-014 Análisis de Tiempos
  const [activeProjectTab, setActiveProjectTab] = useState('RESUMEN');
  const [percentilesData, setPercentilesData] = useState(null);
  const [loadingPercentiles, setLoadingPercentiles] = useState(false);

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
      projectService.getPercentiles(projectId)
        .then(data => setPercentilesData(data))
        .catch(err => console.error("Error al cargar percentiles", err))
        .finally(() => setLoadingPercentiles(false));
    }
  };

  const resetAssignFormUi = () => {
    setLeaderOpen(false);
    setDevsOpen(false);
    setLeaderSearch('');
    setDevSearch('');
    setAssignmentReady(false);
  };

  const handleOpenCreateModal = () => {
    setEditingProjectId(null);
    setFormName('');
    setFormKey('');
    setFormLeaderId('');
    setFormDevIds([]);
    resetAssignFormUi();
    setShowAssignModal(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProjectId(project.id);
    setFormName(project.name);
    setFormKey(project.key);
    setFormLeaderId(project.leader?.id || AVAILABLE_LEADERS[0].id);
    setFormDevIds(project.developers?.map(d => d.id) || []);
    resetAssignFormUi();
    setShowAssignModal(true);
  };

  const handleToggleDeveloper = (devId) => {
    setFormDevIds(prev => (prev.includes(devId) ? prev.filter(id => id !== devId) : [...prev, devId]));
    setAssignmentReady(false);
  };

  const selectedLeader = useMemo(
    () => AVAILABLE_LEADERS.find(l => l.id === formLeaderId) || null,
    [formLeaderId]
  );

  const selectedDevs = useMemo(
    () => AVAILABLE_DEVELOPERS.filter(d => formDevIds.includes(d.id)),
    [formDevIds]
  );

  const filteredLeaders = useMemo(() => {
    const q = leaderSearch.trim().toLowerCase();
    if (!q) return AVAILABLE_LEADERS;
    return AVAILABLE_LEADERS.filter(
      l => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.role.toLowerCase().includes(q)
    );
  }, [leaderSearch]);

  const filteredDevelopers = useMemo(() => {
    const q = devSearch.trim().toLowerCase();
    if (!q) return AVAILABLE_DEVELOPERS;
    return AVAILABLE_DEVELOPERS.filter(
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
      setProjects(prev => prev.map(p => (p.id === editingProjectId
        ? { ...p, name: formName.trim(), key: formKey.trim().toUpperCase(), leader: selectedLeader, developers: selectedDevs }
        : p)));
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
      setProjects(prev => [newProject, ...prev]);
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

  const [statusTab, setStatusTab] = useState('ACTIVE'); // 'ACTIVE' | 'INACTIVE' | 'ALL'
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

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.key.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (statusTab === 'ACTIVE') return p.status !== 'INACTIVE';
    if (statusTab === 'INACTIVE') return p.status === 'INACTIVE';
    return true; // 'ALL'
  });

  const activeProject = filteredProjects.find(p => p.id === expandedProjectId);
  const activeMetrics = activeProject ? getProjectMetrics(activeProject.id) : null;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-start gap-6 sm:gap-8 px-4 sm:px-8 pt-6 pb-12 text-left animate-in fade-in duration-300 no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                        <input
                          type="text"
                          required
                          placeholder="Ej. MCHAV"
                          value={formKey}
                          onChange={e => { setFormKey(e.target.value); setAssignmentReady(false); }}
                          className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold uppercase text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </section>
                </div>

                {/* Contenedor: Líder técnico */}
                <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50" style={{ padding: '1.15rem 1.25rem' }}>
                  <div className="flex items-center justify-between gap-2" style={{ marginBottom: 14 }}>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={15} className="text-violet-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">Líder técnico responsable</h4>
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
                      {formLeaderId && selectedLeader ? selectedLeader.name : 'Seleccionar líder técnico'}
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
                          placeholder="Buscar líder..."
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
                      {formDevIds.length} de {AVAILABLE_DEVELOPERS.length}
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
                  <p className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-300 mb-2">Líder técnico</p>
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
            {/* Ícono de Bote de Basura dentro de Círculo Violeta */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-purple-50 dark:bg-[#1d1738] border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30 shrink-0">
              <Trash2 size={28} className="text-purple-600 dark:text-purple-400" />
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
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-50">Confirmar líder técnico</h3>
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

      <section className="bg-white dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 sm:px-7 sm:py-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Botón Asignar + Buscador al lado (Izquierda) */}
          <div className="flex flex-wrap items-center gap-3">
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

            {/* Barra de Búsqueda Dinámica y Expansible Adaptada a Modo Claro y Modo Oscuro (por jubayer-10) */}
            <div
              className={`h-[38px] p-2 overflow-hidden transition-all duration-300 rounded-full flex group items-center shadow-md border 
              bg-white border-slate-200 hover:border-indigo-400 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 
              dark:bg-gradient-to-r dark:from-[#0b132b] dark:via-[#0f233a] dark:to-[#0a2e38] dark:border-[#38bdf8]/35 dark:hover:border-[#38bdf8]/60 dark:focus-within:border-[#38bdf8] dark:focus-within:ring-[#38bdf8]/25 ${
                searchTerm ? 'w-64 sm:w-72 border-indigo-400 dark:border-[#38bdf8]/55' : 'w-[38px] hover:w-64 sm:hover:w-72 focus-within:w-64 sm:focus-within:w-72'
              }`}
            >
              <div className="flex items-center justify-center shrink-0 w-6 h-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  id="Isolation_Mode"
                  data-name="Isolation Mode"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  className="fill-slate-500 group-hover:fill-indigo-600 dark:fill-[#38bdf8] dark:group-hover:fill-[#38bdf8] transition-all duration-300 group-hover:scale-110"
                >
                  <path
                    d="M18.9,16.776A10.539,10.539,0,1,0,16.776,18.9l5.1,5.1L24,21.88ZM10.5,18A7.5,7.5,0,1,1,18,10.5,7.507,7.507,0,0,1,10.5,18Z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar proyecto..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="outline-none text-xs bg-transparent w-full text-slate-800 placeholder-slate-400 dark:text-[#38bdf8] dark:placeholder-[#38bdf8]/55 font-bold px-2.5"
              />
            </div>
          </div>

          {/* Pestañas de Filtro en Contenedores Separados e Independientes */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusTab('ACTIVE')}
              className={`h-[36px] px-3.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${statusTab === 'ACTIVE'
                  ? 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Activos ({projects.filter(p => p.status !== 'INACTIVE').length})
            </button>

            <button
              type="button"
              onClick={() => setStatusTab('INACTIVE')}
              className={`h-[36px] px-3.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${statusTab === 'INACTIVE'
                  ? 'bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Desactivados ({projects.filter(p => p.status === 'INACTIVE').length})
            </button>

            <button
              type="button"
              onClick={() => setStatusTab('ALL')}
              className={`h-[36px] px-3.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${statusTab === 'ALL'
                  ? 'bg-purple-50 dark:bg-purple-500/15 border-purple-200 dark:border-purple-500/40 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              Todos ({projects.length})
            </button>
          </div>
        </div>
      </section>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 px-1 sm:px-2 pt-1">
        {filteredProjects.map((proj, idx) => {
          const isExpanded = expandedProjectId === proj.id;
          const isPurple = idx % 3 === 1;
          const isEmerald = idx % 3 === 2;

          const colorClasses = isPurple
            ? {
              borderActive: 'border-purple-500 ring-2 ring-purple-500/40 bg-purple-50/50 dark:bg-purple-950/20 shadow-lg shadow-purple-500/20',
              borderInactive: 'border-purple-200 dark:border-purple-500/30 hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-purple-500/15',
              iconBox: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 ring-purple-500/20',
              subtitle: 'text-purple-700 dark:text-purple-300/80',
              button: 'bg-purple-100 dark:bg-purple-500/25 border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-200 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/40'
            }
            : isEmerald
              ? {
                borderActive: 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-lg shadow-emerald-500/20',
                borderInactive: 'border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-emerald-500/15',
                iconBox: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20',
                subtitle: 'text-emerald-700 dark:text-emerald-300/80',
                button: 'bg-emerald-100 dark:bg-emerald-500/25 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-200 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/40'
              }
              : {
                borderActive: 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/20',
                borderInactive: 'border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-indigo-500/15',
                iconBox: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 ring-indigo-500/20',
                subtitle: 'text-indigo-700 dark:text-indigo-300/80',
                button: 'bg-indigo-100 dark:bg-indigo-500/25 border-indigo-300 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-200 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/40'
              };

          return (
            <div
              key={proj.id}
              onClick={() => toggleExpand(proj.id)}
              className={`group relative bg-white dark:bg-slate-900/50 backdrop-blur-xl border rounded-2xl p-5 sm:px-6 sm:py-5 shadow-sm dark:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 hover:scale-[1.02] cursor-pointer flex flex-col justify-between ${isExpanded ? colorClasses.borderActive : colorClasses.borderInactive
                }`}
            >
              <div className="flex items-center justify-between gap-4 min-w-0">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner ring-1 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 ${colorClasses.iconBox}`}>
                    <FolderKanban size={36} />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
                      {proj.name}
                    </h3>
                    <p className={`text-xs font-semibold ${colorClasses.subtitle}`}>
                      {proj.key} • {proj.statusLabel}
                    </p>

                    <div className="flex items-center gap-1 pt-1">
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

                <div className="flex flex-col items-center shrink-0" style={{ gap: 12 }}>
                  {isAdmin ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Editar asignación"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(proj);
                        }}
                        className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors cursor-pointer"
                      >
                        <Edit3 size={14} />
                      </button>
                      {proj.status === 'INACTIVE' ? (
                        <button
                          type="button"
                          title="Reactivar proyecto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReactivateProject(proj);
                          }}
                          className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-colors cursor-pointer"
                        >
                          <RotateCcw size={14} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          title="Desactivar proyecto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeactivateModal(proj);
                          }}
                          className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      title="Confirmar líder"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenConfirmModal(proj);
                      }}
                      className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors cursor-pointer"
                    >
                      <ShieldCheck size={14} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(proj.id);
                    }}
                    className={`px-3 py-3 rounded-2xl border text-sm font-black flex items-center justify-center shadow-sm group-hover:scale-110 transition-all duration-300 cursor-pointer ${colorClasses.button}`}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80 animate-in slide-in-from-top-2 duration-200 text-left">
                  {/* Columna Izquierda: Líder Técnico */}
                  <div className="rounded-2xl bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 flex flex-col justify-between">
                    <span className="block text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-2.5">
                      Líder Técnico
                    </span>

                    {proj.leader ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                          {proj.leader.avatar}
                        </div>
                        <div className="min-w-0 flex flex-col gap-0.5">
                          <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                            {proj.leader.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {proj.leader.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-400">Sin Líder Asignado</p>
                    )}
                  </div>

                  {/* Columna Derecha: Desarrolladores */}
                  <div className="rounded-2xl bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 flex flex-col justify-between space-y-2">
                    <span className="block text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                      Desarrolladores ({proj.developers?.length || 0})
                    </span>

                    <div className="space-y-1.5 max-h-[95px] overflow-y-auto no-scrollbar pr-0.5">
                      {proj.developers?.map(dev => (
                        <div key={dev.id} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                              {dev.avatar}
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{dev.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">{dev.tasksCount || 3} tareas</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeProject && activeMetrics && (
        <section className="relative flex flex-col gap-5 animate-in slide-in-from-bottom-4 mt-2">
          <div className="bg-white dark:bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Activity size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-100 dark:bg-indigo-500/20 px-2.5 py-0.5 rounded-md">
                  {activeProject.key} • {activeProject.category || 'Backend'}
                </span>
                <h3 className="text-base sm:text-lg font-black mt-1 text-slate-900 dark:text-slate-50">
                  Panel de Rendimiento — {activeProject.name}
                </h3>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Pestañas internas del proyecto */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveProjectTab('RESUMEN')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeProjectTab === 'RESUMEN' 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  Resumen General
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProjectTab('TIEMPOS')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeProjectTab === 'TIEMPOS' 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  Análisis de Tiempos
                </button>
              </div>
              
              <button type="button" onClick={() => setExpandedProjectId(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700">
                <X size={15} /> Ocultar
              </button>
            </div>
          </div>

          {activeProjectTab === 'RESUMEN' ? (
            <>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <Zap size={20} className="text-amber-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Velocidad SP</span>
                <p className="text-lg font-black text-slate-900 dark:text-slate-50">{activeMetrics.kpis.velocitySp} SP / sprint</p>
              </div>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <TrendingUp size={20} className="text-emerald-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Salud Entregas</span>
                <p className="text-lg font-black text-slate-900 dark:text-slate-50">{activeMetrics.kpis.deliveryHealth}</p>
              </div>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <Clock size={20} className="text-cyan-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Tiempo Ciclo</span>
                <p className="text-lg font-black text-slate-900 dark:text-slate-50">{activeMetrics.kpis.cycleTimeDays}</p>
              </div>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <Bug size={20} className="text-rose-500 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Bugs Críticos</span>
                <p className="text-lg font-black text-rose-500">{activeMetrics.kpis.criticalBugs} Activos</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="flex flex-col gap-5">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <span className="text-xs font-black uppercase text-indigo-500">Velocidad por Sprint (Story Points)</span>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeMetrics.velocity}>
                      <XAxis dataKey="sprint" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} axisLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                      <Bar dataKey="sp" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <span className="text-xs font-black uppercase text-cyan-500">Burndown del Sprint (Esfuerzo Restante)</span>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeMetrics.burndown}>
                      <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} axisLine={false} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                      <Line type="monotone" dataKey="real" stroke="#06b6d4" strokeWidth={3} />
                      <Line type="monotone" dataKey="ideal" stroke="#64748b" strokeDasharray="4 4" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-black uppercase text-purple-500 mb-4 block">Distribución de Tipos de Trabajo</span>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 h-full">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={activeMetrics.distribution} innerRadius={48} outerRadius={75} paddingAngle={5} dataKey="value">
                        {activeMetrics.distribution.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 w-full sm:w-auto">
                  {activeMetrics.distribution.map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-6">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </>
          ) : (
            /* Pestaña de Análisis de Tiempos (Percentiles) HU-014 */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
              {loadingPercentiles ? (
                <div className="col-span-full py-12 text-center text-sm font-bold text-slate-500 animate-pulse">
                  Calculando percentiles y agregando datos de los últimos 15 días...
                </div>
              ) : percentilesData && percentilesData.length > 0 ? (
                percentilesData.map((data, idx) => {
                  const colors = ['indigo', 'emerald', 'rose', 'sky', 'amber'];
                  return (
                    <div key={data.issue_type} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <PercentilesChart 
                        title={`Análisis de ${data.issue_type}`} 
                        data={data} 
                        colorTheme={colors[idx % colors.length]} 
                      />
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-sm font-bold text-slate-500">
                  No se encontraron datos de tareas resueltas en este proyecto en los últimos 15 días.
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

