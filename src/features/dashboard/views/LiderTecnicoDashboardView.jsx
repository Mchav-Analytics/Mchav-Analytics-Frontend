// ============================================================================
// FEATURE DASHBOARD — VISTA DE LIDERAZGO TÉCNICO CONCENTRADA (SIN REPETICIONES)
// ============================================================================
// Estructura limpia y no redundante:
// 1. Cabecera ejecutiva limpia con controles principales.
// 2. 4 Tarjetas de KPIs únicos (sin información duplicada).
// 3. Distribución en 2 columnas: Gráfico de Velocidad (Izquierda) + Control de Impedimentos (Derecha).

import React, { useState } from 'react';
import {
  Users,
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ChevronRight,
  Activity,
  Bell,
  Calculator,
  FileDown,
  Info,
  UserCheck,
  X,
  Sliders,
  Check,
  BarChart2,
  Send
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';
import LiderNotificationBell from '../components/LiderNotificationBell';

const MetricInfoTooltip = ({ text, align = "auto" }) => {
  return (
    <div className="relative group/tooltip flex items-center inline-flex">
      <Info size={14} className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer ml-1 shrink-0" />
      <div className={`absolute bottom-full mb-2 ${align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"} hidden group-hover/tooltip:block w-64 p-3 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs rounded-xl shadow-2xl z-50 pointer-events-none text-left backdrop-blur-md font-normal leading-relaxed`}>
        {text}
        <div className={`absolute top-full ${align === "right" ? "right-3" : align === "left" ? "left-3" : "left-1/2 -translate-x-1/2"} border-4 border-transparent border-t-slate-900`}></div>
      </div>
    </div>
  );
};

const CustomVelocityTooltip = ({ active, payload, label, isDark }) => {
  if (active && payload && payload.length) {
    const compromisos = payload.find(p => p.dataKey === 'compromisos')?.value || 0;
    const entregados = payload.find(p => p.dataKey === 'entregados')?.value || 0;
    
    let pct = 0;
    let explanation = '';
    let pctColor = 'text-emerald-500 dark:text-emerald-400';

    if (compromisos > 0) {
      pct = Math.round((entregados / compromisos) * 100);
    }

    if (entregados === 0 && compromisos > 0) {
      explanation = 'Sprint activo en ejecución o proyectado. Las entregas finales se contarán al cierre.';
      pctColor = 'text-amber-500 dark:text-amber-400';
    } else if (pct >= 80) {
      explanation = `¡Gran desempeño! El equipo logró entregar el ${pct}% de los Story Points comprometidos en la planeación.`;
    } else {
      explanation = `Baja efectividad (${pct}%). Ocurrieron impedimentos o sobreestimación de capacidad en la planificación.`;
      pctColor = 'text-rose-500 dark:text-rose-400';
    }

    return (
      <div className={`p-3.5 rounded-xl border shadow-2xl max-w-xs font-sans text-xs space-y-2.5 backdrop-blur-md ${
        isDark ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{label}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 ${pctColor}`}>
            {entregados > 0 ? `${pct}% Entregado` : 'En Ejecución'}
          </span>
        </div>

        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
              SP Comprometidos:
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-100">{compromisos} SP</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span>
              SP Entregados:
            </span>
            <span className="font-extrabold text-cyan-600 dark:text-cyan-400">{entregados} SP</span>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
          💡 <strong>¿Qué significa?</strong> {explanation}
        </p>
      </div>
    );
  }
  return null;
};

// Datos de tendencia de velocidad por Sprint (Único gráfico)
const mockVelocityData = [
  { sprint: 'Sprint 1', compromisos: 35, entregados: 32 },
  { sprint: 'Sprint 2', compromisos: 40, entregados: 38 },
  { sprint: 'Sprint 3 (Activo)', compromisos: 45, entregados: 38 },
  { sprint: 'Sprint 4 (Proy.)', compromisos: 42, entregados: 0 },
];

// Integrantes del equipo para reasignación
const teamMembers = [
  { name: 'Valka Hoyos', role: 'Desarrollador Senior' },
  { name: 'Clara Gómez', role: 'Desarrollador Semi-Senior' },
  { name: 'Andrés Torres', role: 'Desarrollador Frontend' },
  { name: 'Mateo Silva', role: 'Desarrollador Backend' }
];

// Incidencias del sprint que requieren atención proactiva
const initialCriticalIssues = [
  {
    key: 'SCRUM-104',
    summary: 'Optimización del flujo ETL y consultas JQL de alta latencia',
    assignee: 'Clara Gómez',
    priority: 'Alta',
    sp: 5,
    risk: 'Bloqueo API'
  },
  {
    key: 'SCRUM-108',
    summary: 'Ajuste de tiempos de expiración JWT en backend FastAPI',
    assignee: 'Valka Hoyos',
    priority: 'Muy Alta',
    sp: 3,
    risk: 'Seguridad'
  },
  {
    key: 'SCRUM-112',
    summary: 'Ajuste adaptativo del Dashboard para monitores 4K',
    assignee: 'Andrés Torres',
    priority: 'Media',
    sp: 2,
    risk: 'Sin inicio'
  }
];

export default function LiderTecnicoDashboardView({
  selectedProjectId,
  setActiveTab,
  isDarkMode = true
}) {
  // Estado para Tooltips explicativos de KPIs
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Estado para la Calculadora de Capacidad y Medidor de Incapacidad
  const [showCapacityCalculator, setShowCapacityCalculator] = useState(false);
  const [devCount, setDevCount] = useState(4);
  const [sprintDays, setSprintDays] = useState(10);
  const [vacationDays, setVacationDays] = useState(2);
  const [sickDays, setSickDays] = useState(0); // Días de incapacidad por desarrollador
  const [sickDevsCount, setSickDevsCount] = useState(0); // Número de desarrolladores incapacitados
  const [avgDevVelocity, setAvgDevVelocity] = useState(10);

  // Cálculo de Capacidad Sugerida e Impacto por Incapacidad Médica
  const theoreticalTotalDays = devCount * sprintDays;
  const standardCapacitySP = devCount * avgDevVelocity;
  const totalLostDays = vacationDays + (sickDevsCount * sickDays);
  const netAvailableDays = Math.max(theoreticalTotalDays - totalLostDays, 0);
  const adjustedCapacitySP = Math.round(standardCapacitySP * (netAvailableDays / (theoreticalTotalDays || 1)));
  const lostCapacitySP = Math.max(standardCapacitySP - adjustedCapacitySP, 0);
  const impactPercentage = standardCapacitySP > 0 ? Math.round((lostCapacitySP / standardCapacitySP) * 100) : 0;

  // Estado para lista de incidencias y acciones
  const [criticalIssues, setCriticalIssues] = useState(initialCriticalIssues);
  const [reassigningIssueKey, setReassigningIssueKey] = useState(null);
  const [newAssigneeName, setNewAssigneeName] = useState('Valka Hoyos');
  const [toastMessage, setToastMessage] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const totalAvailableDays = (devCount * sprintDays) - vacationDays;
  const standardCapacity = devCount * avgDevVelocity;
  const adjustedCapacity = Math.round(standardCapacity * (totalAvailableDays / (devCount * sprintDays)));

  // Mostrar mensaje emergente Toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reasignar desarrollador a una incidencia
  const handleConfirmReassign = (key) => {
    setCriticalIssues(prev => prev.map(issue => {
      if (issue.key === key) {
        return { ...issue, assignee: newAssigneeName };
      }
      return issue;
    }));
    setReassigningIssueKey(null);
    triggerToast(`Incidencia ${key} reasignada correctamente a ${newAssigneeName}.`);
  };

  // Notificar al desarrollador sobre una incidencia
  const handleNotifyDev = (key, devName) => {
    triggerToast(`Notificación enviada a ${devName} sobre la incidencia ${key}.`);
  };

  // Simular exportación de PDF
  const handleExportPdf = () => {
    setIsExportingPdf(true);
    setTimeout(() => {
      setIsExportingPdf(false);
      triggerToast('Reporte consolidado de rendimiento descargado en formato PDF.');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative text-slate-900 dark:text-slate-100">

      {/* ── NOTIFICACIÓN EMERGENTE (TOAST) ── */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-200">
          <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Check size={14} />
          </div>
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* ── CABECERA UNIFICADA DE PANEL OPERATIVO (ESTILO DESIGN SYSTEM CON SQUIRCLE ICON) ── */}
      <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] flex flex-col md:flex-row md:items-center justify-between gap-4">

        {/* Lado Izquierdo: Ícono en Gradiente + Insignia + Título */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shrink-0">
            <BarChart2 size={24} />
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-indigo-600 dark:text-indigo-300" />
                Liderazgo Técnico
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                • Proyecto: <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedProjectId || 'MCHAV'}</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Panel Operativo del Sprint Activo
            </h1>
          </div>
        </div>

        {/* CONTROLES EJECUTIVOS (NOTIFICACIONES, CALCULADORA & EXPORTACIÓN) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <LiderNotificationBell />

          <button
            type="button"
            onClick={() => setShowCapacityCalculator(!showCapacityCalculator)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-extrabold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Calculator size={14} className="text-cyan-600 dark:text-cyan-400" /> 
            {showCapacityCalculator ? 'Cerrar Calculadora' : 'Planificar Capacidad'}
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-4 py-2.5 rounded-2xl bg-[#5b36f5] hover:bg-indigo-600 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0 disabled:opacity-50"
          >
            <FileDown size={15} /> 
            {isExportingPdf ? 'Generando...' : 'Exportar PDF'}
          </button>
        </div>
      </div>

      {/* ── PANEL PLEGABLE: SIMULADOR DE CAPACIDAD & MEDIDOR DE INCAPACIDAD ── */}
      {showCapacityCalculator && (
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-3xl p-5 shadow-sm dark:shadow-xl animate-in zoom-in-95 duration-200 space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="text-indigo-600 dark:text-indigo-400" size={18} />
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Simulador de Capacidad & Medidor de Impacto por Incapacidad
              </h3>
            </div>
            <button type="button" onClick={() => setShowCapacityCalculator(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer">
              <X size={14} />
            </button>
          </div>

          {/* INPUTS DE CONFIGURACIÓN DE EQUIPO E INCAPACIDADES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Integrantes Activos</label>
              <input
                type="number"
                min={1}
                max={20}
                value={devCount}
                onChange={(e) => setDevCount(Number(e.target.value) || 1)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
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
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
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
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 block mb-1">Desarrolladores Incapacitados</label>
              <input
                type="number"
                min={0}
                max={devCount}
                value={sickDevsCount}
                onChange={(e) => setSickDevsCount(Number(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs font-bold text-rose-900 dark:text-rose-200 focus:ring-2 focus:ring-rose-500/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 block mb-1">Días Incapacidad / Desarrollador</label>
              <input
                type="number"
                min={0}
                max={sprintDays}
                value={sickDays}
                onChange={(e) => setSickDays(Number(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs font-bold text-rose-900 dark:text-rose-200 focus:ring-2 focus:ring-rose-500/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Velocidad Prom / Desarrollador</label>
              <input
                type="number"
                min={1}
                max={30}
                value={avgDevVelocity}
                onChange={(e) => setAvgDevVelocity(Number(e.target.value) || 1)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* BOTONES DE PRESET DE SIMULACIÓN RÁPIDA DE INCAPACIDAD */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Simular Escenario:</span>
            <button
              type="button"
              onClick={() => { setSickDevsCount(1); setSickDays(Math.round(sprintDays / 2)); }}
              className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-[11px] font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
            >
              1 Desarrollador incapacitado ({Math.round(sprintDays / 2)} días)
            </button>
            <button
              type="button"
              onClick={() => { setSickDevsCount(1); setSickDays(sprintDays); }}
              className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 text-[11px] font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
            >
              1 Desarrollador baja médica (Todo el sprint)
            </button>
            {(sickDevsCount > 0 || sickDays > 0) && (
              <button
                type="button"
                onClick={() => { setSickDevsCount(0); setSickDays(0); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Restablecer sin Incapacidades
              </button>
            )}
          </div>

          {/* BANNER RESULTADOS Y MEDIDOR DE IMPACTO EN EL SPRINT */}
          <div className={`p-4 rounded-2xl border transition-all ${
            impactPercentage > 30 
              ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60' 
              : impactPercentage > 15 
              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60' 
              : 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60'
          }`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <Activity className={impactPercentage > 30 ? 'text-rose-600 dark:text-rose-400' : impactPercentage > 15 ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'} size={20} />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                    Disponibilidad Neta: <strong>{netAvailableDays} días-persona</strong> (de {theoreticalTotalDays} días teóricos)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Capacidad Estándar: {standardCapacitySP} SP ➔ Ajustada por ausencias e incapacidades: <strong>{adjustedCapacitySP} SP</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-baseline gap-2 shrink-0">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {adjustedCapacitySP} SP
                </span>
                {lostCapacitySP > 0 && (
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/50">
                    -{lostCapacitySP} SP (-{impactPercentage}%)
                  </span>
                )}
              </div>
            </div>

            {/* BARRA DE RIESGO DE INCAPACIDAD & RECOMENDACIÓN TÉCNICA */}
            <div className="pt-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Medidor de Impacto en la Capacidad del Sprint:</span>
                <span className={impactPercentage > 30 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : impactPercentage > 15 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                  {impactPercentage > 30 ? 'ALTA AFECTACIÓN (>30%)' : impactPercentage > 15 ? 'AFECTACIÓN MODERADA (15-30%)' : 'IMPACTO MANEJABLE (<15%)'}
                </span>
              </div>

              {/* Barra Progresiva de Impacto */}
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    impactPercentage > 30 
                      ? 'bg-rose-500' 
                      : impactPercentage > 15 
                      ? 'bg-amber-500' 
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(impactPercentage, 100)}%` }}
                />
              </div>

              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 pt-1">
                {impactPercentage > 30 ? (
                  <span>
                    <strong>Recomendación de Ajuste:</strong> Debido a la incapacidad médica se reducen <strong>{lostCapacitySP} Puntos de Historia</strong>. El compromiso actual del sprint está sobrecargado. Se recomienda al Líder Técnico des-priorizar 2 o 3 historias no críticas y moverlas al backlog antes de la entrega final.
                  </span>
                ) : impactPercentage > 15 ? (
                  <span>
                    <strong>Recomendación de Ajuste:</strong> La ausencia representa una pérdida de <strong>{lostCapacitySP} Puntos de Historia</strong>. Se sugiere pausar tareas secundarias y enfocar al equipo en los entregables principales del sprint.
                  </span>
                ) : (
                  <span>
                    <strong>Capacidad Normal:</strong> El equipo cuenta con margen para absorber la carga de trabajo planificada con redistribución interna ligera entre los desarrolladores activos.
                  </span>
                )}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ── 4 TARJETAS DE KPIS ÚNICOS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Cumplimiento del Sprint */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm relative transition-all hover:border-indigo-500/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cumplimiento del Sprint</span>
              <button
                type="button"
                onClick={() => setActiveTooltip(activeTooltip === 'velocity' ? null : 'velocity')}
                className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 cursor-pointer"
              >
                <Info size={12} />
              </button>
            </div>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Zap size={15} />
            </div>
          </div>

          {activeTooltip === 'velocity' && (
            <div className="mb-2 p-2 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-slate-300 leading-snug">
              Puntos de Historia entregados en relación a la meta del Sprint.
            </div>
          )}

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">84.4%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">(38 de 45 SP)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: '84.4%' }} />
          </div>
        </div>

        {/* KPI 2: Tiempo de Entrega (Lead Time) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm relative transition-all hover:border-cyan-500/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tiempo de Entrega (Lead)</span>
              <button
                type="button"
                onClick={() => setActiveTooltip(activeTooltip === 'lead' ? null : 'lead')}
                className="text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 p-0.5 cursor-pointer"
              >
                <Info size={12} />
              </button>
            </div>
            <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Clock size={15} />
            </div>
          </div>

          {activeTooltip === 'lead' && (
            <div className="mb-2 p-2 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-slate-300 leading-snug">
              Días desde la creación de la tarea en Jira hasta su cierre final.
            </div>
          )}

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">3.4 días</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-500 font-semibold flex items-center gap-1">
            <TrendingDown size={13} /> -12.0% de mejora
          </div>
        </div>

        {/* KPI 3: Tiempo de Desarrollo (Cycle Time) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm relative transition-all hover:border-purple-500/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tiempo de Desarrollo (Cycle)</span>
              <button
                type="button"
                onClick={() => setActiveTooltip(activeTooltip === 'cycle' ? null : 'cycle')}
                className="text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 p-0.5 cursor-pointer"
              >
                <Info size={12} />
              </button>
            </div>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CheckCircle2 size={15} />
            </div>
          </div>

          {activeTooltip === 'cycle' && (
            <div className="mb-2 p-2 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-slate-300 leading-snug">
              Días de trabajo activo desde <i>En Progreso</i> hasta su resolución.
            </div>
          )}

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">1.8 días</span>
          </div>
          <div className="mt-2 text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
            Flujo ágil continuo
          </div>
        </div>

        {/* KPI 4: Cambio de Alcance (Scope Creep) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm relative transition-all hover:border-amber-500/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cambio de Alcance</span>
              <button
                type="button"
                onClick={() => setActiveTooltip(activeTooltip === 'scope' ? null : 'scope')}
                className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 p-0.5 cursor-pointer"
              >
                <Info size={12} />
              </button>
            </div>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle size={15} />
            </div>
          </div>

          {activeTooltip === 'scope' && (
            <div className="mb-2 p-2 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-slate-300 leading-snug">
              Puntos agregados al Sprint posterior al compromiso inicial.
            </div>
          )}

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">+4 SP</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-500 font-semibold">
            8.8% Variabilidad (Aceptable)
          </div>
        </div>

      </div>

      {/* ── SECCIÓN PRINCIPAL DE 2 COLUMNAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* COLUMNA IZQUIERDA (7 COLS): GRÁFICO HISTÓRICO DE VELOCIDAD */}
        <div className="lg:col-span-7 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex flex-col space-y-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span>Histórico de Velocidad por Sprint</span>
                <MetricInfoTooltip text="Muestra la comparación histórica entre los Story Points comprometidos (planificados) y los realmente entregados (completados) en cada sprint para predecir la capacidad de entrega del equipo." />
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                Sprint 1 a 4
              </span>
            </div>

            {/* LEYENDA INTERACTIVA DE VELOCIDAD CON TOOLTIPS INFORMATIVOS */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="group/vel relative">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 cursor-help transition-all hover:scale-105">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  SP Comprometidos (Planificados)
                </span>
                <div className="absolute bottom-full mb-2 left-0 hidden group-hover/vel:block w-64 p-3 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs rounded-xl shadow-2xl z-50 pointer-events-none backdrop-blur-md leading-relaxed">
                  <strong>🟣 SP Comprometidos:</strong> Story Points aceptados y pactados durante la reunión de Sprint Planning al arrancar el sprint.
                </div>
              </div>

              <div className="group/vel relative">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40 cursor-help transition-all hover:scale-105">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                  SP Entregados (Completados)
                </span>
                <div className="absolute bottom-full mb-2 left-0 hidden group-hover/vel:block w-64 p-3 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs rounded-xl shadow-2xl z-50 pointer-events-none backdrop-blur-md leading-relaxed">
                  <strong>🔵 SP Entregados:</strong> Story Points realmente cerrados con éxito en la columna "Listo / Done" antes del fin del sprint.
                </div>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockVelocityData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#475569" : "#cbd5e1"} opacity={0.4} />
                <XAxis 
                  dataKey="sprint" 
                  stroke={isDarkMode ? "#94a3b8" : "#475569"} 
                  tickLine={false} 
                  tick={{ fill: isDarkMode ? "#f8fafc" : "#1e293b", fontSize: 11, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}
                />
                <YAxis 
                  stroke={isDarkMode ? "#94a3b8" : "#475569"} 
                  tickLine={false} 
                  tick={{ fill: isDarkMode ? "#f8fafc" : "#1e293b", fontSize: 11, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif' }}
                />
                <RechartsTooltip content={<CustomVelocityTooltip isDark={isDarkMode} />} />
                <Bar dataKey="compromisos" fill="#4f46e5" radius={[6, 6, 0, 0]} name="SP Comprometidos" />
                <Bar dataKey="entregados" fill="#06b6d4" radius={[6, 6, 0, 0]} name="SP Entregados" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COLUMNA DERECHA (5 COLS): GESTIÓN DE INCIDENCIAS CRÍTICAS E IMPEDIMENTOS */}
        <div className="lg:col-span-5 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-500" />
                Impedimentos & Acciones del Líder
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('alerts_center')}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Ver Alertas <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-3 my-auto">
            {criticalIssues.map((issue) => (
              <div key={issue.key} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{issue.key}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    issue.priority === 'Muy Alta' 
                      ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' 
                      : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                  }`}>
                    {issue.priority}
                  </span>
                </div>

                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{issue.summary}</p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Responsable: <strong className="text-slate-700 dark:text-slate-200">{issue.assignee}</strong> • {issue.sp} SP</span>

                <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => handleNotifyDev(issue.key, issue.assignee)}
                    className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Send size={10} className="text-indigo-600 dark:text-indigo-400" /> Notificar
                  </button>

                  {reassigningIssueKey === issue.key ? (
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      <select
                        value={newAssigneeName}
                        onChange={(e) => setNewAssigneeName(e.target.value)}
                        className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[10px] font-semibold py-0.5 px-1 rounded border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
                      >
                        {teamMembers.map(d => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleConfirmReassign(issue.key)}
                        className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded cursor-pointer"
                      >
                        <Check size={10} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setReassigningIssueKey(issue.key);
                        setNewAssigneeName(issue.assignee);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <UserCheck size={10} className="text-cyan-600 dark:text-cyan-400" /> Reasignar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
