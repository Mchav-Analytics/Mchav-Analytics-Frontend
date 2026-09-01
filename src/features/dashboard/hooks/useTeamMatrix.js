import { useState, useEffect, useCallback } from 'react';
import { developerService } from '../../../services/api';

export function useTeamMatrix(selectedProjectId) {
  const [loading, setLoading] = useState(true);
  const [matrixData, setMatrixData] = useState(null);
  const [selectedDevDetail, setSelectedDevDetail] = useState(null);
  const [activeThreshold, setActiveThreshold] = useState(80);
  const [activeWeights, setActiveWeights] = useState({ w_tp: 25, w_sp: 20, w_ct: 20, w_com: 20, w_qual: 15 });
  const [activeModelName, setActiveModelName] = useState('Modelo Estándar MCHAV');

  const fetchMatrix = useCallback((extraParams = {}) => {
    setLoading(true);
    developerService.getTeamMatrix(selectedProjectId, null, extraParams)
      .then((data) => {
        setMatrixData(data);
        if (data?.matrix_config) {
          if (data.matrix_config.quality_threshold) {
            setActiveThreshold(Number(data.matrix_config.quality_threshold));
          }
          if (data.matrix_config.weights) {
            setActiveWeights(data.matrix_config.weights);
          }
          if (data.matrix_config.nombre_modelo) {
            setActiveModelName(data.matrix_config.nombre_modelo);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener la matriz de equipo:", err);
        setLoading(false);
      });
  }, [selectedProjectId]);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  const saveConfig = async (configData) => {
    try {
      const res = await developerService.saveMatrixConfig(selectedProjectId, configData);
      if (res?.config) {
        setActiveThreshold(res.config.quality_threshold);
        setActiveWeights(res.config.weights);
        if (res.config.nombre_modelo) setActiveModelName(res.config.nombre_modelo);
      }
      fetchMatrix({
        quality_threshold: configData.quality_threshold,
        w_tp: configData.weight_throughput,
        w_sp: configData.weight_velocity,
        w_ct: configData.weight_cycletime,
        w_com: configData.weight_commitment,
        w_qual: configData.weight_quality
      });
      return res;
    } catch (err) {
      console.error("Error guardando configuración de la matriz:", err);
      throw err;
    }
  };

  const applyPreview = ({ threshold, weights }) => {
    setActiveThreshold(threshold);
    if (weights) setActiveWeights(weights);
    fetchMatrix({
      quality_threshold: threshold,
      w_tp: weights?.w_tp,
      w_sp: weights?.w_sp,
      w_ct: weights?.w_ct,
      w_com: weights?.w_com,
      w_qual: weights?.w_qual
    });
  };

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
    conteo,
    activeThreshold,
    activeWeights,
    activeModelName,
    saveConfig,
    applyPreview,
    refetch: fetchMatrix
  };
}
