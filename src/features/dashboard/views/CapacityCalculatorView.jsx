import React from 'react';
import { Calculator, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import LiderNotificationBell from '../components/LiderNotificationBell';
import { useCapacityCalculator } from '../hooks/useCapacityCalculator';
import { InfoTooltip } from '../components/CapacityShared';

import CapacityForm from '../components/CapacityForm';
import CapacityResults from '../components/CapacityResults';
import CapacityJiraTasks from '../components/CapacityJiraTasks';

export default function CapacityCalculatorView({ isDarkMode }) {
  const hookProps = useCapacityCalculator();
  
  const {
    isCollapsed, setIsCollapsed,
    results,
    devCount, setDevCount,
    sprintDays, setSprintDays,
    vacationDays, setVacationDays,
    sickDevsCount, setSickDevsCount,
    sickDays, setSickDays,
    avgDevVelocity, setAvgDevVelocity,
    absenceEvents,
    taskStatusTab, setTaskStatusTab,
    taskSearchTerm, setTaskSearchTerm,
    selectedTaskProject, setSelectedTaskProject,
    handleAddAbsenceEvent,
    handleRemoveEvent,
    handleResetScenarios,
    filteredTasks
  } = hookProps;

  return (
    <div className="space-y-6 font-sans text-left pb-12">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-3xl shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-md shadow-indigo-500/20">
            <Calculator size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                Liderazgo Técnico
              </span>
              <span className="text-xs text-slate-400">• Herramienta de Planificación</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Calculadora y Simulador de Capacidad
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Simula el impacto de ausencias e incapacidades sobre la velocidad estimada y disponibilidad neta del equipo para el Sprint.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <LiderNotificationBell />
        </div>
      </div>

      {/* Contenedor del Simulador */}
      <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-3xl p-5 shadow-sm dark:shadow-xl animate-in zoom-in-95 duration-200 space-y-4">
        
        {/* CABECERA CON BOTÓN DE CONTRAER/EXPANDIR */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="text-indigo-600 dark:text-indigo-400" size={18} />
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center">
              SIMULADOR DE CAPACIDAD & REGISTRO DE INCAPACIDADES POR CALENDARIO
              <InfoTooltip text="Calcula la capacidad real disponible en Story Points (SP) registrando ausencias o incapacidades por rango exacto de fechas (Desde - Hasta)." align="left" />
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title={isCollapsed ? "Expandir el simulador de capacidad" : "Contraer el simulador de capacidad"}
            >
              {isCollapsed ? (
                <>
                  <ChevronDown size={15} className="text-indigo-500" />
                  <span>Expandir Simulador</span>
                </>
              ) : (
                <>
                  <ChevronUp size={15} className="text-indigo-500" />
                  <span>Contraer Panel</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* VISTA RESUMIDA CUANDO ESTÁ CONTRAÍDO */}
        {isCollapsed ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500 text-white font-black text-xs shrink-0 shadow-xs">
                {results.adjustedCapacitySP} SP
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  Disponibilidad Neta: {results.netDays} días-persona ({results.adjustedCapacitySP} SP Capacidad Real)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Capacidad Estándar: {results.theoreticalDays * avgDevVelocity} SP → Ajustada por ausencias: {results.adjustedCapacitySP} SP
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${results.impactBadgeStyle}`}>
                {results.impactBadgeText}
              </span>
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="text-xs font-bold px-3 py-1 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-xs cursor-pointer"
              >
                Expandir y Editar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-150">
            <CapacityForm 
              devCount={devCount} setDevCount={setDevCount}
              sprintDays={sprintDays} setSprintDays={setSprintDays}
              vacationDays={vacationDays} setVacationDays={setVacationDays}
              sickDevsCount={sickDevsCount} setSickDevsCount={setSickDevsCount}
              sickDays={sickDays} setSickDays={setSickDays}
              avgDevVelocity={avgDevVelocity} setAvgDevVelocity={setAvgDevVelocity}
              absenceEvents={absenceEvents}
              handleAddAbsenceEvent={handleAddAbsenceEvent}
              handleRemoveEvent={handleRemoveEvent}
              handleResetScenarios={handleResetScenarios}
            />
            
            <CapacityResults 
              results={results}
            />

            <CapacityJiraTasks 
              adjustedCapacitySP={results.adjustedCapacitySP}
              taskStatusTab={taskStatusTab} setTaskStatusTab={setTaskStatusTab}
              taskSearchTerm={taskSearchTerm} setTaskSearchTerm={setTaskSearchTerm}
              selectedTaskProject={selectedTaskProject} setSelectedTaskProject={setSelectedTaskProject}
              filteredTasks={filteredTasks}
            />
          </div>
        )}
      </div>

    </div>
  );
}
