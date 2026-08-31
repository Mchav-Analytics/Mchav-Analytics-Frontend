import { useState, useEffect, useMemo } from 'react';
import { developerService, jiraService } from '../../../services/api';
import { 
  getTodayStr, 
  classifyAgendaTasks, 
  getNubiaAnalysis 
} from '../utils/agendaLogic';

export function useDailyFocus(selectedProjectId, projectName) {
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [highlightedTaskKey, setHighlightedTaskKey] = useState(null);
  
  // Tareas reales de Jira y Notas en localStorage
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mchav_agenda_notes')) || [];
    } catch {
      return [];
    }
  });
  
  // Custom Date mappings para Tareas
  const [taskDates, setTaskDates] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mchav_agenda_task_dates')) || {};
    } catch {
      return {};
    }
  });

  // Input nueva nota
  const [newNoteText, setNewNoteText] = useState('');

  // Cargar datos reales del backend
  const fetchLocalIssues = async () => {
    if (!selectedProjectId) return;
    try {
      const scorecard = await developerService.getMyScorecard(selectedProjectId);
      const issues = scorecard.assigned_issues || [];
      const mappedTasks = issues.map(issue => ({
        id: issue.id_jira,
        key: issue.key_issue,
        text: issue.summary,
        priority: issue.priority || 'Media',
        sp: issue.story_points || 0,
        status: issue.status_actual === 'LISTO' || issue.status_actual === 'FINALIZADO' || issue.status_base === 'DONE' ? 'FINALIZADO' : 'POR HACER',
        rawStatus: issue.status_actual,
        created_at: issue.created_at ? issue.created_at.substring(0, 10) : null,
        resolved_at: issue.resolved_at ? issue.resolved_at.substring(0, 10) : null,
        dueDate: issue.due_date ? issue.due_date.substring(0, 10) : null
      }));
      setTasks(mappedTasks);
    } catch (err) {
      console.warn("Error loading daily focus issues:", err);
    }
  };

  const fetchIssues = async (syncWithJira = true) => {
    setLoading(true);
    await fetchLocalIssues();
    setLoading(false);

    if (syncWithJira) {
      setIsSyncing(true);
      try {
        await jiraService.triggerSync(true);
        await fetchLocalIssues();
      } catch (err) {
        console.warn("Sincronización en segundo plano:", err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  useEffect(() => {
    fetchIssues(true);
    const timer = setInterval(() => {
      fetchIssues(true);
    }, 20000);
    return () => clearInterval(timer);
  }, [selectedProjectId]);

  useEffect(() => {
    localStorage.setItem('mchav_agenda_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('mchav_agenda_task_dates', JSON.stringify(taskDates));
  }, [taskDates]);

  // Clasificación Unificada y Determinística
  const classification = useMemo(() => {
    return classifyAgendaTasks(tasks, selectedDate, taskDates);
  }, [tasks, selectedDate, taskDates]);

  const {
    todayTasks,
    overdueTasks,
    completedToday,
    totalToday,
    progressPct
  } = classification;

  // Análisis y Recomendación Contextual de NUBIIA
  const nubiaResult = useMemo(() => {
    return getNubiaAnalysis(classification, selectedDate, projectName);
  }, [classification, selectedDate, projectName]);

  // Filtrado de Notas por Fecha
  const filteredNotes = useMemo(() => notes.filter(n => n.date === selectedDate), [notes, selectedDate]);

  // Paginación de Tareas de Hoy
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, todayTasks.length]);

  const totalPages = Math.ceil(totalToday / itemsPerPage);
  const paginatedTasks = todayTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Acción contextual de NUBIIA: enfocar y resaltar tarea
  const handleTaskFocus = (taskKey) => {
    setHighlightedTaskKey(taskKey);
    // Si la tarea está en todayTasks, calcular la página correspondiente
    const taskIndex = todayTasks.findIndex(t => t.key === taskKey);
    if (taskIndex !== -1) {
      const targetPage = Math.floor(taskIndex / itemsPerPage) + 1;
      setCurrentPage(targetPage);
    }
    setTimeout(() => {
      setHighlightedTaskKey(null);
    }, 3000);
  };

  // Cambiar estado de la tarea (Toggle Done)
  const handleToggleDone = async (task) => {
    const isDone = task.status === 'FINALIZADO';
    const newStatus = isDone ? 'POR HACER' : 'FINALIZADO';
    
    // 1. Actualización optimista de la interfaz
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    
    // 2. Sincronización con la API Backend
    try {
      await developerService.updateTaskStatus(task.key, newStatus);
    } catch (error) {
      console.warn("Backend sync not implemented or failed, keeping local state updated.");
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setNotes(prev => [...prev, { id: Date.now(), date: selectedDate, text: newNoteText }]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return {
    selectedDate, setSelectedDate,
    loading,
    isSyncing,
    highlightedTaskKey,
    classification,
    todayTasks, overdueTasks, completedToday, totalToday, progressPct,
    nubiaResult,
    filteredNotes,
    currentPage, setCurrentPage,
    totalPages,
    paginatedTasks,
    handleTaskFocus,
    handleToggleDone,
    handleAddNote,
    handleDeleteNote,
    newNoteText, setNewNoteText
  };
}
