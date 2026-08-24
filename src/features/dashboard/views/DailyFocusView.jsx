import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Circle, Pin, Trash2, AlertTriangle } from 'lucide-react';
import { developerService } from '../../../services/api';
import AiDevCoach from '../components/AiDevCoach';
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
  const fetchIssues = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
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
      console.error("Error loading daily focus issues:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
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
        className={`group flex items-center justify-between py-3 border-b border-slate-100 dark:border-[#232752] last:border-0 hover:bg-slate-50 dark:hover:bg-[#1a1e47] transition-all -mx-2 px-2.5 rounded-xl ${isDone ? 'opacity-60' : ''} ${isHighlighted ? 'bg-indigo-50/90 dark:bg-indigo-950/50 ring-2 ring-indigo-500 animate-pulse' : ''}`}
      >
        <div className="flex items-center gap-3 overflow-hidden w-full">
          <button 
            onClick={() => handleToggleDone(task)}
            className={`shrink-0 cursor-pointer transition-colors ${isDone ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}
          >
            {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          </button>
          
          <div className="flex flex-col flex-1 truncate">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold shrink-0 ${isDone ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-indigo-600 dark:text-indigo-400'}`}>
                {task.key}
              </span>
              {isOverdue && !isDone && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900/30">
                  ATRASADA
                </span>
              )}
            </div>
            <span className={`text-sm truncate mt-0.5 ${isDone ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
              {task.text}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 pl-2">
          <div className="flex items-center gap-3 text-xs">
            <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${
              task.priority === 'Crítica' || task.priority === 'Critical' || task.priority === 'Highest' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 
              task.priority === 'Alta' || task.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 
              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {task.priority}
            </div>
            <div className="flex items-center justify-center bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-mono font-bold w-7 h-7 rounded-full">
              {task.sp}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-5 text-left font-sans text-slate-800 dark:text-slate-100 pb-10">
      
      {/* ENCABEZADO Y NAVEGACIÓN */}
      <div className="flex flex-col md:flex-row md:items-end justify-between bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] p-5 rounded-2xl shadow-sm gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mi Trabajo / Mi Agenda / {projectName}</span>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">Mi Agenda de Hoy</h1>
          </div>
          <h2 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 capitalize mt-1 flex items-center gap-2">
            <Calendar size={16} /> {formatDateLocal(selectedDate)}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0c0e21] p-1.5 rounded-xl border border-slate-200 dark:border-[#232752]">
          <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} className="px-4 py-2 text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-[#1a1e47] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm">
            <ChevronLeft size={16} /> Ayer
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1e47] rounded-lg border border-slate-200 dark:border-[#272b5c] font-bold text-sm text-slate-800 dark:text-slate-200 shadow-sm relative focus-within:ring-2 focus-within:ring-indigo-500">
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="bg-transparent border-none outline-none cursor-pointer uppercase font-mono w-[110px]"
            />
          </div>

          <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="px-4 py-2 text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-[#1a1e47] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm">
            Mañana <ChevronRight size={16} />
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-[#272b5c] mx-2"></div>
          <button onClick={() => setSelectedDate(getTodayStr())} className="px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-black uppercase tracking-widest">
            HOY
          </button>
        </div>
      </div>

      {/* CUERPO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: TAREAS (70%) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Tareas de Hoy */}
          <div className="bg-white dark:bg-[#141738] rounded-2xl border border-slate-200 dark:border-[#272b5c] shadow-sm p-6">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-[#232752] pb-4">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                Tareas de hoy <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 px-2 py-0.5 rounded-full text-xs">{todayTasks.length}</span>
              </h3>
            </div>
            
            <div className="flex flex-col gap-1">
              {paginatedTasks.length > 0 ? (
                paginatedTasks.map(task => renderTaskRow(task))
              ) : (
                <div className="text-center py-10">
                  <span className="text-sm text-slate-400 font-medium">No tienes tareas programadas para esta fecha.</span>
                </div>
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-slate-500 font-medium">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Tareas Atrasadas */}
          <div className="bg-white dark:bg-[#141738] rounded-2xl border border-slate-200 dark:border-[#272b5c] shadow-sm p-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500"></div>
            <div className="flex items-center justify-between mb-5 border-b border-rose-100 dark:border-rose-900/20 pb-4">
              <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={18} /> Tareas atrasadas 
                {overdueTasks.length > 0 && <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 px-2 py-0.5 rounded-full text-xs">{overdueTasks.length}</span>}
              </h3>
            </div>
            
            <div className="flex flex-col gap-1">
              {overdueTasks.length > 0 ? (
                overdueTasks.map(task => renderTaskRow(task, true))
              ) : (
                <div className="text-center py-8">
                  <span className="text-sm text-slate-400 font-medium flex items-center justify-center gap-2">No tienes tareas atrasadas 🎉</span>
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* COLUMNA DERECHA: SIDEBAR (30%) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* NUBIIA - Asistente Automático */}
          <AiDevCoach 
            message={nubiaResult.message} 
            loading={loading}
            actionLabel={nubiaResult.actionLabel}
            onActionClick={nubiaResult.topTask ? () => handleTaskFocus(nubiaResult.topTask.key) : null}
          />

          {/* Progreso */}
          <div className="bg-white dark:bg-[#141738] rounded-2xl border border-slate-200 dark:border-[#272b5c] shadow-sm p-5">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Progreso del día</h3>
            <div className="flex items-end justify-between mb-3">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{completedToday.length} / {totalToday} completadas</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{progressPct}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-[#0c0e21] rounded-full overflow-hidden border border-slate-200 dark:border-[#232752]">
              <div className="h-full bg-emerald-500 transition-all duration-700 ease-out" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>

          {/* Notas */}
          <div className="bg-white dark:bg-[#141738] rounded-2xl border border-slate-200 dark:border-[#272b5c] shadow-sm p-5 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Pin size={14} /> Notas
              </h3>
            </div>
            
            <form onSubmit={handleAddNote} className="mb-4">
              <input 
                type="text" 
                value={newNoteText} 
                onChange={(e) => setNewNoteText(e.target.value)} 
                placeholder="+ Añadir nota (Presiona Enter)" 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0c0e21] text-sm font-medium rounded-xl border border-slate-200 dark:border-[#232752] focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all shadow-sm" 
              />
            </form>
            
            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {filteredNotes.length > 0 ? filteredNotes.map(note => (
                <div key={note.id} className="group flex justify-between items-start gap-3 p-3 bg-amber-50/70 dark:bg-amber-900/20 rounded-xl border border-amber-100/80 dark:border-amber-900/40 text-sm shadow-sm transition-all hover:shadow">
                  <span className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed">{note.text}</span>
                  <button onClick={() => handleDeleteNote(note.id)} className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/30">
                    <Trash2 size={14}/>
                  </button>
                </div>
              )) : (
                <div className="text-center py-6 text-sm text-slate-400 font-medium">Sin notas para esta fecha.</div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
