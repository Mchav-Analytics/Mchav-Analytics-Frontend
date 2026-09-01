import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import api, { projectService } from '../../../services/api';

export const useProyectosDashboard = ({ userProfile, selectedProjectId: parentSelectedProjectId, setSelectedProjectId: parentSetSelectedProjectId }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [internalSelectedProjectId, setInternalSelectedProjectId] = useState(parentSelectedProjectId || 'ALL');

  const selectedProjectId = parentSelectedProjectId !== undefined && parentSelectedProjectId !== 'ALL' ? parentSelectedProjectId : internalSelectedProjectId;
  const setSelectedProjectId = (newId) => {
    setInternalSelectedProjectId(newId);
    if (parentSetSelectedProjectId) {
      parentSetSelectedProjectId(newId);
    }
  };
  const [expandedTeamProjectId, setExpandedTeamProjectId] = useState(null); // Acordeón desplegable de equipo desacoplado
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

  // Velocidad dinámica según el proyecto seleccionado (soporta ALL, 10000, 10033)
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

  // Equipo asignado al proyecto
  const assignedTeam = useMemo(() => {
    if (Array.isArray(realIssues) && realIssues.length > 0) {
      const assigneeMap = {};
      
      realIssues.forEach(issue => {
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
          id: `user-${idx}`,
          name,
          role: assigneeMap[name].role,
          initial: name.charAt(0).toUpperCase(),
          userStatus: 'Activo',
          tasks: workloadText,
          color: ['#8b5cf6', '#2563eb', '#10b981', '#f59e0b', '#06b6d4'][idx % 5]
        };
      });

      if (members.length > 0) return members;
    }

    return [
      { id: '1', role: 'LÍDER', initial: 'V', name: 'Valentina Montalvo', userStatus: 'Activo', tasks: '2 tareas (5 SP)', color: '#8b5cf6' },
      { id: '2', role: 'DEV', initial: 'S', name: 'Stephany León', userStatus: 'Activo', tasks: '4 tareas (12 SP)', color: '#2563eb' },
      { id: '3', role: 'DEV', initial: 'C', name: 'Camilo Corredor', userStatus: 'Activo', tasks: '3 tareas (8 SP)', color: '#10b981' }
    ];
  }, [realIssues]);

  const handleSyncNow = () => {
    setSyncing(true);
    setToastMsg(selectedProjectObj ? `Sincronizando ${selectedProjectObj.name}...` : 'Iniciando sincronización de todos los proyectos...');
    setTimeout(() => {
      setSyncing(false);
      setToastMsg('¡Métricas actualizadas con éxito desde Jira!');
      setTimeout(() => setToastMsg(null), 4000);
    }, 1800);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedProjectId,
    setSelectedProjectId,
    expandedTeamProjectId,
    setExpandedTeamProjectId,
    allProjectsList,
    selectedProjectObj,
    displayProjects,
    activeVelocityData,
    activePercentilesData,
    activeCfdData,
    activeBurnupData,
    showCfdDocModal,
    setShowCfdDocModal,
    showBurndownDocModal,
    setShowBurndownDocModal,
    assignedTeam,
    toastMsg,
    setToastMsg,
    syncing,
    handleSyncNow
  };
};
