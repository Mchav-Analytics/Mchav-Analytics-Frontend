import React from 'react';
import { Sliders, X, Activity, RefreshCw } from 'lucide-react';

export default function CapacitySimulator({ 
  devCount, setDevCount, 
  sprintDays, setSprintDays, 
  vacationDays, setVacationDays, 
  sickDevsCount, setSickDevsCount, 
  sickDays, setSickDays, 
  avgDevVelocity, setAvgDevVelocity, 
  onClose 
}) {
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

  // Determinar nivel de impacto y diagnóstico
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

  return (
    <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-3xl p-5 shadow-sm dark:shadow-xl animate-in zoom-in-95 duration-200 space-y-4 text-left font-sans">
      
      {/* CABECERA */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="text-indigo-600 dark:text-indigo-400" size={18} />
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            SIMULADOR DE CAPACIDAD & MEDIDOR DE IMPACTO POR INCAPACIDAD
          </h3>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer">
          <X size={16} />
        </button>
      </div>

      {/* FILA 1: CAMPOS DE ENTRADA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Integrantes Activos</label>
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
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Días del Sprint</label>
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
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Ausencias Planificadas</label>
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
          <label className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 block mb-1">🚨 Devs Incapacitados</label>
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
          <label className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 block mb-1">🩺 Días Incapacidad / Dev</label>
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
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Velocidad Prom / Dev</label>
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

      {/* FILA 2: BOTONES DE ESCENARIO RÁPIDO */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SIMULAR ESCENARIO:</span>
        
        <button
          type="button"
          onClick={() => { setSickDevsCount(1); setSickDays(6); }}
          className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all cursor-pointer flex items-center gap-1"
        >
          🩹 1 Dev incapacitado (6 días)
        </button>

        <button
          type="button"
          onClick={() => { setSickDevsCount(1); setSickDays(sprintDays); }}
          className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 text-[11px] font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all cursor-pointer flex items-center gap-1"
        >
          🚑 1 Dev baja médica (Todo el sprint)
        </button>

        <button
          type="button"
          onClick={() => { setSickDevsCount(0); setSickDays(0); setVacationDays(0); }}
          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all cursor-pointer flex items-center gap-1"
        >
          <RefreshCw size={11} /> Restablecer sin Incapacidades
        </button>
      </div>

      {/* FILA 3: TARJETA DE RESULTADOS E IMPACTO EN LA CAPACIDAD */}
      <div className="rounded-2xl bg-blue-50/50 dark:bg-slate-900/50 border border-blue-100 dark:border-slate-800 p-4.5 space-y-3.5">
        
        {/* PARTE SUPERIOR DE RESULTADO */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span>Disponibilidad Neta: {netDays} días-persona <span className="text-slate-500 font-medium">(de {theoreticalDays} días teóricos)</span></span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Capacidad Estándar: <strong className="text-slate-700 dark:text-slate-300">{standardCapacitySP} SP</strong> ➔ Ajustada por ausencias e incapacidades: <strong className="text-slate-900 dark:text-white">{adjustedCapacitySP} SP</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {adjustedCapacitySP} SP
            </span>
            {spDiff !== 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                {spDiff > 0 ? `+${spDiff}` : spDiff} SP ({spDiffPct > 0 ? `+${spDiffPct}` : spDiffPct}%)
              </span>
            )}
          </div>
        </div>

        {/* BARRA DEL MEDIDOR DE IMPACTO */}
        <div className="space-y-1.5 pt-1 border-t border-blue-100/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">Medidor de Impacto en la Capacidad del Sprint:</span>
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

        {/* DESCRIPCIÓN DE DIAGNÓSTICO DE CAPACIDAD */}
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pt-1">
          {diagnosticText}
        </p>

      </div>

    </div>
  );
}
