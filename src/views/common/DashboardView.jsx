import React, { useMemo, useState, useEffect } from 'react';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  Activity, 
  AlertTriangle,
  Zap,
  Info,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ComposedChart,
  Bar,
  Line
} from 'recharts';

// Componente para Tooltips Educativos
const InfoTooltip = ({ text }) => (
  <div className="group relative inline-block cursor-help ml-1.5 z-50">
    <Info size={14} className="text-slate-400 hover:text-indigo-500 transition-colors" />
    <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 absolute z-[9999] top-1/2 left-full -translate-y-1/2 ml-2 w-64 p-3 bg-slate-800 text-slate-100 text-xs rounded-lg shadow-xl border border-slate-700 pointer-events-none">
      {text}
      <div className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
    </div>
  </div>
);

// Componente para Trend Badges
const TrendBadge = ({ current, previous, inverse = false }) => {
  if (current === undefined || previous === undefined || previous === null) return <span className="text-xs text-slate-400">Sin datos previos</span>;
  
  const diff = current - previous;
  if (diff === 0) return <span className="text-xs font-medium text-slate-500 flex items-center gap-1"><Minus size={12}/> 0%</span>;
  
  const pct = previous === 0 ? 100 : Math.abs((diff / previous) * 100);
  
  // Si inverse es true, bajar el número es bueno (ej. Cycle Time). Si no, subir es bueno (ej. Throughput)
  const isPositiveTrend = inverse ? diff < 0 : diff > 0;
  
  const colorClass = isPositiveTrend ? "text-emerald-500" : "text-rose-500";
  const Icon = diff > 0 ? TrendingUp : TrendingDown;
  
  return (
    <span className={`text-xs font-medium flex items-center gap-1 ${colorClass}`}>
      <Icon size={14}/> {pct.toFixed(1)}% vs sprint anterior
    </span>
  );
};

function DashboardView({ 
  metrics, 
  metricsLoading, 
  metricsError, 
  syncSuccessMsg, 
  kpis, 
  selectedProjectId,
  setActiveTab 
}) {
  const [selectedSprintId, setSelectedSprintId] = useState('general');

  // Resetear el selector a general si cambia de proyecto
  useEffect(() => {
    setSelectedSprintId('general');
  }, [selectedProjectId]);

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

  const activeKpi = useMemo(() => {
    if (!kpis || kpis.length === 0) return null;
    if (selectedSprintId === 'general') {
      return kpis.find(k => k.id_sprint === null || k.id_sprint === undefined) || kpis[0];
    }
    return kpis.find(k => k.id_sprint === selectedSprintId) || kpis[0];
  }, [kpis, selectedSprintId]);

  const prevKpi = useMemo(() => {
    if (!kpis || kpis.length < 2) return null;
    if (selectedSprintId === 'general') {
      return null;
    }
    const sprintKpis = kpis.filter(k => k.id_sprint !== null && k.id_sprint !== undefined);
    const idx = sprintKpis.findIndex(k => k.id_sprint === selectedSprintId);
    if (idx > 0) return sprintKpis[idx - 1];
    return null;
  }, [kpis, selectedSprintId]);

  const sparklineData = useMemo(() => {
    if (!kpis || kpis.length === 0) return [];
    return kpis.slice(-7);
  }, [kpis]);

  return (
    <div className="w-full space-y-8">
      {metricsError && (
        <div className="animate-in fade-in flex items-center gap-3 p-4 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-400">
          <AlertTriangle size={18} />
          <p className="text-sm font-medium">{metricsError}</p>
        </div>
      )}

      {syncSuccessMsg && (
        <div className="animate-in fade-in flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400">
          <CheckCircle size={18} />
          <p className="text-sm font-medium">{syncSuccessMsg}</p>
        </div>
      )}

      {!selectedProjectId ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
          <Activity className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Sin proyecto seleccionado</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Selecciona un proyecto en la barra superior para visualizar su rendimiento.</p>
        </div>
      ) : (
        <>
          {/* SECCIÓN 1: VOLUMEN Y VELOCIDAD */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">⚡ Volumen y Velocidad de Trabajo</h2>
              
              {/* Indicador de Total de Sprints */}
              <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '6px 14px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', fontWeight: '600' }}>
                <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>🏃</span>
                <span className="text-slate-700 dark:text-slate-200">Total Sprints: <strong className="text-indigo-600 dark:text-indigo-400">{sprintsList.length}</strong></span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Tickets Activos */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center mb-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg mr-3">
                    <ClipboardList size={18} />
                  </div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Tickets Activos</h3>
                  <InfoTooltip text="La cantidad de tickets que actualmente están en la columna 'En Progreso'. Si este número es muy alto, tu equipo podría estar haciendo demasiadas cosas a la vez." />
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {metricsLoading ? "..." : metrics.in_progress_tickets || 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Trabajo en curso (WIP) actual</p>
                </div>
              </div>

              {/* Throughput */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between relative">
                <div className="flex items-center mb-2 relative z-10">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg mr-3">
                    <CheckCircle size={18} />
                  </div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Throughput</h3>
                  <InfoTooltip text="¿Cuántos tickets terminamos? Es la cantidad cruda de tareas que se movieron a 'Done' en el último sprint evaluado." />
                </div>
                <div className="mt-2 relative z-10">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {activeKpi ? activeKpi.throughput_issues : (metrics.completed_tickets || 0)}
                  </p>
                  <div className="mt-1">
                    <TrendBadge 
                      current={activeKpi ? activeKpi.throughput_issues : null} 
                      previous={prevKpi ? prevKpi.throughput_issues : null} 
                    />
                  </div>
                </div>
                {sparklineData.length > 0 && (
                  <div className="absolute bottom-0 right-0 left-0 h-16 opacity-20 pointer-events-none overflow-hidden rounded-b-xl">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparklineData}>
                        <Area type="monotone" dataKey="throughput_issues" stroke="#10B981" fill="#10B981" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Velocidad */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between relative">
                <div className="flex items-center mb-2 relative z-10">
                  <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg mr-3">
                    <Zap size={18} />
                  </div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Velocidad</h3>
                  <InfoTooltip text="La suma total de Puntos de Historia (Esfuerzo) quemados en el último sprint. Útil para predecir cuánto trabajo puede tomar el equipo en el futuro." />
                </div>
                <div className="mt-2 relative z-10">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {activeKpi ? activeKpi.velocity_total_sp : "0"}
                  </p>
                  <div className="mt-1">
                    <TrendBadge 
                      current={activeKpi ? activeKpi.velocity_total_sp : null} 
                      previous={prevKpi ? prevKpi.velocity_total_sp : null} 
                    />
                  </div>
                </div>
                {sparklineData.length > 0 && (
                  <div className="absolute bottom-0 right-0 left-0 h-16 opacity-20 pointer-events-none overflow-hidden rounded-b-xl">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparklineData}>
                        <Area type="monotone" dataKey="velocity_total_sp" stroke="#F59E0B" fill="#F59E0B" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Gráfico 1: Evolución de Velocidad */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm lg:col-span-4 flex flex-col h-[350px]">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                      Historial de Rendimiento (Puntos vs Promedio)
                      <InfoTooltip text="Compara los puntos reales entregados en cada sprint contra tu Promedio Histórico Estimado. Si las barras superan la línea verde, tu equipo superó las expectativas." />
                    </h3>
                  </div>
                </div>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={kpis} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                      <XAxis dataKey="sprintName" stroke="#64748b" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                        itemStyle={{ fontSize: '13px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                      <Bar name="Puntos Entregados" dataKey="velocity_total_sp" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Line name="Promedio Histórico" type="monotone" dataKey="velocity_promedio_historico" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: EFICIENCIA Y TIEMPOS */}
          <div className="space-y-4 pt-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">⏱️ Eficiencia y Tiempos de Entrega</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Tarjetas de Tiempos a la Izquierda */}
              <div className="space-y-4 lg:col-span-1">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="p-2 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg mr-3">
                      <Clock size={18} />
                    </div>
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Tiempo de Ciclo Promedio</h3>
                    <InfoTooltip text="¿Cuánto tardamos en desarrollar algo? Es el tiempo promedio que un ticket pasa en la columna 'En Progreso' antes de terminarse. Menos días = Mejor." />
                  </div>
                  <div className="mt-4">
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">
                      {activeKpi ? `${Number(activeKpi.cycle_time_promedio_dias).toFixed(1)}d` : "0d"}
                    </p>
                    <div className="mt-2">
                      <TrendBadge 
                        current={activeKpi ? activeKpi.cycle_time_promedio_dias : null} 
                        previous={prevKpi ? prevKpi.cycle_time_promedio_dias : null} 
                        inverse={true}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg mr-3">
                      <Clock size={18} />
                    </div>
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Lead Time Promedio</h3>
                    <InfoTooltip text="¿Cuánto espera el cliente? Es el tiempo promedio desde que el ticket fue CREADO (nació) hasta que fue terminado. Incluye el tiempo muerto en el Backlog. Menos días = Mejor." />
                  </div>
                  <div className="mt-4">
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">
                      {activeKpi ? `${Number(activeKpi.lead_time_promedio_dias).toFixed(1)}d` : "0d"}
                    </p>
                    <div className="mt-2">
                      <TrendBadge 
                        current={activeKpi ? activeKpi.lead_time_promedio_dias : null} 
                        previous={prevKpi ? prevKpi.lead_time_promedio_dias : null} 
                        inverse={true}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico 2: Evolución Tiempos a la Derecha */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm lg:col-span-2 flex flex-col h-[360px]">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                    Comparativa: Lead Time vs Cycle Time
                    <InfoTooltip text="La diferencia entre la línea roja (Lead) y la morada (Cycle) es el 'Tiempo Muerto'. Si la línea roja es muy alta, tus tickets pasan mucho tiempo abandonados en el Backlog antes de ser trabajados." />
                  </h3>
                </div>
                <div className="flex-1 w-full min-h-0 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={kpis} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLead" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCycle" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                      <XAxis dataKey="sprintName" stroke="#64748b" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                        itemStyle={{ fontSize: '13px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                      <Area name="Lead Time Promedio (Espera)" type="monotone" dataKey="lead_time_promedio_dias" stroke="#EF4444" fillOpacity={1} fill="url(#colorLead)" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} />
                      <Area name="Cycle Time Promedio (Desarrollo)" type="monotone" dataKey="cycle_time_promedio_dias" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorCycle)" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardView;
