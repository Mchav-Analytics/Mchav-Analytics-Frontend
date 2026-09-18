import React from 'react';
import { Calculator, Sliders } from 'lucide-react';
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

        </div>

        {/* VISTA DEL SIMULADOR */}
        <div className="animate-in fade-in duration-150 pt-2">
          {(activeTab === 'capacity_form' || activeTab === 'capacity_results') && (
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
          )}

          {activeTab === 'capacity_jira' && (
            <CapacityJiraTasks 
              adjustedCapacitySP={results.adjustedCapacitySP}
              taskStatusTab={taskStatusTab} setTaskStatusTab={setTaskStatusTab}
              taskSearchTerm={taskSearchTerm} setTaskSearchTerm={setTaskSearchTerm}
              selectedTaskProject={selectedTaskProject} setSelectedTaskProject={setSelectedTaskProject}
              filteredTasks={filteredTasks}
            />
          )}
        </div>
      </div>
    </div>
  );
}
