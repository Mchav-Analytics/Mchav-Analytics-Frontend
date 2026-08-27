import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Circle, Pin, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { developerService, jiraService } from '../../../services/api';
import { 
  getTodayStr, 
  formatDateLocal, 
  addDays, 
  classifyAgendaTasks, 
  getNubiaAnalysis 
} from '../utils/agendaLogic';

export default function DailyFocusView({
  projects = [],
  selectedProjectId,
  setSelectedProjectId
}) {
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
  
  const projectName = projects.find(p => String(p.id_proyecto) === String(selectedProjectId))?.nombre || `Proyecto ${selectedProjectId}`;

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

  const renderTaskRow = (task, isOverdue = false) => {
    const isDone = task.status === 'FINALIZADO';
    const isHighlighted = task.key === highlightedTaskKey;

    return (
      <div 
        key={task.id} 
        className={`group flex flex-col sm:flex-row sm:items-center justify-between py-3.5 px-4 mb-2 border border-slate-100 dark:border-[#272b5c]/50 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md ${
          isDone ? 'bg-slate-50/50 dark:bg-[#0c0e21]/30 opacity-70' : 'bg-white dark:bg-[#1a1e47]/40 hover:bg-slate-50/80 dark:hover:bg-[#1c204d]/80'
        } ${isHighlighted ? 'ring-2 ring-indigo-500 shadow-indigo-500/20 animate-pulse' : ''} ${
          isOverdue && !isDone ? 'border-l-4 border-l-rose-500' : ''
        }`}
      >
        <div className="flex items-center gap-4 overflow-hidden min-w-0 flex-1">
          <button 
            onClick={() => handleToggleDone(task)}
            className={`shrink-0 cursor-pointer transition-all duration-300 p-1 rounded-full ${
              isDone 
                ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 scale-110' 
                : 'text-slate-300 dark:text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
            }`}
          >
            {isDone ? <CheckCircle2 size={22} className="drop-shadow-sm" /> : <Circle size={22} />}
          </button>
          
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className={`text-xs font-mono font-bold shrink-0 px-2 py-0.5 rounded-md ${
                isDone 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 line-through' 
                  : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
              }`}>
                {task.key}
              </span>
              {isOverdue && !isDone && (
                <span className="text-[10px] font-extrabold tracking-wide text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/50 flex items-center gap-1 shadow-sm">
                  <AlertTriangle size={10} /> ATRASADA
                </span>
              )}
            </div>
            <span className={`text-sm sm:text-[15px] truncate ${isDone ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-100 font-bold'}`}>
              {task.text}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-11 sm:pl-4 mt-2 sm:mt-0">
          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border shadow-xs ${
            task.priority === 'Crítica' || task.priority === 'Critical' || task.priority === 'Highest' 
              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40' : 
            task.priority === 'Alta' || task.priority === 'High' 
              ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/40' : 
            'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700'
          }`}>
            {task.priority}
          </div>
          <div 
            className="flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-800 dark:text-indigo-300 font-mono font-black w-8 h-8 rounded-xl text-xs shadow-sm border border-indigo-200/50 dark:border-indigo-800/50"
            title={`${task.sp} Story Points`}
          >
            {task.sp}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-5 text-left font-sans text-slate-800 dark:text-slate-100 pb-10">
      
      {/* ENCABEZADO Y NAVEGACIÓN */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#272b5c]/70">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold shadow-sm shrink-0">
            <Calendar size={22} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Mi Trabajo / Mi Agenda
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Mi Agenda de Hoy
            </h1>
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Proyecto: <strong className="text-indigo-600 dark:text-indigo-400 font-bold uppercase">{projectName}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-start gap-1.5 bg-slate-100 dark:bg-[#0c0e21] p-1.5 rounded-2xl border border-slate-200 dark:border-[#272b5c] w-full lg:w-auto shadow-xs">
          <button 
            onClick={() => setSelectedDate(addDays(selectedDate, -1))} 
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-[#1a1e47] rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ChevronLeft size={16} /> Ayer
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-white dark:bg-[#1a1e47] rounded-xl border border-slate-200 dark:border-[#272b5c] font-bold text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
            <Calendar size={14} className="text-indigo-500 dark:text-indigo-400" />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="bg-transparent border-none outline-none cursor-pointer uppercase font-mono w-[100px] sm:w-[110px]"
            />
          </div>

          <button 
            onClick={() => setSelectedDate(addDays(selectedDate, 1))} 
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-[#1a1e47] rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            Mañana <ChevronRight size={16} />
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-[#272b5c] mx-0.5 hidden sm:block"></div>
          <button 
            onClick={() => setSelectedDate(getTodayStr())} 
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all cursor-pointer flex items-center justify-center font-black uppercase tracking-widest text-xs"
          >
            HOY
          </button>
        </div>
      </div>

      {/* CUERPO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: TAREAS (70%) */}
        <div className="lg:col-span-8 flex flex-col gap-5 sm:gap-6">
          
          {/* Tareas de Hoy */}
          <div className="bg-white/80 dark:bg-[#141738]/80 backdrop-blur-sm rounded-3xl border border-slate-200/80 dark:border-[#272b5c]/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-[#272b5c]">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                Tareas de Hoy
                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 px-2.5 py-0.5 rounded-full text-xs shadow-sm">
                  {todayTasks.length}
                </span>
              </h3>
            </div>
            
            <div className="flex flex-col">
              {paginatedTasks.length > 0 ? (
                paginatedTasks.map(task => renderTaskRow(task))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 dark:bg-[#0c0e21]/30 rounded-2xl border border-dashed border-slate-200 dark:border-[#272b5c]">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-3">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="text-sm text-slate-500 font-medium">No tienes tareas programadas para esta fecha.</span>
                </div>
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8 text-sm text-slate-500 font-medium">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1a1e47]"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="bg-slate-100 dark:bg-[#0c0e21] px-3 py-1 rounded-lg border border-slate-200 dark:border-[#272b5c] font-bold text-slate-700 dark:text-slate-300">
                  {currentPage} / {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1a1e47]"
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Tareas Atrasadas */}
          <div className="bg-rose-50/40 dark:bg-rose-950/20 backdrop-blur-sm rounded-3xl border border-rose-100 dark:border-rose-900/30 shadow-sm p-5 sm:p-7 relative overflow-hidden group transition-all duration-500 hover:shadow-rose-500/10 hover:border-rose-200 dark:hover:border-rose-800/50">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500 rounded-full blur-[80px] -z-10 opacity-10 translate-x-1/3 -translate-y-1/3"></div>
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-rose-200/60 dark:border-rose-900/30">
              <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={18} className="drop-shadow-sm" /> Tareas Atrasadas 
                {overdueTasks.length > 0 && (
                  <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-400 px-2.5 py-0.5 rounded-full text-xs shadow-sm shadow-rose-500/20">
                    {overdueTasks.length}
                  </span>
                )}
              </h3>
            </div>
            
            <div className="flex flex-col">
              {overdueTasks.length > 0 ? (
                overdueTasks.map(task => renderTaskRow(task, true))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="text-3xl mb-2">🎉</div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">¡Excelente! No tienes tareas atrasadas.</span>
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* COLUMNA DERECHA: SIDEBAR (30%) */}
        <div className="lg:col-span-4 flex flex-col gap-5 sm:gap-6">
          
          {/* Progreso */}
          <div className="bg-white/80 dark:bg-[#141738]/80 backdrop-blur-sm rounded-3xl border border-slate-200/80 dark:border-[#272b5c]/80 shadow-sm p-5 sm:p-7 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400 rounded-full blur-[60px] -z-10 opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <h3 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" /> Progreso del día
            </h3>
            <div className="flex items-end justify-between mb-3.5">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white font-black">{completedToday.length}</strong> de {totalToday}
              </span>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                {progressPct}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-[#0c0e21] rounded-full overflow-hidden border border-slate-200/50 dark:border-[#272b5c]/50 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000 ease-out relative" 
                style={{ width: `${progressPct}%` }}
              >
                <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="bg-white/80 dark:bg-[#141738]/80 backdrop-blur-sm rounded-3xl border border-slate-200/80 dark:border-[#272b5c]/80 shadow-sm p-5 sm:p-7 flex flex-col min-h-[300px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400 rounded-full blur-[70px] -z-10 opacity-10 group-hover:opacity-15 transition-opacity"></div>
            
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Pin size={14} className="text-amber-500" /> Bloc de Notas
              </h3>
            </div>
            
            <form onSubmit={handleAddNote} className="mb-5 relative group">
              <input 
                type="text" 
                value={newNoteText} 
                onChange={(e) => setNewNoteText(e.target.value)} 
                placeholder="Añadir nueva nota rápida..." 
                className="w-full pl-4 pr-10 py-3 bg-slate-50/80 dark:bg-[#0c0e21]/60 text-sm font-medium rounded-xl border border-slate-200/80 dark:border-[#272b5c]/80 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all shadow-sm placeholder:text-slate-400" 
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-[10px] bg-white dark:bg-[#141738] px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#272b5c]">
                ↵
              </div>
            </form>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar max-h-64">
              {filteredNotes.length > 0 ? filteredNotes.map(note => (
                <div key={note.id} className="group/note relative flex justify-between items-start gap-3 p-3.5 bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl border border-amber-200/60 dark:border-amber-800/40 text-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 rounded-l-xl opacity-50"></div>
                  <span className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed pl-1">{note.text}</span>
                  <button onClick={() => handleDeleteNote(note.id)} className="text-slate-400 hover:text-rose-500 opacity-0 group-hover/note:opacity-100 transition-opacity shrink-0 cursor-pointer p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/30 bg-white/50 dark:bg-[#141738]/50">
                    <Trash2 size={14}/>
                  </button>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-32 text-center opacity-70">
                  <Pin size={20} className="text-slate-300 dark:text-slate-600 mb-2 rotate-45" />
                  <span className="text-xs text-slate-400 font-medium">El bloc de notas está vacío.</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
