import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { useAlertsCenter } from '../hooks/useAlertsCenter';
import { AlertsCenterHeader } from '../components/AlertsCenterHeader';
import { AlertsCenterList } from '../components/AlertsCenterList';
import { AlertsCenterWidgets } from '../components/AlertsCenterWidgets';
import { AlertsCenterBottomWidgets } from '../components/AlertsCenterBottomWidgets';
import { AlertsCenterModal } from '../components/AlertsCenterModal';

export default function AlertsCenterView({ selectedProjectId = null }) {
  const {
    toastMessage, setToastMessage,
    showCreateModal, setShowCreateModal,
    formTitle, setFormTitle, formSummary, setFormSummary,
    formCategory, setFormCategory, formPriority, setFormPriority, formProject, setFormProject,
    handleCreateFeedback, handleExportCSV,
    pendingCount, resolvedCount, inProgressCount,
    statusTab, setStatusTab, searchTerm, setSearchTerm, sortBy, setSortBy,
    filteredItems, expandedId, setExpandedId,
    newCommentText, setNewCommentText, handleAddComment, handleToggleStatus,
    sidebarProject, setSidebarProject, sidebarCategory, setSidebarCategory,
    sidebarPriority, setSidebarPriority, sidebarStatus, setSidebarStatus,
    categoryCounts
  } = useAlertsCenter({ selectedProjectId });

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200 font-sans pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900/95 border border-indigo-500/50 text-indigo-200 px-6 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-black tracking-wide">{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-100 ml-3">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header, Filter Pills & Summary Metric Cards */}
      <AlertsCenterHeader 
        setShowCreateModal={setShowCreateModal}
        handleExportCSV={handleExportCSV}
        pendingCount={pendingCount}
        resolvedCount={resolvedCount}
        inProgressCount={inProgressCount}
      />

      {/* Main Grid: Feed List (8 cols) + Sidebar Widgets (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <AlertsCenterList 
          statusTab={statusTab} setStatusTab={setStatusTab}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortBy={sortBy} setSortBy={setSortBy}
          filteredItems={filteredItems}
          expandedId={expandedId} setExpandedId={setExpandedId}
          handleToggleStatus={handleToggleStatus}
          newCommentText={newCommentText} setNewCommentText={setNewCommentText}
          handleAddComment={handleAddComment}
          setSidebarCategory={setSidebarCategory}
          setSidebarPriority={setSidebarPriority}
          setSidebarStatus={setSidebarStatus}
        />

        <AlertsCenterWidgets categoryCounts={categoryCounts} />
      </div>

      {/* 4 Bottom Metric Widgets */}
      <AlertsCenterBottomWidgets />

      {/* Modal for Creating New Feedback */}
      <AlertsCenterModal 
        showCreateModal={showCreateModal} setShowCreateModal={setShowCreateModal}
        formTitle={formTitle} setFormTitle={setFormTitle}
        formSummary={formSummary} setFormSummary={setFormSummary}
        formCategory={formCategory} setFormCategory={setFormCategory}
        formPriority={formPriority} setFormPriority={setFormPriority}
        formProject={formProject} setFormProject={setFormProject}
        handleCreateFeedback={handleCreateFeedback}
      />
    </div>
  );
}
