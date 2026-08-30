import React from 'react';
import { useDailyFocus } from '../hooks/useDailyFocus';

import DailyFocusHeader from '../components/DailyFocusHeader';
import DailyFocusTasks from '../components/DailyFocusTasks';
import DailyFocusSidebar from '../components/DailyFocusSidebar';

export default function DailyFocusView({
  projects = [],
  selectedProjectId,
  setSelectedProjectId
}) {
  const projectName = projects.find(p => String(p.id_proyecto) === String(selectedProjectId))?.nombre || `Proyecto ${selectedProjectId}`;
  
  const hookProps = useDailyFocus(selectedProjectId, projectName);

  const {
    selectedDate, setSelectedDate,
    highlightedTaskKey,
    todayTasks, overdueTasks, completedToday, totalToday, progressPct,
    filteredNotes,
    currentPage, setCurrentPage,
    totalPages,
    paginatedTasks,
    handleToggleDone,
    handleAddNote,
    handleDeleteNote,
    newNoteText, setNewNoteText
  } = hookProps;

  return (
    <div className="w-full flex-1 flex flex-col space-y-5 text-left font-sans text-slate-800 dark:text-slate-100 pb-10">
      
      <DailyFocusHeader 
        projectName={projectName}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        <DailyFocusTasks 
          todayTasks={todayTasks}
          overdueTasks={overdueTasks}
          paginatedTasks={paginatedTasks}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          highlightedTaskKey={highlightedTaskKey}
          handleToggleDone={handleToggleDone}
        />

        <DailyFocusSidebar 
          completedToday={completedToday}
          totalToday={totalToday}
          progressPct={progressPct}
          newNoteText={newNoteText}
          setNewNoteText={setNewNoteText}
          handleAddNote={handleAddNote}
          filteredNotes={filteredNotes}
          handleDeleteNote={handleDeleteNote}
        />
      </div>

    </div>
  );
}
