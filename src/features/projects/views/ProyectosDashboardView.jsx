import React from 'react';
import { useProyectosDashboard } from '../hooks/useProyectosDashboard';
import { useAuth } from '../../auth/context/AuthContext';
import { ProjectsHeader } from '../components/ProjectsHeader';
import { ProjectsTable } from '../components/ProjectsTable';
import { ProjectsCFD } from '../components/ProjectsCFD';
import { ProjectsBurnup } from '../components/ProjectsBurnup';
import { ProjectsTeamPerformance } from '../components/ProjectsTeamPerformance';
import { FileDown, X, BookOpen, Layers, Activity, TrendingUp, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';

const ProyectosDashboardView = ({ userProfile, activeTab, setActiveTab }) => {
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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
        onNavigateToHealth={(projId) => {
          if (setSelectedProjectId) setSelectedProjectId(projId);
          if (setActiveTab) setActiveTab('sprint_health');
        }}
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

      {/* Modal Documentación Técnica Burnup (Side Sheet no invasivo) */}
      {showBurndownDocModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/20 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121530] border-l border-slate-200 dark:border-[#272b5c] w-full sm:w-[480px] h-full overflow-y-auto p-6 shadow-2xl space-y-5 text-left relative animate-in slide-in-from-right duration-300">
            
            {/* Header del Drawer */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-xs shrink-0">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    Justificación Técnica: Burnup
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    Alcance total vs. trabajo completado
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowBurndownDocModal(false)} 
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido en Tarjetas */}
            <div className="space-y-3">
              
              {/* Item 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181c3d] border border-slate-200/80 dark:border-[#2a2f5e] space-y-1.5">
                <div className="flex items-center gap-2">
                  <Activity size={15} className="text-indigo-500 shrink-0" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    1. Alcance Total vs. Trabajo Completado
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal pl-6">
                  El Burnup dibuja dos curvas clave: el <strong className="font-extrabold text-slate-800 dark:text-slate-100">Alcance Total (Total Scope)</strong> en el tiempo y el <strong className="font-extrabold text-slate-800 dark:text-slate-100">Trabajo Completado acumulado</strong> diariamente. Esto evidencia variaciones por <em className="text-indigo-600 dark:text-indigo-400 font-semibold">Scope Creep</em>.
                </p>
              </div>

              {/* Item 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181c3d] border border-slate-200/80 dark:border-[#2a2f5e] space-y-1.5">
                <div className="flex items-center gap-2">
                  <TrendingUp size={15} className="text-purple-500 shrink-0" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    2. Eje Horizontal y Proyección Ideal
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal pl-6">
                  La línea de ritmo ideal marca la trayectoria uniforme proyectada desde el inicio del sprint hasta el tope de alcance al cierre.
                </p>
              </div>

              {/* Item 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181c3d] border border-slate-200/80 dark:border-[#2a2f5e] space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-emerald-500 shrink-0" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    3. Historial de Transiciones Jira Cloud
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal pl-6">
                  Las tareas pasadas a estados resueltos (<span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px]">Done</span>, <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px]">Completado</span>) incrementan el trabajo acumulado del día correspondiente.
                </p>
              </div>

              {/* Tip Callout */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/40 flex items-start gap-2.5">
                <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 leading-tight">
                  <strong className="font-extrabold">Recomendación:</strong> Si la brecha entre Alcance Total y Trabajo Completado aumenta al final del sprint, revisa las historias agregadas a mitad del ciclo.
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowBurndownDocModal(false)} 
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
              >
                Cerrar panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Documentación Técnica CFD (Side Sheet no invasivo) */}
      {showCfdDocModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/20 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121530] border-l border-slate-200 dark:border-[#272b5c] w-full sm:w-[480px] h-full overflow-y-auto p-6 shadow-2xl space-y-5 text-left relative animate-in slide-in-from-right duration-300">
            
            {/* Header del Drawer */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-xs shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    Justificación Técnica: CFD
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    Distribución del trabajo y estabilidad del flujo
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCfdDocModal(false)} 
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido en Tarjetas */}
            <div className="space-y-3">
              
              {/* Item 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181c3d] border border-slate-200/80 dark:border-[#2a2f5e] space-y-2">
                <div className="flex items-center gap-2">
                  <Layers size={15} className="text-indigo-500 shrink-0" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    1. Áreas Apiladas por Estado
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal pl-6">
                  El CFD representa la cantidad acumulada de tareas/puntos distribuidos en las etapas del flujo:
                </p>
                <div className="flex flex-wrap gap-1.5 pl-6 pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-[10px]">Por Hacer</span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px]">En Progreso</span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold text-[10px]">En Revisión / QA</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px]">Completado</span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181c3d] border border-slate-200/80 dark:border-[#2a2f5e] space-y-1.5">
                <div className="flex items-center gap-2">
                  <AlertCircle size={15} className="text-amber-500 shrink-0" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    2. Detección de Cuellos de Botella
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal pl-6">
                  Un ensanchamiento repentino en las bandas intermedias (<span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px]">En Progreso</span> o <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold text-[10px]">En Revisión</span>) indica una acumulación de trabajo bloqueado o baja capacidad de salida.
                </p>
              </div>

              {/* Item 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181c3d] border border-slate-200/80 dark:border-[#2a2f5e] space-y-1.5">
                <div className="flex items-center gap-2">
                  <TrendingUp size={15} className="text-purple-500 shrink-0" />
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    3. Cálculo de Lead Time y Estabilidad de WIP
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal pl-6">
                  La distancia horizontal entre la curva de inicio y la curva de <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px]">Completado</span> refleja la tendencia del Lead Time del equipo.
                </p>
              </div>

              {/* Tip Callout */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/40 flex items-start gap-2.5">
                <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 leading-tight">
                  <strong className="font-extrabold">Tip de Flujo:</strong> Si la franja de "En Revisión / QA" es más ancha que "En Progreso", el equipo necesita más apoyo en Code Review y QA automatizado.
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowCfdDocModal(false)} 
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
              >
                Cerrar panel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProyectosDashboardView;
