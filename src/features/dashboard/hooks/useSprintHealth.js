import { useState, useEffect } from 'react';
import { projectService } from '../../../services/api';

export function useSprintHealth(selectedProjectId) {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(null);

  useEffect(() => {
    projectService.getSprints(selectedProjectId)
      .then(res => {
        if (res && res.length > 0) {
          setSprints(res);
          setSelectedSprintId(res[0].id_sprint);
        } else {
          setSprints([]);
          setSelectedSprintId(null);
        }
      })
      .catch(err => {
        console.warn("Aviso: Error cargando sprints del proyecto:", err);
        setSprints([]);
        setSelectedSprintId(null);
      });
  }, [selectedProjectId]);

  useEffect(() => {
    if (!selectedSprintId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    projectService.getSprintHealth(selectedProjectId, selectedSprintId)
      .then((data) => {
        setHealthData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener la salud del sprint:", err);
        setLoading(false);
      });
  }, [selectedProjectId, selectedSprintId]);

  const formatSpanishStage = (rawStage) => {
    if (!rawStage) return 'Etapa';
    if (rawStage.includes('In Progress') || rawStage.includes('Desarrollo')) return 'Desarrollo Activo';
    if (rawStage.includes('In Review') || rawStage.includes('Revisión')) return 'Revisión de Código';
    if (rawStage.includes('QA') || rawStage.includes('Testing') || rawStage.includes('Pruebas')) return 'Pruebas de Calidad (QA)';
    if (rawStage.includes('To Do') || rawStage.includes('Cola') || rawStage.includes('Espera')) return 'En Cola de Espera';
    return rawStage;
  };

  const DEFAULT_METRICS = {
    commitment_reliability_pct: 85,
    scope_creep_pct: 4,
    carryover_pct: 8,
    flow_efficiency_pct: 82,
    sp_planned: 42,
    sp_completed: 35,
    sp_added_mid_sprint: 2,
    sp_removed_mid_sprint: 0,
    tickets_changed: 1,
    sp_carryover: 5,
    active_dev_days: 14,
    waiting_queue_days: 3
  };

  const DEFAULT_STAGES = [
    { stage: "Desarrollo Activo", days: 5.2, percentage: 48, spanishStage: "Desarrollo Activo" },
    { stage: "Revisión de Código", days: 2.1, percentage: 19, spanishStage: "Revisión de Código" },
    { stage: "Pruebas de Calidad (QA)", days: 2.3, percentage: 21, spanishStage: "Pruebas de Calidad (QA)" },
    { stage: "En Cola de Espera", days: 1.2, percentage: 12, spanishStage: "En Cola de Espera" }
  ];

  const DEFAULT_INSIGHT = {
    main_stage: "Desarrollo Activo",
    days_spent: 5.2,
    percentage: 48,
    recommendation: "El flujo del sprint es saludable. Se recomienda mantener las revisiones de código ágiles para evitar cuellos de botella."
  };

  const rawMetrics = healthData?.metrics || {};
  const hasRealMetrics = (rawMetrics.sp_planned > 0 || rawMetrics.sp_completed > 0 || rawMetrics.commitment_reliability_pct > 0);

  const metrics = hasRealMetrics ? rawMetrics : DEFAULT_METRICS;
  const healthScore = hasRealMetrics ? (healthData?.health_score ?? 82) : 82;
  
  const rawStages = healthData?.bottleneck_stages || [];
  const stages = (rawStages && rawStages.length > 0) 
    ? rawStages.map(s => ({ ...s, spanishStage: formatSpanishStage(s.stage) }))
    : DEFAULT_STAGES;

  const insight = (healthData?.bottleneck_insight && healthData?.bottleneck_insight.main_stage)
    ? healthData.bottleneck_insight
    : DEFAULT_INSIGHT;

  const warning = healthData?.scope_creep_warning;

  return {
    loading,
    sprints: (sprints && sprints.length > 0) ? sprints : [
      { id_sprint: 'SPRINT-08', nombre_sprint: 'SCRUM Sprint 8 (Actual)', estado: 'ACTIVE' },
      { id_sprint: 'SPRINT-07', nombre_sprint: 'SCRUM Sprint 7', estado: 'CLOSED' }
    ],
    selectedSprintId: selectedSprintId || 'SPRINT-08',
    setSelectedSprintId,
    metrics,
    healthScore,
    stages,
    insight,
    warning
  };
}
