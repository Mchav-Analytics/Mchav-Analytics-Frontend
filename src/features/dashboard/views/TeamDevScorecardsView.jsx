import React from 'react';
import { useTeamScorecards } from '../hooks/useTeamScorecards';

// Componentes extraídos
import TeamDevScorecardsHeader from '../components/TeamDevScorecardsHeader';
import TeamDevScorecardsNav from '../components/TeamDevScorecardsNav';
import TeamDevSelector from '../components/TeamDevSelector';
import TeamDevScorecardsDashboard from '../components/TeamDevScorecardsDashboard';
import TeamDevAssignedIssues from '../components/TeamDevAssignedIssues';

export default function TeamDevScorecardsView({ selectedProjectId = '10000', onSelectProject, onNavigateToMatrix, onNavigateToHealth, onNavigateToAlerts }) {
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
      
      {/* CONTENEDOR MASTER UNIFICADO SUPERIOR (EN UNA SOLA TARJETA) */}
      <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-6">
        {/* 1. ENCABEZADO PRINCIPAL PARA ADMINISTRADOR */}
        <TeamDevScorecardsHeader 
          selectedProjectId={selectedProjectId}
          onSelectProject={onSelectProject}
          onNavigateToMatrix={onNavigateToMatrix} 
        />

        {/* 2. BARRA DE NAVEGACIÓN Y ACCESO RÁPIDO */}
        <TeamDevScorecardsNav 
          selectedProjectId={selectedProjectId}
          onSelectProject={onSelectProject}
          onNavigateToMatrix={onNavigateToMatrix}
          onNavigateToHealth={onNavigateToHealth}
        />

        {/* 3. SELECTOR DE DESARROLLADORES (CARDS INTERACTIVAS) */}
        <TeamDevSelector 
          developers={developers}
          filteredDevs={filteredDevs}
          selectedDev={selectedDev}
          setSelectedDev={setSelectedDev}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
        />
      </div>

      {/* DASHBOARD INDIVIDUAL DEL DESARROLLADOR SELECCIONADO */}
      {selectedDev && (
        <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-[#33376b]">
          
          {/* CONTENEDOR MASTER UNIFICADO (EN UNA SOLA TARJETA) */}
          <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-6">
            
            {/* 1. ENCABEZADO DEL DESARROLLADOR SELECCIONADO */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-lg shadow-md shrink-0 border border-indigo-400/30">
                  {(selectedDev.nombre || 'Dev').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div className="space-y-0.5 text-left">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Developer Workload & Flow Profile: {selectedDev.nombre}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    ID Assignee: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{selectedDev.assignee_id}</span> | Email: {selectedDev.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3.5 py-1.5 rounded-full">
                  Vista de Contexto Operativo
                </span>
              </div>
            </div>

            {/* 2. TARJETAS KPI DEL DESARROLLADOR SELECCIONADO */}
            <TeamDevScorecardsDashboard scorecard={scorecard} />
          </div>

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
