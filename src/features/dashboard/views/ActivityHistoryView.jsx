import React from 'react';
import { History, Award, Trophy, Clock } from 'lucide-react';
import { useActivityHistory } from '../hooks/useActivityHistory';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { ActivityAchievements } from '../components/ActivityAchievements';
import { ActivityModals } from '../components/ActivityModals';

export default function ActivityHistoryView({ 
  projects = [],
  selectedProjectId,
  setSelectedProjectId
}) {
  const {
    loading, activeTab, setActiveTab, searchQuery, setSearchQuery,
    actionFilter, setActionFilter, currentPage, setCurrentPage,
    categoryFilter, setCategoryFilter, badgeStatusFilter, setBadgeStatusFilter,
    selectedBadgeModal, setSelectedBadgeModal, activityFeed, filteredFeed,
    paginatedFeed, totalPages, countDone, countReview, countInProgress, totalSPDelivered,
    fullBadgesCatalog, displayedBadges, unlockedCount, inProgressCount,
    currentXP, nextLevelXP, xpPercentage, devRank, devName, projectName
  } = useActivityHistory({ projects, selectedProjectId });

  return (
    <div className="w-full flex-1 flex flex-col space-y-5 text-left font-sans text-slate-800 dark:text-slate-100 pb-10">

      {/* 1. ENCABEZADO SOBRIO CON PROYECTO Y DESARROLLADOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#272b5c]/70">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold shadow-sm shrink-0">
            <History size={22} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Desarrollador: <strong className="text-slate-800 dark:text-slate-200 font-bold">{devName}</strong>
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Historial y Trayectoria
            </h1>
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Proyecto: <strong className="text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                  {activeTab === 'ACHIEVEMENTS' ? 'PERFIL GLOBAL' : (selectedProjectId ? projectName : 'Ninguno Seleccionado')}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs shrink-0 self-start sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 shadow-xs">
            <Trophy size={13} className="text-purple-600 dark:text-purple-400" />
            {unlockedCount} de {fullBadgesCatalog.length} Medallas Desbloqueadas
          </span>
        </div>
      </div>

      {/* 2. SELECTOR DE SECCIONES (SEGMENTED TAB SWITCHER) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-[#0c0e21] border border-slate-200 dark:border-[#272b5c] shadow-xs">
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'TIMELINE'
                ? 'bg-white dark:bg-[#1a1e47] text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock size={15} />
            <span>Timeline de Actividades</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'TIMELINE'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {activityFeed.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ACHIEVEMENTS')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'ACHIEVEMENTS'
                ? 'bg-white dark:bg-[#1a1e47] text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award size={15} />
            <span>Logros y Medallas</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'ACHIEVEMENTS'
                ? 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {unlockedCount}/{fullBadgesCatalog.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
          {activeTab === 'TIMELINE' ? (
            <span>Registro cronológico de entregas y cambios de estado</span>
          ) : (
            <span>🏆 Tu Perfil Global de Desarrollador (Agrupa todos tus proyectos)</span>
          )}
        </div>
      </div>

      {activeTab === 'TIMELINE' && (
        <ActivityTimeline 
          selectedProjectId={selectedProjectId}
          activityFeed={activityFeed}
          paginatedFeed={paginatedFeed}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          actionFilter={actionFilter}
          setActionFilter={setActionFilter}
          countDone={countDone}
          countReview={countReview}
          countInProgress={countInProgress}
          totalSPDelivered={totalSPDelivered}
        />
      )}

      {activeTab === 'ACHIEVEMENTS' && (
        <ActivityAchievements 
          devRank={devRank}
          currentXP={currentXP}
          nextLevelXP={nextLevelXP}
          xpPercentage={xpPercentage}
          unlockedCount={unlockedCount}
          fullBadgesCatalog={fullBadgesCatalog}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          badgeStatusFilter={badgeStatusFilter}
          setBadgeStatusFilter={setBadgeStatusFilter}
          inProgressCount={inProgressCount}
          displayedBadges={displayedBadges}
          setSelectedBadgeModal={setSelectedBadgeModal}
        />
      )}

      <ActivityModals 
        selectedBadgeModal={selectedBadgeModal}
        setSelectedBadgeModal={setSelectedBadgeModal}
      />
    </div>
  );
}
