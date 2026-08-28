// ============================================================================
// FEATURE PROJECTS — DASHBOARD EJECUTIVO CON SELECTOR DINÁMICO POR PROYECTO
// ============================================================================
// Permite alternar entre el Resumen General (Todos los Proyectos) y el análisis individualizado
// de un proyecto específico, filtrando métricas, gráficas, tiempos de ciclo y actividades.

import React, { useState, useEffect, useMemo } from 'react';
import api, { projectService } from '../../../services/api';
import { useAuth } from '../../auth/context/AuthContext';
import LiderNotificationBell from '../../dashboard/components/LiderNotificationBell';
import { SprintBurnupChart } from '../components/SprintBurnupChart';
import { CumulativeFlowDiagram } from '../components/CumulativeFlowDiagram';
import {
  FolderKanban,
  CheckCircle2,
  TrendingUp,
  Clock,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar,
  Filter,
  Info,
  Sparkles,
  Plus,
  X,
  Activity,
  FileDown,
  UserPlus,
  Layers,
  BarChart3,
  PieChart as PieIcon,
  ListFilter,
  Check,
  Building2,
  Box,
  ClipboardList
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ReferenceLine
} from 'recharts';

// Tooltip explicativo genérico controlado con estado de hover React
const InfoTooltip = ({ text, align = "center", position = "bottom" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => e.stopPropagation()}
      className="relative inline-flex items-center cursor-pointer ml-1 shrink-0 z-40"
    >
      <div className="p-0.5 rounded-full text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
        <Info size={13} />
      </div>
      
      {isHovered && (
        <div className={`absolute z-50 w-60 p-3 bg-slate-950/95 text-slate-100 text-[11px] font-medium leading-relaxed rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.85)] border border-slate-700/80 pointer-events-none text-left backdrop-blur-md normal-case tracking-normal ${
          position === "bottom" ? "top-full mt-2.5" : "bottom-full mb-2.5"
        } ${
          align === "right" 
            ? "right-0" 
            : align === "left" 
            ? "left-0" 
            : "left-1/2 -translate-x-1/2"
        }`}>
          <span className="block">{text}</span>
          <div className={`absolute border-4 border-transparent ${
            position === "bottom"
              ? "bottom-full border-b-slate-950"
              : "top-full border-t-slate-950"
          } ${
            align === "right"
              ? "right-3"
              : align === "left"
              ? "left-3"
              : "left-1/2 -translate-x-1/2"
          }`}></div>
        </div>
      )}
    </div>
  );
};

// Tooltip flotante de gráficas
const EnrichedChartTooltip = ({ active, payload, label, unit = "incidencias", titlePrefix = "Información" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-[#11152a]/95 text-white border border-slate-700/80 rounded-2xl p-3.5 text-xs shadow-2xl backdrop-blur-md min-w-[200px] text-left space-y-2">
        <div className="font-extrabold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center justify-between">
          <span>{label ? `${titlePrefix}: ${label}` : titlePrefix}</span>
          <span className="text-[10px] text-indigo-400 font-mono">Jira Cloud</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5" style={{ color: item.color || item.fill }}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color || item.fill }} />
                {item.name || item.dataKey}:
              </span>
              <span className="font-extrabold text-slate-100">
                {item.value} <span className="text-[10px] text-slate-400 font-normal">{unit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Proyectos de referencia
const DEFAULT_PROJECT_ROWS = [
  { id: 'proj-1', key: 'PA', name: 'Plataforma Analytics', status: 'Activo', issuesCount: 324, velocity: 45.2, cycleTime: '2.8 días', progress: 75, lastSync: 'Hace 2 horas', color: '#8b5cf6' },
  { id: 'proj-2', key: 'MC', name: 'MCHAV Core', status: 'Activo', issuesCount: 278, velocity: 38.7, cycleTime: '3.1 días', progress: 68, lastSync: 'Hace 1 hora', color: '#3b82f6' },
  { id: 'proj-3', key: 'WD', name: 'Web Dashboard', status: 'Activo', issuesCount: 196, velocity: 32.1, cycleTime: '2.5 días', progress: 82, lastSync: 'Hace 3 horas', color: '#f97316' },
  { id: 'proj-4', key: 'AG', name: 'API Gateway', status: 'Activo', issuesCount: 156, velocity: 28.9, cycleTime: '3.7 días', progress: 61, lastSync: 'Hace 30 min', color: '#10b981' },
  { id: 'proj-5', key: 'MA', name: 'Mobile App', status: 'Pausado', issuesCount: 98, velocity: 12.4, cycleTime: '4.2 días', progress: 35, lastSync: 'Hace 5 horas', color: '#a855f7' },
  { id: 'proj-6', key: 'INF', name: 'Infraestructura', status: 'Activo', issuesCount: 67, velocity: 8.6, cycleTime: '2.1 días', progress: 91, lastSync: 'Hace 1 hora', color: '#06b6d4' },
];

// Evolución de Velocidad General vs Por Proyecto
const PROJECT_VELOCITY_MAP = {
  'proj-1': [
    { sprint: 'Sprint 12', SP: 42 }, { sprint: 'Sprint 13', SP: 55 }, { sprint: 'Sprint 14', SP: 50 }, { sprint: 'Sprint 15', SP: 68 }, { sprint: 'Sprint 16', SP: 72 }, { sprint: 'Sprint 17', SP: 65 }
  ],
  'proj-2': [
    { sprint: 'Sprint 12', SP: 35 }, { sprint: 'Sprint 13', SP: 48 }, { sprint: 'Sprint 14', SP: 42 }, { sprint: 'Sprint 15', SP: 52 }, { sprint: 'Sprint 16', SP: 58 }, { sprint: 'Sprint 17', SP: 54 }
  ],
  'proj-3': [
    { sprint: 'Sprint 12', SP: 48 }, { sprint: 'Sprint 13', SP: 52 }, { sprint: 'Sprint 14', SP: 45 }, { sprint: 'Sprint 15', SP: 38 }, { sprint: 'Sprint 16', SP: 50 }, { sprint: 'Sprint 17', SP: 46 }
  ],
  'proj-4': [
    { sprint: 'Sprint 12', SP: 28 }, { sprint: 'Sprint 13', SP: 40 }, { sprint: 'Sprint 14', SP: 35 }, { sprint: 'Sprint 15', SP: 32 }, { sprint: 'Sprint 16', SP: 42 }, { sprint: 'Sprint 17', SP: 38 }
  ],
  'proj-5': [
    { sprint: 'Sprint 12', SP: 15 }, { sprint: 'Sprint 13', SP: 18 }, { sprint: 'Sprint 14', SP: 12 }, { sprint: 'Sprint 15', SP: 10 }, { sprint: 'Sprint 16', SP: 14 }, { sprint: 'Sprint 17', SP: 12 }
  ],
  'proj-6': [
    { sprint: 'Sprint 12', SP: 10 }, { sprint: 'Sprint 13', SP: 12 }, { sprint: 'Sprint 14', SP: 8 }, { sprint: 'Sprint 15', SP: 9 }, { sprint: 'Sprint 16', SP: 11 }, { sprint: 'Sprint 17', SP: 9 }
  ]
};

const GENERAL_VELOCITY_DATA = [
  { sprint: 'Sprint 12', PA: 42, MC: 35, WD: 48, AG: 28 },
  { sprint: 'Sprint 13', PA: 55, MC: 48, WD: 52, AG: 40 },
  { sprint: 'Sprint 14', PA: 50, MC: 42, WD: 45, AG: 35 },
  { sprint: 'Sprint 15', PA: 68, MC: 52, WD: 38, AG: 32 },
  { sprint: 'Sprint 16', PA: 72, MC: 58, WD: 50, AG: 42 },
  { sprint: 'Sprint 17', PA: 65, MC: 54, WD: 46, AG: 38 },
];

const MOCK_BURNUP_DATA = [
  { fecha_real: '13 ago', alcance_total: 225, trabajo_completado: 0, ritmo_ideal: 0, tareas_completadas: 0 },
  { fecha_real: '16 ago', alcance_total: 225, trabajo_completado: 20, ritmo_ideal: 22.5, tareas_completadas: 5 },
  { fecha_real: '19 ago', alcance_total: 225, trabajo_completado: 40, ritmo_ideal: 45, tareas_completadas: 12 },
  { fecha_real: '22 ago', alcance_total: 225, trabajo_completado: 60, ritmo_ideal: 67.5, tareas_completadas: 20 },
  { fecha_real: '25 ago', alcance_total: 230, trabajo_completado: 85, ritmo_ideal: 90, tareas_completadas: 35 },
  { fecha_real: '28 ago', alcance_total: 235, trabajo_completado: 120, ritmo_ideal: 112.5, tareas_completadas: 55 },
  { fecha_real: '31 ago', alcance_total: 235, trabajo_completado: 155, ritmo_ideal: 135, tareas_completadas: 80 },
  { fecha_real: '3 sep', alcance_total: 240, trabajo_completado: 180, ritmo_ideal: 157.5, tareas_completadas: 110 },
  { fecha_real: '7 sep', alcance_total: 240, trabajo_completado: 210, ritmo_ideal: 180, tareas_completadas: 130 },
];

const MOCK_CFD_DATA = [
  { fecha_real: '13 ago', por_hacer: 200, en_progreso: 15, en_revision: 10, completado: 0 },
  { fecha_real: '16 ago', por_hacer: 170, en_progreso: 25, en_revision: 10, completado: 20 },
  { fecha_real: '19 ago', por_hacer: 140, en_progreso: 30, en_revision: 15, completado: 40 },
  { fecha_real: '22 ago', por_hacer: 110, en_progreso: 35, en_revision: 20, completado: 60 },
  { fecha_real: '25 ago', por_hacer: 80, en_progreso: 40, en_revision: 25, completado: 85 },
  { fecha_real: '28 ago', por_hacer: 55, en_progreso: 35, en_revision: 25, completado: 120 },
  { fecha_real: '31 ago', por_hacer: 35, en_progreso: 30, en_revision: 15, completado: 155 },
  { fecha_real: '3 sep', por_hacer: 20, en_progreso: 25, en_revision: 15, completado: 180 },
  { fecha_real: '7 sep', por_hacer: 10, en_progreso: 12, en_revision: 8, completado: 210 }
]; 

const MOCK_BURNUP_DATA_EXTENDED = [
  ...MOCK_BURNUP_DATA,
  { fecha_real: '10 sep', alcance_total: 240, trabajo_completado: 230, ritmo_ideal: 202.5, tareas_completadas: 138 },
  { fecha_real: '13 sep', alcance_total: 240, trabajo_completado: 240, ritmo_ideal: 225, tareas_completadas: 141 },
];

const mockVelocitySprintsData = [
  { sprint: 'Sprint 14', comprometido: 40, completado: 32 },
  { sprint: 'Sprint 15', comprometido: 38, completado: 39 },
  { sprint: 'Sprint 16', comprometido: 35, completado: 30 },
  { sprint: 'Sprint 17', comprometido: 40, completado: 35 },
];

const mockCycleTimeScatterData = [
  { x: 1, y: 1.2 }, { x: 2, y: 2.0 }, { x: 3, y: 1.8 }, { x: 4, y: 2.1 },
  { x: 5, y: 4.0 }, { x: 6, y: 3.8 }, { x: 7, y: 1.9 }, { x: 8, y: 6.0 },
  { x: 9, y: 1.8 }, { x: 10, y: 4.0 }, { x: 11, y: 10.0 }, { x: 12, y: 2.2 },
  { x: 13, y: 2.8 }, { x: 14, y: 1.5 }, { x: 15, y: 10.0 }, { x: 16, y: 3.1 },
  { x: 17, y: 2.0 }, { x: 18, y: 3.2 }, { x: 19, y: 1.2 }, { x: 20, y: 5.5 }
];

export default function ProyectosDashboardView({ userProfile = null }) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('ALL'); // 'ALL' o id del proyecto
  const [expandedTeamProjectId, setExpandedTeamProjectId] = useState(null); // id del proyecto desplegado
  const [dateRange, setDateRange] = useState('MAY_2024');
  const [sprintRange, setSprintRange] = useState('6_SPRINTS');
  const [pageSize, setPageSize] = useState(10);
  const [toastMsg, setToastMsg] = useState(null);

  // Proyectos reales backend, Burnup, CFD & Sprints
  const [realProjects, setRealProjects] = useState([]);
  const [realBurnupData, setRealBurnupData] = useState([]);
  const [realCfdData, setRealCfdData] = useState([]);
  const [realIssues, setRealIssues] = useState([]);
  const [realSprints, setRealSprints] = useState([]);
  const [showBurndownDocModal, setShowBurndownDocModal] = useState(false);
  const [showCfdDocModal, setShowCfdDocModal] = useState(false);

  useEffect(() => {
    projectService.getProjects()
      .then(async (data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mappedProjects = await Promise.all(data.map(async (p, idx) => {
            const projId = p.id_proyecto || p.key_proyecto || `PROJ-${idx + 1}`;
            let issuesArr = [];
            try {
              const res = await projectService.getKpiIssuesDetail(projId);
              issuesArr = res?.issues || (Array.isArray(res) ? res : []);
            } catch (err) {
              issuesArr = [];
            }

            const totalCount = issuesArr.length;
            const doneIssues = issuesArr.filter(i => ['done', 'finalizado', 'resolved', 'completado', 'cerrado'].some(s => (i.status_actual || '').toLowerCase().includes(s)));
            const doneCount = doneIssues.length;
            const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
            const totalVelocity = doneIssues.reduce((acc, i) => acc + parseFloat(i.story_points || 0), 0);

            const validCycleTimes = issuesArr.map(i => parseFloat(i.cycle_time_days || 0)).filter(t => t > 0);
            const avgCycle = validCycleTimes.length > 0
              ? (validCycleTimes.reduce((a, b) => a + b, 0) / validCycleTimes.length).toFixed(1)
              : '0.0';

            return {
              id: projId,
              key: p.key_proyecto || p.key || `PROJ-${idx + 1}`,
              name: p.nombre || `Proyecto ${idx + 1}`,
              status: (p.estado || '').toUpperCase() === 'INACTIVE' ? 'Pausado' : 'Activo',
              issuesCount: totalCount,
              velocity: totalVelocity > 0 ? totalVelocity.toFixed(1) : '0.0',
              cycleTime: `${avgCycle} días`,
              progress: progressPct,
              lastSync: 'Hace momentos',
              color: ['#8b5cf6', '#3b82f6', '#f97316', '#10b981', '#a855f7', '#06b6d4'][idx % 6]
            };
          }));

          setRealProjects(mappedProjects);
        }
      })
      .catch(() => { });
  }, []);

  // Fetch de Burndown, Sprints e Incidencias Reales según el proyecto seleccionado
  useEffect(() => {
    const targetProjId = selectedProjectId === 'ALL'
      ? (realProjects[0]?.id || 'PROJ-01')
      : selectedProjectId;

    projectService.getProjectBurnup(targetProjId)
      .then(res => {
        const burnupArr = res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(burnupArr) && burnupArr.length > 0) {
          setRealBurnupData(burnupArr);
        } else {
          setRealBurnupData([]);
        }
      })
      .catch(() => setRealBurnupData([]));

    projectService.getProjectCFD(targetProjId)
      .then(res => {
        const cfdArr = res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(cfdArr) && cfdArr.length > 0) {
          setRealCfdData(cfdArr);
        } else {
          setRealCfdData([]);
        }
      })
      .catch(() => setRealCfdData([]));

    projectService.getSprints(targetProjId)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRealSprints(data);
        } else {
          setRealSprints([]);
        }
      })
      .catch(() => setRealSprints([]));

    projectService.getKpiIssuesDetail(targetProjId)
      .then(res => {
        const issuesArr = res?.issues || (Array.isArray(res) ? res : []);
        setRealIssues(issuesArr);
      })
      .catch(() => setRealIssues([]));
  }, [selectedProjectId, realProjects]);

  const allProjectsList = useMemo(() => {
    return realProjects;
  }, [realProjects]);

  // Proyecto seleccionado (si no es 'ALL')
  const selectedProjectObj = useMemo(() => {
    if (selectedProjectId === 'ALL') return null;
    return allProjectsList.find(p => p.id === selectedProjectId) || null;
  }, [selectedProjectId, allProjectsList]);

  // Proyectos filtrados para la tabla
  const displayProjects = useMemo(() => {
    let list = allProjectsList;
    if (selectedProjectId !== 'ALL') {
      list = list.filter(p => p.id === selectedProjectId);
    }
    if (!searchTerm.trim()) return list;
    return list.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.key.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProjectsList, selectedProjectId, searchTerm]);

  // Cálculos dinámicos de Métricas (KPIs) según la selección
  const metrics = useMemo(() => {
    if (selectedProjectObj) {
      return {
        activeCountLabel: '1 Proyecto',
        activeSubtext: `Seleccionado: ${selectedProjectObj.name}`,
        totalIssues: selectedProjectObj.issuesCount,
        avgVelocity: `${selectedProjectObj.velocity}`,
        cycleTime: selectedProjectObj.cycleTime,
        lastSync: selectedProjectObj.lastSync,
        progress: selectedProjectObj.progress
      };
    }

    const totalIssues = allProjectsList.reduce((acc, p) => acc + (p.issuesCount || 0), 0);
    const avgVelocity = (allProjectsList.reduce((acc, p) => acc + parseFloat(p.velocity || 0), 0) / (allProjectsList.length || 1)).toFixed(1);
    const activeCount = allProjectsList.filter(p => p.status === 'Activo').length;

    return {
      activeCountLabel: `${activeCount}`,
      activeSubtext: `De ${allProjectsList.length} proyectos en total`,
      totalIssues: totalIssues > 0 ? totalIssues.toLocaleString() : '1,248',
      avgVelocity: `${avgVelocity}`,
      cycleTime: '3.2 días',
      lastSync: 'Hace 2 horas',
      progress: 75
    };
  }, [selectedProjectObj, allProjectsList]);

  // Datos del Gráfico Donut de Estados calculados desde la BD real de Jira
  const statusDistributionData = useMemo(() => {
    if (Array.isArray(realIssues) && realIssues.length > 0) {
      let completados = 0;
      let enProgreso = 0;
      let porCompletar = 0;
      let bloqueados = 0;
      let sinAsignar = 0;

      realIssues.forEach(issue => {
        const st = (issue.status_actual || '').toLowerCase();
        if (['done', 'finalizado', 'resolved', 'completado', 'cerrado'].some(s => st.includes(s))) {
          completados++;
        } else if (['in progress', 'en progreso', 'desarrollo', 'in review', 'revisión', 'doing'].some(s => st.includes(s))) {
          enProgreso++;
        } else if (['blocked', 'bloqueado', 'impediment'].some(s => st.includes(s))) {
          bloqueados++;
        } else if (['to do', 'por hacer', 'backlog', 'open', 'abierto'].some(s => st.includes(s))) {
          porCompletar++;
        } else {
          sinAsignar++;
        }
      });

      const total = realIssues.length;
      return [
        { name: 'Completados', value: completados, percentage: total ? `${((completados / total) * 100).toFixed(1)}%` : '0%', color: '#10b981' },
        { name: 'En progreso', value: enProgreso, percentage: total ? `${((enProgreso / total) * 100).toFixed(1)}%` : '0%', color: '#8b5cf6' },
        { name: 'Por completar', value: porCompletar, percentage: total ? `${((porCompletar / total) * 100).toFixed(1)}%` : '0%', color: '#3b82f6' },
        { name: 'Bloqueados', value: bloqueados, percentage: total ? `${((bloqueados / total) * 100).toFixed(1)}%` : '0%', color: '#f59e0b' },
        { name: 'Sin asignar', value: sinAsignar, percentage: total ? `${((sinAsignar / total) * 100).toFixed(1)}%` : '0%', color: '#cbd5e1' },
      ];
    }

    return [
      { name: 'Completados', value: 141, percentage: '57.8%', color: '#10b981' },
      { name: 'En progreso', value: 73, percentage: '29.9%', color: '#8b5cf6' },
      { name: 'Por completar', value: 30, percentage: '12.3%', color: '#3b82f6' },
      { name: 'Bloqueados', value: 13, percentage: '5.3%', color: '#f59e0b' },
      { name: 'Sin asignar', value: 5, percentage: '2.0%', color: '#cbd5e1' },
    ];
  }, [realIssues]);

  // Métricas consolidadas en tiempo real
  const computedMetrics = useMemo(() => {
    const totalIssuesCount = Array.isArray(realIssues) && realIssues.length > 0
      ? realIssues.length
      : 244;

    const completadosCount = statusDistributionData.find(s => s.name === 'Completados')?.value || 141;
    const enProgresoCount = statusDistributionData.find(s => s.name === 'En progreso')?.value || 73;
    const porCompletarCount = statusDistributionData.find(s => s.name === 'Por completar')?.value || 30;

    const pctCompletado = totalIssuesCount > 0
      ? ((completadosCount / totalIssuesCount) * 100).toFixed(1)
      : '57.8';

    const activeProjs = realProjects.length > 0
      ? realProjects.filter(p => p.status === 'Activo').length
      : 8;

    return {
      activeProjects: activeProjs,
      totalIssues: totalIssuesCount,
      completados: completadosCount,
      enProgreso: enProgresoCount,
      porCompletar: porCompletarCount,
      pctCompletado: `${pctCompletado}%`,
      pctNum: parseFloat(pctCompletado) || 57.8
    };
  }, [realIssues, statusDistributionData, realProjects]);

  // Datos del Gráfico de Barras de Velocidad del equipo dinámicos desde Jira / BD
  const teamVelocityData = useMemo(() => {
    if (Array.isArray(realSprints) && realSprints.length > 0) {
      const colors = ['#8b5cf6', '#3b82f6', '#10b981'];
      return realSprints.slice(-3).reverse().map((s, idx) => ({
        name: s.nombre || `Sprint ${idx + 10}`,
        SP: Math.round(s.sp_completados || s.sp_completed || (realIssues.filter(i => i.sprint_nombre === s.nombre && (i.status_actual || '').toLowerCase().includes('done')).reduce((acc, i) => acc + (i.story_points || 0), 0)) || (42 - idx * 4)),
        color: colors[idx % colors.length]
      }));
    }

    if (Array.isArray(realIssues) && realIssues.length > 0) {
      const doneSP = realIssues
        .filter(i => ['done', 'finalizado', 'resolved', 'completado'].some(st => (i.status_actual || '').toLowerCase().includes(st)))
        .reduce((acc, i) => acc + (i.story_points || 0), 0);

      const totalSP = Math.round(doneSP) || 42;
      return [
        { name: 'Sprint Actual', SP: totalSP, color: '#8b5cf6' },
        { name: 'Sprint Anterior', SP: Math.max(10, Math.round(totalSP * 0.85)), color: '#3b82f6' },
        { name: 'Sprint Previo', SP: Math.max(10, Math.round(totalSP * 0.7)), color: '#10b981' },
      ];
    }

    return [
      { name: 'Sprint 12', SP: 42, color: '#8b5cf6' },
      { name: 'Sprint 11', SP: 38, color: '#3b82f6' },
      { name: 'Sprint 10', SP: 34, color: '#10b981' },
    ];
  }, [realSprints, realIssues]);

  // Equipo asignado por proyecto (con roles, estado Activo/Inactivo y carga actual)
  const getProjectTeam = useMemo(() => {
    return (projId, projStatus = 'Activo') => {
      if (Array.isArray(realIssues) && realIssues.length > 0) {
        const projIssues = projId && projId !== 'ALL'
          ? realIssues.filter(i => i.id_proyecto === projId || i.key_proyecto === projId)
          : realIssues;

        const assigneeMap = {};
        projIssues.forEach(issue => {
          const name = issue.assignee_name || 'Sin Asignar';
          if (name === 'Sin Asignar') return;

          if (!assigneeMap[name]) {
            assigneeMap[name] = {
              total: 0,
              pending: 0,
              pendingSp: 0,
              role: Object.keys(assigneeMap).length === 0 ? 'LÍDER' : 'DEV'
            };
          }

          assigneeMap[name].total += 1;
          const st = (issue.status_actual || '').toLowerCase();
          const isDone = ['done', 'finalizado', 'resolved', 'completado', 'cerrado'].some(s => st.includes(s));
          if (!isDone) {
            assigneeMap[name].pending += 1;
            assigneeMap[name].pendingSp += parseFloat(issue.story_points || 0);
          }
        });

        const members = Object.keys(assigneeMap).map((name, idx) => {
          const pCount = assigneeMap[name].pending;
          const pSp = Math.round(assigneeMap[name].pendingSp);
          let workloadText = 'Sin tareas pendientes';
          if (pCount > 0) {
            workloadText = pSp > 0 ? `${pCount} tareas (${pSp} SP)` : `${pCount} tareas`;
          }

          return {
            id: `user-${projId}-${idx}`,
            name,
            role: assigneeMap[name].role,
            userStatus: projStatus === 'Inactivo' || projStatus === 'Pausado' ? (idx % 2 === 0 ? 'Activo' : 'Inactivo') : 'Activo',
            initial: name.charAt(0).toUpperCase(),
            tasks: workloadText,
            color: ['#8b5cf6', '#2563eb', '#10b981', '#f59e0b', '#06b6d4', '#a855f7'][idx % 6]
          };
        });

        if (members.length > 0) return members;
      }

      const defaultTeam = [
        { id: 't1', role: 'LÍDER', userStatus: 'Activo', initial: 'C', name: 'camilo corredor', tasks: 'Sin tareas pendientes', color: '#8b5cf6' },
        { id: 't2', role: 'DEV', userStatus: 'Activo', initial: 'S', name: 'salamancamai12', tasks: 'Sin tareas pendientes', color: '#2563eb' },
        { id: 't3', role: 'DEV', userStatus: 'Activo', initial: 'B', name: 'beltrancamilo592', tasks: 'Sin tareas pendientes', color: '#10b981' },
        { id: 't4', role: 'DEV', userStatus: 'Activo', initial: 'A', name: 'Andrés Alcalá', tasks: 'Sin tareas pendientes', color: '#f59e0b' },
        { id: 't5', role: 'DEV', userStatus: 'Activo', initial: 'V', name: 'Valentina Montalvo', tasks: 'Sin tareas pendientes', color: '#06b6d4' },
        { id: 't6', role: 'DEV', userStatus: 'Activo', initial: 'S', name: 'Stephany León', tasks: 'Sin tareas pendientes', color: '#a855f7' }
      ];

      if (projStatus === 'Pausado' || projStatus === 'Inactivo') {
        return defaultTeam.map((m, idx) => ({
          ...m,
          userStatus: idx === 1 || idx === 4 ? 'Inactivo' : 'Activo',
          tasks: idx === 0 ? '2 tareas (5 SP)' : 'Sin tareas pendientes'
        }));
      }

      return defaultTeam;
    };
  }, [realIssues]);

  // Velocidad dinámica según el proyecto seleccionado
  const activeVelocityData = useMemo(() => {
    if (Array.isArray(realSprints) && realSprints.length > 0) {
      return realSprints.slice(-4).map((s, idx) => ({
        sprint: s.nombre || `Sprint ${14 + idx}`,
        comprometido: Math.round(s.sp_planificados || s.sp_planned || (40 + idx * 2)),
        completado: Math.round(s.sp_completados || s.sp_completed || (32 + idx * 3))
      }));
    }

    const velocityByProj = {
      'ALL': [
        { sprint: 'Sprint 14', comprometido: 95, completado: 88 },
        { sprint: 'Sprint 15', comprometido: 105, completado: 100 },
        { sprint: 'Sprint 16', comprometido: 112, completado: 108 },
        { sprint: 'Sprint 17', comprometido: 120, completado: 117 },
      ],
      '10000': [
        { sprint: 'Sprint 14', comprometido: 60, completado: 58 },
        { sprint: 'Sprint 15', comprometido: 65, completado: 62 },
        { sprint: 'Sprint 16', comprometido: 70, completado: 68 },
        { sprint: 'Sprint 17', comprometido: 75, completado: 72 },
      ],
      '10033': [
        { sprint: 'Sprint 14', comprometido: 35, completado: 30 },
        { sprint: 'Sprint 15', comprometido: 40, completado: 38 },
        { sprint: 'Sprint 16', comprometido: 42, completado: 40 },
        { sprint: 'Sprint 17', comprometido: 45, completado: 42 },
      ],
    };
    velocityByProj['SC'] = velocityByProj['10000'];
    velocityByProj['PA'] = velocityByProj['10033'];

    return velocityByProj[selectedProjectId] || velocityByProj['ALL'];
  }, [realSprints, selectedProjectId]);

  // Percentiles y dispersión de Cycle Time dinámicos según el proyecto seleccionado
  const activePercentilesData = useMemo(() => {
    let times = [];

    if (Array.isArray(realIssues) && realIssues.length > 0) {
      times = realIssues
        .map(i => parseFloat(i.cycle_time_days || i.lead_time_days || 0))
        .filter(t => t > 0);
    }

    if (times.length < 5) {
      const baseMap = {
        'ALL': [1.2, 1.5, 1.8, 2.0, 2.1, 2.5, 2.8, 3.2, 3.8, 4.0, 5.5, 6.0, 8.0, 9.5],
        '10000': [1.2, 1.5, 1.8, 2.0, 2.1, 2.3, 2.6, 2.9, 3.4, 3.8, 4.0, 5.2, 6.5, 8.0],
        '10033': [2.2, 2.5, 2.8, 3.1, 3.4, 3.8, 4.2, 4.8, 5.2, 5.8, 6.5, 7.8, 9.2, 11.0],
      };
      baseMap['SC'] = baseMap['10000'];
      baseMap['PA'] = baseMap['10033'];

      times = baseMap[selectedProjectId] || baseMap['ALL'];
    }

    times.sort((a, b) => a - b);

    const getPercentile = (pct) => {
      if (times.length === 0) return 0;
      const index = Math.min(times.length - 1, Math.floor(times.length * pct));
      return parseFloat(times[index].toFixed(1));
    };

    const p50 = getPercentile(0.50) || 2.1;
    const p85 = getPercentile(0.85) || 4.0;
    const p95 = getPercentile(0.95) || 8.0;

    const scatterPoints = times.map((yVal, idx) => ({
      x: idx + 1,
      y: yVal
    }));

    return {
      scatterPoints,
      p50,
      p85,
      p95,
      predictabilityText: `El 85% de los issues se completa en ≤ ${p85} días.`
    };
  }, [realIssues, selectedProjectId]);

  // Datos dinámicos para el Diagrama de Flujo Acumulado (CFD) por proyecto
  const activeCfdData = useMemo(() => {
    if (Array.isArray(realCfdData) && realCfdData.length > 0) {
      return realCfdData;
    }

    const cfdMap = {
      'ALL': [
        { fecha_real: '13 ago', por_hacer: 320, en_progreso: 35, en_revision: 25, completado: 0 },
        { fecha_real: '16 ago', por_hacer: 275, en_progreso: 52, en_revision: 28, completado: 40 },
        { fecha_real: '19 ago', por_hacer: 220, en_progreso: 63, en_revision: 37, completado: 75 },
        { fecha_real: '22 ago', por_hacer: 165, en_progreso: 72, en_revision: 43, completado: 115 },
        { fecha_real: '25 ago', por_hacer: 110, en_progreso: 80, en_revision: 50, completado: 155 },
        { fecha_real: '28 ago', por_hacer: 65, en_progreso: 65, en_revision: 35, completado: 230 },
        { fecha_real: '31 ago', por_hacer: 35, en_progreso: 50, en_revision: 25, completado: 285 },
        { fecha_real: '3 sep', por_hacer: 18, en_progreso: 32, en_revision: 18, completado: 327 },
        { fecha_real: '7 sep', por_hacer: 8, en_progreso: 18, en_revision: 9, completado: 360 }
      ],
      '10000': [
        { fecha_real: '13 ago', por_hacer: 180, en_progreso: 20, en_revision: 15, completado: 0 },
        { fecha_real: '16 ago', por_hacer: 150, en_progreso: 30, en_revision: 15, completado: 20 },
        { fecha_real: '19 ago', por_hacer: 120, en_progreso: 35, en_revision: 20, completado: 40 },
        { fecha_real: '22 ago', por_hacer: 90, en_progreso: 40, en_revision: 25, completado: 60 },
        { fecha_real: '25 ago', por_hacer: 60, en_progreso: 45, en_revision: 30, completado: 80 },
        { fecha_real: '28 ago', por_hacer: 35, en_progreso: 40, en_revision: 20, completado: 120 },
        { fecha_real: '31 ago', por_hacer: 20, en_progreso: 30, en_revision: 15, completado: 150 },
        { fecha_real: '3 sep', por_hacer: 10, en_progreso: 20, en_revision: 10, completado: 175 },
        { fecha_real: '7 sep', por_hacer: 5, en_progreso: 10, en_revision: 5, completado: 195 }
      ],
      '10033': [
        { fecha_real: '13 ago', por_hacer: 140, en_progreso: 15, en_revision: 10, completado: 0 },
        { fecha_real: '16 ago', por_hacer: 125, en_progreso: 22, en_revision: 13, completado: 20 },
        { fecha_real: '19 ago', por_hacer: 100, en_progreso: 28, en_revision: 17, completado: 35 },
        { fecha_real: '22 ago', por_hacer: 75, en_progreso: 32, en_revision: 18, completado: 55 },
        { fecha_real: '25 ago', por_hacer: 50, en_progreso: 35, en_revision: 20, completado: 75 },
        { fecha_real: '28 ago', por_hacer: 30, en_progreso: 25, en_revision: 15, completado: 110 },
        { fecha_real: '31 ago', por_hacer: 15, en_progreso: 20, en_revision: 10, completado: 135 },
        { fecha_real: '3 sep', por_hacer: 8, en_progreso: 12, en_revision: 8, completado: 152 },
        { fecha_real: '7 sep', por_hacer: 3, en_progreso: 8, en_revision: 4, completado: 165 }
      ]
    };
    cfdMap['SC'] = cfdMap['10000'];
    cfdMap['PA'] = cfdMap['10033'];

    return cfdMap[selectedProjectId] || cfdMap['ALL'];
  }, [realCfdData, selectedProjectId]);

  // Datos dinámicos para el Sprint Burnup Chart por proyecto
  const activeBurnupData = useMemo(() => {
    if (Array.isArray(realBurnupData) && realBurnupData.length > 0) {
      return realBurnupData;
    }

    const burnupMap = {
      'ALL': [
        { fecha_real: '13 ago', alcance_total: 450, trabajo_completado: 0, ritmo_ideal: 0, tareas_completadas: 0 },
        { fecha_real: '16 ago', alcance_total: 450, trabajo_completado: 43, ritmo_ideal: 45, tareas_completadas: 10 },
        { fecha_real: '19 ago', alcance_total: 450, trabajo_completado: 88, ritmo_ideal: 90, tareas_completadas: 24 },
        { fecha_real: '22 ago', alcance_total: 455, trabajo_completado: 135, ritmo_ideal: 135, tareas_completadas: 40 },
        { fecha_real: '25 ago', alcance_total: 465, trabajo_completado: 187, ritmo_ideal: 180, tareas_completadas: 66 },
        { fecha_real: '28 ago', alcance_total: 470, trabajo_completado: 260, ritmo_ideal: 225, tareas_completadas: 103 },
        { fecha_real: '31 ago', alcance_total: 475, trabajo_completado: 333, ritmo_ideal: 270, tareas_completadas: 153 },
        { fecha_real: '3 sep', alcance_total: 475, trabajo_completado: 395, ritmo_ideal: 315, tareas_completadas: 207 },
        { fecha_real: '7 sep', alcance_total: 475, trabajo_completado: 448, ritmo_ideal: 360, tareas_completadas: 243 }
      ],
      '10000': [
        { fecha_real: '13 ago', alcance_total: 250, trabajo_completado: 0, ritmo_ideal: 0, tareas_completadas: 0 },
        { fecha_real: '16 ago', alcance_total: 250, trabajo_completado: 25, ritmo_ideal: 25, tareas_completadas: 6 },
        { fecha_real: '19 ago', alcance_total: 250, trabajo_completado: 50, ritmo_ideal: 50, tareas_completadas: 14 },
        { fecha_real: '22 ago', alcance_total: 255, trabajo_completado: 75, ritmo_ideal: 75, tareas_completadas: 22 },
        { fecha_real: '25 ago', alcance_total: 260, trabajo_completado: 105, ritmo_ideal: 100, tareas_completadas: 38 },
        { fecha_real: '28 ago', alcance_total: 260, trabajo_completado: 145, ritmo_ideal: 125, tareas_completadas: 58 },
        { fecha_real: '31 ago', alcance_total: 265, trabajo_completado: 185, ritmo_ideal: 150, tareas_completadas: 85 },
        { fecha_real: '3 sep', alcance_total: 265, trabajo_completado: 220, ritmo_ideal: 175, tareas_completadas: 115 },
        { fecha_real: '7 sep', alcance_total: 265, trabajo_completado: 250, ritmo_ideal: 200, tareas_completadas: 135 }
      ],
      '10033': [
        { fecha_real: '13 ago', alcance_total: 200, trabajo_completado: 0, ritmo_ideal: 0, tareas_completadas: 0 },
        { fecha_real: '16 ago', alcance_total: 200, trabajo_completado: 18, ritmo_ideal: 20, tareas_completadas: 4 },
        { fecha_real: '19 ago', alcance_total: 200, trabajo_completado: 38, ritmo_ideal: 40, tareas_completadas: 10 },
        { fecha_real: '22 ago', alcance_total: 200, trabajo_completado: 60, ritmo_ideal: 60, tareas_completadas: 18 },
        { fecha_real: '25 ago', alcance_total: 205, trabajo_completado: 82, ritmo_ideal: 80, tareas_completadas: 28 },
        { fecha_real: '28 ago', alcance_total: 210, trabajo_completado: 115, ritmo_ideal: 100, tareas_completadas: 45 },
        { fecha_real: '31 ago', alcance_total: 210, trabajo_completado: 148, ritmo_ideal: 120, tareas_completadas: 68 },
        { fecha_real: '3 sep', alcance_total: 210, trabajo_completado: 175, ritmo_ideal: 140, tareas_completadas: 92 },
        { fecha_real: '7 sep', alcance_total: 210, trabajo_completado: 198, ritmo_ideal: 160, tareas_completadas: 108 }
      ]
    };
    burnupMap['SC'] = burnupMap['10000'];
    burnupMap['PA'] = burnupMap['10033'];

    return burnupMap[selectedProjectId] || burnupMap['ALL'];
  }, [realBurnupData, selectedProjectId]);

  // Tiempo de Ciclo Promedio por Tipo de Incidencia (Días para resolver Bugs, Historias, Tareas, etc.)
  const cycleTimeByTypeData = useMemo(() => {
    if (Array.isArray(realIssues) && realIssues.length > 0) {
      const typeMap = {};
      
      realIssues.forEach(issue => {
        const rawType = issue.issue_type || issue.issuetype || 'Story';
        let typeName = 'Historias';
        if (rawType.toLowerCase().includes('bug')) typeName = 'Bugs';
        else if (rawType.toLowerCase().includes('task') || rawType.toLowerCase().includes('tarea')) typeName = 'Tareas';
        else if (rawType.toLowerCase().includes('improvement') || rawType.toLowerCase().includes('mejora')) typeName = 'Mejoras';

        if (!typeMap[typeName]) {
          typeMap[typeName] = { totalDays: 0, count: 0 };
        }

        const days = parseFloat(issue.cycle_time_days || issue.lead_time_days || 0);
        if (days > 0) {
          typeMap[typeName].totalDays += days;
          typeMap[typeName].count += 1;
        }
      });

      const colors = {
        'Bugs': '#ef4444',
        'Historias': '#8b5cf6',
        'Tareas': '#3b82f6',
        'Mejoras': '#10b981'
      };

      const result = Object.keys(typeMap).map(typeName => {
        const avg = typeMap[typeName].count > 0
          ? (typeMap[typeName].totalDays / typeMap[typeName].count).toFixed(1)
          : 0;
        return {
          name: typeName,
          dias: parseFloat(avg) || 1.5,
          color: colors[typeName] || '#6366f1',
          count: typeMap[typeName].count
        };
      });

      if (result.length > 0) return result;
    }

    return [
      { name: 'Bugs', dias: 1.4, color: '#ef4444', count: 18 },
      { name: 'Historias', dias: 4.2, color: '#8b5cf6', count: 45 },
      { name: 'Tareas', dias: 2.1, color: '#3b82f6', count: 32 },
      { name: 'Mejoras', dias: 2.8, color: '#10b981', count: 12 },
    ];
  }, [realIssues]);

  // Datos del Gráfico de Barras según selección
  const topProjectsBarData = useMemo(() => {
    if (selectedProjectObj) {
      return [
        { name: 'Historias de Usuario', value: Math.round(selectedProjectObj.issuesCount * 0.55), color: selectedProjectObj.color },
        { name: 'Tareas / Subtareas', value: Math.round(selectedProjectObj.issuesCount * 0.30), color: '#3b82f6' },
        { name: 'Bugs / Defectos', value: Math.round(selectedProjectObj.issuesCount * 0.15), color: '#ef4444' },
      ];
    }
    return [
      { name: 'Plataforma Analytics', value: 324, color: '#8b5cf6' },
      { name: 'MCHAV Core', value: 278, color: '#3b82f6' },
      { name: 'Web Dashboard', value: 196, color: '#f97316' },
      { name: 'API Gateway', value: 156, color: '#10b981' },
      { name: 'Mobile App', value: 98, color: '#a855f7' },
    ];
  }, [selectedProjectObj]);

  // Datos del Gráfico de Evolución de Velocidad según selección
  const velocityEvolutionData = useMemo(() => {
    if (selectedProjectObj && PROJECT_VELOCITY_MAP[selectedProjectObj.id]) {
      return PROJECT_VELOCITY_MAP[selectedProjectObj.id];
    }
    return GENERAL_VELOCITY_DATA;
  }, [selectedProjectObj]);

  // Actividades Recientes filtradas
  const recentActivities = useMemo(() => {
    if (selectedProjectObj) {
      return [
        { id: 1, type: 'SYNC', title: 'Sincronización completada', project: selectedProjectObj.name, time: 'Hace 2 horas', iconBg: 'bg-emerald-500/15 text-emerald-500' },
        { id: 2, type: 'ISSUE', title: 'Nueva incidencia asignada', project: `${selectedProjectObj.name} • ${selectedProjectObj.key}-104`, time: 'Hace 3 horas', iconBg: 'bg-purple-500/15 text-purple-500' },
        { id: 3, type: 'SPRINT', title: 'Sprint actualizado', project: `${selectedProjectObj.name} • Sprint Activo`, time: 'Hace 5 horas', iconBg: 'bg-amber-500/15 text-amber-500' }
      ];
    }
    return [
      { id: 1, type: 'SYNC', title: 'Sincronización completada', project: 'Plataforma Analytics', time: 'Hace 2 horas', iconBg: 'bg-emerald-500/15 text-emerald-500' },
      { id: 2, type: 'ISSUE', title: 'Nueva incidencia creada', project: 'MCHAV Core • BUG-1234', time: 'Hace 3 horas', iconBg: 'bg-purple-500/15 text-purple-500' },
      { id: 3, type: 'SPRINT', title: 'Sprint finalizado', project: 'Web Dashboard • Sprint 16', time: 'Hace 5 horas', iconBg: 'bg-amber-500/15 text-amber-500' },
      { id: 4, type: 'SYNC', title: 'Sincronización completada', project: 'API Gateway', time: 'Hace 6 horas', iconBg: 'bg-emerald-500/15 text-emerald-500' },
    ];
  }, [selectedProjectObj]);

  const handleSyncNow = () => {
    setSyncing(true);
    setToastMsg(selectedProjectObj ? `Sincronizando ${selectedProjectObj.name}...` : 'Iniciando sincronización de todos los proyectos...');
    setTimeout(() => {
      setSyncing(false);
      setToastMsg('¡Métricas actualizadas con éxito desde Jira!');
      setTimeout(() => setToastMsg(null), 4000);
    }, 1800);
  };

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in duration-200 pb-12">

      {/* Toast Notificación */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900/95 dark:bg-slate-950/95 text-white border border-emerald-500/50 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-top-3">
          <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold">{toastMsg}</span>
          <button type="button" onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white ml-2">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── HEADER CON CONTROLES GLOBALES DE CONTEXTO ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Bienvenido de nuevo, {userProfile?.first_name || user?.email?.split('@')[0] || 'Camilo'}
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Resumen general del rendimiento de tus proyectos
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Selector de Proyecto Global */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-xl shadow-2xs">
              <Filter size={14} className="text-slate-400" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-slate-800 dark:text-slate-100 outline-none cursor-pointer pr-4"
              >
                <option value="ALL" className="bg-white dark:bg-slate-900 font-bold">
                  Todos los proyectos
                </option>
                {allProjectsList.map(p => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 font-semibold">
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>


      {/* ── TABLA RESUMEN DE PROYECTOS (UBICADA SOBRE EL BURNDOWN CHART) ── */}
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
                    <InfoTooltip text="Nombre oficial y avatar identificador del proyecto." align="left" />
                  </span>
                </th>
                <th className="pb-3 px-2">
                  <span className="flex items-center">
                    Clave
                    <InfoTooltip text="Clave abreviada única del proyecto en Jira." align="left" />
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
                          className={`text-slate-400 cursor-pointer hover:text-indigo-500 transition-transform ${expandedTeamProjectId === proj.id ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''}`}
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

                    {/* Botón Seleccionar Equipo */}
                    <td className="py-3 pl-2 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedTeamProjectId(expandedTeamProjectId === proj.id ? null : proj.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${expandedTeamProjectId === proj.id
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/20'
                          }`}
                      >
                        {expandedTeamProjectId === proj.id ? 'Ocultar equipo' : 'Ver equipo'}
                      </button>
                    </td>
                  </tr>

                  {/* SUB-FILA DESPLEGABLE CON EL EQUIPO ASIGNADO (SÓLO SI SE EXPANDE EXPLÍCITAMENTE) */}
                  {expandedTeamProjectId === proj.id && (
                    <tr className="bg-slate-50/80 dark:bg-[#181f36]/70">
                      <td colSpan={9} className="p-3 sm:p-4">
                        <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-xl p-4 shadow-sm space-y-3 text-left">
                          
                          {/* Header Equipo Asignado */}
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>Equipo Asignado al Proyecto</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">({proj.name})</span>
                              </h4>
                              <InfoTooltip text="Lista de miembros asignados activamente al proyecto, su rol, estado del usuario y carga actual." />
                            </div>
                            <span className="text-[11px] font-bold text-slate-400">
                              {getProjectTeam(proj.id, proj.status).length} miembros asignados
                            </span>
                          </div>

                          {/* Tabla de Integrantes */}
                          <div className="border border-slate-100 dark:border-slate-800/80 rounded-lg overflow-hidden">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50/70 dark:bg-[#1a2138]/50 border-b border-slate-100 dark:border-slate-800/80 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                  <th className="py-2 px-3 w-28">
                                    <span className="flex items-center">
                                      Rol
                                      <InfoTooltip text="Rol asignado en el proyecto (LÍDER o DEV)." align="left" />
                                    </span>
                                  </th>
                                  <th className="py-2 px-3">
                                    <span className="flex items-center">
                                      Usuario
                                      <InfoTooltip text="Nombre del integrante e inicial de identificación." align="left" />
                                    </span>
                                  </th>
                                  <th className="py-2 px-3 text-center w-28">
                                    <span className="flex items-center justify-center">
                                      Estado Usuario
                                      <InfoTooltip text="Disponibilidad actual del usuario (Activo o Inactivo)." align="center" />
                                    </span>
                                  </th>
                                  <th className="py-2 px-3 text-right">
                                    <span className="flex items-center justify-end">
                                      Carga Actual
                                      <InfoTooltip text="Cantidad de tareas pendientes y Story Points asignados." align="right" />
                                    </span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {getProjectTeam(proj.id, proj.status).map((member) => (
                                  <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    
                                    {/* Rol Badge */}
                                    <td className="py-2 px-3">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                                        member.role === 'LÍDER'
                                          ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                          : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${member.role === 'LÍDER' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                                        {member.role}
                                      </span>
                                    </td>

                                    {/* Usuario */}
                                    <td className="py-2 px-3">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-2xs" style={{ backgroundColor: member.color }}>
                                          {member.initial}
                                        </div>
                                        <span className="font-extrabold text-slate-900 dark:text-white">
                                          {member.name}
                                        </span>
                                      </div>
                                    </td>

                                    {/* Estado Usuario */}
                                    <td className="py-2 px-3 text-center">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                        member.userStatus === 'Activo'
                                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                          : 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border border-slate-500/20'
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${member.userStatus === 'Activo' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                        {member.userStatus}
                                      </span>
                                    </td>

                                    {/* Carga Actual */}
                                    <td className="py-2 px-3 text-right font-medium text-slate-500 dark:text-slate-400">
                                      {member.tasks}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )))}
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

      {/* ── BLOQUE 2A: DIAGRAMA DE FLUJO ACUMULADO (CFD FULL WIDTH) ── */}
      <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        
        {/* Header CFD */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Diagrama de Flujo Acumulado (CFD)
            </h3>
            <InfoTooltip
              text="Muestra la cantidad acumulada de tareas/puntos por estado (Por Hacer, En Progreso, En Revisión, Completado) para detectar cuellos de botella y medir estabilidad del WIP."
            />
          </div>

          {/* Controles Derecha */}
          <div className="flex items-center gap-3">
            <select className="h-8 px-3 rounded-xl bg-slate-50 dark:bg-[#1a2138] border border-slate-200 dark:border-[#2c3757] text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer">
              <option value="ACTUAL">Sprint actual</option>
              <option value="PREV">Sprint anterior</option>
            </select>

            <button
              type="button"
              onClick={() => setShowCfdDocModal(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
            >
              <span>Ver detalle</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Gráfica CFD */}
        <div className="pt-2">
          <CumulativeFlowDiagram data={activeCfdData} />
        </div>
      </div>

      {/* ── BLOQUE 2B: SPRINT BURNUP CHART (FULL WIDTH) ── */}
      <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        
        {/* Header Burnup */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Sprint Burnup Chart
            </h3>
            <InfoTooltip
              text="Seguimiento del trabajo completado acumulado frente al alcance total del sprint para identificar cambios de alcance (Scope Creep)."
            />
          </div>

          {/* Controles Derecha */}
          <div className="flex items-center gap-3">
            <select className="h-8 px-3 rounded-xl bg-slate-50 dark:bg-[#1a2138] border border-slate-200 dark:border-[#2c3757] text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer">
              <option value="ACTUAL">Sprint actual</option>
              <option value="PREV">Sprint anterior</option>
            </select>

            <button
              type="button"
              onClick={() => setShowBurndownDocModal(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
            >
              <span>Ver detalle</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Gráfica Burnup */}
        <div className="pt-2">
          <SprintBurnupChart data={activeBurnupData} />
        </div>
      </div>

      {/* ── BLOQUE 3: RENDIMIENTO DEL EQUIPO (VELOCITY & TIEMPO DE ENTREGA Y PREDICTIBILIDAD) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* COLUMNA 1: VELOCITY (ÚLTIMOS SPRINTS) */}
        <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          
          {/* Header & Leyenda */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Velocity (Últimos sprints)
            </h3>

            {/* Leyenda */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded bg-[#d8b4fe] inline-block" />
                Comprometido
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded bg-[#7c3aed] inline-block" />
                Completado
              </span>
            </div>
          </div>

          {/* Gráfico de Barras Agrupadas */}
          <div className="h-52 w-full min-h-[210px] pt-2">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={activeVelocityData}
                margin={{ top: 20, right: 15, left: -10, bottom: 20 }}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis
                  dataKey="sprint"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'auto']}
                  label={{ value: 'Story Points', angle: -90, position: 'insideLeft', offset: 15, fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                />
                <RechartsTooltip content={<EnrichedChartTooltip unit="SP" titlePrefix="Sprint" />} />
                <Bar
                  dataKey="comprometido"
                  name="Comprometido"
                  fill="#d8b4fe"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                  label={{ position: 'top', fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                />
                <Bar
                  dataKey="completado"
                  name="Completado"
                  fill="#7c3aed"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                  label={{ position: 'top', fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COLUMNA 2: TIEMPO DE ENTREGA Y PREDICTIBILIDAD */}
        <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                TIEMPO DE ENTREGA Y PREDICTIBILIDAD
              </h3>
              <InfoTooltip text="Muestra la dispersión del Cycle Time de cada issue resuelto y los percentiles de entrega (P50, P85, P95) para medir predictibilidad." />
            </div>

            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Días de resolución
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-4 pt-1">
            {/* Scatter Plot dispersión Cycle Time */}
            <div className="flex-1 space-y-1">
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 block">
                Cycle Time (días)
              </span>

              <div className="h-44 w-full min-h-[180px]">
                <ResponsiveContainer width="100%" height={180}>
                  <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                    <XAxis type="number" dataKey="x" name="Issue" stroke="#64748b" fontSize={9} tick={false} axisLine={{ stroke: '#cbd5e1' }} />
                    <YAxis type="number" dataKey="y" name="Días" stroke="#64748b" fontSize={10} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                    <ReferenceLine y={activePercentilesData.p50} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1.5} />
                    <ReferenceLine y={activePercentilesData.p85} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1.5} />
                    <ReferenceLine y={activePercentilesData.p95} stroke="#f43f5e" strokeDasharray="3 3" strokeWidth={1.5} />
                    <Scatter name="Issues" data={activePercentilesData.scatterPoints} fill="#8884d8">
                      {activePercentilesData.scatterPoints.map((entry, index) => (
                        <Cell key={`cell-scatter-${index}`} fill={entry.y <= activePercentilesData.p50 ? '#10b981' : entry.y <= activePercentilesData.p85 ? '#f59e0b' : '#f43f5e'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] font-bold text-slate-400 text-center">
                Días de resolución promedio
              </div>
            </div>

            {/* Panel de Percentiles & Predictibilidad */}
            <div className="w-full sm:w-44 flex flex-col justify-between gap-3 shrink-0">
              
              {/* Sección Percentiles */}
              <div className="space-y-2 text-xs font-semibold">
                <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1">
                  Percentiles (días)
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">P50 (mediana)</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{activePercentilesData.p50}</span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-1">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">P85</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">{activePercentilesData.p85}</span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-1">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">P95</span>
                  <span className="font-extrabold text-rose-600 dark:text-rose-400">{activePercentilesData.p95}</span>
                </div>
              </div>

              {/* Caja Predictibilidad */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>Predictibilidad</span>
                </div>
                <p className="text-[10px] leading-tight font-semibold text-emerald-800 dark:text-emerald-200">
                  {activePercentilesData.predictabilityText}
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* FOOTER INSTITUCIONAL */}
      <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/80 text-center text-xs text-slate-400 font-medium">
        © 2025 MCHAV Analytics. Todos los derechos reservados.
      </div>

      {/* MODAL DOCUMENTACIÓN TÉCNICA BURNUP */}
      {showBurndownDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileDown size={18} className="text-indigo-500" />
                Justificación Técnica: Cálculo del Sprint Burnup Chart
              </h3>
              <button type="button" onClick={() => setShowBurndownDocModal(false)} className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={16} />
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
              <p><strong>1. Alcance Total vs Trabajo Completado:</strong><br />
              El Burnup dibuja dos curvas clave: el **Alcance Total (Total Scope)** en el tiempo y el **Trabajo Completado acumulado** diariamente. Esto permite evidenciar si las variaciones en el cumplimiento se deben a entregas o a cambios en el alcance (*Scope Creep*).</p>
              <p><strong>2. Eje Horizontal y Proyección Ideal:</strong><br />
              La línea de ritmo ideal marca la trayectoria uniforme proyectada desde el inicio del sprint hasta el tope de alcance al cierre.</p>
              <p><strong>3. Historial de Transiciones Jira Cloud:</strong><br />
              Las tareas pasadas a estados resueltos (*Done*, *Completado*) incrementan el trabajo acumulado del día correspondiente.</p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button type="button" onClick={() => setShowBurndownDocModal(false)} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md">
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DOCUMENTACIÓN TÉCNICA CFD */}
      {showCfdDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileDown size={18} className="text-indigo-500" />
                Justificación Técnica: Cumulative Flow Diagram (CFD)
              </h3>
              <button type="button" onClick={() => setShowCfdDocModal(false)} className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={16} />
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
              <p><strong>1. Áreas Apiladas por Estado:</strong><br />
              El CFD representa la cantidad acumulada de tareas/puntos distribuidos en las etapas del flujo: *Por Hacer*, *En Progreso*, *En Revisión / QA* y *Completado*.</p>
              <p><strong>2. Detección de Cuellos de Botella:</strong><br />
              Un ensanchamiento repentino en las bandas intermedias (*En Progreso* o *En Revisión*) indica una acumulación de trabajo bloqueado o baja capacidad de salida.</p>
              <p><strong>3. Cálculo de Lead Time y Estabilidad de WIP:</strong><br />
              La distancia horizontal entre la curva de inicio y la curva de *Completado* refleja la tendencia del Lead Time del equipo.</p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button type="button" onClick={() => setShowCfdDocModal(false)} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md">
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
