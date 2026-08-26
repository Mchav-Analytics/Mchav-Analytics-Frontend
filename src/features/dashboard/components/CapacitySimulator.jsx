import React, { useState } from 'react';
import { Sliders, X, Activity, RefreshCw, Info, Calendar, Plus, Trash2, HeartPulse, UserCheck, CheckCircle2 } from 'lucide-react';

const InfoTooltip = ({ text, align = "center" }) => {
  return (
    <div className="group/tooltip relative inline-flex items-center cursor-help ml-1 shrink-0 z-30">
      <div className="p-0.5 rounded-full text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
        <Info size={13} />
      </div>
      <div className={`absolute bottom-full mb-2 ${align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"} hidden group-hover/tooltip:block w-60 p-2.5 bg-slate-900/95 dark:bg-slate-950/95 text-slate-100 text-[11px] font-normal leading-relaxed rounded-xl shadow-2xl z-50 pointer-events-none text-left backdrop-blur-md border border-slate-700/80`}>
        {text}
        <div className={`absolute top-full ${align === "right" ? "right-3" : align === "left" ? "left-3" : "left-1/2 -translate-x-1/2"} border-4 border-transparent border-t-slate-900 dark:border-t-slate-950`}></div>
      </div>
    </div>
  );
};

// Función auxiliar para calcular días hábiles entre 2 fechas (excluyendo sábados y domingos)
function calculateBusinessDays(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start) || isNaN(end) || start > end) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dayOfWeek = cur.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export default function CapacitySimulator({ 
  devCount, setDevCount, 
  sprintDays, setSprintDays, 
  vacationDays, setVacationDays, 
  sickDevsCount, setSickDevsCount, 
  sickDays, setSickDays, 
  avgDevVelocity, setAvgDevVelocity, 
  onClose 
}) {
  // Lista de ausencias/incapacidades programadas por fecha
  const [absenceEvents, setAbsenceEvents] = useState([
    { id: 1, devName: 'Desarrollador 1', type: 'VACATION', startDate: '2026-09-01', endDate: '2026-09-02', days: 2, note: 'Vacaciones planificadas' }
  ]);

  // Campos del formulario de rango de fechas
  const [newDevName, setNewDevName] = useState('Desarrollador 1');
  const [newAbsenceType, setNewAbsenceType] = useState('SICK'); // 'VACATION' o 'SICK'
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showCalendarForm, setShowCalendarForm] = useState(false);

  // Recalcular métricas del simulador según los eventos del calendario
  const recalculateFromEvents = (events) => {
    let totalVacation = 0;
    let sickDevsMap = {};

    events.forEach(ev => {
      if (ev.type === 'VACATION') {
        totalVacation += ev.days;
      } else if (ev.type === 'SICK') {
        sickDevsMap[ev.devName] = (sickDevsMap[ev.devName] || 0) + ev.days;
      }
    });

    setVacationDays(totalVacation);

    const sickDevNames = Object.keys(sickDevsMap);
    const countSickDevs = sickDevNames.length;
    const avgSickDays = countSickDevs > 0 
      ? Math.round(Object.values(sickDevsMap).reduce((a, b) => a + b, 0) / countSickDevs) 
      : 0;

    setSickDevsCount(countSickDevs);
    setSickDays(avgSickDays);
  };

  // Agregar evento por rango de fechas
  const handleAddAbsenceEvent = (e) => {
    e.preventDefault();
    if (!newStartDate || !newEndDate) return;
    
    const days = calculateBusinessDays(newStartDate, newEndDate);
    if (days <= 0) return;

    const newEvent = {
      id: Date.now(),
      devName: newDevName,
      type: newAbsenceType,
      startDate: newStartDate,
      endDate: newEndDate,
      days,
      note: newNote.trim() || (newAbsenceType === 'SICK' ? 'Incapacidad Médica' : 'Vacaciones')
    };

    const updated = [...absenceEvents, newEvent];
    setAbsenceEvents(updated);
    recalculateFromEvents(updated);

    // Limpiar formulario
    setNewStartDate('');
    setNewEndDate('');
    setNewNote('');
    setShowCalendarForm(false);
  };

  // Eliminar evento de ausencia
  const handleRemoveEvent = (id) => {
    const updated = absenceEvents.filter(ev => ev.id !== id);
    setAbsenceEvents(updated);
    recalculateFromEvents(updated);
  };

  // Cálculos matemáticos del simulador
  const theoreticalDays = (devCount || 1) * (sprintDays || 1);
  const absenceDays = (vacationDays || 0) + ((sickDevsCount || 0) * (sickDays || 0));
  const netDays = Math.max(0, theoreticalDays - absenceDays);
  
  const standardCapacitySP = (devCount || 1) * (avgDevVelocity || 10);
  const ratio = theoreticalDays > 0 ? (netDays / theoreticalDays) : 1;
  const adjustedCapacitySP = Math.round(standardCapacitySP * ratio);
  
  const spDiff = adjustedCapacitySP - standardCapacitySP;
  const spDiffPct = standardCapacitySP > 0 ? Math.round((spDiff / standardCapacitySP) * 100) : 0;
  const impactPct = Math.abs(spDiffPct);

  // Nivel de impacto y diagnóstico
  let impactBadgeText = '🟢 IMPACTO MANEJABLE (<15%)';
  let impactBadgeStyle = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
  let barColor = 'bg-emerald-500';
  let diagnosticText = '🟢 Capacidad Normal: El equipo cuenta con margen para absorber la carga de trabajo planificada con redistribución interna ligera entre los desarrolladores activos.';

  if (impactPct >= 15 && impactPct < 30) {
    impactBadgeText = '🟡 IMPACTO MODERADO (15-30%)';
    impactBadgeStyle = 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
    barColor = 'bg-amber-500';
    diagnosticText = '🟡 Alerta Moderada: Se recomienda reajustar el compromiso del sprint removiendo 1 o 2 tareas de menor prioridad.';
  } else if (impactPct >= 30) {
    impactBadgeText = '🔴 IMPACTO CRÍTICO (>30%)';
    impactBadgeStyle = 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
    barColor = 'bg-rose-500';
    diagnosticText = '🔴 Riesgo Severo: Se requiere despriorizar historias principales y negociar el alcance del sprint con el Product Owner.';
  }

  // Días laborables en tiempo real al seleccionar rango
  const calculatedDaysPreview = calculateBusinessDays(newStartDate, newEndDate);

  return (
    <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-3xl p-5 shadow-sm dark:shadow-xl animate-in zoom-in-95 duration-200 space-y-4 text-left font-sans">
      
      {/* CABECERA */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="text-indigo-600 dark:text-indigo-400" size={18} />
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center">
            SIMULADOR DE CAPACIDAD & REGISTRO DE INCAPACIDADES POR CALENDARIO
            <InfoTooltip text="Calcula la capacidad real disponible en Story Points (SP) registrando ausencias o incapacidades por rango exacto de fechas (Desde - Hasta)." align="left" />
          </h3>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer">
          <X size={16} />
        </button>
      </div>

      {/* FILA 1: CAMPOS GENERALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center">
            Integrantes Activos
            <InfoTooltip text="Número de desarrolladores actualmente asignados al equipo." />
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={devCount}
            onChange={(e) => setDevCount(Number(e.target.value) || 1)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center">
            Días del Sprint
            <InfoTooltip text="Duración en días laborables del sprint (normalmente 10 días)." />
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={sprintDays}
            onChange={(e) => setSprintDays(Number(e.target.value) || 1)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center">
            Ausencias Planificadas
            <InfoTooltip text="Días totales de vacaciones o permisos programados en el calendario." />
          </label>
          <input
            type="number"
            min={0}
            max={50}
            value={vacationDays}
            onChange={(e) => setVacationDays(Number(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 mb-1 flex items-center">
            🚨 Devs Incapacitados
            <InfoTooltip text="Cantidad de desarrolladores fuera por baja médica." />
          </label>
          <input
            type="number"
            min={0}
            max={devCount}
            value={sickDevsCount}
            onChange={(e) => setSickDevsCount(Number(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs font-bold text-rose-900 dark:text-rose-200 focus:ring-2 focus:ring-rose-500/30 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 mb-1 flex items-center">
            🩺 Días Incapacidad / Dev
            <InfoTooltip text="Días laborables promedios de incapacidad." />
          </label>
          <input
            type="number"
            min={0}
            max={sprintDays}
            value={sickDays}
            onChange={(e) => setSickDays(Number(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs font-bold text-rose-900 dark:text-rose-200 focus:ring-2 focus:ring-rose-500/30 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center">
            Velocidad Prom / Dev
            <InfoTooltip text="Story Points que entrega 1 dev por sprint." />
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={avgDevVelocity}
            onChange={(e) => setAvgDevVelocity(Number(e.target.value) || 1)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* FILA 2: SECCIÓN DE CALENDARIO (REGISTRO POR RANGO DE FECHAS) */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-slate-900/70 border border-indigo-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="text-indigo-600 dark:text-indigo-400" size={16} />
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
              📅 REGISTRO DE AUSENCIAS E INCAPACIDADES POR RANGO DE FECHAS
              <InfoTooltip text="Selecciona la fecha de inicio y fin (Desde - Hasta) para calcular automáticamente los días laborables de ausencia e impactar la capacidad." />
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowCalendarForm(!showCalendarForm)}
            className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
          >
            <Plus size={13} />
            <span>{showCalendarForm ? 'Ocultar Formulario' : '+ Programar Fecha'}</span>
          </button>
        </div>

        {/* FORMULARIO DESPLEGABLE DE FECHAS */}
        {showCalendarForm && (
          <form onSubmit={handleAddAbsenceEvent} className="p-3.5 rounded-xl bg-white dark:bg-[#14192b] border border-indigo-200 dark:border-indigo-500/30 space-y-3 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Desarrollador */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Desarrollador / Integrante</label>
                <select
                  value={newDevName}
                  onChange={(e) => setNewDevName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none"
                >
                  {Array.from({ length: devCount || 4 }).map((_, idx) => (
                    <option key={idx} value={`Desarrollador ${idx + 1}`}>Desarrollador {idx + 1}</option>
                  ))}
                </select>
              </div>

              {/* Tipo de Ausencia */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Tipo de Evento</label>
                <select
                  value={newAbsenceType}
                  onChange={(e) => setNewAbsenceType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                >
                  <option value="SICK">🚨 Incapacidad Médica (Imprevista)</option>
                  <option value="VACATION">🏖️ Vacaciones / Permiso (Planificado)</option>
                </select>
              </div>

              {/* Fecha Inicio (Desde) */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Fecha Inicio (Desde)</label>
                <input
                  type="date"
                  required
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              {/* Fecha Fin (Hasta) */}
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Fecha Fin (Hasta)</label>
                <input
                  type="date"
                  required
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

            </div>

            {/* Fila de Nota y Previsualización de Días */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <input
                type="text"
                placeholder="Motivo / Nota (Opcional, e.g. Cita médica o Vacaciones de ley)..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full sm:flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none"
              />

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {calculatedDaysPreview > 0 && (
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-500/30">
                    = {calculatedDaysPreview} días hábiles
                  </span>
                )}

                <button
                  type="submit"
                  disabled={!newStartDate || !newEndDate || calculatedDaysPreview <= 0}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-sm"
                >
                  <CheckCircle2 size={14} />
                  <span>Guardar en Calendario</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* LISTADO DE EVENTOS PROGRAMADOS EN EL CALENDARIO */}
        {absenceEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
            {absenceEvents.map((ev) => (
              <div
                key={ev.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                  ev.type === 'SICK'
                    ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-950 dark:text-rose-200'
                    : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200'
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 font-black">
                    <span>{ev.type === 'SICK' ? '🚨 Incapacidad' : '🏖️ Vacaciones'}</span>
                    <span className="text-[10px] font-bold opacity-75">• {ev.devName}</span>
                  </div>
                  <div className="text-[11px] font-semibold flex items-center gap-1 opacity-90">
                    <Calendar size={11} />
                    <span>{ev.startDate} ➔ {ev.endDate}</span>
                    <span className="font-extrabold ml-1">({ev.days} días)</span>
                  </div>
                  {ev.note && <div className="text-[10px] italic opacity-75 truncate">{ev.note}</div>}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveEvent(ev.id)}
                  title="Eliminar este evento del calendario"
                  className="p-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 cursor-pointer shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-2 text-xs text-slate-400 font-medium italic">
            No hay fechas específicas registradas en el calendario. Haz clic en "+ Programar Fecha" para añadir un rango.
          </div>
        )}
      </div>

      {/* FILA 3: BOTONES DE ESCENARIO RÁPIDO */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center">
          ESCENARIOS PREPROGRAMADOS:
          <InfoTooltip text="Escenarios preconfigurados rápidos para probar imprevistos médicos en el sprint." />
        </span>
        
        <button
          type="button"
          onClick={() => { setSickDevsCount(1); setSickDays(6); }}
          title="Simula 1 desarrollador fuera por 6 días laborables"
          className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all cursor-pointer flex items-center gap-1"
        >
          🩹 1 Dev incapacitado (6 días)
        </button>

        <button
          type="button"
          onClick={() => { setSickDevsCount(1); setSickDays(sprintDays); }}
          title="Simula 1 desarrollador fuera durante los 10 días completos del sprint"
          className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 text-[11px] font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all cursor-pointer flex items-center gap-1"
        >
          🚑 1 Dev baja médica (Todo el sprint)
        </button>

        <button
          type="button"
          onClick={() => {
            setAbsenceEvents([]);
            setSickDevsCount(0); 
            setSickDays(0); 
            setVacationDays(0); 
          }}
          title="Restablece los campos de ausencias e incapacidades a cero"
          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all cursor-pointer flex items-center gap-1"
        >
          <RefreshCw size={11} /> Restablecer sin Incapacidades
        </button>
      </div>

      {/* FILA 4: TARJETA DE RESULTADOS E IMPACTO EN LA CAPACIDAD */}
      <div className="rounded-2xl bg-blue-50/50 dark:bg-slate-900/50 border border-blue-100 dark:border-slate-800 p-4.5 space-y-3.5">
        
        {/* PARTE SUPERIOR DE RESULTADO */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span className="flex items-center">
                Disponibilidad Neta: {netDays} días-persona <span className="text-slate-500 font-medium ml-1">(de {theoreticalDays} días teóricos)</span>
                <InfoTooltip text="Total de días laborables disponibles en el equipo descontando ausencias planificadas e incapacidades médicas." align="left" />
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center">
              Capacidad Estándar: <strong className="text-slate-700 dark:text-slate-300 ml-1">{standardCapacitySP} SP</strong> ➔ Ajustada por ausencias e incapacidades: <strong className="text-slate-900 dark:text-white ml-1">{adjustedCapacitySP} SP</strong>
              <InfoTooltip text="Capacidad teórica del equipo en Puntos de Historia frente a la capacidad real máxima recomendada." />
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {adjustedCapacitySP} SP
            </span>
            {spDiff !== 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 flex items-center" title="Pérdida neta de Puntos de Historia por incapacidades">
                {spDiff > 0 ? `+${spDiff}` : spDiff} SP ({spDiffPct > 0 ? `+${spDiffPct}` : spDiffPct}%)
              </span>
            )}
          </div>
        </div>

        {/* BARRA DEL MEDIDOR DE IMPACTO CON TOOLTIP */}
        <div className="space-y-1.5 pt-1 border-t border-blue-100/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300 flex items-center">
              Medidor de Impacto en la Capacidad del Sprint:
              <InfoTooltip text="Semáforo de riesgo que clasifica el impacto de la pérdida de capacidad en el cumplimiento de los objetivos." />
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${impactBadgeStyle}`}>
              {impactBadgeText}
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden relative">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${Math.max(6, Math.min(100, impactPct))}%` }}
            />
          </div>
        </div>

        {/* DESCRIPCIÓN DE DIAGNÓSTICO DE CAPACIDAD CON TOOLTIP */}
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pt-1 flex items-start">
          <span className="flex-1">{diagnosticText}</span>
          <InfoTooltip text="Recomendación estratégica para la reunión de planificación o ajuste de alcance del sprint." align="right" />
        </p>

      </div>

    </div>
  );
}
