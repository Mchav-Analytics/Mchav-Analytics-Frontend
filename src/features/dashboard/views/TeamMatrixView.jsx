import React from 'react';
import { useTeamMatrix } from '../hooks/useTeamMatrix';

// Componentes extraídos
import TeamMatrixHeader from '../components/TeamMatrixHeader';
import TeamMatrixNav from '../components/TeamMatrixNav';
import TeamMatrixKpis from '../components/TeamMatrixKpis';
import FourQuadrantChart from '../components/FourQuadrantChart';
import TeamMatrixLeaderboard from '../components/TeamMatrixLeaderboard';

function TeamMatrixView({ selectedProjectId = 'PROJ-01', onSelectDevForScorecard, onNavigateToHealth, isDarkMode }) {
  const {
    loading,
    selectedDevDetail,
    setSelectedDevDetail,
    teamSummary,
    developers,
    topPerformer,
    conteo
  } = useTeamMatrix(selectedProjectId);

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

  return (
    <div className="space-y-6 pb-12 font-sans text-left">

      {/* BARRA SUPERIOR DE MATRIZ DE EQUIPO */}
      <TeamMatrixHeader />

      {/* BARRA DE NAVEGACIÓN Y ACCESO RÁPIDO */}
      <TeamMatrixNav 
        selectedProjectId={selectedProjectId}
        onNavigateToHealth={onNavigateToHealth}
        onSelectDevForScorecard={onSelectDevForScorecard}
        topPerformer={topPerformer}
      />

      {/* TARJETAS DE KPIS COMPARATIVOS */}
      <TeamMatrixKpis 
        teamSummary={teamSummary}
        developers={developers}
        conteo={conteo}
      />

      {/* SECCIÓN DEL GRÁFICO DE 4 CUADRANTES */}
      <div className="space-y-3">
        <FourQuadrantChart
          developers={developers}
          isDarkMode={isDarkMode}
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

    </div>
  );
}

export default TeamMatrixView;
