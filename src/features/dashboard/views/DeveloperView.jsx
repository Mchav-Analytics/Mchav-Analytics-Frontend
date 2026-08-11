// ============================================================================
// VISTA DEL DESARROLLADOR — MI TRABAJO (FIX HOVER TOOLTIPS & OVERFLOW NO SCROLL)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  ClipboardList, 
  Zap, 
  Info, 
  UserCheck
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { developerService } from '../../../services/api';

const MetricInfoTooltip = ({ text, align = "auto" }) => {
  const alignClass = 
    align === "left" ? "left-0" :
    align === "right" ? "right-0" :
    "left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0";

  return (
    <div className="group/tooltip relative inline-flex items-center cursor-help ml-2 z-50" title={text}>
      <Info size={15} className="text-slate-400 hover:text-indigo-400 transition-colors inline shrink-0" />
      <div className={`opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 absolute bottom-full ${alignClass} mb-2.5 w-64 sm:w-72 p-3.5 bg-slate-950 text-slate-100 text-xs rounded-xl shadow-2xl border border-indigo-500/50 pointer-events-none leading-relaxed text-left z-[99999]`}>
        {text}
      </div>
    </div>
  );
};

const SparklineMini = ({ color = "#10b981" }) => {
  const data = [{ v: 4.2 }, { v: 3.8 }, { v: 4.5 }, { v: 3.1 }, { v: 2.8 }, { v: 3.2 }];
  return (
    <div className="w-20 h-7 inline-block">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`grad_${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.5}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#grad_${color.replace('#', '')})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function DeveloperView({ kpis = [], selectedProjectId = 'PROJ-01', onNavigateToAlerts }) {
  const { user, approveUserPermission } = useAuth();
  const [scorecard, setScorecard] = useState(null);

  const isPending = user?.status === 'PENDING';

  useEffect(() => {
    developerService.getMyScorecard(selectedProjectId)
      .then(data => setScorecard(data))
      .catch(err => console.warn("Error cargando scorecard:", err));
  }, [selectedProjectId, user?.email]);

  const sparklineCycleTime = [
    { v: 4.5 }, { v: 4.1 }, { v: 3.8 }, { v: 4.2 }, { v: 3.5 }, { v: 3.9 }, { v: 3.2 }
  ];

  const donutWipData = [
    { name: 'En Progreso', value: scorecard?.wip_tickets || 7, color: '#8b5cf6' },
    { name: 'Capacidad Restante', value: Math.max(0, (scorecard?.wip_max || 10) - (scorecard?.wip_tickets || 7)), color: '#1e293b' }
  ];

  const throughputDaily = [
    { day: 'L', v: 2 }, { day: 'M', v: 3 }, { day: 'M', v: 1 }, { day: 'J', v: 4 }, { day: 'V', v: 4 }
  ];

  const assignedIssuesList = scorecard?.assigned_issues || [];
  const workDist = scorecard?.work_distribution || { pct_historias: 45, pct_bugs: 15, pct_tareas: 40 };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-10 py-4 text-left font-sans min-h-[85vh] flex flex-col justify-between">

      {/* ENCABEZADO ESPACIOSO CON AURA DEGRADADA CON BOTÓN DE ALERTAS Y AYUDA */}
      <div className="relative group rounded-2xl bg-slate-950 p-8 shadow-2xl border border-slate-800/80 transition-all duration-300">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-md opacity-30 transition-opacity group-hover:opacity-50 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-extrabold text-xl shadow-xl shadow-indigo-500/25">
              {user?.nombre ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CG'}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                Developer Performance: {user?.nombre || 'Clara Gomez'}
                <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {user?.rol || 'DEVELOPER'}
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Consola interactiva de rendimiento individual y métricas de carga de trabajo.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToAlerts}
            className="px-4 py-2.5 text-xs font-bold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl shadow-lg border border-rose-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] shrink-0"
          >
            <Zap size={16} className="text-amber-300" />
            <span>Alertas & Solicitar Ayuda</span>
          </button>
        </div>
      </div>

      {/* NOTIFICACIÓN PENDIENTE ESPACIOSA */}
      {isPending && (
        <div className="group relative rounded-2xl bg-slate-950 p-6 shadow-2xl border border-amber-500/30">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 blur-sm opacity-40"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-xl shrink-0 border border-amber-500/20">
                <Clock size={24} className="animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-amber-200 flex items-center gap-2">
                  ⏳ Estado: Pendiente de Asignación de Rol
                </h3>
                <p className="text-xs text-slate-300">
                  Hola <strong>{user?.nombre || 'Clara Gomez'}</strong> ({user?.email}). Tu cuenta se ha autenticado. Un Administrador debe aprobar tu rol.
                </p>
              </div>
            </div>
            <button
              onClick={() => approveUserPermission(user?.email || 'cgomez@mchav.com', 'DEVELOPER')}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition-all hover:from-amber-600 hover:to-orange-600 flex items-center gap-2 cursor-pointer shadow-md"
            >
              <UserCheck size={16} /> Simular Aprobación Admin
            </button>
          </div>
        </div>
      )}

      {/* TARJETAS KPI EN GRID CON HOVER Z-50 (FLOTADO LIMPIO DE TOOLTIPS SOBRE OTRAS CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* TARJETA 1: Cycle Time Personal */}
        <div className="group relative flex flex-col rounded-2xl bg-slate-950 p-7 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/20 border border-slate-800/80 min-h-[220px] justify-between hover:z-50">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 opacity-15 blur-sm transition-opacity duration-300 group-hover:opacity-30 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Cycle Time</h3>
              </div>
              <MetricInfoTooltip align="left" text="Cycle Time Personal: Mide el tiempo promedio transcurrido en días desde que mueves una incidencia a 'In Progress' hasta que queda 'Done'." />
            </div>

            <div>
              <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                {scorecard?.cycle_time_personal || 3.2} <span className="text-lg font-bold text-emerald-500">días</span>
              </span>
              <div className="w-full h-12 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineCycleTime}>
                    <defs>
                      <linearGradient id="ctGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.5}/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="url(#ctGrad)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">Avg Sprint Previo</span>
              <span className="font-semibold text-emerald-400">{scorecard?.cycle_time_prev || 3.5}d</span>
            </div>
          </div>
        </div>

        {/* TARJETA 2: Tickets WIP */}
        <div className="group relative flex flex-col rounded-2xl bg-slate-950 p-7 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/20 border border-slate-800/80 min-h-[220px] justify-between hover:z-50">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-400 opacity-15 blur-sm transition-opacity duration-300 group-hover:opacity-30 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Tickets WIP</h3>
              </div>
              <MetricInfoTooltip align="left" text="Work In Progress (WIP): Número de tareas abiertas activas en 'In Progress'. Mantener el WIP ≤ 3 evita la multitarea." />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold text-purple-400 tracking-tight">
                  {scorecard?.wip_tickets || 7}
                </span>
                <p className="text-xs text-slate-400 mt-1">Tickets activos</p>
              </div>
              <div className="w-16 h-16 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutWipData} innerRadius={18} outerRadius={28} dataKey="value" stroke="none">
                      {donutWipData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <span className="absolute text-[9px] font-bold text-purple-300">WIP</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">Capacidad Máx: {scorecard?.wip_max || 10}</span>
              <span className="font-semibold text-purple-400">Avg {scorecard?.wip_avg || 5.5}</span>
            </div>
          </div>
        </div>

        {/* TARJETA 3: Throughput */}
        <div className="group relative flex flex-col rounded-2xl bg-slate-950 p-7 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-teal-500/20 border border-slate-800/80 min-h-[220px] justify-between hover:z-50">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500 via-sky-500 to-teal-400 opacity-15 blur-sm transition-opacity duration-300 group-hover:opacity-30 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 shadow-md">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Throughput</h3>
              </div>
              <MetricInfoTooltip align="right" text="Mi Throughput: Cantidad total de incidencias y entregables completados por ti en el sprint." />
            </div>

            <div>
              <span className="text-3xl font-extrabold text-teal-400 tracking-tight">
                {scorecard?.throughput_tickets || 14} <span className="text-xs font-bold text-teal-500">Tickets</span>
              </span>
              <div className="w-full h-11 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={throughputDaily}>
                    <Bar dataKey="v" fill="#14b8a6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">Promedio Diario</span>
              <span className="font-semibold text-teal-400">{scorecard?.throughput_avg_daily || 2.3}/día</span>
            </div>
          </div>
        </div>

        {/* TARJETA 4: Story Points */}
        <div className="group relative flex flex-col rounded-2xl bg-slate-950 p-7 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/20 border border-slate-800/80 min-h-[220px] justify-between hover:z-50">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-15 blur-sm transition-opacity duration-300 group-hover:opacity-30 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-md">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Story Points</h3>
              </div>
              <MetricInfoTooltip align="right" text="Puntos Quemados (Story Points): Suma del esfuerzo estimado completado en tus entregas dentro del sprint activo." />
            </div>

            <div>
              <span className="text-3xl font-extrabold text-indigo-400 tracking-tight">
                {scorecard?.story_points_burned || 65} <span className="text-sm font-bold text-indigo-500">SP</span>
              </span>
              <div className="w-full bg-slate-900 h-3 rounded-full mt-4 overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${scorecard?.story_points_achieved_pct || 81}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">Meta: {scorecard?.story_points_target || 80} SP</span>
              <span className="font-semibold text-indigo-400">{scorecard?.story_points_achieved_pct || 81}% Completado</span>
            </div>
          </div>
        </div>

      </div>

      {/* SECCIÓN DISTRIBUCIÓN DEL TRABAJO CON HOVER Z-40 */}
      <div className="group relative rounded-2xl bg-slate-950 p-8 shadow-2xl border border-slate-800/80 transition-all duration-300 space-y-6 hover:z-40">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-500/10 via-rose-500/10 to-emerald-500/10 blur-sm opacity-20 pointer-events-none"></div>
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Distribución del Trabajo
              </h2>
              <MetricInfoTooltip text="Distribución del Trabajo: Proporción del esfuerzo dedicado a desarrollo de Historias, Bugs y Tareas de Deuda Técnica." />
            </div>
            <div className="flex items-center gap-6 text-xs font-semibold">
              <span className="flex items-center gap-2 text-sky-400"><span className="w-3 h-3 rounded-full bg-sky-400"></span> Historias ({workDist.pct_historias}%)</span>
              <span className="flex items-center gap-2 text-rose-400"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Bugs ({workDist.pct_bugs}%)</span>
              <span className="flex items-center gap-2 text-emerald-400"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> Tareas ({workDist.pct_tareas}%)</span>
            </div>
          </div>

          <div className="w-full bg-slate-900 h-10 rounded-xl overflow-hidden flex border border-slate-800 p-1">
            <div 
              style={{ width: `${workDist.pct_historias}%` }} 
              className="bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center rounded-l-lg transition-all"
            >
              {workDist.pct_historias}% Historias
            </div>
            <div 
              style={{ width: `${workDist.pct_bugs}%` }} 
              className="bg-rose-500 text-white font-bold text-xs flex items-center justify-center transition-all"
            >
              {workDist.pct_bugs}% Bugs
            </div>
            <div 
              style={{ width: `${workDist.pct_tareas}%` }} 
              className="bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center rounded-r-lg transition-all"
            >
              {workDist.pct_tareas}% Tareas
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN TABLA DE INCIDENCIAS ASIGNADAS SIN DESBORDAMIENTO HORIZONTAL */}
      <div className="group relative rounded-2xl bg-slate-950 p-8 shadow-2xl border border-slate-800/80 transition-all duration-300 space-y-6 hover:z-40">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-sm opacity-20 pointer-events-none"></div>
        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Incidencias Asignadas
              </h2>
              <MetricInfoTooltip text="Listado de Incidencias Asignadas: Muestra las tareas asignadas directamente a ti con sus claves, resúmenes y Cycle Time." />
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
              {assignedIssuesList.length} Tareas Asignadas
            </span>
          </div>

          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-4">CLAVE</th>
                  <th className="px-5 py-4">RESUMEN</th>
                  <th className="px-5 py-4 text-center">ESTADO ACTUAL</th>
                  <th className="px-5 py-4 text-right">Story Points</th>
                  <th className="px-5 py-4 text-right">Cycle Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {assignedIssuesList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                      No hay incidencias asignadas registradas en el sistema para este proyecto. Sincronice su proyecto con Jira para cargar información real.
                    </td>
                  </tr>
                ) : (
                  assignedIssuesList.map((issue, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-indigo-400 text-sm">
                        {issue.key_issue}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-200 hover:text-indigo-300 transition-colors cursor-pointer max-w-md truncate">
                        {issue.summary}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase border ${
                          issue.status_actual?.toUpperCase().includes('LISTO') || issue.status_actual?.toUpperCase().includes('DONE')
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : issue.status_actual?.toUpperCase().includes('REVISI')
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {issue.status_actual}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-slate-200 text-sm">
                        {issue.story_points}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-teal-400 flex items-center justify-end gap-3">
                        <span className="text-sm">{issue.cycle_time_days > 0 ? `${issue.cycle_time_days}d` : '-'}</span>
                        <SparklineMini color={issue.cycle_time_days > 3.5 ? "#f43f5e" : "#10b981"} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
