import { useState, useEffect } from 'react';
import { calculateBusinessDays, REAL_JIRA_ISSUES_DB } from '../components/CapacityShared';

export const TEAM_DEVS = [
  'Michael Rodríguez',
  'Camilo Beltrán',
  'Andrés Alcalá',
  'Stephany León',
  'Valentina Montalvo',
  'Mai Salamanca',
  'Carlos Mendoza'
];

export function useCapacityCalculator() {
  const [devCount, setDevCount] = useState(5);
  const [sprintDays, setSprintDays] = useState(10);
  const [vacationDays, setVacationDays] = useState(2);
  const [sickDevsCount, setSickDevsCount] = useState(1);
  const [sickDays, setSickDays] = useState(5);
  const [avgDevVelocity, setAvgDevVelocity] = useState(10);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Lista de ausencias/incapacidades programadas por fecha (con desarrolladores reales)
  const [absenceEvents, setAbsenceEvents] = useState([
    { 
      id: 1, 
      devName: 'Michael Rodríguez', 
      type: 'SICK', 
      startDate: '2026-09-08', 
      endDate: '2026-09-12', 
      days: 5, 
      note: 'Incapacidad Médica por Gripe Severa' 
    },
    { 
      id: 2, 
      devName: 'Camilo Beltrán', 
      type: 'VACATION', 
      startDate: '2026-09-14', 
      endDate: '2026-09-15', 
      days: 2, 
      note: 'Permiso personal planificado' 
    }
  ]);

  // Lista viva de incidencias de Jira para permitir reasignación en tiempo real
  const [jiraTasks, setJiraTasks] = useState(REAL_JIRA_ISSUES_DB);

  // Estados para Filtros de Incidencias en Vivo de Jira
  const [taskStatusTab, setTaskStatusTab] = useState(() => {
    try {
      return localStorage.getItem('mchav_capacity_status_filter') || 'ALL';
    } catch (e) {
      return 'ALL';
    }
  });
  const [taskSearchTerm, setTaskSearchTerm] = useState('');
  const [selectedTaskProject, setSelectedTaskProject] = useState('ALL');

  useEffect(() => {
    const handleFilterChange = (e) => {
      if (e.detail && e.detail.status) {
        setTaskStatusTab(e.detail.status);
      }
    };
    window.addEventListener('mchav-change-tab', handleFilterChange);
    return () => window.removeEventListener('mchav-change-tab', handleFilterChange);
  }, []);

  // Recalcular métricas del simulador según los eventos del calendario
  const recalculateFromEvents = (events) => {
    let totalVacation = 0;
    let sickDevsMap = {};

    events.forEach(ev => {
      if (ev.type === 'VACATION') {
        totalVacation += ev.days;
      } else if (ev.type === 'SICK') {
        sickDevsMap[ev.devName] = (sickDevsMap[ev.devName] || 0) + ev.days;
      }
    });

    setVacationDays(totalVacation);

    const sickDevNames = Object.keys(sickDevsMap);
    const countSickDevs = sickDevNames.length;
    const avgSickDays = countSickDevs > 0 
      ? Math.round(Object.values(sickDevsMap).reduce((a, b) => a + b, 0) / countSickDevs) 
      : 0;

    setSickDevsCount(countSickDevs);
    setSickDays(avgSickDays);
  };

  const handleAddAbsenceEvent = (newDevName, newAbsenceType, newStartDate, newEndDate, newNote) => {
    const days = calculateBusinessDays(newStartDate, newEndDate);
    if (days <= 0) return false;

    const newEvent = {
      id: Date.now(),
      devName: newDevName,
      type: newAbsenceType,
      startDate: newStartDate,
      endDate: newEndDate,
      days,
      note: newNote.trim() || (newAbsenceType === 'SICK' ? 'Incapacidad Médica' : 'Vacaciones')
    };

    const updated = [...absenceEvents, newEvent];
    setAbsenceEvents(updated);
    recalculateFromEvents(updated);
    return true;
  };

  const handleUpdateAbsenceEvent = (id, updatedFields) => {
    const updated = absenceEvents.map(ev => {
      if (ev.id !== id) return ev;
      const startDate = updatedFields.startDate || ev.startDate;
      const endDate = updatedFields.endDate || ev.endDate;
      const days = calculateBusinessDays(startDate, endDate);
      return {
        ...ev,
        ...updatedFields,
        days: days > 0 ? days : ev.days
      };
    });
    setAbsenceEvents(updated);
    recalculateFromEvents(updated);
  };

  const handleRemoveEvent = (id) => {
    const updated = absenceEvents.filter(ev => ev.id !== id);
    setAbsenceEvents(updated);
    recalculateFromEvents(updated);
  };

  const handleReassignTask = (taskKey, newAssignee) => {
    setJiraTasks(prevTasks => 
      prevTasks.map(task => 
        task.key === taskKey ? { ...task, assignee: newAssignee } : task
      )
    );
  };

  const handleResetScenarios = () => {
    setAbsenceEvents([]);
    setSickDevsCount(0); 
    setSickDays(0); 
    setVacationDays(0); 
  };

  // Cálculos matemáticos del simulador
  const theoreticalDays = (devCount || 1) * (sprintDays || 1);
  const absenceDays = (vacationDays || 0) + ((sickDevsCount || 0) * (sickDays || 0));
  const netDays = Math.max(0, theoreticalDays - absenceDays);
  
  const standardCapacitySP = (devCount || 1) * (avgDevVelocity || 10);
  const ratio = theoreticalDays > 0 ? (netDays / theoreticalDays) : 1;
  const adjustedCapacitySP = Math.round(standardCapacitySP * ratio);
  
  const spDiff = adjustedCapacitySP - standardCapacitySP;
  const spDiffPct = standardCapacitySP > 0 ? Math.round((spDiff / standardCapacitySP) * 100) : 0;
  const impactPct = Math.abs(spDiffPct);

  // Nivel de impacto y diagnóstico
  let impactBadgeText = 'IMPACTO MANEJABLE (<15%)';
  let impactBadgeStyle = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
  let barColor = 'bg-emerald-500';
  let diagnosticText = 'Capacidad Normal: El equipo cuenta con margen para absorber la carga de trabajo planificada con redistribución interna ligera entre los desarrolladores activos.';

  if (impactPct >= 15 && impactPct < 30) {
    impactBadgeText = 'IMPACTO MODERADO (15-30%)';
    impactBadgeStyle = 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
    barColor = 'bg-amber-500';
    diagnosticText = 'Alerta Moderada: Se recomienda reajustar el compromiso del sprint removiendo 1 o 2 tareas de menor prioridad.';
  } else if (impactPct >= 30) {
    impactBadgeText = 'IMPACTO CRÍTICO (>30%)';
    impactBadgeStyle = 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
    barColor = 'bg-rose-500';
    diagnosticText = 'Riesgo Severo: Se requiere despriorizar historias principales y negociar el alcance del sprint con el Product Owner.';
  }

  const results = {
    theoreticalDays,
    netDays,
    standardCapacitySP,
    adjustedCapacitySP,
    spDiff,
    spDiffPct,
    impactPct,
    impactBadgeText,
    impactBadgeStyle,
    barColor,
    diagnosticText
  };

  // Filtrado de incidencias Jira
  let filteredTasks = jiraTasks;
  if (selectedTaskProject !== 'ALL') {
    filteredTasks = filteredTasks.filter(item => item.projectId === selectedTaskProject);
  }
  if (taskStatusTab !== 'ALL') {
    filteredTasks = filteredTasks.filter(item => item.status === taskStatusTab);
  }
  if (taskSearchTerm.trim()) {
    const query = taskSearchTerm.toLowerCase();
    filteredTasks = filteredTasks.filter(item => 
      item.key.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.assignee.toLowerCase().includes(query) ||
      item.project.toLowerCase().includes(query)
    );
  }

  return {
    devCount, setDevCount,
    sprintDays, setSprintDays,
    vacationDays, setVacationDays,
    sickDevsCount, setSickDevsCount,
    sickDays, setSickDays,
    avgDevVelocity, setAvgDevVelocity,
    isCollapsed, setIsCollapsed,
    absenceEvents,
    jiraTasks,
    taskStatusTab, setTaskStatusTab,
    taskSearchTerm, setTaskSearchTerm,
    selectedTaskProject, setSelectedTaskProject,
    handleAddAbsenceEvent,
    handleUpdateAbsenceEvent,
    handleRemoveEvent,
    handleReassignTask,
    handleResetScenarios,
    results,
    filteredTasks
  };
}
