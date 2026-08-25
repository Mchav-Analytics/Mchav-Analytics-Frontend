import React from 'react';
import { Activity, Zap, TrendingUp, Clock, Bug } from 'lucide-react';
import { MetricInfoTooltip } from '../../dashboard/components/LiderVelocityChart';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Area,
  Line,
  PieChart,
  Pie,
  Cell,
  Bar
} from 'recharts';
import { PercentilesChart } from './PercentilesChart'; 

const tooltipStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: 'none',
  borderRadius: '12px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  padding: '12px 16px',
  fontSize: '12px',
  fontWeight: '600',
  color: '#1e293b'
};

export const ProjectMetrics = ({ 
  activeProject, 
  activeMetrics, 
  activeProjectTab, 
  setActiveProjectTab, 
  burndownData,
  loadingPercentiles,
  percentilesWindow,
  setPercentilesWindow,
  percentilesData
}) => {
  return (
    <section className="relative flex flex-col gap-5 animate-in slide-in-from-bottom-4 mt-2">
          <div className="bg-white dark:bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Activity size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-white bg-indigo-100 dark:bg-indigo-500/20 px-2.5 py-0.5 rounded-md">
                  {activeProject.key} • {activeProject.category || 'Backend'}
                </span>
                <h3 className="text-base sm:text-lg font-black mt-1 text-slate-900 dark:text-white">
                  Resumen Ejecutivo & Métricas Jira — {activeProject.name}
                </h3>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Pestañas internas del proyecto */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveProjectTab('RESUMEN')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeProjectTab === 'RESUMEN'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                  Resumen General
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProjectTab('TIEMPOS')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${activeProjectTab === 'TIEMPOS'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                  Análisis de Tiempos
                </button>
              </div>


            </div>
          </div>

          {activeProjectTab === 'RESUMEN' ? (
            <>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm flex items-center gap-3">
                  <div className="absolute top-3 right-3">
                    <MetricInfoTooltip align="left" text="Cuántos puntos de trabajo termina el equipo en cada sprint. Entre más alto, más productivo es el equipo." />
                  </div>
                  <Zap size={20} className="text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-300">Velocidad SP</span>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{activeMetrics.kpis.velocitySp} SP / sprint</p>
                  </div>
                </div>
                <div className="relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm flex items-center gap-3">
                  <div className="absolute top-3 right-3">
                    <MetricInfoTooltip align="right" text="Porcentaje de tareas entregadas a tiempo. Si es alto, el equipo cumple bien con los plazos." />
                  </div>
                  <TrendingUp size={20} className="text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-300">Salud Entregas</span>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{activeMetrics.kpis.deliveryHealth}</p>
                  </div>
                </div>
                {(() => {
                  const cycleTimeNum = parseFloat(activeMetrics.kpis.cycleTimeDays) || 0;
                  let colorClass = "text-emerald-600 dark:text-emerald-500";
                  let borderClass = "border-emerald-500/30 dark:border-emerald-500/50";
                  let shadowClass = "shadow-[0_4px_20px_rgba(16,185,129,0.1)] dark:shadow-[0_4px_20px_rgba(16,185,129,0.15)]";
                  let statusText = "Óptimo";

                  if (cycleTimeNum > 14) {
                    colorClass = "text-rose-600 dark:text-rose-500";
                    borderClass = "border-rose-500/30 dark:border-rose-500/50";
                    shadowClass = "shadow-[0_4px_20px_rgba(244,63,94,0.1)] dark:shadow-[0_4px_20px_rgba(244,63,94,0.15)]";
                    statusText = "Crítico";
                  } else if (cycleTimeNum > 7) {
                    colorClass = "text-amber-600 dark:text-amber-500";
                    borderClass = "border-amber-500/30 dark:border-amber-500/50";
                    shadowClass = "shadow-[0_4px_20px_rgba(245,158,11,0.1)] dark:shadow-[0_4px_20px_rgba(245,158,11,0.15)]";
                    statusText = "En Riesgo";
                  }

                  return (
                    <div className={`relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#191c3d] border ${borderClass} ${shadowClass} flex items-center gap-3 transition-colors`}>
                      <div className="absolute top-3 right-3">
                        <MetricInfoTooltip align="right" text="Cuántos días tarda en promedio una tarea desde que se empieza hasta que se termina. Menos días es mejor." />
                      </div>
                      <Clock size={20} className={`${colorClass} shrink-0`} />
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-300">Tiempo Ciclo</span>
                          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white dark:bg-[#191c3d] border ${borderClass} ${colorClass}`}>{statusText}</span>
                        </div>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{activeMetrics.kpis.cycleTimeDays}</p>
                      </div>
                    </div>
                  );
                })()}
                <div className="relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm flex items-center gap-3">
                  <div className="absolute top-3 right-3">
                    <MetricInfoTooltip align="right" text="Errores graves que siguen sin resolver. Necesitan arreglarse lo antes posible." />
                  </div>
                  <Bug size={20} className="text-rose-500 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-300">Bugs Críticos</span>
                    <p className="text-lg font-black text-rose-500 dark:text-rose-400">{activeMetrics.kpis.criticalBugs} Activos</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
                {/* Equipo Asignado al Proyecto */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm dark:shadow-[0_8px_30px_rgba(25,28,61,0.5)] space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Equipo Asignado al Proyecto</h3>
                      <MetricInfoTooltip align="left" text="Lder tcnico y desarrolladores activos en este proyecto." />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{(activeProject.developers?.length || 0) + (activeProject.leader ? 1 : 0)} miembros asignados</p>
                  </div>
                  
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
                    <div className="max-h-[250px] overflow-y-auto no-scrollbar">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 font-semibold">Rol</th>
                            <th className="px-4 py-2 font-semibold">Usuario</th>
                            <th className="px-4 py-2 font-semibold">Carga Actual</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#191c3d]">
                          {activeProject.leader && (
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                              <td className="px-4 py-2.5">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-bold text-[10px] uppercase tracking-wide">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Lder
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-purple-600 text-white font-black text-[9px] flex items-center justify-center shrink-0">
                                  {activeProject.leader.avatar}
                                </div>
                                {activeProject.leader.name}
                              </td>
                              <td className="px-4 py-2.5 text-slate-400 font-medium">-</td>
                            </tr>
                          )}
                          {activeProject.developers?.map(dev => (
                            <tr key={dev.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                              <td className="px-4 py-2.5">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold text-[10px] uppercase tracking-wide">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Dev
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-blue-600 text-white font-black text-[9px] flex items-center justify-center shrink-0">
                                  {dev.avatar}
                                </div>
                                {dev.name}
                              </td>
                              <td className="px-4 py-2.5 font-medium text-slate-500 dark:text-slate-400">
                                {dev.tasksCount || 3} tareas
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Progreso de tareas (Burndown) */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm dark:shadow-[0_8px_30px_rgba(25,28,61,0.5)] space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Progreso de tareas</h3>
                      <MetricInfoTooltip align="left" text="Muestra cómo va disminuyendo el trabajo pendiente día a día comparado con la meta ideal." />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Compara el trabajo que aún falta por hacer contra el ritmo ideal de entrega.</p>
                  </div>

                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={activeMetrics.burndown} margin={{ top: 15, right: 15, left: 15, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorBurndownReal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="day"
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          tickFormatter={(val) => String(val).replace('D', 'Día ')}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          tickFormatter={(val) => val}
                          width={35}
                          label={{ value: 'Esfuerzo (Unidades)', angle: -90, position: 'insideLeft', offset: -5, fill: '#64748b', fontSize: 11, style: { textAnchor: 'middle' } }}
                        />
                        <RechartsTooltip
                          contentStyle={tooltipStyle}
                          formatter={(value, name) => [
                            `${value} unidades de trabajo`,
                            name === 'real' || name === 'REAL' ? 'Lo que realmente falta por hacer' : 'Lo que debería faltar hoy'
                          ]}
                          labelFormatter={(label) => `Progreso - Día ${String(label).replace('D', '')}`}
                        />
                        <Area type="monotone" dataKey="real" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorBurndownReal)" dot={{ r: 4, fill: '#818cf8', stroke: '#ffffff', strokeWidth: 2 }} name="REAL" />
                        <Line type="monotone" dataKey="ideal" stroke="#10b981" strokeDasharray="4 4" strokeWidth={2} dot={false} name="IDEAL" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Distribución del trabajo */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm dark:shadow-[0_8px_30px_rgba(25,28,61,0.5)] flex flex-col gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Distribución del trabajo</h3>
                      <MetricInfoTooltip text="Muestra en qué porcentaje se dividió el tiempo entre crear nuevas funciones, arreglar fallos o hacer mejoras técnicas." />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Por tipo de incidencia, sprint actual</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 mt-2 h-64">
                    <div className="h-full w-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={activeMetrics.distribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {activeMetrics.distribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <span className="text-3xl font-black text-slate-900 dark:text-white">
                          {activeMetrics.distribution.reduce((acc, curr) => acc + curr.value, 0)}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">Total Incidencias</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {activeMetrics.distribution.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                          </div>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {item.value} <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold ml-1">({item.percentage}%)</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Velocidad por Sprint */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] shadow-sm dark:shadow-[0_8px_30px_rgba(25,28,61,0.5)] space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Velocidad por Sprint</h3>
                      <MetricInfoTooltip align="left" text="Muestra la cantidad de trabajo que el equipo ha logrado terminar en cada ciclo reciente para ver si el ritmo mejora o se mantiene." />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Evolución de la cantidad de tareas o unidades terminadas</p>
                  </div>

                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={activeMetrics.velocity} margin={{ top: 15, right: 15, left: 15, bottom: 20 }}>
                        <XAxis
                          dataKey="sprint"
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          tickFormatter={(val) => String(val).replace(/\D/g, '')}
                          label={{ value: 'Número de Sprint (Ciclo de trabajo)', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 11 }}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          width={35}
                          label={{ value: 'Trabajo Entregado', angle: -90, position: 'insideLeft', offset: -5, fill: '#64748b', fontSize: 11, style: { textAnchor: 'middle' } }}
                        />
                        <RechartsTooltip
                          contentStyle={tooltipStyle}
                          formatter={(value, name) => [
                            `${value} unidades completadas`,
                            name === 'Trabajo Finalizado' ? 'Total Entregado' : 'Tendencia General'
                          ]}
                          labelFormatter={(label) => `Período (Sprint): ${String(label).replace(/\D/g, '')}`}
                        />
                        <Bar dataKey="sp" fill="#6366f1" radius={[6, 6, 0, 0]} name="Trabajo Finalizado" barSize={36} />
                        <Line type="monotone" dataKey="sp" stroke="#10b981" strokeWidth={3} dot={false} name="Tendencia General" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              </>
          ) : (
            /* Pestaña de Análisis de Tiempos (Percentiles) HU-014 */
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Métricas de Flujo (Lead Time y Cycle Time)
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Periodo evaluado:</span>
                  <select
                    className="bg-slate-100 dark:bg-slate-900 border-none text-xs font-bold text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    value={percentilesWindow}
                    onChange={(e) => setPercentilesWindow(Number(e.target.value))}
                  >
                    <option value={15}>Últimos 15 días</option>
                    <option value={30}>Últimos 30 días</option>
                    <option value={60}>Últimos 60 días</option>
                    <option value={90}>Últimos 90 días</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
                {loadingPercentiles ? (
                  <div className="col-span-full py-12 text-center text-sm font-bold text-slate-500 animate-pulse">
                    Calculando percentiles y agregando datos de los últimos {percentilesWindow} días...
                  </div>
                ) : percentilesData && percentilesData.length > 0 ? (
                percentilesData.map((data, idx) => {
                  const colors = ['indigo', 'emerald', 'rose', 'sky', 'amber'];
                  return (
                    <div key={data.issue_type} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <PercentilesChart
                        title={`Análisis de ${data.issue_type}`}
                        data={data}
                        colorTheme={colors[idx % colors.length]}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-sm font-bold text-slate-500">
                  No se encontraron datos de tareas resueltas en este proyecto en los últimos {percentilesWindow} días.
                </div>
              )}
              </div>
            </div>
          )}
        </section>
  );
};
