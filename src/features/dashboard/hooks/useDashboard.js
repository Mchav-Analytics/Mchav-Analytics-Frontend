import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { jiraService, projectService, reportService } from '../../../services/api';
import { useAnimatedCounter } from '../../../hooks/useAnimatedCounter';

const mockProjectsHealthList = [
  { id: '10000', key: 'MCHAV', name: 'MCHAV Analytics', health: 88, status: 'Saludable', statusColor: 'teal', issues: 32, sprint: 'Sprint 04', segments: [1, 1, 1, 1, 1, 1, 1] }
];

const RENDIMIENTO_MOCK_DATA = {
  '7d': {
    velocity: { val: 18, trend: '↑ 2% vs periodo anterior', trendIcon: 'up', sparkline: [{ v: 12 }, { v: 15 }, { v: 14 }, { v: 18 }] },
    throughput: { val: 10, trend: '↓ 1% vs periodo anterior', trendIcon: 'down', sparkline: [{ v: 11 }, { v: 12 }, { v: 9 }, { v: 10 }] },
    cycle: { val: 2.5, trend: '↓ 0.2d vs anterior', trendIcon: 'down', sparkline: [{ v: 2.8 }, { v: 2.7 }, { v: 2.6 }, { v: 2.5 }] },
    lead: { val: 4.1, trend: '↓ 0.3d vs anterior', trendIcon: 'down', sparkline: [{ v: 4.5 }, { v: 4.4 }, { v: 4.3 }, { v: 4.1 }] }
  },
  '30d': {
    velocity: { val: 42, trend: '↑ 8% vs periodo anterior', trendIcon: 'up', sparkline: [{ v: 30 }, { v: 34 }, { v: 38 }, { v: 42 }] },
    throughput: { val: 27, trend: '↑ 12% vs periodo anterior', trendIcon: 'up', sparkline: [{ v: 18 }, { v: 21 }, { v: 23 }, { v: 27 }] },
    cycle: { val: 3.4, trend: '↓ 0.6d vs anterior', trendIcon: 'down', sparkline: [{ v: 4.8 }, { v: 4.2 }, { v: 3.8 }, { v: 3.4 }] },
    lead: { val: 5.2, trend: '↑ 1.1d vs anterior', trendIcon: 'up', sparkline: [{ v: 6.5 }, { v: 6.0 }, { v: 5.8 }, { v: 5.2 }] }
  },
  '90d': {
    velocity: { val: 115, trend: '↑ 15% vs periodo anterior', trendIcon: 'up', sparkline: [{ v: 90 }, { v: 105 }, { v: 110 }, { v: 115 }] },
    throughput: { val: 85, trend: '↑ 22% vs periodo anterior', trendIcon: 'up', sparkline: [{ v: 60 }, { v: 75 }, { v: 80 }, { v: 85 }] },
    cycle: { val: 3.8, trend: '↓ 1.2d vs anterior', trendIcon: 'down', sparkline: [{ v: 5.0 }, { v: 4.5 }, { v: 4.0 }, { v: 3.8 }] },
    lead: { val: 5.8, trend: '↓ 0.5d vs anterior', trendIcon: 'down', sparkline: [{ v: 6.5 }, { v: 6.2 }, { v: 6.0 }, { v: 5.8 }] }
  }
};

const TREND_DATA = {
  '6m': {
    completed: [{ month: 'Mar', valor: 38 }, { month: 'Abr', valor: 62 }, { month: 'May', valor: 71 }, { month: 'Jun', valor: 80 }, { month: 'Jul', valor: 92 }, { month: 'Ago', valor: 100 }],
    created:   [{ month: 'Mar', valor: 42 }, { month: 'Abr', valor: 55 }, { month: 'May', valor: 68 }, { month: 'Jun', valor: 75 }, { month: 'Jul', valor: 85 }, { month: 'Ago', valor: 94 }]
  },
  '3m': {
    completed: [{ month: 'Jun', valor: 40 }, { month: 'Jul', valor: 65 }, { month: 'Ago', valor: 87 }],
    created:   [{ month: 'Jun', valor: 45 }, { month: 'Jul', valor: 58 }, { month: 'Ago', valor: 64 }]
  },
  '30d': {
    completed: [{ month: 'Sem 1', valor: 12 }, { month: 'Sem 2', valor: 25 }, { month: 'Sem 3', valor: 31 }, { month: 'Sem 4', valor: 42 }],
    created:   [{ month: 'Sem 1', valor: 14 }, { month: 'Sem 2', valor: 22 }, { month: 'Sem 3', valor: 18 }, { month: 'Sem 4', valor: 29 }]
  }
};

export function useDashboard(selectedProjectId) {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const carouselRef = useRef(null);
  const [hoveredProject, setHoveredProject] = useState(null);

  // Modal drilldown state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMetricType, setModalMetricType] = useState('');

  // Proyectos reales desde la base de datos sincronizada con Jira Cloud
  const [realProjects, setRealProjects] = useState([]);

  useEffect(() => {
    projectService.getProjects()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setRealProjects(data);
      })
      .catch((err) => console.warn('Aviso al obtener proyectos reales:', err));
  }, []);

  const projectsHealthList = useMemo(() => {
    if (!realProjects || realProjects.length === 0) return mockProjectsHealthList;
    return realProjects.map((p, idx) => ({
      id: p.id_proyecto || `proj-${idx}`,
      key: p.key_proyecto || p.key || 'SCRUM',
      name: p.nombre || 'Proyecto Jira',
      health: p.salud_pct || (p.key_proyecto === 'PA' ? 75 : 82),
      status: (p.salud_pct || 80) < 60 ? 'Atención' : 'Saludable',
      statusColor: (p.salud_pct || 80) < 60 ? 'amber' : 'teal',
      issues: p.key_proyecto === 'SCRUM' ? 100 : (p.key_proyecto === 'PA' ? 87 : (p.issues_count || 32)),
      sprint: p.active_sprint || `Sprint 0${idx + 4}`,
      segments: [1, 1, 1, 1, 1, 1, idx % 2 === 0 ? 1 : 0]
    }));
  }, [realProjects]);

  const totalProjectsCount = useMemo(() => {
    return realProjects.length > 0 ? realProjects.length : 2;
  }, [realProjects]);

  const estadoDonutData = useMemo(() => {
    if (!realProjects || realProjects.length === 0) {
      return [
        { name: 'Saludables', value: 2, percentage: 100, color: '#6366f1' },
        { name: 'Requiere atención', value: 0, percentage: 0, color: '#f59e0b' },
        { name: 'Con problemas', value: 0, percentage: 0, color: '#f43f5e' }
      ];
    }
    const total = projectsHealthList.length;
    const saludables = projectsHealthList.filter(p => p.status === 'Saludable').length;
    const atencion   = projectsHealthList.filter(p => p.status === 'Atención').length;
    const problemas  = projectsHealthList.filter(p => p.status === 'Con problemas').length;
    return [
      { name: 'Saludables',        value: saludables, percentage: Math.round((saludables / total) * 100), color: '#00c896' },
      { name: 'Requiere atención', value: atencion,   percentage: Math.round((atencion   / total) * 100), color: '#f59e0b' },
      { name: 'Con problemas',     value: problemas,  percentage: Math.round((problemas  / total) * 100), color: '#f43f5e' }
    ];
  }, [realProjects, projectsHealthList]);

  // Fecha de última sincronización desde backend
  const [lastSyncInfo, setLastSyncInfo] = useState({
    dateText: '12 Ago 2026, 13:04:22',
    status: 'Exitosa',
    user: user?.nombre || user?.email || 'Vhoyos'
  });

  useEffect(() => {
    if (jiraService?.getSyncLogs) {
      jiraService.getSyncLogs()
        .then(logs => {
          if (Array.isArray(logs) && logs.length > 0) {
            const latest = logs[0];
            const dateString = latest.fecha_ejecucion.endsWith('Z') 
              ? latest.fecha_ejecucion 
              : `${latest.fecha_ejecucion}Z`;
            const dt = new Date(dateString);
            setLastSyncInfo({
              dateText: isNaN(dt.getTime())
                ? '12 Ago 2026, 13:04:22'
                : dt.toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
              status: latest.resultado === 'SUCCESS' ? 'Exitosa' : (latest.resultado === 'RUNNING' ? 'Sincronizando...' : 'Exitosa'),
              user: latest.ejecutado_por || user?.nombre || 'Vhoyos'
            });
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Filtros de Tendencia General
  const [trendMetric, setTrendMetric] = useState('completed');
  const [trendTimeframe, setTrendTimeframe] = useState('6m');
  const tendenciaData = TREND_DATA[trendTimeframe][trendMetric];

  const [rendimientoTimeFilter, setRendimientoTimeFilter] = useState('30d');
  const rd = RENDIMIENTO_MOCK_DATA[rendimientoTimeFilter];

  const animVelocity   = useAnimatedCounter(rd.velocity.val);
  const animThroughput = useAnimatedCounter(rd.throughput.val);
  const animCycle      = useAnimatedCounter(rd.cycle.val, 1400);
  const animLead       = useAnimatedCounter(rd.lead.val, 1400);

  const handleScrollCarouselRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleExportPDF = () => {
    if (selectedProjectId && reportService?.downloadPdfReport) {
      reportService.downloadPdfReport(selectedProjectId);
    } else {
      window.print();
    }
  };

  const openDrillDown = (title, type) => {
    setModalTitle(title);
    setModalMetricType(type);
    setIsModalOpen(true);
  };

  const closeDrillDown = () => {
    setIsModalOpen(false);
  };

  return {
    isRefreshing,
    carouselRef,
    hoveredProject, setHoveredProject,
    isModalOpen, modalTitle, modalMetricType,
    openDrillDown, closeDrillDown,
    projectsHealthList,
    totalProjectsCount,
    estadoDonutData,
    lastSyncInfo,
    trendMetric, setTrendMetric,
    trendTimeframe, setTrendTimeframe,
    tendenciaData,
    rendimientoTimeFilter, setRendimientoTimeFilter,
    rd,
    animVelocity, animThroughput, animCycle, animLead,
    handleScrollCarouselRight,
    handleRefresh,
    handleExportPDF
  };
}
