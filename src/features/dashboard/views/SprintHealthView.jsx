// ============================================================================
// VISTA: SALUD Y PREDICTIBILIDAD DEL SPRINT (SPRINT HEALTH DASHBOARD — FASE 7)
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Zap,
  Target,
  Users,
  BarChart3,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { projectService } from '../../../services/api';

const MetricInfoTooltip = ({ text, align = "auto" }) => {
  return (
    <div className="relative group/tooltip flex items-center inline-flex">
      <Info size={14} className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer ml-1.5 shrink-0" />
      <div className={`absolute bottom-full mb-2 ${align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"} hidden group-hover/tooltip:block w-64 p-3 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs rounded-xl shadow-2xl z-50 pointer-events-none text-left backdrop-blur-md font-normal leading-relaxed`}>
        {text}
        <div className={`absolute top-full ${align === "right" ? "right-3" : align === "left" ? "left-3" : "left-1/2 -translate-x-1/2"} border-4 border-transparent border-t-slate-900`}></div>
      </div>
    </div>
  );
};

function SprintHealthView({ selectedProjectId = 'PROJ-01', onNavigateToMatrix, onNavigateToScorecards }) {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(null);

  // 1. Cargar lista de sprints del proyecto activo
  useEffect(() => {
    projectService.getSprints(selectedProjectId)
      .then(res => {
        if (res && res.length > 0) {
          setSprints(res);
          setSelectedSprintId(res[0].id_sprint);
        } else {
          setSprints([]);
          setSelectedSprintId(null);
        }
      })
      .catch(err => {
        console.warn("Aviso: Error cargando sprints del proyecto:", err);
        setSprints([]);
        setSelectedSprintId(null);
      });
  }, [selectedProjectId]);

  // 2. Cargar salud del sprint según el sprint seleccionado
  useEffect(() => {
    setLoading(true);
    projectService.getSprintHealth(selectedProjectId, selectedSprintId)
      .then((data) => {
        setHealthData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener la salud del sprint:", err);
        setLoading(false);
      });
  }, [selectedProjectId, selectedSprintId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Analizando Salud y Predictibilidad del Sprint ({selectedSprintId})...</p>
        </div>
      </div>
    );
  }

  const metrics = healthData?.metrics || {};
  const healthScore = healthData?.health_score ?? 0;
  const stages = healthData?.bottleneck_stages || [];
  const insight = healthData?.bottleneck_insight || {};
  const warning = healthData?.scope_creep_warning;

  const getScoreColor = (score) => {
    if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', stroke: '#10b981' };
    if (score >= 60) return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40', stroke: '#f59e0b' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/40', stroke: '#f43f5e' };
  };

  const scoreTheme = getScoreColor(healthScore);

  return (
    <div className="space-y-6 pb-12 font-sans text-left">

      {/* BARRA SUPERIOR DE ACCESO RÁPIDO Y NAVEGACIÓN CON SELECTOR DE SPRINT */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-3 px-4 rounded-xl shadow-sm dark:shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button 
            onClick={onNavigateToMatrix}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-slate-100 dark:bg-[#12142e] hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-[#33376b] flex items-center gap-1.5 cursor-pointer"
          >
            <Users size={14} />
            <span>Matriz 4 Cuadrantes</span>
          </button>
          <button className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg shadow border border-indigo-500 flex items-center gap-1.5 cursor-pointer">
            <Zap size={14} className="text-amber-400" />
            <span>Salud del Sprint & Flow</span>
          </button>
          <button 
            onClick={onNavigateToScorecards}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-slate-100 dark:bg-[#12142e] hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-[#33376b] flex items-center gap-1.5 cursor-pointer"
          >
            <Target size={14} className="text-cyan-600 dark:text-cyan-400" />
            <span>Scorecards Devs</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          {/* SELECTOR DE SPRINT */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#12142e] px-3 py-1 rounded-lg border border-slate-200 dark:border-[#33376b]">
            <Layers size={14} className="text-indigo-600 dark:text-indigo-400" />
            {sprints.length > 0 ? (
              <select
                value={selectedSprintId || ''}
                onChange={(e) => setSelectedSprintId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer pr-1"
              >
                {sprints.map((s) => (
                  <option key={s.id_sprint} value={s.id_sprint} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                    {s.nombre || s.nombre_sprint || s.id_sprint}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Kanban / Sin Sprints Scrum</span>
            )}
          </div>

          <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/40 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ETL Sync Activa
          </span>
        </div>
      </div>
      
      {/* CABECERA DE LA VISTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#191c3d] p-6 rounded-2xl border border-slate-200 dark:border-[#33376b] shadow-sm dark:shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 rounded-full">
              FASE 7 — PREDICTABILITY ENGINE
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Proyecto: {selectedProjectId}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Salud del Sprint & Eficiencia de Flujo
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Evaluación de predictibilidad, compromiso inicial, scope creep y cuellos de botella en el tiempo de entrega.
          </p>
        </div>

        <div className={`flex items-center gap-4 p-4 rounded-xl border shadow-lg ${scoreTheme.bg} ${scoreTheme.border}`}>
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="#cbd5e1" strokeWidth="4" fill="transparent" />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke={scoreTheme.stroke}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={138}
                strokeDashoffset={138 - (138 * Math.min(healthScore, 100)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className={`absolute font-extrabold text-sm ${scoreTheme.text}`}>{healthScore}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Sprint Health Score</span>
            <span className={`text-sm font-bold ${scoreTheme.text}`}>{healthData?.diagnostico_label}</span>
          </div>
        </div>
      </div>

      {/* BANNER DESTACADO DE ADVERTENCIA POR SCOPE CREEP */}
      {warning && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 p-4 rounded-2xl flex items-start gap-3 shadow-sm dark:shadow-lg">
          <ShieldAlert className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={22} />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">{warning.title}</h3>
            <p className="text-xs text-amber-700 dark:text-amber-200/80">{warning.message}</p>
          </div>
        </div>
      )}

      {/* 4 TARJETAS KPIS DE PREDICTIBILIDAD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* KPI 1: COMMITMENT RELIABILITY */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Commitment Reliability</span>
              <MetricInfoTooltip text="Mide el porcentaje de Story Points realmente entregados frente a los comprometidos al iniciar el sprint. Es la métrica principal de estabilidad operativa." />
            </div>
            <Target size={18} className="text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{metrics.commitment_reliability_pct}%</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {metrics.sp_completed} SP entregados de {metrics.sp_planned} SP planificados.
          </p>
        </div>

        {/* KPI 2: SCOPE CREEP RATE */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Scope Creep Rate</span>
              <MetricInfoTooltip text="Porcentaje de Story Points añadidos a mitad del sprint después de la planificación inicial. Un valor >15% indica alteraciones o emergencias no previstas." />
            </div>
            <AlertTriangle size={18} className="text-amber-500 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{metrics.scope_creep_pct}%</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            +{metrics.sp_added_mid_sprint} SP añadidos a mitad del sprint.
          </p>
        </div>

        {/* KPI 3: CARRYOVER RATE */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Carryover Rate</span>
              <MetricInfoTooltip text="Porcentaje de Story Points planificados que no lograron completarse a tiempo y deben ser trasladados (Carryover) al siguiente sprint." />
            </div>
            <Layers size={18} className="text-rose-500 dark:text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{metrics.carryover_pct}%</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {metrics.sp_carryover} SP incompletos que pasan a otro sprint.
          </p>
        </div>

        {/* KPI 4: FLOW EFFICIENCY */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Flow Efficiency</span>
              <MetricInfoTooltip align="right" text="Proporción del tiempo en que las tareas estuvieron en desarrollo activo (In Progress) vs. el tiempo total incluyendo colas de espera (Review, QA, Bloqueos)." />
            </div>
            <Zap size={18} className="text-cyan-500 dark:text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">{metrics.flow_efficiency_pct}%</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {metrics.active_dev_days}d activos vs {metrics.waiting_queue_days}d en colas.
          </p>
        </div>

      </div>

      {/* SECCIÓN DE IDENTIFICACIÓN DE CUELLOS DE BOTELLA (FLOW EFFICIENCY CHART & INSIGHTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICO DE BARRAS DE TIEMPO ACUMULADO POR ETAPA */}
        <div className="lg:col-span-2 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-600 dark:text-indigo-400" />
              Descomposición de Tiempo de Flujo por Etapa (Días Acumulados)
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">Tiempo Activo vs. Tiempos de Espera</span>
          </div>

          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stages} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.5} />
                <XAxis type="number" stroke="#64748b" fontSize={11} label={{ value: 'Días Acumulados →', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
                <YAxis type="category" dataKey="stage" stroke="#64748b" fontSize={11} width={150} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                  formatter={(val, name) => [`${val} días`, 'Tiempo Acumulado']}
                />
                <Bar dataKey="days" radius={[0, 8, 8, 0]}>
                  {stages.map((entry, index) => {
                    const isDevelopment = entry.stage.includes("In Progress");
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={isDevelopment ? '#10b981' : '#6366f1'} 
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CUELLO DE BOTELLA CLAVE E INSIGHT ANALÍTICO */}
        <div className="bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-5 rounded-2xl shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Info size={18} />
              <span>Identificación de Cuellos de Botella</span>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Etapa de Mayor Fricción</span>
              <span className="text-base font-extrabold text-amber-300 block">{insight.main_stage}</span>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-white">{insight.days_spent} días</span>
                <span className="text-xs text-slate-400">({insight.percentage}% del tiempo total)</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl space-y-1 text-xs">
              <span className="font-bold text-indigo-300 block">💡 Recomendación del Predictability Engine:</span>
              <p className="text-slate-300 leading-relaxed">{insight.recommendation}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Flow Ratio Eficiente:</span>
            <span className="font-bold text-emerald-400">{metrics.flow_efficiency_pct}% Útil</span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default SprintHealthView;
