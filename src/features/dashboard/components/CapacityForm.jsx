import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle2, Trash2, RefreshCw } from 'lucide-react';
import { InfoTooltip, calculateBusinessDays } from './CapacityShared';

export default function CapacityForm({ 
  devCount, setDevCount,
  sprintDays, setSprintDays,
  vacationDays, setVacationDays,
  sickDevsCount, setSickDevsCount,
  sickDays, setSickDays,
  avgDevVelocity, setAvgDevVelocity,
  absenceEvents,
  handleAddAbsenceEvent,
  handleRemoveEvent,
  handleResetScenarios
}) {
  const [newDevName, setNewDevName] = useState('Desarrollador 1');
  const [newAbsenceType, setNewAbsenceType] = useState('SICK'); 
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showCalendarForm, setShowCalendarForm] = useState(false);

  const calculatedDaysPreview = calculateBusinessDays(newStartDate, newEndDate);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!newStartDate || !newEndDate) return;
    
    const success = handleAddAbsenceEvent(newDevName, newAbsenceType, newStartDate, newEndDate, newNote);
    if (success) {
      setNewStartDate('');
      setNewEndDate('');
      setNewNote('');
      setShowCalendarForm(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
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
          <form onSubmit={onSubmit} className="p-3.5 rounded-xl bg-white dark:bg-[#14192b] border border-indigo-200 dark:border-indigo-500/30 space-y-3 animate-in slide-in-from-top-2">
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
          onClick={handleResetScenarios}
          title="Restablece los campos de ausencias e incapacidades a cero"
          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all cursor-pointer flex items-center gap-1"
        >
          <RefreshCw size={11} /> Restablecer sin Incapacidades
        </button>
      </div>
    </div>
  );
}
