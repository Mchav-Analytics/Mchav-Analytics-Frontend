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
import NubiDevAnalysisModal from '../components/NubiDevAnalysisModal';

function TeamMatrixView({
  selectedProjectId = 'PROJ-01',
  onSelectProject,
  onSelectDevForScorecard,
  onNavigateToHealth,
  isDarkMode
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [aiAnalysisDev, setAiAnalysisDev] = useState(null);

  const { dbProjects: allProjects = [] } = useProjectsData();

  const handleSelectProject = (newId) => {
    if (onSelectProject) {
      onSelectProject(newId);
    }
  };

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
  } = useTeamMatrix(selectedProjectId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Calculando métricas de la Matriz 4 Cuadrantes para {selectedProjectId}...</p>
        </div>
      </div>
    );
  }

  const selectedProjObj = allProjects.find(p => (p.id || p.id_proyecto) === selectedProjectId);
  const selectedProjName = selectedProjObj?.name || selectedProjObj?.nombre || selectedProjectId;

  return (
    <div className="space-y-6 pb-12 font-sans text-left">

      {/* BARRA SUPERIOR DE MATRIZ DE EQUIPO CON SELECTOR DE EQUIPO JIRA */}
      <TeamMatrixHeader
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
        allProjects={allProjects}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* BARRA DE NAVEGACIÓN Y ACCESO RÁPIDO POR EQUIPO (PROYECTO JIRA) */}
      <TeamMatrixNav 
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
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

      {/* TABLA DE LEADERBOARD DE EQUIPO CON BOTÓN DE ANÁLISIS NUBI IA */}
      <TeamMatrixLeaderboard 
        developers={developers}
        teamSummary={teamSummary}
        onSelectDevForScorecard={onSelectDevForScorecard}
        onOpenAiAnalysis={(dev) => setAiAnalysisDev(dev)}
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

      {/* MODAL DE DIAGNÓSTICO E INTEGRACIÓN NUBI IA POR DESARROLLADOR */}
      {aiAnalysisDev && (
        <NubiDevAnalysisModal
          isOpen={Boolean(aiAnalysisDev)}
          onClose={() => setAiAnalysisDev(null)}
          developer={aiAnalysisDev}
          onSelectDevForScorecard={onSelectDevForScorecard}
        />
      )}

    </div>
  );
}

export default TeamMatrixView;

