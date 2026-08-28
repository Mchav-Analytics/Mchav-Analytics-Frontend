import React from 'react';
import { Layers, Loader2, CheckCircle2 } from 'lucide-react';
import { useDevWorkload } from '../hooks/useDevWorkload';
import { DevWorkloadFilters } from '../components/DevWorkloadFilters';
import { DevWorkloadTable } from '../components/DevWorkloadTable';
import { DevWorkloadModals } from '../components/DevWorkloadModals';

export default function DevWorkloadView({ 
  projects = [],
  selectedProjectId,
  setSelectedProjectId
}) {
  const {
    projectName, devName, loading, isSyncing,
    searchQuery, setSearchQuery, statusFilter, setStatusFilter,
    priorityFilter, setPriorityFilter, sortBy, setSortBy,
    hasActiveFilters, clearFilters,
    tasksList, filteredTasks, paginatedTasks,
    currentPage, setCurrentPage, totalPages, totalItems, startItem, endItem, itemsPerPage,
    totalSPAssigned, totalSPBurned, inProgressCount, pendingCount, burnedPct,
    selectedTaskModal, setSelectedTaskModal, availableTransitions, loadingTransitions,
    isStatusDropdownOpen, setIsStatusDropdownOpen, dropdownRef, updatingStatus, handleSelectTransition,
    copiedBranch, handleCopyGitBranch, toastMsg, errorMsg
  } = useDevWorkload({ projects, selectedProjectId });

  return (
    <div className="w-full flex-1 flex flex-col space-y-4 text-left font-sans text-slate-800 dark:text-slate-100 pb-10">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#272b5c]/70">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold shadow-sm shrink-0">
            <Layers size={22} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Desarrollador: <strong className="text-slate-800 dark:text-slate-200 font-bold">{devName}</strong>
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Plan de Trabajo
            </h1>
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Proyecto: <strong className="text-indigo-600 dark:text-indigo-400 font-bold uppercase">{projectName}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0 self-start sm:self-center">
          <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            {isSyncing ? (
              <>
                <Loader2 size={13} className="animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Sincronizando con Jira...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">Sincronizado con Jira</span>
              </>
            )}
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-bold text-slate-800 dark:text-slate-300">
            {totalItems} {totalItems === 1 ? 'tarea' : 'tareas'}
          </span>
        </div>
      </div>

      {/* Resumen Horizontal */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 py-2.5 px-3.5 sm:px-4 rounded-xl bg-white dark:bg-[#141738]/50 border border-slate-200 dark:border-[#272b5c]/60 shadow-xs text-xs">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Asignados:</span>
          <strong className="text-slate-900 dark:text-white font-mono font-bold">{totalSPAssigned} SP</strong>
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Completados:</span>
          <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{totalSPBurned} SP</strong>
          {totalSPAssigned > 0 && (
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">({burnedPct}%)</span>
          )}
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-600 dark:text-slate-400 font-medium">En progreso:</span>
          <strong className="text-indigo-700 dark:text-indigo-400 font-mono font-bold">{inProgressCount}</strong>
          <span className="text-slate-600 dark:text-slate-400">{inProgressCount === 1 ? 'tarea' : 'tareas'}</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Pendientes:</span>
          <strong className="text-slate-800 dark:text-slate-300 font-mono font-bold">{pendingCount}</strong>
          <span className="text-slate-600 dark:text-slate-400">{pendingCount === 1 ? 'tarea' : 'tareas'}</span>
        </div>
      </div>

      <DevWorkloadFilters 
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
        sortBy={sortBy} setSortBy={setSortBy}
        hasActiveFilters={hasActiveFilters} clearFilters={clearFilters}
      />

      <DevWorkloadTable 
        paginatedTasks={paginatedTasks}
        setSelectedTaskModal={setSelectedTaskModal}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        startItem={startItem}
        endItem={endItem}
      />

      {/* TOAST DE CONFIRMACIÓN FLOTANTE */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-[99999] bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      <DevWorkloadModals 
        selectedTaskModal={selectedTaskModal}
        setSelectedTaskModal={setSelectedTaskModal}
        updatingStatus={updatingStatus}
        isStatusDropdownOpen={isStatusDropdownOpen}
        setIsStatusDropdownOpen={setIsStatusDropdownOpen}
        dropdownRef={dropdownRef}
        loadingTransitions={loadingTransitions}
        availableTransitions={availableTransitions}
        handleSelectTransition={handleSelectTransition}
        copiedBranch={copiedBranch}
        handleCopyGitBranch={handleCopyGitBranch}
        errorMsg={errorMsg}
      />
    </div>
  );
}
