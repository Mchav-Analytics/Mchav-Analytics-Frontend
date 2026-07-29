import React, { useMemo, useState, useEffect } from 'react';
import { RefreshCw, ChevronDown, Activity } from 'lucide-react';

// Importar los subcomponentes visuales refinados
import KPIGrid from '../components/KPIGrid';
import VelocityChart from '../../analytics/components/VelocityChart';
import BurndownChart from '../../analytics/components/BurndownChart';
import SprintHealth from '../components/SprintHealth';
import { isCriticalBug, isBottleneck } from '../../../utils/issueHelpers';

// Constantes de cálculo
const CRITICAL_BUG_PENALTY = 15;
const BOTTLENECK_PENALTY = 10;
const MIN_HEALTH_SCORE = 15;

export default function DashboardView({ 
  metricsLoading = false, 
  metricsError = null, 
  syncSuccessMsg = null, 
  kpis = [], 
  issues = [],
  selectedProjectId,
  onSync,
  isDarkMode
}) {
  const [selectedSprintId, setSelectedSprintId] = useState('general');

  // Resetear el selector de sprints si cambia el proyecto activo
  useEffect(() => {
    setSelectedSprintId('general');
  }, [selectedProjectId]);

  // Extraer listado único de Sprints del proyecto
  const sprintsList = useMemo(() => {
    if (!kpis) return [];
    const unique = [];
    const seen = new Set();
    for (const k of kpis) {
      if (k.id_sprint && !seen.has(k.id_sprint)) {
        seen.add(k.id_sprint);
        unique.push({ id_sprint: k.id_sprint, nombre: k.sprintName });
      }
    }
    return unique;
  }, [kpis]);

  const activeSprint = useMemo(
    () => sprintsList.find((s) => s.id_sprint === selectedSprintId),
    [sprintsList, selectedSprintId]
  );
  
  const activeSprintName = activeSprint?.nombre || 'Histórico General';

  // KPI del sprint seleccionado o valor histórico global
  const activeKpi = useMemo(() => {
    if (!kpis || kpis.length === 0) return null;
    if (selectedSprintId === 'general') {
      return kpis.find((k) => k.id_sprint === null || k.id_sprint === undefined) || kpis[0];
    }
    return kpis.find((k) => k.id_sprint === selectedSprintId) || kpis[0];
  }, [kpis, selectedSprintId]);

  // KPI previo para contrastar deltas
  const prevKpi = useMemo(() => {
    if (!kpis || kpis.length < 2) return null;
    if (selectedSprintId === 'general') {
      const generalKpis = kpis.filter((k) => k.id_sprint === null || k.id_sprint === undefined);
      if (generalKpis.length >= 2) return generalKpis[generalKpis.length - 2];
      const sprintKpis = kpis.filter((k) => k.id_sprint !== null && k.id_sprint !== undefined);
      if (sprintKpis.length >= 2) return sprintKpis[sprintKpis.length - 2];
      return null;
    }
    const sprintKpis = kpis.filter((k) => k.id_sprint !== null && k.id_sprint !== undefined);
    const idx = sprintKpis.findIndex((k) => k.id_sprint === selectedSprintId);
    if (idx > 0) return sprintKpis[idx - 1];
    return null;
  }, [kpis, selectedSprintId]);

  // Cálculo del Sprint Health en vivo
  const healthScore = useMemo(() => {
    if (!issues || issues.length === 0) return 100;
    const criticalCount = issues.filter(isCriticalBug).length;
    const bottleneckCount = issues.filter(isBottleneck).length;

    const score = 100 - (criticalCount * CRITICAL_BUG_PENALTY) - (bottleneckCount * BOTTLENECK_PENALTY);
    return Math.max(MIN_HEALTH_SCORE, score);
  }, [issues]);

  const criticalBugs = useMemo(() => issues.filter(isCriticalBug), [issues]);
  const blockedTasks = useMemo(() => issues.filter(isBottleneck), [issues]);

  const handleSync = () => {
    if (typeof onSync === 'function') {
      onSync();
    }
  };

  return (
    <div className="w-full flex flex-col gap-y-7 text-slate-800 dark:text-slate-100 pb-12">
      
      {/* Alertas de Sincronización */}
      {metricsError && (
        <div role="alert" className="flex items-center gap-3 p-4 rounded-[16px] bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-semibold">
          {metricsError}
        </div>
      )}

      {syncSuccessMsg && (
        <div role="status" className="flex items-center gap-3 p-4 rounded-[16px] bg-emerald-500/15 border border-emerald-500/25 text-emerald-455 text-xs font-semibold">
          {syncSuccessMsg}
        </div>
      )}

      {!selectedProjectId ? (
        <div className="bg-[#131B2E] border border-white/5 rounded-[22px] p-16 text-center shadow-xl">
          <Activity className="mx-auto h-12 w-12 text-slate-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-slate-200">Sin proyecto seleccionado</h3>
          <p className="text-slate-400 text-xs mt-2">
            Selecciona un proyecto en el panel izquierdo para visualizar las métricas y analíticas.
          </p>
        </div>
      ) : (
        <>
          {/* BARRA SUPERIOR CON TÍTULO DINÁMICO E INTERACTIVO (DISEÑO LINEAR) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/5 pt-1">
            
            <div className="flex items-center gap-3.5">
              {/* Monograma de Marca M */}
              <div className="w-8 h-8 rounded-[9px] bg-indigo-500 flex items-center justify-center text-white font-black font-mono text-[13px] select-none shadow-md shadow-indigo-500/15">
                M
              </div>

              {/* Título Interactivo (Select Integrado) */}
              <div className="flex items-center gap-3">
                <div className="relative flex items-center group">
                  <select
                    id="sprint-select"
                    value={selectedSprintId}
                    onChange={(e) => setSelectedSprintId(e.target.value)}
                    disabled={metricsLoading}
                    className="appearance-none bg-transparent hover:text-indigo-400 border-none transition-colors font-black text-[20px] text-slate-800 dark:text-white focus:outline-none cursor-pointer pr-7 py-0.5 select-none"
                  >
                    <option value="general" className="bg-white dark:bg-[#131B2E] text-slate-800 dark:text-slate-200 font-sans text-sm">Histórico general</option>
                    {sprintsList.map((s) => (
                      <option key={s.id_sprint} value={s.id_sprint} className="bg-white dark:bg-[#131B2E] text-slate-800 dark:text-slate-200 font-sans text-sm">
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-400 pointer-events-none transition-colors" />
                </div>

                {/* Subtítulo informativo */}
                {selectedSprintId !== 'general' && (
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-l border-slate-200 dark:border-l-white/10 pl-3.5 mt-1 select-none">
                    Día 7 de 10 • Equipo Nómada
                  </span>
                )}
              </div>
            </div>

            {/* Sincronización en la derecha */}
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleSync}
                disabled={metricsLoading}
                className="w-[36px] h-[36px] rounded-xl border border-white/5 bg-[#131B2E] text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                title="Sincronizar Datos"
                aria-label="Sincronizar"
              >
                <RefreshCw size={13} className={metricsLoading ? 'animate-spin' : ''} />
              </button>
            </div>

          </div>

          {/* 1. REJILLA DE KPIs CONSOLIDADOS */}
          <KPIGrid 
            activeKpi={activeKpi}
            prevKpi={prevKpi}
            issues={issues}
          />

          {/* 2. GRÁFICOS: VELOCIDAD Y BURNDOWN (LADO A LADO) */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <VelocityChart kpis={kpis} isDarkMode={isDarkMode} />
            <BurndownChart issues={issues} isDarkMode={isDarkMode} />
          </div>

          {/* 3. SALUD & DISTRIBUCIÓN DE TRABAJO (LADO A LADO) */}
          <SprintHealth healthScore={healthScore} issues={issues} isDarkMode={isDarkMode} />
        </>
      )}
    </div>
  );
}