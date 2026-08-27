// ============================================================================
// VISTA DEL DESARROLLADOR — MI TRABAJO (WORKSPACE PERSONAL DE TRABAJO)
// Refactorizada: Hook + Componentes (Fase 4)
// ============================================================================

import React from 'react';
import { User, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useDeveloperWorkload } from '../hooks/useDeveloperWorkload';

import LiderNotificationBell from '../components/LiderNotificationBell';
import DeveloperProjectHeader from '../../../components/layout/DeveloperProjectHeader';
import DeveloperMetricsPanel from '../components/DeveloperMetricsPanel';
import DeveloperActiveTasks from '../components/DeveloperActiveTasks';
import DeveloperModals from '../components/DeveloperModals';

export default function DeveloperView({
  projects = [],
  selectedProjectId = 'PROJ-01',
  setSelectedProjectId,
  syncSuccessMsg,
  alerts = [],
  onNavigateTab
}) {
  const { user } = useAuth();
  const devName = user?.nombre || 'Desarrollador';

  const {
    scorecard,
    isRefreshing,
    taskFilter,
    setTaskFilter,
    typeFilter,
    setTypeFilter,
    currentPage,
    setCurrentPage,
    ITEMS_PER_PAGE,
    selectedIssueModal,
    setSelectedIssueModal,
    replyModalOpen,
    setReplyModalOpen,
    activeReplyIssue,
    quickReplyText,
    setQuickReplyText,
    sendingQuickReply,
    toastMsg,
    alertsModalOpen,
    setAlertsModalOpen,
    alertsTab,
    setAlertsTab,
    helpIssueKey,
    setHelpIssueKey,
    helpType,
    setHelpType,
    helpMessage,
    setHelpMessage,
    submittedHelpRequests,
    showHelpSuccessToast,
    handleReloadData,
    handleUpdateTaskStatus,
    handleSendQuickReply,
    handleSubmitHelpRequest,
    assignedIssuesList,
    filteredTasks,
    totalCount,
    donutData
  } = useDeveloperWorkload(selectedProjectId, user);

  // Generate dynamic notifications for recent assigned tasks (from hook state)
  const dynamicNotifications = assignedIssuesList
    .slice()
    .sort((a, b) => new Date(b.fecha_creacion || 0) - new Date(a.fecha_creacion || 0))
    .slice(0, 4)
    .map(t => {
      let timeStr = 'Reciente';
      if (t.fecha_creacion) {
        const diffMs = new Date() - new Date(t.fecha_creacion);
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) timeStr = `Hace ${diffMins} min`;
        else if (diffMins < 1440) timeStr = `Hace ${Math.floor(diffMins / 60)} horas`;
        else timeStr = `Hace ${Math.floor(diffMins / 1440)} días`;
      }
      return {
        id: `dyn-task-${t.key_issue}`,
        type: 'TASK_ASSIGNED',
        title: 'Nueva Tarea Asignada',
        description: `Te han asignado la incidencia ${t.key_issue}: ${t.summary}`,
        tagline: `Asignado por el equipo.`,
        time: timeStr,
        isRead: false,
        issueKey: t.key_issue
      };
    });

  return (
    <div className="w-full flex-1 h-full flex flex-col space-y-6 pb-12 overflow-y-auto text-left font-sans transition-colors duration-300 relative">
      
      {/* TOAST DE RESPUESTA ENVIADA */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. ENCABEZADO CONSOLE DE TRABAJO INDIVIDUAL */}
      <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold shadow-md shrink-0">
            <User size={24} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                DEVELOPER WORKSPACE
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                • Desarrollador: <strong className="text-slate-800 dark:text-slate-200 font-bold">{devName}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Mi Trabajo
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="pr-4 border-r border-slate-200 dark:border-slate-700/50">
            <DeveloperProjectHeader 
              projects={projects}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              syncSuccessMsg={syncSuccessMsg}
              isGlobalView={true}
            />
          </div>

          <LiderNotificationBell 
            onNavigateTab={onNavigateTab} 
            dynamicNotifications={dynamicNotifications} 
            onOpenTask={() => {
              if (onNavigateTab) onNavigateTab('dev_workload');
            }}
          />

          <button
            onClick={handleReloadData}
            className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all cursor-pointer shadow-xs"
            title="Actualizar datos"
          >
            <RotateCcw size={16} className={isRefreshing ? "animate-spin text-indigo-500" : ""} />
          </button>
        </div>
      </div>

      {/* 2. KPIS PERSONALES */}
      <DeveloperMetricsPanel scorecard={scorecard} />

      {/* 3. TAREAS ACTIVAS Y DISTRIBUCIÓN */}
      <DeveloperActiveTasks 
        totalCount={totalCount}
        donutData={donutData || []}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        setCurrentPage={setCurrentPage}
        filteredTasks={filteredTasks}
        ITEMS_PER_PAGE={ITEMS_PER_PAGE}
        currentPage={currentPage}
        taskFilter={taskFilter}
        setTaskFilter={setTaskFilter}
        setSelectedIssueModal={setSelectedIssueModal}
      />

      {/* 4. MODALES REUTILIZABLES */}
      <DeveloperModals 
        replyModalOpen={replyModalOpen}
        setReplyModalOpen={setReplyModalOpen}
        activeReplyIssue={activeReplyIssue}
        quickReplyText={quickReplyText}
        setQuickReplyText={setQuickReplyText}
        handleSendQuickReply={handleSendQuickReply}
        sendingQuickReply={sendingQuickReply}
        selectedIssueModal={selectedIssueModal}
        setSelectedIssueModal={setSelectedIssueModal}
        handleUpdateTaskStatus={handleUpdateTaskStatus}
        alertsModalOpen={alertsModalOpen}
        setAlertsModalOpen={setAlertsModalOpen}
        alertsTab={alertsTab}
        setAlertsTab={setAlertsTab}
        helpIssueKey={helpIssueKey}
        setHelpIssueKey={setHelpIssueKey}
        assignedIssuesList={assignedIssuesList}
        helpType={helpType}
        setHelpType={setHelpType}
        helpMessage={helpMessage}
        setHelpMessage={setHelpMessage}
        handleSubmitHelpRequest={handleSubmitHelpRequest}
        showHelpSuccessToast={showHelpSuccessToast}
        submittedHelpRequests={submittedHelpRequests}
        alerts={alerts}
      />

    </div>
  );
}
