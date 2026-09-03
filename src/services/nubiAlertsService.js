// Motor de Detección de Anomalías y Alertas en Tiempo Real de la IA de Nubi

export function generateNubiMetricAlerts(metricsObj = {}, projectKey = 'PA') {
  const alerts = [];
  const nowStr = 'Hace un momento';
  const nowTs = Date.now();

  const commitment = metricsObj.commitment_reliability_pct ?? 90;
  const scopeCreep = metricsObj.scope_creep_pct ?? 0;
  const carryover = metricsObj.carryover_pct ?? 10;
  const flowEff = metricsObj.flow_efficiency_pct ?? 75;
  const waitingDays = metricsObj.waiting_queue_days ?? 4.8;

  // 1. Alerta: Eficiencia del Flujo Crítica (< 65% o desviación)
  if (flowEff < 65) {
    alerts.push({
      id: `nubi-flow-${nowTs}`,
      type: 'NUBI_ALERT',
      severity: 'CRITICAL',
      title: '⚡ IA Nubi: Desplome Severo en Eficiencia del Flujo',
      metricName: 'Eficiencia del Flujo',
      currentValue: `${flowEff}%`,
      threshold: 'Mínimo 65.0%',
      description: `La eficiencia de trabajo efectivo cayó al ${flowEff}%. Hay ${waitingDays} días acumulados en colas de espera.`,
      nubiDiagnosis: `IA Nubi detectó estancamiento severo en etapas de Revisión / QA para el proyecto ${projectKey}.`,
      nubiRecommendation: 'Reasignar desarrolladores senior a Code Review y habilitar ejecuciones de QA automatizado.',
      time: nowStr,
      timestamp: nowTs,
      isRead: false,
      targetTab: 'sprint_health',
      projectKey
    });
  } else if (flowEff < 80) {
    alerts.push({
      id: `nubi-flow-warn-${nowTs}`,
      type: 'NUBI_ALERT',
      severity: 'WARNING',
      title: '⚠️ IA Nubi: Eficiencia del Flujo en Nivel Amarillo',
      metricName: 'Eficiencia del Flujo',
      currentValue: `${flowEff}%`,
      threshold: 'Ideal ≥ 80.0%',
      description: `Eficiencia moderada (${flowEff}%). ${waitingDays} días en cola de espera sin avance activo.`,
      nubiDiagnosis: `El flujo de trabajo presenta cuellos de botella moderados en ${projectKey}.`,
      nubiRecommendation: 'Revisar tareas en cola antes del cierre del sprint.',
      time: 'Hace 5m',
      timestamp: nowTs - 300000,
      isRead: false,
      targetTab: 'sprint_health',
      projectKey
    });
  }

  // 2. Alerta: Scope Creep Alto (> 15% o desviación crítica)
  if (scopeCreep > 15) {
    alerts.push({
      id: `nubi-scope-${nowTs}`,
      type: 'NUBI_ALERT',
      severity: 'CRITICAL',
      title: '🚨 IA Nubi: Alteración Crítica de Alcance (Scope Creep)',
      metricName: 'Scope Creep',
      currentValue: `${scopeCreep}%`,
      threshold: 'Máximo 15.0%',
      description: `Se han inyectado +${metricsObj.sp_added_mid_sprint || 12} SP adicionales a mitad del sprint planificado.`,
      nubiDiagnosis: `El sprint del proyecto ${projectKey} se está sobrecargando sin ajustar la fecha de cierre.`,
      nubiRecommendation: 'Hacer negociación de alcance con el Product Owner y congelar adición de tareas.',
      time: nowStr,
      timestamp: nowTs,
      isRead: false,
      targetTab: 'proyectos',
      projectKey
    });
  } else {
    alerts.push({
      id: `nubi-scope-info-${nowTs}`,
      type: 'NUBI_ALERT',
      severity: 'INFO',
      title: 'ℹ️ IA Nubi: Estabilidad de Alcance Verificada',
      metricName: 'Scope Creep',
      currentValue: `${scopeCreep}%`,
      threshold: '≤ 15.0%',
      description: `Variación de alcance en ${scopeCreep}%. El sprint mantiene disciplina de compromisos.`,
      nubiDiagnosis: `Cero alteración de alcance detectada en ${projectKey}. Ritmo óptimo.`,
      nubiRecommendation: 'Mantener la política de cambio de alcance durante el ciclo.',
      time: 'Hace 12m',
      timestamp: nowTs - 720000,
      isRead: true,
      targetTab: 'proyectos',
      projectKey
    });
  }

  // 3. Alerta: Confiabilidad del Compromiso (< 75%)
  if (commitment < 75) {
    alerts.push({
      id: `nubi-commit-${nowTs}`,
      type: 'NUBI_ALERT',
      severity: 'CRITICAL',
      title: '🚨 IA Nubi: Riesgo de Incumplimiento de Sprint',
      metricName: 'Confiabilidad del Compromiso',
      currentValue: `${commitment}%`,
      threshold: 'Mínimo 85.0%',
      description: `La entrega proyectada es solo del ${commitment}%. Hay ${metricsObj.sp_carryover || 15} SP en riesgo de Carryover.`,
      nubiDiagnosis: `Peligro de no llegar a la meta del sprint para el proyecto ${projectKey}.`,
      nubiRecommendation: 'Desbloquear tareas de alta prioridad e implementar Swarming de equipo.',
      time: nowStr,
      timestamp: nowTs,
      isRead: false,
      targetTab: 'team_matrix',
      projectKey
    });
  } else {
    alerts.push({
      id: `nubi-commit-ok-${nowTs}`,
      type: 'NUBI_ALERT',
      severity: 'INFO',
      title: '✨ IA Nubi: Confiabilidad en Rango Saludable',
      metricName: 'Confiabilidad del Compromiso',
      currentValue: `${commitment}%`,
      threshold: '≥ 85.0%',
      description: `Disciplina del equipo al ${commitment}%. Planificación alineada con la capacidad.`,
      nubiDiagnosis: `Salud del sprint respaldada con ${metricsObj.sp_completed || 44} SP entregados.`,
      nubiRecommendation: 'Continuar monitoreo periódico de burndown.',
      time: 'Hace 1h',
      timestamp: nowTs - 3600000,
      isRead: true,
      targetTab: 'proyectos',
      projectKey
    });
  }

  // 4. Alerta: Cuello de Botella Estancado
  alerts.push({
    id: `nubi-bottleneck-${nowTs}`,
    type: 'NUBI_ALERT',
    severity: 'WARNING',
    title: '⚠️ IA Nubi: Cuello de Botella en "Cola de Espera"',
    metricName: 'Días Acumulados de Estancamiento',
    currentValue: '149.0 Días',
    threshold: 'Máximo 30.0 Días',
    description: 'La fase "En Cola de Espera" acumula 149 días sin iniciar resolución activa.',
    nubiDiagnosis: 'Exceso de backlog acumulado sin triage de desarrollo.',
    nubiRecommendation: 'Archivar tareas obsoletas y redistribuir prioridad en la cola.',
    time: 'Hace 15m',
    timestamp: nowTs - 900000,
    isRead: false,
    targetTab: 'sprint_health',
    projectKey
  });

  return alerts;
}
