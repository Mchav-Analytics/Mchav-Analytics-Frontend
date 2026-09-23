import React from 'react';
import { Calculator, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import LiderNotificationBell from '../components/LiderNotificationBell';
import { useCapacityCalculator } from '../hooks/useCapacityCalculator';
import { InfoTooltip } from '../components/CapacityShared';

import CapacityForm from '../components/CapacityForm';
import CapacityResults from '../components/CapacityResults';
import CapacityJiraTasks from '../components/CapacityJiraTasks';

export default function CapacityCalculatorView({ isDarkMode, activeTab = 'capacity_form', setActiveTab }) {
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
    jiraTasks,
    taskStatusTab, setTaskStatusTab,
    taskSearchTerm, setTaskSearchTerm,
    selectedTaskProject, setSelectedTaskProject,
    handleAddAbsenceEvent,
    handleUpdateAbsenceEvent,
    handleRemoveEvent,
    handleReassignTask,
    handleResetScenarios,
    filteredTasks,
    liveDevs
  } = hookProps;

  return (
    <div className="font-sans text-left pb-12">
      {/* CONTENEDOR ÚNICO PRINCIPAL (ESTILO CENTRO DE REPORTES) */}
      <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
        
        {/* Cabecera Integrada */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
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
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Calculadora y Simulador de Capacidad
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Simula el impacto de ausencias e incapacidades sobre la velocidad estimada y capacidad disponible del equipo para el Sprint.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
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
            <LiderNotificationBell />
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
          /* VISTA EXPANDIDA DEL SIMULADOR */
          <div className="animate-in fade-in duration-150 pt-2 space-y-4">
            <CapacityForm 
              devCount={devCount} setDevCount={setDevCount}
              sprintDays={sprintDays} setSprintDays={setSprintDays}
              vacationDays={vacationDays} setVacationDays={setVacationDays}
              sickDevsCount={sickDevsCount} setSickDevsCount={setSickDevsCount}
              sickDays={sickDays} setSickDays={setSickDays}
              avgDevVelocity={avgDevVelocity} setAvgDevVelocity={setAvgDevVelocity}
              absenceEvents={absenceEvents}
              jiraTasks={jiraTasks}
              liveDevs={liveDevs}
              handleAddAbsenceEvent={handleAddAbsenceEvent}
              handleUpdateAbsenceEvent={handleUpdateAbsenceEvent}
              handleRemoveEvent={handleRemoveEvent}
              handleReassignTask={handleReassignTask}
              handleResetScenarios={handleResetScenarios}
              results={results}
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
