import React from 'react';
import { User, RotateCcw, CheckCircle2 } from 'lucide-react';

import { useDeveloperDashboard } from '../hooks/useDeveloperDashboard';
import LiderNotificationBell from '../components/LiderNotificationBell';
import DeveloperProjectHeader from '../../../components/layout/DeveloperProjectHeader';
import AiDevCoach from '../components/AiDevCoach';

import { DeveloperKpiStrip } from '../components/DeveloperKpiStrip';
import { DeveloperWorkDistribution } from '../components/DeveloperWorkDistribution';
import { DeveloperAssignedTasks } from '../components/DeveloperAssignedTasks';
import { DeveloperModals } from '../components/DeveloperModals';

export default function DeveloperView({
  kpis = [],
  projects = [],
  selectedProjectId = 'PROJ-01',
  setSelectedProjectId,
  syncSuccessMsg,
  alerts = [],
  onNavigateToAlerts,
  onNavigateTab
}) {
  const {
    scorecard, aiCoachTip, efficiencyGain, cleanDeliveries, isRefreshing,
    taskFilter, setTaskFilter, typeFilter, setTypeFilter, currentPage, setCurrentPage,
    ITEMS_PER_PAGE, selectedIssueModal, setSelectedIssueModal, replyModalOpen,
    setReplyModalOpen, activeReplyIssue, quickReplyText, setQuickReplyText,
    sendingQuickReply, toastMsg, setToastMsg, alertsModalOpen, setAlertsModalOpen,
    alertsTab, setAlertsTab, helpIssueKey, setHelpIssueKey, helpType, setHelpType,
    helpUrgency, setHelpUrgency, helpMessage, setHelpMessage, submittedHelpRequests,
    showHelpSuccessToast, devName, handleReloadData,
    handleSendQuickReply, handleSubmitHelpRequest,
    assignedIssuesList, filteredTasks, totalCount, dynamicNotifications, donutData
  } = useDeveloperDashboard({ projects, selectedProjectId });

  return (
    <div className="w-full flex-1 h-full flex flex-col space-y-6 pb-12 overflow-y-auto text-left font-sans transition-colors duration-300 relative">
      {/* TOAST DE RESPUESTA ENVIADA */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ENCABEZADO CONSOLE DE TRABAJO */}
      <div className="w-full pb-4 sm:pb-6 relative flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-200/50 dark:border-[#272b5c]/50 mb-2">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] -z-10 opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold shadow-lg shadow-indigo-500/20 shrink-0">
            <User size={24} className="sm:w-7 sm:h-7" />
          </div>
          <div className="space-y-1 text-left min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-widest bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-1.5 shrink-0 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                DEVELOPER WORKSPACE
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                • Desarrollador: <strong className="text-slate-800 dark:text-slate-200 font-bold">{devName}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Mi Trabajo
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t border-slate-100 dark:border-slate-800/80 md:border-t-0">
          <div className="pr-2 sm:pr-4 sm:border-r border-slate-200 dark:border-slate-700/50">
            <DeveloperProjectHeader 
              projects={projects}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              syncSuccessMsg={syncSuccessMsg}
              isGlobalView={true}
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LiderNotificationBell 
              onNavigateTab={onNavigateTab} 
              dynamicNotifications={dynamicNotifications} 
              onOpenTask={(issueKey) => {
                const found = assignedIssuesList.find(i => i.key_issue === issueKey || i.id_issue === issueKey);
                if (found) setSelectedIssueModal(found);
                else if (onNavigateTab) onNavigateTab('dev_workload');
              }}
            />
            <button
              onClick={handleReloadData}
              className="p-3 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-[#1a1e47] bg-white dark:bg-[#0c0e21] border border-slate-200 dark:border-[#272b5c] rounded-2xl transition-all cursor-pointer shadow-sm focus:ring-2 focus:ring-indigo-500/50"
              title="Actualizar datos"
            >
              <RotateCcw size={18} className={isRefreshing ? "animate-spin text-indigo-500" : ""} />
            </button>
          </div>
        </div>
      </div>

      <AiDevCoach 
        tip={aiCoachTip}
        efficiencyGain={efficiencyGain}
        cleanDeliveries={cleanDeliveries}
        loading={isRefreshing}
      />

      <DeveloperKpiStrip scorecard={scorecard} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 flex-1">
        <DeveloperWorkDistribution 
          donutData={donutData} 
          totalCount={totalCount} 
          typeFilter={typeFilter} 
          setTypeFilter={setTypeFilter} 
          setCurrentPage={setCurrentPage} 
        />
        <DeveloperAssignedTasks 
          filteredTasks={filteredTasks}
          taskFilter={taskFilter}
          setTaskFilter={setTaskFilter}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          setSelectedIssueModal={setSelectedIssueModal}
        />
      </div>

      <DeveloperModals 
        replyModalOpen={replyModalOpen}
        activeReplyIssue={activeReplyIssue}
        setReplyModalOpen={setReplyModalOpen}
        quickReplyText={quickReplyText}
        setQuickReplyText={setQuickReplyText}
        handleSendQuickReply={handleSendQuickReply}
        sendingQuickReply={sendingQuickReply}
        selectedIssueModal={selectedIssueModal}
        setSelectedIssueModal={setSelectedIssueModal}
        alertsModalOpen={alertsModalOpen}
        setAlertsModalOpen={setAlertsModalOpen}
        alertsTab={alertsTab}
        setAlertsTab={setAlertsTab}
        submittedHelpRequests={submittedHelpRequests}
        showHelpSuccessToast={showHelpSuccessToast}
        handleSubmitHelpRequest={handleSubmitHelpRequest}
        helpIssueKey={helpIssueKey}
        setHelpIssueKey={setHelpIssueKey}
        assignedIssuesList={assignedIssuesList}
        helpType={helpType}
        setHelpType={setHelpType}
        helpMessage={helpMessage}
        setHelpMessage={setHelpMessage}
        alerts={alerts}
      />
    </div>
  );
}
