import React, { useState } from 'react';
import { createPortal } from 'react-dom';
// Formulario y Simulador de Capacidad de Equipo
import { 
  Calendar, Plus, CheckCircle2, Trash2, RefreshCw, Edit3, 
  UserCheck, ShieldAlert, Sparkles, X, ChevronRight, ChevronLeft, AlertCircle, ArrowRight, Zap, Settings, AlertTriangle, Sliders, Bot, Award, Check
} from 'lucide-react';
import { InfoTooltip, calculateBusinessDays } from './CapacityShared';
import CapacityResults from './CapacityResults';
import { TEAM_DEVS } from '../hooks/useCapacityCalculator';

export default function CapacityForm({ 
  devCount, setDevCount,
  sprintDays, setSprintDays,
  vacationDays, setVacationDays,
  sickDevsCount, setSickDevsCount,
  sickDays, setSickDays,
  avgDevVelocity, setAvgDevVelocity,
  absenceEvents = [],
  jiraTasks = [],
  liveDevs = [],
  handleAddAbsenceEvent,
  handleUpdateAbsenceEvent,
  handleRemoveEvent,
  handleReassignTask,
  handleResetScenarios,
  results
}) {
  const activeDevsList = (liveDevs && liveDevs.length > 0) ? liveDevs : TEAM_DEVS;
  const [newDevName, setNewDevName] = useState(activeDevsList[0] || 'Valentina Montalvo');
  const [customDevName, setCustomDevName] = useState('');
  const [isCustomDev, setIsCustomDev] = useState(false);
  const [newAbsenceType, setNewAbsenceType] = useState('SICK'); 
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showCalendarForm, setShowCalendarForm] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [contingencyFilter, setContingencyFilter] = useState('ALL');
  const [showAllNovedadesModal, setShowAllNovedadesModal] = useState(false);
  const [novedadesPage, setNovedadesPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const totalNovedadesPages = Math.ceil(absenceEvents.length / ITEMS_PER_PAGE) || 1;
  const currentNovedadesPage = Math.min(novedadesPage, totalNovedadesPages);
  const paginatedAbsenceEvents = absenceEvents.slice(
    (currentNovedadesPage - 1) * ITEMS_PER_PAGE,
    currentNovedadesPage * ITEMS_PER_PAGE
  );

  const [editingEventId, setEditingEventId] = useState(null);
  const [editFields, setEditFields] = useState({ startDate: '', endDate: '', type: 'SICK', note: '' });

  const [selectedDevForTasks, setSelectedDevForTasks] = useState(null);
  const [showNubiContingencyModal, setShowNubiContingencyModal] = useState(false);
  const [customNubiAssignments, setCustomNubiAssignments] = useState({});
  const [isApplyingNubiPlan, setIsApplyingNubiPlan] = useState(false);
  const [nubiSuccessMessage, setNubiSuccessMessage] = useState('');

  const calculatedDaysPreview = calculateBusinessDays(newStartDate, newEndDate);
  const finalDevName = isCustomDev ? customDevName.trim() : newDevName;

  const onSubmit = (e) => {
    e.preventDefault();
    if (!newStartDate || !newEndDate || !finalDevName) return;
    
    const success = handleAddAbsenceEvent(finalDevName, newAbsenceType, newStartDate, newEndDate, newNote);
    if (success) {
      setNewStartDate('');
      setNewEndDate('');
      setNewNote('');
      setShowCalendarForm(false);
    }
  };

  const startEditEvent = (ev) => {
    setEditingEventId(ev.id);
    setEditFields({
      startDate: ev.startDate,
      endDate: ev.endDate,
      type: ev.type,
      note: ev.note || ''
    });
  };

  const saveEditEvent = (evId) => {
    if (handleUpdateAbsenceEvent) {
      handleUpdateAbsenceEvent(evId, editFields);
    }
    setEditingEventId(null);
  };

  const getTasksForDev = (devName) => {
    if (!jiraTasks || !devName) return [];
    return jiraTasks.filter(t => t.assignee.toLowerCase() === devName.toLowerCase() && t.status !== 'Completados');
  };

  const getDevRiskSP = (devName) => {
    const tasks = getTasksForDev(devName);
    return tasks.reduce((sum, t) => sum + (t.sp || 0), 0);
  };

  const getDevSpecialtyTag = (devName, summary = '') => {
    const s = summary.toLowerCase();
    if (s.includes('auth') || s.includes('oauth') || s.includes('ui') || s.includes('frontend')) return 'Especialista UI & Frontend';
    if (s.includes('api') || s.includes('rest') || s.includes('backend') || s.includes('endpoint')) return 'Especialista Backend & APIs';
    if (s.includes('sql') || s.includes('etl') || s.includes('docker') || s.includes('reportes')) return 'Especialista DB & Data Processing';
    if (s.includes('wcag') || s.includes('modelo') || s.includes('tabla')) return 'Especialista QA & Accesibilidad';

    if (devName === 'Stephany León') return 'Especialista UI & Frontend';
    if (devName === 'Andrés Alcalá') return 'Especialista Backend & APIs';
    if (devName === 'Mai Salamanca') return 'Especialista DB & Data Processing';
    if (devName === 'Valentina Montalvo') return 'Especialista QA & Accesibilidad';
    return 'Desarrollador Fullstack';
  };

  const getAvailableDevsWorkload = (absentDevName) => {
    const activeDevs = activeDevsList.filter(d => d.toLowerCase() !== absentDevName?.toLowerCase());
    return activeDevs.map(dev => {
      const devTasks = getTasksForDev(dev);
      const totalSP = devTasks.reduce((sum, t) => sum + (t.sp || 0), 0);
      return { devName: dev, tasksCount: devTasks.length, totalSP };
    }).sort((a, b) => a.totalSP - b.totalSP);
  };

  const getContingencyPlan = () => {
    if (!absenceEvents || absenceEvents.length === 0 || !jiraTasks) return [];

    const absentDevNames = absenceEvents.map(e => e.devName.toLowerCase());
    const availableDevs = activeDevsList.filter(d => !absentDevNames.includes(d.toLowerCase()));

    if (availableDevs.length === 0) return [];

    const devWorkloadMap = {};
    const devTasksCountMap = {};
    availableDevs.forEach(dev => {
      const devTasks = jiraTasks.filter(t => t.assignee.toLowerCase() === dev.toLowerCase() && t.status !== 'Completados');
      devWorkloadMap[dev] = devTasks.reduce((sum, t) => sum + (t.sp || 0), 0);
      devTasksCountMap[dev] = devTasks.length;
    });

    const recommendations = [];

    absenceEvents.forEach(event => {
      const devName = event.devName;
      const tasks = jiraTasks.filter(t => t.assignee.toLowerCase() === devName.toLowerCase() && t.status !== 'Completados');

      tasks.forEach(task => {
        const candidates = availableDevs.map(candidate => {
          const currentSP = devWorkloadMap[candidate] || 0;
          const currentTasks = devTasksCountMap[candidate] || 0;
          let score = 100 - (currentSP * 6);

          const summaryLower = (task.summary + ' ' + task.key).toLowerCase();
          let isSpecialist = false;

          if ((summaryLower.includes('auth') || summaryLower.includes('oauth') || summaryLower.includes('ui') || summaryLower.includes('frontend')) && candidate === 'Stephany León') {
            score += 25; isSpecialist = true;
          } else if ((summaryLower.includes('api') || summaryLower.includes('rest') || summaryLower.includes('backend') || summaryLower.includes('endpoint')) && candidate === 'Andrés Alcalá') {
            score += 25; isSpecialist = true;
          } else if ((summaryLower.includes('sql') || summaryLower.includes('etl') || summaryLower.includes('docker') || summaryLower.includes('reportes')) && candidate === 'Mai Salamanca') {
            score += 25; isSpecialist = true;
          } else if ((summaryLower.includes('wcag') || summaryLower.includes('modelo') || summaryLower.includes('tabla')) && candidate === 'Valentina Montalvo') {
            score += 25; isSpecialist = true;
          }

          const matchPct = Math.min(98, Math.max(82, Math.round(score)));
          const specialty = getDevSpecialtyTag(candidate, task.summary);
          const flowStatus = currentSP <= 5 ? 'Flujo Saludable 🟢' : currentSP <= 12 ? 'Carga Moderada 🟡' : 'Alta Ocupación 🔴';

          let reason = `${candidate} cuenta con disponibilidad adecuada (${currentSP} SP) y flujo constante.`;
          if (isSpecialist) {
            reason = `${candidate} es ${specialty} y posee la menor carga del sprint (${currentSP} SP, ${currentTasks} ${currentTasks === 1 ? 'tarea' : 'tareas'}).`;
          }

          return {
            candidate,
            score,
            matchPct,
            currentSP,
            currentTasks,
            specialty,
            flowStatus,
            reason
          };
        }).sort((a, b) => b.score - a.score);

        const best = candidates[0] || {};

        recommendations.push({
          task,
          absentDev: devName,
          recommendedDev: best.candidate,
          recommendedDevSP: best.currentSP,
          matchPct: best.matchPct || 90,
          reason: best.reason || 'Carga balanceada',
          specialty: best.specialty || 'Fullstack',
          flowStatus: best.flowStatus || 'Saludable',
          allCandidates: candidates
        });
      });
    });

    return recommendations;
  };

  const contingencyRecommendations = getContingencyPlan();

  const handleOpenNubiModal = () => {
    const initialMap = {};
    contingencyRecommendations.forEach(rec => {
      initialMap[rec.task.key] = rec.recommendedDev;
    });
    setCustomNubiAssignments(initialMap);
    setShowNubiContingencyModal(true);
  };

  const handleConfirmNubiContingency = () => {
    setIsApplyingNubiPlan(true);
    setTimeout(() => {
      contingencyRecommendations.forEach(rec => {
        const assignedDev = customNubiAssignments[rec.task.key] || rec.recommendedDev;
        if (handleReassignTask) {
          handleReassignTask(rec.task.key, assignedDev);
        }
      });
      setIsApplyingNubiPlan(false);
      setNubiSuccessMessage('¡Plan de contingencia redistribuido exitosamente por Nubi IA!');
      setTimeout(() => {
        setNubiSuccessMessage('');
        setShowNubiContingencyModal(false);
      }, 1500);
    }, 700);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-150 font-sans text-left">
        
        {/* LAYOUT PRINCIPAL DE 2 COLUMNAS (IZQUIERDA: CONTINGENCIA + CALENDARIO | DERECHA: CONFIGURACIÓN + MEDIDOR) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── COLUMNA IZQUIERDA: PLAN DE CONTINGENCIA (CAROUSEL TARJETAS) + REGISTRO DE AUSENCIAS POR FECHAS ── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* PLAN DE CONTINGENCIA Y REDISTRIBUCIÓN */}
            <div className="p-6 rounded-3xl bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-slate-800 shadow-2xs space-y-5 animate-in fade-in duration-200">
              
              {/* Cabecera del Plan de Contingencia */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Plan de contingencia y redistribución
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {contingencyRecommendations.length} {contingencyRecommendations.length === 1 ? 'Incidencia requiere' : 'Incidencias requieren'} cobertura por incapacidad o vacaciones.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenNubiModal}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all shrink-0 cursor-pointer"
                  title="Abre el panel para auditar y aplicar la redistribución de contingencia"
                >
                  <CheckCircle2 size={15} />
                  <span>Aplicar plan de contingencia</span>
                </button>
              </div>

              {/* PESTAÑAS DE FILTRO RÁPIDO (TODAS, CRÍTICAS, VACACIONES, MÉDICAS) */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => { setContingencyFilter('ALL'); setCarouselIndex(0); }}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${contingencyFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  <span>⚡ Todas</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[12px] ${contingencyFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>
                    {absenceEvents.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setContingencyFilter('CRITICAL'); setCarouselIndex(0); }}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${contingencyFilter === 'CRITICAL' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/60'}`}
                >
                  <span>🔴 Críticas</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[12px] bg-rose-200/60 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                    {contingencyRecommendations.filter(r => (r.task?.sp || 0) >= 5).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setContingencyFilter('VACATION'); setCarouselIndex(0); }}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${contingencyFilter === 'VACATION' ? 'bg-amber-500/90 text-white shadow-xs' : 'bg-amber-50/60 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300/90 border border-amber-200/50 dark:border-amber-900/30 hover:bg-amber-100/50 dark:hover:bg-amber-900/50'}`}
                >
                  <span>🟡 Vacaciones</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[12px] bg-amber-200/50 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                    {absenceEvents.filter(e => e.type === 'VACATION').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setContingencyFilter('SICK'); setCarouselIndex(0); }}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${contingencyFilter === 'SICK' ? 'bg-sky-600 text-white shadow-xs' : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40 hover:bg-sky-100 dark:hover:bg-sky-900/60'}`}
                >
                  <span>🩺 Médicas</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[12px] bg-sky-200/60 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200">
                    {absenceEvents.filter(e => e.type === 'SICK').length}
                  </span>
                </button>
              </div>

              {/* CAROUSEL HORIZONTAL DE TARJETAS DE DESARROLLADORES */}
              <div className="relative group/carousel px-1">
                
                {/* Botón Navegación Izquierda */}
                <button
                  type="button"
                  onClick={() => setCarouselIndex(prev => Math.max(0, prev - 1))}
                  disabled={carouselIndex === 0}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  ‹
                </button>

                {/* Botón Navegación Derecha */}
                <button
                  type="button"
                  onClick={() => setCarouselIndex(prev => Math.min(2, prev + 1))}
                  disabled={carouselIndex >= 2}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  ›
                </button>

                {/* Grid de Tarjetas Reales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {activeDevsList.map(devName => {
                    const event = (absenceEvents || []).find(e => e.devName.toLowerCase() === devName.toLowerCase());
                    const tasks = getTasksForDev(devName);
                    const sp = tasks.reduce((sum, t) => sum + (t.sp || 0), 0);
                    const statusType = event ? event.type : 'AVAILABLE';
                    const statusText = event ? (event.note || (event.type === 'SICK' ? 'Incapacidad médica' : 'Vacaciones')) : 'Disponible';
                    const color = event ? (event.type === 'SICK' ? 'sky' : 'amber') : 'emerald';

                    return {
                      name: devName,
                      initial: devName.charAt(0).toUpperCase(),
                      statusText,
                      statusType,
                      sp,
                      tasks: tasks.length,
                      color
                    };
                  }).filter(card => {
                    if (contingencyFilter === 'CRITICAL') return card.color === 'sky' || card.sp >= 5;
                    if (contingencyFilter === 'VACATION') return card.statusType === 'VACATION';
                    if (contingencyFilter === 'SICK') return card.statusType === 'SICK';
                    return true;
                  }).slice(carouselIndex, carouselIndex + 4).map((card, idx) => {
                    const isSky = card.color === 'sky' || card.statusType === 'SICK';
                    const isAmber = card.color === 'amber' || card.statusType === 'VACATION';

                    const cardStyle = isSky 
                      ? 'bg-sky-50/50 dark:bg-[#121b2d] border-sky-200/50 dark:border-sky-500/20 shadow-2xs dark:shadow-md dark:shadow-sky-950/50' 
                      : isAmber 
                        ? 'bg-amber-50/40 dark:bg-[#1e1910] border-amber-200/40 dark:border-amber-500/15 shadow-2xs dark:shadow-md dark:shadow-amber-950/30'
                        : 'bg-emerald-50/50 dark:bg-[#12231e] border-emerald-200/50 dark:border-emerald-500/20 shadow-2xs dark:shadow-md dark:shadow-emerald-950/50';

                    const badgeStyle = isSky
                      ? 'bg-sky-100/80 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-transparent dark:border-sky-800/30'
                      : isAmber
                        ? 'bg-amber-100/60 dark:bg-amber-950/60 text-amber-800/90 dark:text-amber-300/90 border border-transparent dark:border-amber-800/20'
                        : 'bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-transparent dark:border-emerald-800/30';

                    const avatarStyle = isSky
                      ? 'bg-sky-500 text-white'
                      : isAmber
                        ? 'bg-amber-500/85 text-white'
                        : 'bg-emerald-500 text-white';

                    const buttonStyle = isSky
                      ? 'border-sky-200 dark:border-sky-800/40 text-sky-600 dark:text-sky-300 hover:bg-sky-100/50 dark:hover:bg-sky-950/60'
                      : isAmber
                        ? 'border-amber-200/60 dark:border-amber-800/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100/40 dark:hover:bg-amber-950/50'
                        : 'border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/60';

                    return (
                      <div 
                        key={card.name + idx}
                        className={`p-3.5 rounded-2xl border ${cardStyle} space-y-3 flex flex-col justify-between transition-all duration-200`}
                      >
                        {/* Cabecera Tarjeta: Avatar + Nombre */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full ${avatarStyle} font-black text-[12px] flex items-center justify-center shrink-0`}>
                              {card.initial}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[95px]" title={card.name}>
                              {card.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[12px] inline-flex items-center gap-1 ${badgeStyle}`}>
                              <span>{isSky ? '🩺' : isAmber ? '🟡' : '🟢'}</span>
                              <span className="truncate max-w-[100px]">{card.statusText}</span>
                            </span>
                          </div>
                        </div>

                        {/* Métrica SP */}
                        <div className="text-center py-0.5">
                          <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                            {card.sp} SP
                          </div>
                          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {card.tasks} {card.tasks === 1 ? 'tarea' : 'tareas'}
                          </div>
                        </div>

                        {/* Botón Reasignar */}
                        <button
                          type="button"
                          onClick={() => setSelectedDevForTasks(selectedDevForTasks === card.name ? null : card.name)}
                          className={`w-full py-1.5 px-3 rounded-xl border ${buttonStyle} font-bold text-xs transition-all cursor-pointer shadow-2xs text-center`}
                        >
                          Reasignar
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Paginación de Puntos Indicator */}
                <div className="flex items-center justify-center gap-1.5 pt-3">
                  {[0, 1, 2].map((dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setCarouselIndex(dotIdx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${carouselIndex === dotIdx ? 'bg-indigo-600 w-4' : 'bg-slate-300 dark:bg-slate-700 w-2'}`}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* REGISTRO DE AUSENCIAS E INCAPACIDADES POR FECHAS */}
            <div className="p-6 rounded-3xl bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-slate-800 shadow-2xs space-y-5">
              
              {/* Cabecera del Registro de Ausencias */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900 dark:text-white leading-tight">
                    Registro de ausencias e incapacidades por fechas
                  </h3>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Gestión de novedades por integrante con consulta de tareas en riesgo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCalendarForm(!showCalendarForm)}
                  className="px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 font-bold text-[13px] flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-2xs"
                >
                  <Plus size={14} />
                  <span>{showCalendarForm ? 'Cancelar' : 'Registrar Novedad'}</span>
                </button>
              </div>

              {/* FORMULARIO DE NUEVO REGISTRO DESPLEGABLE */}
              {showCalendarForm && (
                <form onSubmit={onSubmit} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles size={14} className="text-indigo-500" />
                      Registrar Nueva Novedad de Personal
                    </h4>
                    <span className="text-[12px] text-slate-400 font-semibold">Calculador de días hábiles activo</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Seleccionar Integrante */}
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Desarrollador / Integrante *
                      </label>
                      {!isCustomDev ? (
                        <select
                          value={newDevName}
                          onChange={(e) => {
                            if (e.target.value === '__OTHER__') {
                              setIsCustomDev(true);
                            } else {
                              setNewDevName(e.target.value);
                            }
                          }}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] font-bold text-slate-800 dark:text-slate-100 outline-none"
                        >
                          {activeDevsList.map((dev, idx) => (
                            <option key={idx} value={dev}>{dev}</option>
                          ))}
                          <option value="__OTHER__">Escribir otro nombre...</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Nombre del desarrollador..."
                            value={customDevName}
                            onChange={(e) => setCustomDevName(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-indigo-400 rounded-xl text-[13px] font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => setIsCustomDev(false)}
                            className="p-1.5 rounded-lg bg-slate-200 text-slate-600 text-[12px] font-bold"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Tipo de Novedad */}
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Tipo de Novedad *
                      </label>
                      <select
                        value={newAbsenceType}
                        onChange={(e) => setNewAbsenceType(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] font-bold text-slate-800 dark:text-slate-100 outline-none"
                      >
                        <option value="SICK">Incapacidad Médica</option>
                        <option value="VACATION">Vacaciones Planificadas</option>
                      </select>
                    </div>

                    {/* Fecha Inicio */}
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Fecha Inicio *
                      </label>
                      <input
                        type="date"
                        value={newStartDate}
                        onChange={(e) => setNewStartDate(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] font-bold"
                      />
                    </div>

                    {/* Fecha Fin */}
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Fecha Fin *
                      </label>
                      <input
                        type="date"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nota o Justificación
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Gripe severa con 5 días de reposo formulado..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                      {calculatedDaysPreview > 0 ? `Total Días Hábiles: ${calculatedDaysPreview} días` : 'Selecciona fechas'}
                    </span>
                    <button
                      type="submit"
                      disabled={!newStartDate || !newEndDate || calculatedDaysPreview <= 0}
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50 text-white dark:text-slate-900 text-[13px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <CheckCircle2 size={14} />
                      <span>Guardar Novedad</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TARJETAS HORIZONTALES LADO A LADO SEGÚN DISEÑO REFERENCIA */}
              <div className="flex flex-col sm:flex-row items-center gap-3 overflow-x-auto pb-1">
                {absenceEvents.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 w-full">
                    <p className="text-[13px] font-bold text-slate-400">No hay ausencias ni novedades registradas.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row items-stretch gap-3 flex-1">
                      {absenceEvents.map((ev) => {
                        const initials = ev.devName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                        const isSick = ev.type === 'SICK';

                        return (
                          <div 
                            key={ev.id} 
                            className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex-1 min-w-[210px] space-y-2.5 flex flex-col justify-between shadow-2xs"
                          >
                            {/* Fila Superior: Avatar + Nombre + Badge */}
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full ${isSick ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' : 'bg-amber-100/80 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'} font-black text-xs flex items-center justify-center shrink-0`}>
                                {initials}
                              </div>
                              <div className="space-y-0.5 overflow-hidden">
                                <h4 className="font-bold text-slate-900 dark:text-white text-[14px] truncate" title={ev.devName}>
                                  {ev.devName}
                                </h4>
                                <span className={`px-2 py-0.5 rounded-full text-[12px] font-bold block truncate ${isSick ? 'bg-sky-100/90 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300' : 'bg-amber-100/70 dark:bg-amber-950/50 text-amber-800/90 dark:text-amber-300/90'}`}>
                                  {isSick ? '🩺 Incapacidad médica' : '🟡 Vacaciones'}
                                </span>
                              </div>
                            </div>

                            {/* Días y Fechas + Métrica de SP */}
                            <div className="space-y-1.5 border-t border-b border-slate-200/60 dark:border-slate-700/60 py-2">
                              <div className="flex items-center justify-between">
                                <div className="font-black text-slate-900 dark:text-white text-[14px]">
                                  {ev.days} {ev.days === 1 ? 'día' : 'días'}
                                </div>
                                <span className={`px-2 py-0.5 rounded-md font-extrabold text-[12px] ${isSick ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40' : 'bg-amber-50/60 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300/90 border border-amber-200/40 dark:border-amber-900/30'}`}>
                                  {getDevRiskSP(ev.devName) || (isSick ? 13 : 5)} SP en riesgo
                                </span>
                              </div>
                              <div className="text-[12px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <span>{ev.startDate}</span>
                                <span>→</span>
                                <span>{ev.endDate}</span>
                              </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center justify-between pt-0.5">
                              <button
                                type="button"
                                onClick={() => setSelectedDevForTasks(ev.devName)}
                                className="text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors"
                              >
                                <span>Ver tareas</span>
                                <ChevronRight size={12} />
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => startEditEvent(ev)}
                                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                                  title="Editar registro"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEvent(ev.id)}
                                  className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 cursor-pointer"
                                  title="Eliminar registro"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Enlace Ver todas las novedades */}
                    <div className="flex items-center justify-center p-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowAllNovedadesModal(true)}
                        className="text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Ver todas las novedades</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>

            </div>

          </div>

          {/* ── COLUMNA DERECHA: TARJETA VERTICAL CON PASO 1, PASO 2 Y MEDIDOR DE IMPACTO ── */}
          <div className="lg:col-span-5 p-5 rounded-3xl bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-slate-800 shadow-2xs space-y-5">
            
            {/* PASO 1: CAPACIDAD BASE DEL EQUIPO */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings size={16} className="text-slate-600 dark:text-slate-400" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    PASO 1: CAPACIDAD BASE
                    <InfoTooltip text="Parámetros base del equipo para calcular la capacidad bruta total del sprint." />
                  </h4>
                </div>
                <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                  CONFIGURACIÓN INICIAL
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <span>Integrantes</span>
                    <InfoTooltip text="Número total de desarrolladores en el equipo." align="left" />
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={devCount}
                    onChange={(e) => setDevCount(Number(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-black text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-slate-400/20 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <span>Dias Sprint</span>
                    <InfoTooltip text="Días hábiles laborables por sprint." align="center" />
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={sprintDays}
                    onChange={(e) => setSprintDays(Number(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-black text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-slate-400/20 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <span>Velocidad/Dev</span>
                    <InfoTooltip text="Story Points promedio entregados por desarrollador." align="right" />
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={avgDevVelocity}
                    onChange={(e) => setAvgDevVelocity(Number(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-black text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-slate-400/20 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* PASO 2: NOVEDADES E INCAPACIDADES */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-slate-600 dark:text-slate-400" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    PASO 2: NOVEDADES E INCAPACIDADES
                    <InfoTooltip text="Días perdidos por vacaciones, licencias o bajas médicas." />
                  </h4>
                </div>
                <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                  DESCUENTOS
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <span>Vacaciones</span>
                    <InfoTooltip text="Días totales de vacaciones planificadas." align="left" />
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={vacationDays}
                    onChange={(e) => setVacationDays(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-black text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <span>Devs Baja</span>
                    <InfoTooltip text="Desarrolladores fuera por baja médica." align="center" />
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={devCount}
                    value={sickDevsCount}
                    onChange={(e) => setSickDevsCount(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-black text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <span>Dias/Baja</span>
                    <InfoTooltip text="Días hábiles promedio de baja por desarrollador." align="right" />
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={sprintDays}
                    value={sickDays}
                    onChange={(e) => setSickDays(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-black text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* MEDIDOR DE IMPACTO CON TACÓMETRO/VELOCÍMETRO (UBICADO DEBAJO DEL PASO 1 Y 2) */}
            {results && <CapacityResults results={results} />}

            {/* BOTONES DE ESCENARIOS PREPROGRAMADOS */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                ESCENARIOS PREPROGRAMADOS DE PRUEBA RÁPIDA:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { setSickDevsCount(1); setSickDays(5); }}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[10px] font-black cursor-pointer transition-all"
                >
                  ⚡ 1 Dev incapacitado (5 días)
                </button>
                <button
                  type="button"
                  onClick={() => { setSickDevsCount(1); setSickDays(sprintDays); }}
                  className="px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/20 text-[10px] font-black cursor-pointer transition-all"
                >
                  🚨 1 Dev baja médica (Todo el sprint)
                </button>
                <button
                  type="button"
                  onClick={handleResetScenarios}
                  className="px-2.5 py-1 rounded-xl bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold cursor-pointer transition-all"
                >
                  🔄 Restablecer sin Incapacidades
                </button>
              </div>
            </div>

          </div>

        </div>

      {/* MODAL ASISTENTE DE REDISTRIBUCIÓN DE TAREAS E IMPACTO POR IA */}
      {selectedDevForTasks && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                  <Sparkles size={18} className="text-amber-500/90" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Plan de Reasignación IA • {selectedDevForTasks}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Analizador de carga y sugerencias de redistribución de tareas en riesgo por baja médica / vacaciones.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDevForTasks(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ShieldAlert size={14} className="text-rose-500/80" />
                Incidencias en Riesgo Asignadas a {selectedDevForTasks}:
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {getTasksForDev(selectedDevForTasks).map((task) => (
                  <div
                    key={task.key}
                    className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-[11px] border border-slate-300/50 dark:border-slate-700">
                          {task.key}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">{task.summary}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span>Proyecto: <strong>{task.project}</strong></span>
                        <span>• Status: <strong>{task.status}</strong></span>
                        <span>• Estimación: <strong className="text-slate-700 dark:text-slate-300">{task.sp} SP</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <span className="text-[10px] text-slate-400 font-bold">Reasignar a:</span>
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleReassignTask(task.key, e.target.value);
                          }
                        }}
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-slate-400/20"
                      >
                        <option value="" disabled>Seleccionar integrante...</option>
                        {activeDevsList.filter(d => d.toLowerCase() !== selectedDevForTasks.toLowerCase()).map((devName) => (
                          <option key={devName} value={devName}>{devName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500/90" />
                Sugerencia IA de Capacidad Disponible en el Equipo:
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {getAvailableDevsWorkload(selectedDevForTasks).map((item) => (
                  <div key={item.devName} className="p-2 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">{item.devName}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex justify-between">
                      <span>{item.tasksCount} tareas</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{item.totalSP} SP total</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 italic">
                Las reasignaciones se sincronizan en tiempo real con la capacidad calculada del sprint.
              </span>
              <button
                type="button"
                onClick={() => setSelectedDevForTasks(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Cerrar y Aplicar
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* MODAL HISTORIAL Y LISTADO COMPLETO DE NOVEDADES Y AUSENCIAS */}
      {showAllNovedadesModal && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
          <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-slate-700 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Historial de Ausencias e Incapacidades
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700">
                      {absenceEvents.length} registradas
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Consulta detallada de todas las novedades del equipo con su justificación y Story Points afectados.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAllNovedadesModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Listado de Novedades */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {absenceEvents.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400">No hay ausencias ni novedades registradas actualmente.</p>
                </div>
              ) : (
                paginatedAbsenceEvents.map((ev) => {
                  const initials = ev.devName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                  const isSick = ev.type === 'SICK';
                  const riskSP = getDevRiskSP(ev.devName);

                  return (
                    <div 
                      key={ev.id}
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${isSick ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300' : 'bg-amber-100/80 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'} font-extrabold text-xs flex items-center justify-center shrink-0`}>
                          {initials}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {ev.devName}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isSick ? 'bg-sky-100/90 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300' : 'bg-amber-100/70 dark:bg-amber-950/50 text-amber-800/90 dark:text-amber-300/90'}`}>
                              {isSick ? '🩺 Incapacidad médica' : '🟡 Vacaciones'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs">
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar size={13} className="text-slate-400" />
                              {ev.startDate} → {ev.endDate}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {ev.days} {ev.days === 1 ? 'día hábil' : 'días hábiles'}
                            </span>
                          </div>

                          {ev.note && (
                            <p className="text-[11px] text-slate-400 italic">
                              "{ev.note}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${isSick ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 border border-sky-200/60 dark:border-sky-900/40' : 'bg-amber-50/60 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300/90 border border-amber-200/40 dark:border-amber-900/30'}`}>
                          {riskSP || (isSick ? 13 : 5)} SP en riesgo
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => { setShowAllNovedadesModal(false); setSelectedDevForTasks(ev.devName); }}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Ver tareas afectadas"
                          >
                            <span>Tareas</span>
                            <ChevronRight size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowAllNovedadesModal(false); startEditEvent(ev); }}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                            title="Editar"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveEvent(ev.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Controles de Paginación cuando hay más de 10 registros */}
            {absenceEvents.length > ITEMS_PER_PAGE && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 px-1 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-medium">
                  Mostrando <strong>{(currentNovedadesPage - 1) * ITEMS_PER_PAGE + 1}</strong> - <strong>{Math.min(currentNovedadesPage * ITEMS_PER_PAGE, absenceEvents.length)}</strong> de <strong>{absenceEvents.length}</strong> novedades
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentNovedadesPage === 1}
                    onClick={() => setNovedadesPage(p => Math.max(p - 1, 1))}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={13} />
                    <span>Anterior</span>
                  </button>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-xs px-1">
                    Página {currentNovedadesPage} de {totalNovedadesPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentNovedadesPage >= totalNovedadesPages}
                    onClick={() => setNovedadesPage(p => Math.min(p + 1, totalNovedadesPages))}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <span>Siguiente</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Footer Modal */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setShowAllNovedadesModal(false); setShowCalendarForm(true); }}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-800/80 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Plus size={14} />
                <span>Registrar Nueva Novedad</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAllNovedadesModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
      {/* MODAL PRINCIPAL: PLAN DE CONTINGENCIA NUBI IA (REDISTRIBUCIÓN INTELIGENTE Y ANÁLISIS DE CUALIFICACIÓN) */}
      {showNubiContingencyModal && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
          <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-left">
            
            {/* ENCABEZADO DEGRADADO NUBI IA */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 text-white border-b border-indigo-500/20 relative overflow-hidden shrink-0">
              <div className="absolute right-0 top-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md border border-white/20">
                  <Bot className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/30 text-purple-200 border border-purple-400/30 flex items-center gap-1 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-amber-300" /> Nubi IA • Redistribución Inteligente
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                    Plan de Contingencia y Evaluación de Cualificación
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNubiContingencyModal(false)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* NOTIFICACIÓN DE ÉXITO SI SE APLICÓ */}
            {nubiSuccessMessage && (
              <div className="p-4 bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
                <CheckCircle2 size={18} />
                <span>{nubiSuccessMessage}</span>
              </div>
            )}

            {/* CUERPO DEL MODAL (SCROLL) */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
              
              {/* TARJETA DE RESUMEN EJECUTIVO IA */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-purple-50/50 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    Diagnóstico Inteligente del Sprint
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    {contingencyRecommendations.length} Incidencias Cobertura
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  Nubi IA ha analizado los perfiles técnicos, especialización (Frontend, Backend, DB, QA) y el estado de la carga de trabajo en tiempo real de cada desarrollador activo para garantizar cero sobrecarga y máximo rendimiento.
                </p>
              </div>

              {/* LISTADO DE TAREAS Y EVALUACIÓN DE DESARROLLADORES MÁS APTOS */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Recomendación Inteligente por Incidencia</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Cualificación + Flujo de Trabajo</span>
                </h4>

                {contingencyRecommendations.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400">No hay ausencias ni novedades pendientes de contingencia.</p>
                  </div>
                ) : (
                  contingencyRecommendations.map((rec) => {
                    const currentSelectedDev = customNubiAssignments[rec.task.key] || rec.recommendedDev;
                    const selectedCandidateInfo = rec.allCandidates.find(c => c.candidate === currentSelectedDev) || rec.allCandidates[0];

                    return (
                      <div 
                        key={rec.task.key}
                        className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 space-y-3 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                      >
                        {/* Cabecera de la tarea afectada */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800/60 text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-[11px]">
                                {rec.task.key}
                              </span>
                              <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                                {rec.task.summary}
                              </h5>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <span>Proyecto: <strong className="text-slate-700 dark:text-slate-300">{rec.task.project}</strong></span>
                              <span>•</span>
                              <span>Estimación: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{rec.task.sp} SP</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                            <span className="text-[10px] text-slate-400 font-semibold">Ausente:</span>
                            <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40 text-[10px] font-bold">
                              🩺 {rec.absentDev}
                            </span>
                          </div>
                        </div>

                        {/* Ficha del Desarrollador Más Apto Recomendado por Nubi IA */}
                        <div className="p-3.5 rounded-xl bg-white dark:bg-[#181d36] border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                                {currentSelectedDev.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                                    {currentSelectedDev}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 flex items-center gap-1">
                                    <Award size={11} className="text-emerald-500" />
                                    {selectedCandidateInfo?.matchPct}% Aptitud IA
                                  </span>
                                </div>
                                <div className="text-[11px] text-indigo-600 dark:text-indigo-300 font-bold mt-0.5 flex items-center gap-2">
                                  <span>{selectedCandidateInfo?.specialty}</span>
                                  <span>•</span>
                                  <span>Flujo: {selectedCandidateInfo?.flowStatus}</span>
                                </div>
                              </div>
                            </div>

                            {/* Dropdown Selector de Desarrolladores Aptos */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] text-slate-400 font-bold">Asignar a:</span>
                              <select
                                value={currentSelectedDev}
                                onChange={(e) => {
                                  setCustomNubiAssignments(prev => ({
                                    ...prev,
                                    [rec.task.key]: e.target.value
                                  }));
                                }}
                                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                              >
                                {rec.allCandidates.map(c => (
                                  <option key={c.candidate} value={c.candidate}>
                                    {c.candidate} ({c.matchPct}% Aptitud - {c.currentSP} SP)
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Explicación de Nubi IA de Por Qué es el Más Calificado */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                            <Sparkles size={13} className="text-amber-500 shrink-0 mt-0.5" />
                            <span><strong>Criterio Nubi IA:</strong> {selectedCandidateInfo?.reason || rec.reason}</span>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* PIE DEL MODAL */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#101426] shrink-0">
              <button
                type="button"
                onClick={() => setShowNubiContingencyModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isApplyingNubiPlan || contingencyRecommendations.length === 0}
                onClick={handleConfirmNubiContingency}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isApplyingNubiPlan ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Nubi IA Procesando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-amber-300 animate-pulse" />
                    <span>Confirmar y Redistribuir con Nubi IA</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}


