// ============================================================================
// SUB-VISTA: MI AGENDA DE HOY (LÓGICA DINÁMICA DE FECHAS ESTRICTA)
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Circle, Plus, Trash2, Clock, Search, ChevronLeft, ChevronRight,
  Sparkles, CheckSquare, Pin, X, RotateCcw, AlertTriangle, Calendar, ChevronDown, Zap
} from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { projectService, jiraService, developerService } from '../../../services/api';

export default function DailyFocusView({
  projects = [],
  selectedProjectId,
  setSelectedProjectId,
  syncSuccessMsg
}) {
  const { user } = useAuth();
  
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [notes, setNotes] = useState([]);

  const [filterPriority, setFilterPriority] = useState('Todas');
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedModalItem, setSelectedModalItem] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  
  // NAVEGACIÓN DE FECHA DINÁMICA REAL
  const todayObj = new Date();
  const todayStr = new Date(todayObj.getTime() - (todayObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [pageAtrasadas, setPageAtrasadas] = useState(1);
  const [pageDia, setPageDia] = useState(1);
  const [pageFuturas, setPageFuturas] = useState(1);
  const [pageCompletadas, setPageCompletadas] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Cargar tareas reales desde la base de datos
  const loadData = () => {
    if (!selectedProjectId) {
      setItems([]);
      return;
    }

    setLoadingItems(true);
    const userEmail = user?.email || 'valentina1025m@gmail.com';
    const userName = user?.nombre || 'Valentina Montalvo';

    projectService.getKpiIssuesDetail(selectedProjectId, { assignee_email: userEmail, assignee_name: userName, limit: 100 })
      .then(dbRes => {
        if (dbRes && dbRes.issues && dbRes.issues.length > 0) {
          const mappedItems = dbRes.issues.map((issue) => {
            const st = (issue.status_actual || '').toUpperCase();
            const isDone = ['FINALIZADO', 'DONE', 'COMPLETADA', 'LISTO'].includes(st);

            // Asumimos que la API provee rawDate en ISO String. Si no, lo asimilamos a la fecha actual para propósitos de la demo.
            return {
              id: issue.key_issue,
              text: `${issue.summary}`,
              done: isDone,
              priority: issue.priority || 'Media',
              category: issue.issue_type || 'Tarea',
              estTime: `${issue.story_points || 1} SP`,
              key: issue.key_issue,
              rawDate: (issue.resolved_at || issue.created_at || todayStr).split('T')[0],
              time: ''
            };
          });

          // DATOS SIMULADOS PARA TODAS LAS COLUMNAS
          const dateActualObj = new Date(selectedDate + 'T12:00:00');
          const ayerObj = new Date(dateActualObj);
          ayerObj.setDate(ayerObj.getDate() - 2);
          const mananaObj = new Date(dateActualObj);
          mananaObj.setDate(mananaObj.getDate() + 2);

          mappedItems.push({ id: 'SIM-ATR-1', text: 'Dato Simulado: API Endpoint (Atrasada)', done: false, priority: 'Alta', category: 'Backend', estTime: '3h', key: 'SIM-ATR-1', rawDate: ayerObj.toISOString().split('T')[0], time: '' });
          mappedItems.unshift({ id: 'SIM-HOY-1', text: 'Dato Simulado: Reunión de Sincronización', done: false, priority: 'Alta', category: 'Reunión', estTime: '1h', key: 'SIM-HOY-1', rawDate: selectedDate, time: '14:30' });
          mappedItems.push({ id: 'SIM-COMP-1', text: 'Dato Simulado: Revisión de PR', done: true, priority: 'Media', category: 'Tarea', estTime: '2h', key: 'SIM-COMP-1', rawDate: selectedDate, time: '10:00' });
          mappedItems.push({ id: 'SIM-FUT-1', text: 'Dato Simulado: Planificación Sprint', done: false, priority: 'Baja', category: 'Planificación', estTime: '4h', key: 'SIM-FUT-1', rawDate: mananaObj.toISOString().split('T')[0], time: '' });


          setItems(mappedItems);
        } else {
          setItems([]);
        }
      })
      .catch(err => {
        console.warn("Error cargando agenda real:", err);
        setItems([]);
      })
      .finally(() => {
        setLoadingItems(false);
      });
      
    // Cargar Notas desde API vinculadas a la fecha
    developerService.getNotesByDate(selectedDate)
      .then(res => {
         const fetchedNotes = res.notes || [];
         if (fetchedNotes.length === 0) {
            fetchedNotes.push({ id: 'SIM-NOTE-1', text: 'Dato Simulado: Standup 10 AM', date: selectedDate });
         }
         setNotes(fetchedNotes);
      })
      .catch(err => {
         // Backend no implementado, mostramos dato simulado
         setNotes([{ id: 'SIM-NOTE-1', text: 'Dato Simulado: Standup a las 10 AM', date: selectedDate }]); 
      });
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId, user?.email, selectedDate]);

  const handleReload = async () => {
    setLoadingItems(true);
    try {
      await jiraService.triggerSync();
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Error al sincronizar con Jira:", error);
    }
    loadData();
  };

  const toggleDone = (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newStatus = item.done ? 'TO DO' : 'DONE';
    
    developerService.updateTaskStatus(id, newStatus)
      .then(() => {
         setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
         showToast(item.done ? '🔄 Tarea restablecida' : '✅ Tarea marcada como lista');
      })
      .catch(err => {
         showToast('❌ Error: Endpoint "Actualizar Estado" no implementado en el Backend.');
      });
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    developerService.createNote(selectedDate, newNoteText)
      .then(res => {
         const simNote = { id: `NOTE-${Date.now()}`, text: newNoteText, date: selectedDate };
         setNotes(prev => [...prev, simNote]);
         setNewNoteText('');
         showToast('📌 Nota guardada');
      })
      .catch(err => {
         // Simular visualmente
         const simNote = { id: `NOTE-${Date.now()}`, text: newNoteText, date: selectedDate };
         setNotes(prev => [...prev, simNote]);
         setNewNoteText('');
         showToast('⚠️ Endpoint no implementado, pero nota simulada agregada visualmente.');
      });
  };

  const handleDeleteNote = (id) => {
    developerService.deleteNote(id)
      .then(() => {
         setNotes(prev => prev.filter(n => n.id !== id));
      })
      .catch(err => {
         showToast('❌ Error: Endpoint "Eliminar Nota" no implementado en FastAPI.');
      });
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };
  
  const changeDate = (days) => {
    const d = new Date(selectedDate + 'T12:00:00'); // Evitar problemas de Timezone
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const selectedProjectObj = projects.find(p => String(p.id_proyecto) === String(selectedProjectId));
  const projectName = selectedProjectObj?.nombre || `Proyecto ${selectedProjectId}`;

  // Filtrado de Búsqueda y Prioridad
  const filteredItems = items.filter(i => {
    let match = true;
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      if (!(i.text || '').toLowerCase().includes(lowerQ) && !(i.key || '').toLowerCase().includes(lowerQ)) {
        match = false;
      }
    }
    if (filterPriority !== 'Todas' && i.priority !== filterPriority) {
      match = false;
    }
    return match;
  });

  // Cálculo de Diferencia de Días
  const getDaysDiff = (taskDateStr, targetDateStr) => {
    if (!taskDateStr) return 0;
    const t = new Date(targetDateStr + 'T12:00:00');
    t.setHours(0, 0, 0, 0);
    const d = new Date(taskDateStr.split('T')[0] + 'T12:00:00');
    d.setHours(0, 0, 0, 0);
    return Math.floor((d - t) / (1000 * 60 * 60 * 24));
  };

  // Clasificación Dinámica según la fecha seleccionada
  const atrasadas = filteredItems.filter(i => !i.done && getDaysDiff(i.rawDate, selectedDate) < 0);
  const delDia = filteredItems.filter(i => !i.done && getDaysDiff(i.rawDate, selectedDate) === 0);
  const proximas = filteredItems.filter(i => !i.done && getDaysDiff(i.rawDate, selectedDate) > 0);
  const completadas = filteredItems.filter(i => i.done && getDaysDiff(i.rawDate, selectedDate) === 0);

  // Metas correspondientes al día seleccionado
  const totalCount = delDia.length + completadas.length;
  const completedCount = completadas.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const paginate = (array, page) => array.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = (array) => Math.ceil(array.length / ITEMS_PER_PAGE) || 1;

  const renderPagination = (currentPage, setPage, total) => (
    total > 1 ? (
      <div className="flex items-center justify-between mt-3 px-2">
        <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-1 text-slate-400 hover:text-indigo-500 disabled:opacity-30"><ChevronLeft size={16} /></button>
        <span className="text-[10px] font-bold text-slate-500">Pág {currentPage} de {total}</span>
        <button onClick={() => setPage(Math.min(total, currentPage + 1))} disabled={currentPage === total} className="p-1 text-slate-400 hover:text-indigo-500 disabled:opacity-30"><ChevronRight size={16} /></button>
      </div>
    ) : null
  );

  const renderTaskCard = (item, { isAtrasada = false, isFutura = false } = {}) => {
    const diffDays = Math.abs(getDaysDiff(item.rawDate, selectedDate));
    return (
      <div key={item.id} className="group p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#0e112a] border border-slate-200/80 dark:border-[#232752] hover:border-indigo-500/60 transition-all flex flex-col gap-2 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <button onClick={() => toggleDone(item.id)} className={`shrink-0 mt-0.5 transition-colors cursor-pointer ${item.done ? 'text-emerald-500' : 'text-slate-400 hover:text-indigo-500'}`}>
            {item.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          </button>
          <div className="flex-1 min-w-0 space-y-1 cursor-pointer" onClick={() => setSelectedModalItem(item)}>
            <span className={`text-xs font-bold block leading-snug break-words ${item.done ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white hover:underline decoration-indigo-400 underline-offset-2'}`}>{item.text}</span>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 flex-wrap mt-1">
              <span className="text-slate-600 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{item.key || 'MCHAV'}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-sm ${item.priority === 'Alta' ? 'bg-red-500 text-white' : item.priority === 'Media' ? 'bg-amber-400 text-amber-950' : 'bg-emerald-500 text-white'}`}>{item.priority}</span>
              {item.time && <span className="text-slate-700 dark:text-slate-200 font-extrabold flex items-center gap-1 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded shadow-sm border border-slate-300 dark:border-slate-600"><Clock size={10}/> {item.time}</span>}
              {isFutura && <span className="text-indigo-700 dark:text-indigo-200 font-extrabold flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded shadow-sm"><Calendar size={10}/> {new Date(item.rawDate + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>}
              {isAtrasada && <span className="text-white font-extrabold flex items-center gap-1 bg-rose-500 px-1.5 py-0.5 rounded shadow-sm"><AlertTriangle size={10}/> Atrasada {diffDays} {diffDays === 1 ? 'd' : 'd'}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-full flex-1 flex flex-col justify-between space-y-4 text-left font-sans transition-colors duration-300 text-slate-800 dark:text-slate-100">

      {!selectedProjectId ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white dark:bg-[#141738] rounded-2xl border border-slate-200 dark:border-[#272b5c] text-center">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-full flex items-center justify-center mb-4">
            <CheckSquare size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Selecciona un Proyecto</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Para ver tu agenda, selecciona en qué proyecto deseas trabajar desde el selector superior.
          </p>
        </div>
      ) : (
        <>
          {/* MIGA DE PAN */}
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <span>Mi Trabajo</span> <ChevronRight size={12}/> <span className="text-indigo-500">Mi Agenda</span> <ChevronRight size={12}/> <span>{projectName}</span>
          </div>

          {/* CABECERA Y METAS */}
          <div className="rounded-2xl bg-white dark:bg-[#141738] p-5 shadow-sm border border-slate-200 dark:border-[#272b5c] shrink-0">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md shrink-0">
                  <CheckSquare size={24} />
                </div>
                <div className="space-y-1 text-left">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {selectedDate === todayStr ? 'Mi Agenda de Hoy' : `Agenda del ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`}
                  </h1>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 capitalize">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                {/* NAVEGACIÓN DE FECHA REAL */}
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0c0e21] rounded-xl border border-slate-200 dark:border-[#232752] p-1.5 shadow-sm">
                  
                  <button onClick={() => changeDate(-1)} className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                    <ChevronLeft size={14}/> {selectedDate === todayStr ? 'Ayer' : 'Anterior'}
                  </button>

                  <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                  
                  <div className="relative flex items-center px-2 cursor-pointer group" onClick={(e) => { try { e.currentTarget.querySelector('input').showPicker() } catch(err){} }}>
                    <Calendar size={14} className="text-indigo-500 mr-2" />
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 capitalize">
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>

                  <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1"></div>

                  <button onClick={() => changeDate(1)} className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                    {selectedDate === todayStr ? 'Mañana' : 'Siguiente'} <ChevronRight size={14}/>
                  </button>

                  <button onClick={() => setSelectedDate(todayStr)} className="ml-2 px-3 py-1 text-[10px] font-black bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors uppercase cursor-pointer">
                    Hoy
                  </button>
                </div>

                {/* BARRA DE PROGRESO DINÁMICA */}
                <div className="p-3 bg-slate-50 dark:bg-[#0c0e21] rounded-xl border border-slate-200 dark:border-[#232752] flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase">
                      {selectedDate === todayStr ? 'METAS DE HOY' : `METAS DEL ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`.toUpperCase()}
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-[#00f5d4]">{completedCount} de {totalCount} Hechas ({progressPct}%)</span>
                  </div>
                  <div className="w-20 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700">
                    <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 dark:to-[#00f5d4] h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
                  </div>
                </div>

                <button onClick={handleReload} disabled={loadingItems} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-[#272b5c] bg-white dark:bg-[#141738] text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all cursor-pointer shadow-sm disabled:opacity-50">
                  <RotateCcw size={18} className={loadingItems ? "animate-spin text-indigo-500" : ""} />
                </button>
              </div>

            </div>
          </div>

      {/* TOAST DE NOTIFICACIÓN */}
      {toastMsg && (
        <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-sm shrink-0 animate-in fade-in ${toastMsg.includes('❌') ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 text-rose-700 dark:text-rose-400' : 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-200 text-indigo-700 dark:text-indigo-300'}`}>
          {!toastMsg.includes('❌') && <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* FILTROS Y NUEVA TAREA */}
      <div className="flex flex-col md:flex-row items-center gap-3 shrink-0 py-2 border-b border-slate-200 dark:border-[#272b5c] w-full">
        <div className="relative w-full md:w-[260px] h-9 rounded-lg bg-white dark:bg-[#0c0e21] border border-slate-300 dark:border-[#33376b] flex items-center focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-sm">
          <Search size={14} className="absolute left-3 text-slate-500" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar tareas..." className="w-full pl-9 pr-2 h-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none" />
        </div>
        
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="w-full md:w-auto h-9 px-3 bg-white dark:bg-[#0c0e21] text-xs text-slate-800 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-[#33376b] focus:outline-none focus:border-indigo-500 shadow-sm font-bold">
          <option value="Todas">Todas las prioridades</option>
          <option value="Alta">🔥 Alta</option>
          <option value="Media">⚡ Media</option>
          <option value="Baja">🧊 Baja</option>
        </select>
        
        <div className="flex-1"></div>
      </div>

      {/* TABLERO KANBAN LIMPIO POR FECHAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 mt-2 min-h-0">
        
        {/* Atrasadas */}
        <div className="flex flex-col rounded-2xl bg-slate-50/50 dark:bg-[#141738]/50 p-4 shadow-sm border border-slate-200 dark:border-[#272b5c] h-full overflow-hidden">
          <h3 className="text-xs font-extrabold text-rose-600 dark:text-rose-400 uppercase mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><AlertTriangle size={14} /> {selectedDate === todayStr ? 'Atrasadas' : 'Pendientes Anteriores'}</span>
            <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full text-[10px]">{atrasadas.length}</span>
          </h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {atrasadas.length > 0 ? paginate(atrasadas, pageAtrasadas).map(i => renderTaskCard(i, { isAtrasada: true })) : <div className="text-center p-4 text-xs text-slate-400">Todo al día</div>}
          </div>
          {renderPagination(pageAtrasadas, setPageAtrasadas, totalPages(atrasadas))}
        </div>

        {/* Tareas del Día seleccionado */}
        <div className="flex flex-col rounded-2xl bg-indigo-50/30 dark:bg-indigo-900/10 p-4 shadow-sm border border-indigo-200 dark:border-indigo-500/20 h-full overflow-hidden">
          <h3 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Clock size={14} /> {selectedDate === todayStr ? 'Tareas de Hoy' : `Plan del ${new Date(selectedDate + 'T12:00:00').getDate()}`}</span>
            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full text-[10px]">{delDia.length}</span>
          </h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {delDia.length > 0 ? paginate(delDia, pageDia).map(i => renderTaskCard(i)) : <div className="text-center p-4 text-xs text-slate-400">Sin tareas asignadas</div>}
          </div>
          {renderPagination(pageDia, setPageDia, totalPages(delDia))}
        </div>

        {/* Completadas en la fecha */}
        <div className="flex flex-col rounded-2xl bg-emerald-50/30 dark:bg-emerald-900/10 p-4 shadow-sm border border-emerald-200 dark:border-emerald-500/20 h-full overflow-hidden">
          <h3 className="text-xs font-extrabold text-emerald-600 dark:text-[#00f5d4] uppercase mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> Completadas</span>
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-[#00f5d4] px-2 py-0.5 rounded-full text-[10px]">{completadas.length}</span>
          </h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {completadas.length > 0 ? paginate(completadas, pageCompletadas).map(i => renderTaskCard(i)) : <div className="text-center p-4 text-xs text-slate-400">Aún no hay completadas</div>}
          </div>
          {renderPagination(pageCompletadas, setPageCompletadas, totalPages(completadas))}
        </div>

        {/* Futuras y Notas */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          <div className="flex flex-col rounded-2xl bg-slate-50/50 dark:bg-[#141738]/50 p-4 shadow-sm border border-slate-200 dark:border-[#272b5c] flex-1 overflow-hidden">
            <h3 className="text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Calendar size={14} /> Tareas Futuras</span>
              <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px]">{proximas.length}</span>
            </h3>
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {proximas.length > 0 ? paginate(proximas, pageFuturas).map(i => renderTaskCard(i, { isFutura: true })) : <div className="text-center p-4 text-xs text-slate-400">Sin tareas futuras</div>}
            </div>
            {renderPagination(pageFuturas, setPageFuturas, totalPages(proximas))}
          </div>
          
          <div className="flex flex-col rounded-2xl bg-white dark:bg-[#141738] p-4 shadow-sm border border-slate-200 dark:border-[#272b5c] max-h-[45%]">
            <h3 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase mb-3 flex items-center gap-1.5">
              <Pin size={14} /> {selectedDate === todayStr ? 'Notas de Hoy' : `Notas del ${new Date(selectedDate + 'T12:00:00').getDate()}`}
            </h3>
            <form onSubmit={handleAddNote} className="mb-2">
              <input type="text" value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} placeholder="Presiona Enter para guardar..." className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#0c0e21] text-[11px] rounded border border-slate-200 dark:border-[#232752] focus:outline-none focus:border-amber-500 shadow-sm transition-colors" />
            </form>
            <div className="space-y-2 overflow-y-auto pr-1">
              {notes.length > 0 ? notes.map(note => (
                <div key={note.id} className="group flex justify-between items-start gap-1 p-2 bg-amber-50 dark:bg-amber-900/10 rounded border border-amber-100 dark:border-amber-900/30 text-[10px]">
                  <span className="text-slate-700 dark:text-slate-300">{note.text}</span>
                  <button onClick={() => handleDeleteNote(note.id)} className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                </div>
              )) : (
                <div className="text-center p-2 text-[10px] text-slate-400">Sin notas para esta fecha</div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* MODAL DETALLE DE TAREA REFINADO */}
      {selectedModalItem && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#141738] shadow-2xl border border-slate-200 dark:border-[#272b5c] text-left overflow-hidden">
            
            <div className="p-5 border-b border-slate-100 dark:border-[#232752] bg-slate-50/50 dark:bg-[#0c0e21]/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm px-2.5 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-500/30">
                  {selectedModalItem.key || 'N/A'}
                </span>
                {selectedModalItem.done && <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase rounded-md border border-emerald-200 dark:border-emerald-800">Finalizado</span>}
              </div>
              <button onClick={() => setSelectedModalItem(null)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors shadow-sm bg-slate-100 dark:bg-[#1a1e47]">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {selectedModalItem.text}
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-[#0c0e21] rounded-xl border border-slate-200 dark:border-[#232752] space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Proyecto</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{projectName}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#0c0e21] rounded-xl border border-slate-200 dark:border-[#232752] space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Fecha Límite</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{new Date(selectedModalItem.rawDate + 'T12:00:00').toLocaleDateString()}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#0c0e21] rounded-xl border border-slate-200 dark:border-[#232752] space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Prioridad</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 block">{selectedModalItem.priority}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#0c0e21] rounded-xl border border-slate-200 dark:border-[#232752] space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Estimación</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400 block">{selectedModalItem.estTime}</span>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-[#232752] bg-slate-50/50 dark:bg-[#0c0e21]/50 flex items-center justify-between">
              <button
                onClick={() => {
                  toggleDone(selectedModalItem.id);
                  setSelectedModalItem(null);
                }}
                className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
                  selectedModalItem.done
                    ? 'bg-amber-500 hover:bg-amber-600 text-white hover:shadow-amber-500/20'
                    : 'bg-emerald-600 dark:bg-[#059669] text-white hover:bg-emerald-500 hover:shadow-emerald-500/20'
                }`}
              >
                {selectedModalItem.done ? <><RotateCcw size={16} /> Restablecer Estado</> : <><CheckCircle2 size={16} /> Marcar como Listo</>}
              </button>
            </div>
          </div>
        </div>
      )}

        </>
      )}

    </div>
  );
}
