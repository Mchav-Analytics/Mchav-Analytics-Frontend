import React from 'react';
import { useTeamScorecards } from '../hooks/useTeamScorecards';

// Componentes extraídos
import TeamDevScorecardsHeader from '../components/TeamDevScorecardsHeader';
import TeamDevScorecardsNav from '../components/TeamDevScorecardsNav';
import TeamDevSelector from '../components/TeamDevSelector';
import TeamDevScorecardsDashboard from '../components/TeamDevScorecardsDashboard';
import TeamDevAssignedIssues from '../components/TeamDevAssignedIssues';

export default function TeamDevScorecardsView({ selectedProjectId = 'PROJ-01', onNavigateToMatrix, onNavigateToHealth, onNavigateToAlerts }) {
  const {
    developers,
    selectedDev,
    setSelectedDev,
    scorecard,
    loadingDevs,
    loadingCard,
    searchFilter,
    setSearchFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredDevs
  } = useTeamScorecards(selectedProjectId);

  const assignedIssuesList = scorecard?.assigned_issues || [];

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-8 py-4 text-left font-sans min-h-[85vh] flex flex-col justify-between">
      
      {/* ENCABEZADO PRINCIPAL PARA ADMINISTRADOR */}
      <TeamDevScorecardsHeader onNavigateToMatrix={onNavigateToMatrix} />

      {/* BARRA DE NAVEGACIÓN Y ACCESO RÁPIDO */}
      <TeamDevScorecardsNav 
        selectedProjectId={selectedProjectId}
        onNavigateToMatrix={onNavigateToMatrix}
        onNavigateToHealth={onNavigateToHealth}
      />

      {/* SELECTOR DE DESARROLLADORES (CARDS INTERACTIVAS) */}
      <TeamDevSelector 
        developers={developers}
        filteredDevs={filteredDevs}
        selectedDev={selectedDev}
        setSelectedDev={setSelectedDev}
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
      />

      {/* DASHBOARD INDIVIDUAL DEL DESARROLLADOR SELECCIONADO */}
      {selectedDev && (
        <div className="space-y-8 pt-4 border-t border-slate-200 dark:border-[#33376b]">
          
          {/* BANNER DEL DESARROLLADOR SELECCIONADO */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-lg">
                {(selectedDev.nombre || 'Dev').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Scorecard de {selectedDev.nombre}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">ID Assignee: <span className="font-mono text-indigo-600 dark:text-indigo-400">{selectedDev.assignee_id}</span> | Email: {selectedDev.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3.5 py-1.5 rounded-full">
                Rendimiento: Alto (81% SP)
              </span>
            </div>
          </div>

          {/* TARJETAS KPI DEL DESARROLLADOR SELECCIONADO */}
          <TeamDevScorecardsDashboard scorecard={scorecard} />

          {/* TABLA DE INCIDENCIAS DEL DESARROLLADOR SELECCIONADO */}
          <TeamDevAssignedIssues 
            selectedDev={selectedDev}
            assignedIssuesList={assignedIssuesList}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

    </div>
  );
}
