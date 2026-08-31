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

  const metrics = healthData?.metrics || {};
  const healthScore = healthData?.health_score ?? 0;
  const rawStages = healthData?.bottleneck_stages || [];
  const stages = rawStages.map(s => ({
    ...s,
    spanishStage: formatSpanishStage(s.stage)
  }));
  const insight = healthData?.bottleneck_insight || {};
  const warning = healthData?.scope_creep_warning;

  return {
    loading,
    sprints,
    selectedSprintId,
    setSelectedSprintId,
    metrics,
    healthScore,
    stages,
    insight,
    warning
  };
}
