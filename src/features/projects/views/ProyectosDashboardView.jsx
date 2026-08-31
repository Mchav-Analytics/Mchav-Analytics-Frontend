import React from 'react';
import { useProyectosDashboard } from '../hooks/useProyectosDashboard';
import { useAuth } from '../../auth/context/AuthContext';
import { ProjectsHeader } from '../components/ProjectsHeader';
import { ProjectsTable } from '../components/ProjectsTable';
import { ProjectsCFD } from '../components/ProjectsCFD';
import { ProjectsBurnup } from '../components/ProjectsBurnup';
import { ProjectsTeamPerformance } from '../components/ProjectsTeamPerformance';
import { FileDown, X } from 'lucide-react';

const ProyectosDashboardView = ({ userProfile }) => {
  const { user } = useAuth();
  const {
    searchTerm,
    setSearchTerm,
    selectedProjectId,
    setSelectedProjectId,
    expandedTeamProjectId,
    setExpandedTeamProjectId,
    allProjectsList,
    selectedProjectObj,
    displayProjects,
    activeVelocityData,
    activePercentilesData,
    activeCfdData,
    activeBurnupData,
    showCfdDocModal,
    setShowCfdDocModal,
    showBurndownDocModal,
    setShowBurndownDocModal,
    assignedTeam,
    toastMsg
  } = useProyectosDashboard({ userProfile });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left font-sans">
      
      {/* Toast Notificación */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold animate-bounce flex items-center gap-2">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header con controles globales */}
      <ProjectsHeader
        userProfile={userProfile}
        user={user}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        allProjectsList={allProjectsList}
      />

      {/* 2. Tabla Resumen de Proyectos */}
      <ProjectsTable
        selectedProjectObj={selectedProjectObj}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        displayProjects={displayProjects}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        expandedTeamProjectId={expandedTeamProjectId}
        setExpandedTeamProjectId={setExpandedTeamProjectId}
        assignedTeam={assignedTeam}
      />

      {/* 3. Bloque 2A: Diagrama de Flujo Acumulado (CFD) */}
      <ProjectsCFD
        activeCfdData={activeCfdData}
        setShowCfdDocModal={setShowCfdDocModal}
      />

      {/* 4. Bloque 2B: Sprint Burnup Chart */}
      <ProjectsBurnup
        activeBurnupData={activeBurnupData}
        setShowBurndownDocModal={setShowBurndownDocModal}
      />

      {/* 5. Bloque 3: Velocidad del Equipo & Predictibilidad */}
      <ProjectsTeamPerformance
        activeVelocityData={activeVelocityData}
        activePercentilesData={activePercentilesData}
      />

      {/* Footer Institucional */}
      <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/80 text-center text-xs text-slate-400 font-medium">
        © 2025 MCHAV Analytics. Todos los derechos reservados.
      </div>

      {/* Modal Documentación Técnica Burnup */}
      {showBurndownDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileDown size={18} className="text-indigo-500" />
                Justificación Técnica: Cálculo del Sprint Burnup Chart
              </h3>
              <button type="button" onClick={() => setShowBurndownDocModal(false)} className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={16} />
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
              <p><strong>1. Alcance Total vs Trabajo Completado:</strong><br />
              El Burnup dibuja dos curvas clave: el **Alcance Total (Total Scope)** en el tiempo y el **Trabajo Completado acumulado** diariamente. Esto permite evidenciar si las variaciones en el cumplimiento se deben a entregas o a cambios en el alcance (*Scope Creep*).</p>
              <p><strong>2. Eje Horizontal y Proyección Ideal:</strong><br />
              La línea de ritmo ideal marca la trayectoria uniforme proyectada desde el inicio del sprint hasta el tope de alcance al cierre.</p>
              <p><strong>3. Historial de Transiciones Jira Cloud:</strong><br />
              Las tareas pasadas a estados resueltos (*Done*, *Completado*) incrementan el trabajo acumulado del día correspondiente.</p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button type="button" onClick={() => setShowBurndownDocModal(false)} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md">
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Documentación Técnica CFD */}
      {showCfdDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileDown size={18} className="text-indigo-500" />
                Justificación Técnica: Cumulative Flow Diagram (CFD)
              </h3>
              <button type="button" onClick={() => setShowCfdDocModal(false)} className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={16} />
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
              <p><strong>1. Áreas Apiladas por Estado:</strong><br />
              El CFD representa la cantidad acumulada de tareas/puntos distribuidos en las etapas del flujo: *Por Hacer*, *En Progreso*, *En Revisión / QA* y *Completado*.</p>
              <p><strong>2. Detección de Cuellos de Botella:</strong><br />
              Un ensanchamiento repentino en las bandas intermedias (*En Progreso* o *En Revisión*) indica una acumulación de trabajo bloqueado o baja capacidad de salida.</p>
              <p><strong>3. Cálculo de Lead Time y Estabilidad de WIP:</strong><br />
              La distancia horizontal entre la curva de inicio y la curva de *Completado* refleja la tendencia del Lead Time del equipo.</p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button type="button" onClick={() => setShowCfdDocModal(false)} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md">
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProyectosDashboardView;
