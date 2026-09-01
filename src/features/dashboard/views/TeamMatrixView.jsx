import React, { useState } from 'react';
import { useTeamMatrix } from '../hooks/useTeamMatrix';
import { useProjectsData } from '../../../hooks/useProjectsData';

// Componentes extraídos
import TeamMatrixHeader from '../components/TeamMatrixHeader';
import TeamMatrixNav from '../components/TeamMatrixNav';
import TeamMatrixKpis from '../components/TeamMatrixKpis';
import FourQuadrantChart from '../components/FourQuadrantChart';
import TeamMatrixLeaderboard from '../components/TeamMatrixLeaderboard';
import MatrixSettingsModal from '../components/MatrixSettingsModal';
import MatrixMethodologyGuide from '../components/MatrixMethodologyGuide';

function TeamMatrixView({
  selectedProjectId: initialProjectId = 'PROJ-01',
  onSelectDevForScorecard,
  onNavigateToHealth,
  isDarkMode
}) {
  const [currentProjectId, setCurrentProjectId] = useState(initialProjectId);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const { projects: allProjects } = useProjectsData();

  const {
    loading,
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
    applyPreview
  } = useTeamMatrix(currentProjectId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Generando Matriz Comparativa de Equipo...</p>
        </div>
      </div>
    );
  }

  const selectedProjObj = allProjects.find(p => (p.id || p.id_proyecto) === currentProjectId);
  const selectedProjName = selectedProjObj?.name || selectedProjObj?.nombre || currentProjectId;

  return (
    <div className="space-y-6 pb-12 font-sans text-left">

      {/* BARRA SUPERIOR DE MATRIZ DE EQUIPO */}
      <TeamMatrixHeader
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* BARRA DE NAVEGACIÓN Y ACCESO RÁPIDO POR EQUIPO (PROYECTO JIRA) */}
      <TeamMatrixNav 
        selectedProjectId={currentProjectId}
        onSelectProject={(newId) => setCurrentProjectId(newId)}
        allProjects={allProjects}
        onNavigateToHealth={onNavigateToHealth}
        onSelectDevForScorecard={onSelectDevForScorecard}
        topPerformer={topPerformer}
        qualityThreshold={activeThreshold}
        activeModelName={activeModelName}
      />

      {/* TARJETAS DE KPIS COMPARATIVOS */}
      <TeamMatrixKpis 
        teamSummary={teamSummary}
        developers={developers}
        conteo={conteo}
      />

      {/* SECCIÓN DEL GRÁFICO DE 4 CUADRANTES CON UMBRAL DINÁMICO */}
      <div className="space-y-3">
        <FourQuadrantChart
          developers={developers}
          isDarkMode={isDarkMode}
          qualityThreshold={activeThreshold}
          onSelectDev={(dev) => {
            setSelectedDevDetail(dev);
            if (onSelectDevForScorecard) onSelectDevForScorecard(dev.assignee_id);
          }}
        />
      </div>

      {/* TABLA DE LEADERBOARD DE EQUIPO CON EXPLICACIÓN DE RESULTADOS */}
      <TeamMatrixLeaderboard 
        developers={developers}
        teamSummary={teamSummary}
        onSelectDevForScorecard={onSelectDevForScorecard}
      />

      {/* MODAL DE CONFIGURACIÓN DE UMBRALES Y PONDERACIONES */}
      <MatrixSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialThreshold={activeThreshold}
        initialWeights={activeWeights}
        selectedProjectName={selectedProjName}
        onSaveConfig={(cfgData) => saveConfig(cfgData)}
        onApplyPreview={(previewData) => applyPreview(previewData)}
      />

      {/* MODAL DE METODOLOGÍA Y ESPECIFICACIÓN DE FÓRMULAS */}
      <MatrixMethodologyGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

    </div>
  );
}

export default TeamMatrixView;

