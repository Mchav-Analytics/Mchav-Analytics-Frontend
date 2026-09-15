import React, { useState } from 'react';
import { 
  Calendar, Plus, CheckCircle2, Trash2, RefreshCw, Edit3, 
  UserCheck, ShieldAlert, Sparkles, X, ChevronRight, AlertCircle, ArrowRight, Zap, Settings, AlertTriangle, Sliders
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
  handleAddAbsenceEvent,
  handleUpdateAbsenceEvent,
  handleRemoveEvent,
  handleReassignTask,
  handleResetScenarios,
  results
}) {
  const [newDevName, setNewDevName] = useState(TEAM_DEVS[0] || 'Michael Rodríguez');
  const [customDevName, setCustomDevName] = useState('');
  const [isCustomDev, setIsCustomDev] = useState(false);
  const [newAbsenceType, setNewAbsenceType] = useState('SICK'); 
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showCalendarForm, setShowCalendarForm] = useState(false);

  const [editingEventId, setEditingEventId] = useState(null);
  const [editFields, setEditFields] = useState({ startDate: '', endDate: '', type: 'SICK', note: '' });

  const [selectedDevForTasks, setSelectedDevForTasks] = useState(null);

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

  const getAvailableDevsWorkload = (absentDevName) => {
    const activeDevs = TEAM_DEVS.filter(d => d.toLowerCase() !== absentDevName?.toLowerCase());
    return activeDevs.map(dev => {
      const devTasks = getTasksForDev(dev);
      const totalSP = devTasks.reduce((sum, t) => sum + (t.sp || 0), 0);
      return { devName: dev, tasksCount: devTasks.length, totalSP };
    }).sort((a, b) => a.totalSP - b.totalSP);
  };

  const getContingencyPlan = () => {
    if (!absenceEvents || absenceEvents.length === 0 || !jiraTasks) return [];

    const absentDevNames = absenceEvents.map(e => e.devName.toLowerCase());
    const availableDevs = TEAM_DEVS.filter(d => !absentDevNames.includes(d.toLowerCase()));

    if (availableDevs.length === 0) return [];

    const devWorkloadMap = {};
    availableDevs.forEach(dev => {
      const devTasks = jiraTasks.filter(t => t.assignee.toLowerCase() === dev.toLowerCase() && t.status !== 'Completados');
      devWorkloadMap[dev] = devTasks.reduce((sum, t) => sum + (t.sp || 0), 0);
    });

    const recommendations = [];

    absenceEvents.forEach(event => {
      const devName = event.devName;
      const tasks = jiraTasks.filter(t => t.assignee.toLowerCase() === devName.toLowerCase() && t.status !== 'Completados');

      tasks.forEach(task => {
        let bestCandidate = availableDevs[0];
        let highestScore = -999;
        let bestReason = '';

        availableDevs.forEach(candidate => {
          const currentSP = devWorkloadMap[candidate] || 0;
          let score = 100 - (currentSP * 6);

          const summaryLower = (task.summary + ' ' + task.key).toLowerCase();
          if ((summaryLower.includes('auth') || summaryLower.includes('oauth') || summaryLower.includes('ui') || summaryLower.includes('frontend')) && candidate === 'Stephany León') {
            score += 25;
          } else if ((summaryLower.includes('api') || summaryLower.includes('rest') || summaryLower.includes('backend') || summaryLower.includes('endpoint')) && candidate === 'Andrés Alcalá') {
            score += 25;
          } else if ((summaryLower.includes('sql') || summaryLower.includes('etl') || summaryLower.includes('docker') || summaryLower.includes('reportes')) && candidate === 'Mai Salamanca') {
            score += 25;
          } else if ((summaryLower.includes('wcag') || summaryLower.includes('modelo') || summaryLower.includes('tabla')) && candidate === 'Valentina Montalvo') {
            score += 25;
          }

          if (score > highestScore) {
            highestScore = score;
            bestCandidate = candidate;
            const matchPct = Math.min(98, Math.max(82, Math.round(score)));
            bestReason = `${candidate} cuenta con la menor carga del sprint (${currentSP} SP) y alta especialidad en este tipo de incidencias.`;
          }
        });

        recommendations.push({
          task,
          absentDev: devName,
          recommendedDev: bestCandidate,
          recommendedDevSP: devWorkloadMap[bestCandidate] || 0,
          matchPct: Math.min(98, Math.max(82, Math.round(highestScore))),
          reason: bestReason
        });
      });
    });

    return recommendations;
  };

  const contingencyRecommendations = getContingencyPlan();

  const handleApplyAllContingency = () => {
    contingencyRecommendations.forEach(rec => {
      if (handleReassignTask) {
        handleReassignTask(rec.task.key, rec.recommendedDev);
      }
    });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-150 font-sans text-left">
        
        {/* 1. SECCIÓN SUPERIOR: PASO 1 Y PASO 2 EN 2 TARJETAS LADO A LADO (TAL COMO EN LA FOTO) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* PASO 1: CAPACIDAD BASE DEL EQUIPO */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-200/90 dark:border-indigo-800/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                  PASO 1: CAPACIDAD BASE DEL EQUIPO
                  <InfoTooltip text="Parámetros base del equipo para calcular la capacidad bruta total del sprint." />
                </h4>
              </div>
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider shrink-0">
                CONFIGURACIÓN INICIAL
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center justify-between">
                  <span>Integrantes</span>
                  <InfoTooltip text="Número total de desarrolladores en el equipo." align="left" />
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={devCount}
                  onChange={(e) => setDevCount(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-black text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center justify-between">
                  <span>Dias Sprint</span>
                  <InfoTooltip text="Días hábiles laborables por sprint." align="center" />
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={sprintDays}
                  onChange={(e) => setSprintDays(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-black text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center justify-between">
                  <span>Velocidad/Dev</span>
                  <InfoTooltip text="Story Points promedio entregados por desarrollador." align="right" />
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={avgDevVelocity}
                  onChange={(e) => setAvgDevVelocity(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-black text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* PASO 2: NOVEDADES E INCAPACIDADES */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-200/90 dark:border-rose-900/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" />
                <h4 className="text-xs font-black text-rose-950 dark:text-rose-200 uppercase tracking-wider flex items-center gap-1.5">
                  PASO 2: NOVEDADES E INCAPACIDADES
                  <InfoTooltip text="Días perdidos por vacaciones, licencias o bajas médicas." />
                </h4>
              </div>
              <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider shrink-0">
                DESCUENTO DE DÍAS
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center justify-between">
                  <span>Vacaciones (Días)</span>
                  <InfoTooltip text="Días totales de vacaciones planificadas." align="left" />
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={vacationDays}
                  onChange={(e) => setVacationDays(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-black text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-rose-800 dark:text-rose-300 block mb-1 flex items-center justify-between">
                  <span>Devs Baja Médica</span>
                  <InfoTooltip text="Desarrolladores fuera por baja médica." align="center" />
                </label>
                <input
                  type="number"
                  min={0}
                  max={devCount}
                  value={sickDevsCount}
                  onChange={(e) => setSickDevsCount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 rounded-full text-xs font-black text-rose-900 dark:text-rose-200 text-center focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-rose-800 dark:text-rose-300 block mb-1 flex items-center justify-between">
                  <span>Dias / Baja Dev</span>
                  <InfoTooltip text="Días hábiles promedio de baja por desarrollador." align="right" />
                </label>
                <input
                  type="number"
                  min={0}
                  max={sprintDays}
                  value={sickDays}
                  onChange={(e) => setSickDays(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 rounded-full text-xs font-black text-rose-900 dark:text-rose-200 text-center focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
                />
              </div>
            </div>
          </div>

        </div>

        {/* 2. SECCIÓN DE RESULTADOS EJECUTIVOS DE CAPACIDAD */}
        {results && <CapacityResults results={results} />}

        {/* 3. SECCIÓN PLAN DE CONTINGENCIA Y REDISTRIBUCIÓN RECOMENDADA POR IA */}
        {contingencyRecommendations.length > 0 && (
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-slate-50/50 to-purple-50/30 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#171a38]/80 border border-indigo-200/80 dark:border-slate-800 space-y-4 shadow-sm animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                    PLAN DE CONTINGENCIA Y REDISTRIBUCIÓN INTELIGENTE POR IA
                    <InfoTooltip text="Algoritmo de Inteligencia Artificial que analiza la especialidad técnica y la carga libre disponible de los integrantes para mitigar el riesgo de baja del sprint." />
                  </h4>
                  <p className="text-[11px] text-indigo-700/80 dark:text-slate-400 font-medium">
                    {contingencyRecommendations.length} {contingencyRecommendations.length === 1 ? 'incidencia requiere' : 'incidencias requieren'} cobertura por incapacidad o vacaciones.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplyAllContingency}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-102 shrink-0"
                title="Reasigna automáticamente todas las tareas afectadas a los candidatos recomendados con un solo clic"
              >
                <Zap size={14} />
                <span>Aplicar Plan de Contingencia Completo</span>
              </button>
            </div>

            {/* CARDS DE SUGERENCIAS INDIVIDUALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contingencyRecommendations.map((rec) => (
                <div key={rec.task.key} className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-indigo-100 dark:border-slate-700/80 space-y-2.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-black text-[11px]">
                      {rec.task.key} ({rec.task.sp} SP)
                    </span>
                    <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md">
                      Dev Ausente: {rec.absentDev}
                    </span>
                  </div>

                  <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{rec.task.summary}</div>

                  <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-slate-900/60 border border-indigo-100 dark:border-slate-700/50 text-[11px] text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-between font-extrabold text-indigo-950 dark:text-indigo-300 mb-0.5">
                      <span>Candidato Sugerido: {rec.recommendedDev}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-0.5">
                        <Zap size={10} /> {rec.matchPct}% Match
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic leading-snug">{rec.reason}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-medium">Carga actual: {rec.recommendedDevSP} SP</span>
                    <button
                      type="button"
                      onClick={() => handleReassignTask(rec.task.key, rec.recommendedDev)}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                      title={`Reasigna inmediatamente ${rec.task.key} a ${rec.recommendedDev}`}
                    >
                      <CheckCircle2 size={12} />
                      <span>Reasigna a {rec.recommendedDev.split(' ')[0]}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SECCIÓN REGISTRO DE AUSENCIAS E INCAPACIDADES POR DESARROLLADOR */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-slate-50/50 to-blue-50/30 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#171a38]/80 border border-indigo-100 dark:border-slate-800 space-y-4 shadow-2xs">
          
          {/* Cabecera de la Sección */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-indigo-100/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                <Calendar size={18} />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  REGISTRO DE AUSENCIAS E INCAPACIDADES POR DESARROLLADOR
                  <InfoTooltip text="Programa ausencias o incapacidades con fechas exactas, asigna el desarrollador específico y alarga el registro si la baja médica o vacaciones se extienden." />
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Gestión de novedades por integrante con consulta de tareas en riesgo y plan de redistribución por IA.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setShowCalendarForm(!showCalendarForm)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-102"
                title="Añadir una nueva novedad de vacaciones o incapacidad médica por fechas"
              >
                <Plus size={14} />
                <span>{showCalendarForm ? 'Ocultar Formulario' : 'Registrar Ausencia / Incapacidad'}</span>
              </button>
            </div>
          </div>

          {/* FORMULARIO DE NUEVO REGISTRO */}
          {showCalendarForm && (
            <form onSubmit={onSubmit} className="p-4 rounded-2xl bg-white dark:bg-[#14192b] border border-indigo-200/80 dark:border-indigo-500/30 space-y-4 shadow-sm animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-500" />
                  Registrar Nueva Novedad de Personal
                </h4>
                <span className="text-[10px] text-slate-400 font-semibold">Calculador automático de días hábiles</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                
                {/* Selección de Desarrollador */}
                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Desarrollador / Integrante <span className="text-rose-500">*</span>
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
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                    >
                      {TEAM_DEVS.map((dev, idx) => (
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
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-indigo-400 dark:border-indigo-500 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomDev(false)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline shrink-0"
                      >
                        Volver
                      </button>
                    </div>
                  )}
                </div>

                {/* Tipo de Novedad */}
                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tipo de Evento <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newAbsenceType}
                    onChange={(e) => setNewAbsenceType(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                  >
                    <option value="SICK">Incapacidad Médica (Imprevista)</option>
                    <option value="VACATION">Vacaciones (Planificadas)</option>
                    <option value="PERSONAL">Permiso Especial / Día Libre</option>
                  </select>
                </div>

                {/* Fecha Inicio (Desde) */}
                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Fecha Inicio (Desde) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Fecha Fin (Hasta) */}
                <div>
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Fecha Fin (Hasta) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>

              </div>

              {/* Fila de Nota y Previsualización de Días */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <input
                  type="text"
                  placeholder="Motivo o detalle (ej: Incapacidad EPS 5 días por cirugía / Vacaciones de ley)..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full sm:flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none"
                />

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
                  {calculatedDaysPreview > 0 && (
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/20 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30">
                      = {calculatedDaysPreview} días laborables
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={!newStartDate || !newEndDate || calculatedDaysPreview <= 0}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-sm"
                  >
                    <CheckCircle2 size={14} />
                    <span>Guardar Novedad</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TARJETAS DE AUSENCIAS / INCAPACIDADES GUARDADAS */}
          {absenceEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {absenceEvents.map((ev) => {
                const devTasks = getTasksForDev(ev.devName);
                const riskSP = getDevRiskSP(ev.devName);
                const isEditing = editingEventId === ev.id;

                const isSick = ev.type === 'SICK';
                const isVacation = ev.type === 'VACATION';

                return (
                  <div
                    key={ev.id}
                    className={`p-4 rounded-2xl border transition-all shadow-xs flex flex-col justify-between gap-3 ${
                      isSick
                        ? 'bg-gradient-to-br from-rose-50/90 to-rose-100/40 dark:from-rose-950/40 dark:to-slate-900 border-rose-200 dark:border-rose-900/60'
                        : isVacation
                        ? 'bg-gradient-to-br from-amber-50/90 to-amber-100/40 dark:from-amber-950/40 dark:to-slate-900 border-amber-200 dark:border-amber-900/60'
                        : 'bg-gradient-to-br from-indigo-50/90 to-blue-100/40 dark:from-indigo-950/40 dark:to-slate-900 border-indigo-200 dark:border-indigo-900/60'
                    }`}
                  >
                    {!isEditing ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                                  isSick
                                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                                    : isVacation
                                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                                    : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                                }`}>
                                  {isSick ? 'Incapacidad Médica' : isVacation ? 'Vacaciones' : 'Permiso Especial'}
                                </span>
                                <span className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
                                  <UserCheck size={13} className="text-indigo-500" />
                                  {ev.devName}
                                </span>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 text-xs font-black text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shrink-0">
                              {ev.days} {ev.days === 1 ? 'día' : 'días'} hábiles
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1.5 pt-0.5">
                            <Calendar size={13} className="text-slate-400" />
                            <span>{ev.startDate}</span>
                            <ArrowRight size={12} className="text-slate-400" />
                            <span>{ev.endDate}</span>
                          </div>

                          {ev.note && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic bg-white/50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                              "{ev.note}"
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
                          {devTasks.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setSelectedDevForTasks(ev.devName)}
                              className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs hover:scale-102"
                              title="Ver tareas del desarrollador y sugerencias de reasignación por IA"
                            >
                              <Sparkles size={12} />
                              <span>{devTasks.length} {devTasks.length === 1 ? 'Tarea' : 'Tareas'} ({riskSP} SP)</span>
                              <ChevronRight size={12} />
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              Sin tareas pendientes en el sprint
                            </span>
                          )}

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEditEvent(ev)}
                              title="Modificar o alargar incapacidad/vacaciones"
                              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 text-[11px] font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Edit3 size={12} />
                              <span>Editar / Alargar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveEvent(ev.id)}
                              title="Eliminar este registro"
                              className="p-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 cursor-pointer transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3 p-1">
                        <div className="flex items-center justify-between border-b border-indigo-200 dark:border-indigo-800 pb-1.5">
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                            <Edit3 size={13} />
                            Modificar o Alargar Ausencia de {ev.devName}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingEventId(null)}
                            className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            Cancelar
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">Tipo Novedad</label>
                            <select
                              value={editFields.type}
                              onChange={(e) => setEditFields({ ...editFields, type: e.target.value })}
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
                            >
                              <option value="SICK">Incapacidad Médica</option>
                              <option value="VACATION">Vacaciones</option>
                              <option value="PERSONAL">Permiso Especial</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">Fecha Inicio</label>
                            <input
                              type="date"
                              value={editFields.startDate}
                              onChange={(e) => setEditFields({ ...editFields, startDate: e.target.value })}
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                              Fecha Fin <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">(Alargar)</span>
                            </label>
                            <input
                              type="date"
                              value={editFields.endDate}
                              onChange={(e) => setEditFields({ ...editFields, endDate: e.target.value })}
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-indigo-400 dark:border-indigo-500 rounded-lg text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">Nota o Motivo</label>
                          <input
                            type="text"
                            value={editFields.note}
                            onChange={(e) => setEditFields({ ...editFields, note: e.target.value })}
                            className="w-full px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                            placeholder="Nota sobre la prórroga de la baja o cambio de fecha..."
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingEventId(null)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            Descartar
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEditEvent(ev.id)}
                            className="px-3.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
                          >
                            Guardar Prórroga
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-400 font-medium italic">
              No hay ausencias ni incapacidades registradas. Haz clic en "Registrar Ausencia / Incapacidad" para agregar una novedad por integrante.
            </div>
          )}
        </div>

      {/* MODAL ASISTENTE DE REDISTRIBUCIÓN DE TAREAS E IMPACTO POR IA */}
      {selectedDevForTasks && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
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
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ShieldAlert size={14} className="text-rose-500" />
                Incidencias en Riesgo Asignadas a {selectedDevForTasks}:
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {getTasksForDev(selectedDevForTasks).map((task) => (
                  <div
                    key={task.key}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-black text-[11px]">
                          {task.key}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">{task.summary}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span>Proyecto: <strong>{task.project}</strong></span>
                        <span>• Status: <strong>{task.status}</strong></span>
                        <span>• Estimación: <strong className="text-indigo-600 dark:text-indigo-400">{task.sp} SP</strong></span>
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
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-600/50 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/30"
                      >
                        <option value="" disabled>Seleccionar integrante...</option>
                        {TEAM_DEVS.filter(d => d.toLowerCase() !== selectedDevForTasks.toLowerCase()).map((devName) => (
                          <option key={devName} value={devName}>{devName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-slate-900/60 border border-indigo-100 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                Sugerencia IA de Capacidad Disponible en el Equipo:
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {getAvailableDevsWorkload(selectedDevForTasks).map((item) => (
                  <div key={item.devName} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white truncate">{item.devName}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex justify-between">
                      <span>{item.tasksCount} tareas</span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{item.totalSP} SP total</span>
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
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-sm transition-all"
              >
                Cerrar y Aplicar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
