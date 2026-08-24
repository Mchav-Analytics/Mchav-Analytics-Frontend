// src/features/dashboard/utils/agendaLogic.js
// Lógica de negocio unificada para Mi Agenda de Hoy y motor de recomendaciones de NUBIIA

export const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateLocal = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
};

export const addDays = (dateStr, days) => {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Obtiene la fecha asignada a una tarea en la agenda.
 */
export const getTaskDate = (task, selectedDate, todayStr, taskDates = {}) => {
  if (taskDates[task.key]) return taskDates[task.key];
  if (task.status === 'FINALIZADO' && task.resolved_at) return task.resolved_at;
  if (task.status !== 'FINALIZADO') {
    // Si la fecha seleccionada es hoy, las tareas activas sin fecha fija pertenecen a hoy
    if (selectedDate === todayStr) return todayStr;
    if (task.dueDate === selectedDate) return selectedDate;
    if (task.created_at === selectedDate) return selectedDate;
    return todayStr;
  }
  if (task.dueDate) return task.dueDate;
  if (task.created_at) return task.created_at;
  return null;
};

/**
 * Determina si una tarea está estrictamente ATRASADA.
 * REGLA: dueDate < fechaSeleccionada && estado !== 'FINALIZADO'
 * Si dueDate es null, vacío o >= fechaSeleccionada, NUNCA está atrasada.
 */
export const isTaskOverdue = (task, selectedDate) => {
  if (!task.dueDate) return false;
  if (task.status === 'FINALIZADO') return false;
  return task.dueDate < selectedDate;
};

/**
 * Clasifica todas las tareas para la fecha seleccionada de forma determinística y unificada.
 */
export const classifyAgendaTasks = (tasks = [], selectedDate, taskDates = {}) => {
  const todayStr = getTodayStr();

  // 1. Tareas de hoy (para la fecha seleccionada)
  const todayTasks = tasks.filter(t => {
    if (taskDates[t.key]) return taskDates[t.key] === selectedDate;
    if (t.status === 'FINALIZADO') {
      return (t.resolved_at || t.created_at || todayStr) === selectedDate;
    }
    // Tareas activas (pendientes / en curso)
    if (selectedDate === todayStr) return true;
    if (t.dueDate === selectedDate) return true;
    if (t.created_at === selectedDate) return true;
    return false;
  });

  // 2. Tareas Atrasadas: dueDate < selectedDate && estado !== FINALIZADO
  const overdueTasks = tasks.filter(t => isTaskOverdue(t, selectedDate));

  // 3. Tareas Próximas a Vencer: dueDate en [selectedDate, selectedDate + 2 días] y no atrasadas ni finalizadas
  const tomorrowStr = addDays(selectedDate, 1);
  const dayAfterStr = addDays(selectedDate, 2);
  const upcomingTasks = tasks.filter(t => {
    if (t.status === 'FINALIZADO') return false;
    if (!t.dueDate) return false;
    if (t.dueDate < selectedDate) return false;
    return t.dueDate === selectedDate || t.dueDate === tomorrowStr || t.dueDate === dayAfterStr;
  });

  // 4. Métricas de la jornada
  const completedToday = todayTasks.filter(t => t.status === 'FINALIZADO');
  const pendingToday = todayTasks.filter(t => t.status !== 'FINALIZADO');
  
  const priorityWeights = { 'Crítica': 4, 'Critical': 4, 'Highest': 4, 'Alta': 3, 'High': 3, 'Media': 2, 'Medium': 2, 'Baja': 1, 'Low': 1 };
  
  const criticalOrHigh = pendingToday.filter(t => (priorityWeights[t.priority] || 2) >= 3);
  const totalSPPending = pendingToday.reduce((acc, t) => acc + (parseFloat(t.sp) || 0), 0);

  const totalToday = todayTasks.length;
  const progressPct = totalToday > 0 ? Math.round((completedToday.length / totalToday) * 100) : 0;

  return {
    todayTasks,
    overdueTasks,
    upcomingTasks,
    completedToday,
    pendingToday,
    criticalOrHigh,
    totalSPPending,
    totalToday,
    progressPct,
    todayStr,
    priorityWeights
  };
};

/**
 * Motor de análisis de NUBIIA: genera una recomendación orientada a la acción.
 * Responde siempre: "¿Qué debería hacer ahora?" sin repetir conteos visibles.
 */
export const getNubiaAnalysis = (classification, selectedDate, projectName = 'Proyecto') => {
  const {
    todayTasks,
    overdueTasks,
    upcomingTasks,
    completedToday,
    pendingToday,
    criticalOrHigh,
    totalSPPending,
    totalToday,
    todayStr,
    priorityWeights
  } = classification;

  const isPast = selectedDate < todayStr;
  const isFuture = selectedDate > todayStr;
  const tomorrowStr = addDays(selectedDate, 1);

  // Ordenador de tareas por importancia: Prioridad > SP > Vencimiento
  const sortTasksByImportance = (taskList) => {
    return [...taskList].sort((a, b) => {
      const pDiff = (priorityWeights[b.priority] || 2) - (priorityWeights[a.priority] || 2);
      if (pDiff !== 0) return pDiff;
      const spDiff = (parseFloat(b.sp) || 0) - (parseFloat(a.sp) || 0);
      if (spDiff !== 0) return spDiff;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      return 0;
    });
  };

  // CASO A: Fecha en el pasado
  if (isPast) {
    if (totalToday === 0) {
      return {
        message: `No hubo actividades registradas en tu agenda para el ${formatDateLocal(selectedDate)}.`,
        topTask: null,
        actionLabel: null
      };
    }
    if (pendingToday.length === 0) {
      return {
        message: `El ${formatDateLocal(selectedDate)} completaste con éxito todas tus tareas programadas. ¡Jornada impecable!`,
        topTask: null,
        actionLabel: null
      };
    }
    return {
      message: `En esta fecha quedaron ${pendingToday.length} actividades sin concluir, las cuales continúan disponibles en tu flujo de trabajo.`,
      topTask: pendingToday[0],
      actionLabel: `Ver ${pendingToday[0].key}`
    };
  }

  // CASO B: Fecha en el futuro
  if (isFuture) {
    if (totalToday === 0) {
      return {
        message: `Aún no tienes tareas programadas para el ${formatDateLocal(selectedDate)}. Puedes planificar nuevas entregas en ${projectName}.`,
        topTask: null,
        actionLabel: null
      };
    }
    const topFuture = sortTasksByImportance(pendingToday)[0] || todayTasks[0];
    if (criticalOrHigh.length > 0) {
      return {
        message: `Para esta fecha tienes programada la tarea crítica ${topFuture.key}. Prepárate para abordarla como primera prioridad.`,
        topTask: topFuture,
        actionLabel: `Ver ${topFuture.key}`
      };
    }
    return {
      message: `Tienes planificadas actividades para esta jornada. Te sugiero tener presente ${topFuture.key} (${topFuture.sp} SP) al iniciar el día.`,
      topTask: topFuture,
      actionLabel: `Ver ${topFuture.key}`
    };
  }

  // --- CASOS PARA EL DÍA DE HOY ---

  // 1. Tarea Atrasada Real (dueDate < selectedDate && !completada)
  if (overdueTasks.length > 0) {
    const topOverdue = sortTasksByImportance(overdueTasks)[0];
    return {
      message: `Tienes la tarea ${topOverdue.key} que ya superó su fecha de vencimiento. Te recomiendo atenderla antes de continuar con nuevas actividades.`,
      topTask: topOverdue,
      actionLabel: `Ver ${topOverdue.key}`
    };
  }

  // 2. Tarea Próxima a Vencer (vence hoy o mañana en el sprint)
  if (upcomingTasks.length > 0) {
    const topUpcoming = sortTasksByImportance(upcomingTasks)[0];
    const isTodayDue = topUpcoming.dueDate === selectedDate;
    const isTomorrowDue = topUpcoming.dueDate === tomorrowStr;
    const timeLabel = isTodayDue ? 'hoy' : (isTomorrowDue ? 'mañana' : `el ${topUpcoming.dueDate}`);
    return {
      message: `La tarea ${topUpcoming.key} tiene entrega programada para ${timeLabel}. Priorízala para asegurar su cierre a tiempo en el sprint.`,
      topTask: topUpcoming,
      actionLabel: `Ver ${topUpcoming.key}`
    };
  }

  // 3. Tareas Críticas / Alta Prioridad
  if (criticalOrHigh.length > 0) {
    const topCritical = sortTasksByImportance(criticalOrHigh)[0];
    return {
      message: `Hay una tarea de alta prioridad (${topCritical.key}: "${topCritical.text}"). Te recomiendo concentrarte primero en ella para destrabar el avance.`,
      topTask: topCritical,
      actionLabel: `Ver ${topCritical.key}`
    };
  }

  // 4. Carga de trabajo alta (>= 4 tareas pendientes o >= 12 SP)
  if (pendingToday.length >= 4 || totalSPPending >= 12) {
    const topPending = sortTasksByImportance(pendingToday)[0];
    return {
      message: `Tu carga de trabajo de hoy es alta. Empieza por ${topPending.key} (${topPending.sp} SP) y avanza progresivamente con las de menor prioridad.`,
      topTask: topPending,
      actionLabel: `Ver ${topPending.key}`
    };
  }

  // 5. Tareas pendientes estándar del día
  if (pendingToday.length > 0) {
    const topPending = sortTasksByImportance(pendingToday)[0];
    return {
      message: `¡Vas al día! No tienes tareas atrasadas. Te sugiero continuar con ${topPending.key} (${topPending.text}) para mantener un ritmo constante.`,
      topTask: topPending,
      actionLabel: `Ver ${topPending.key}`
    };
  }

  // 6. Todas las tareas de hoy están completadas
  if (completedToday.length > 0 && totalToday === completedToday.length) {
    return {
      message: `¡Excelente trabajo! Has completado todas tus tareas de hoy. Es un buen momento para apoyar en revisiones o adelantar entregas del sprint.`,
      topTask: null,
      actionLabel: null
    };
  }

  // 7. Agenda libre / sin tareas
  return {
    message: `Tu agenda está libre por ahora. Es un buen momento para revisar tus pendientes o avanzar en una tarea del sprint en ${projectName}.`,
    topTask: null,
    actionLabel: null
  };
};
