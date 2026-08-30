import { useState, useEffect } from 'react';
import { developerService } from '../../../services/api';

export function useTeamMatrix(selectedProjectId) {
  const [loading, setLoading] = useState(true);
  const [matrixData, setMatrixData] = useState(null);
  const [selectedDevDetail, setSelectedDevDetail] = useState(null);

  useEffect(() => {
    setLoading(true);
    developerService.getTeamMatrix(selectedProjectId)
      .then((data) => {
        setMatrixData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener la matriz de equipo:", err);
        setLoading(false);
      });
  }, [selectedProjectId]);

  const teamSummary = matrixData?.team_summary || {};
  const developers = matrixData?.developers || [];
  const topPerformer = teamSummary.top_performer;
  const conteo = teamSummary.conteo_cuadrantes || {};

  return {
    loading,
    matrixData,
    selectedDevDetail,
    setSelectedDevDetail,
    teamSummary,
    developers,
    topPerformer,
    conteo
  };
}
