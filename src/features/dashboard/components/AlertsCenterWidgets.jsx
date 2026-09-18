import React, { useMemo } from 'react';
import { Info, Code, Layers, Layout, FileText, TrendingUp, MessageSquare, CheckCircle, Send, ChevronRight, Target, Clock, Server, CheckSquare, Globe, Smartphone } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../auth/context/AuthContext';

const TREND_DATA = [
  { name: '10 sep', val: 1 },
  { name: '11 sep', val: 2 },
  { name: '12 sep', val: 3 },
  { name: '13 sep', val: 2 },
  { name: '14 sep', val: 4 },
  { name: '15 sep', val: 3 },
  { name: '16 sep', val: 7 },
];

export const AlertsCenterWidgets = ({ 
  categoryCounts = {}, 
  projectCounts = {},
  trendData = [],
  trendTimeframe = 'weekly',
  setTrendTimeframe,
  sidebarCategory = 'ALL', 
  setSidebarCategory, 
  setStatusTab,
  isDev: isDevProp,
  isAdmin: isAdminProp,
  isLeader: isLeaderProp
}) => {
  const { user } = useAuth();
  const roleRaw = (user?.rol || user?.role || '').toUpperCase();
  const isAdminCalculated = roleRaw.includes('ADMIN');
  const isLeaderCalculated = roleRaw.includes('MANAG') || roleRaw.includes('LIDER') || roleRaw.includes('LEAD');
  
  const isDev = isDevProp !== undefined ? isDevProp : (!isAdminCalculated && !isLeaderCalculated);
  const isAdmin = isAdminProp !== undefined ? isAdminProp : isAdminCalculated;
  const isLeader = isLeaderProp !== undefined ? isLeaderProp : (!isAdmin && !isDev);

  const [localTimeframe, setLocalTimeframe] = React.useState('weekly');
  const activeTimeframe = trendTimeframe || localTimeframe;

  const handleTimeframeChange = (val) => {
    if (setTrendTimeframe) {
      setTrendTimeframe(val);
    }
    setLocalTimeframe(val);
  };

  const chartData = useMemo(() => {
    if (trendData && trendData.length > 0) return trendData;
    if (activeTimeframe === 'monthly') {
      return [
        { name: 'May', val: 1 },
        { name: 'Jun', val: 2 },
        { name: 'Jul', val: 4 },
        { name: 'Ago', val: 5 },
        { name: 'Sep', val: 7 }
      ];
    }
    return [
      { name: '10 sep', val: 1 },
      { name: '11 sep', val: 2 },
      { name: '12 sep', val: 3 },
      { name: '13 sep', val: 2 },
      { name: '14 sep', val: 4 },
      { name: '15 sep', val: 3 },
      { name: '16 sep', val: 7 }
    ];
  }, [trendData, activeTimeframe]);

  const maxVal = Math.max(1, ...chartData.map(d => d.val || 0));

  const maxCategoryCount = Math.max(
    1,
    categoryCounts['Código'] || 0,
    categoryCounts['Procesos'] || 0,
    categoryCounts['UI/UX'] || 0,
    categoryCounts['Documentación'] || 0
  );

  const maxProjectCount = Math.max(
    1,
    projectCounts['MCHAV Analytics'] || 8,
    projectCounts['Portal Web'] || 5,
    projectCounts['App Móvil'] || 3,
    projectCounts['Infraestructura'] || 2
  );

  const getWidthPct = (count) => {
    if (!count) return 0;
    return Math.max(12, Math.round((count / maxCategoryCount) * 100));
  };

  // ── VISTA DESARROLLADOR: WIDGETS DE "TU PROGRESO" Y "ACTIVIDAD RECIENTE" (IMAGEN 1) ──
  if (isDev) {
    return (
      <div className="lg:col-span-4 space-y-6">
        {/* WIDGET 1: TU PROGRESO */}
        <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-6 rounded-3xl shadow-2xs space-y-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Tu progreso
            </h3>
          </div>

          <div className="bg-white/90 dark:bg-[#1a1e3b]/80 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
            {/* Ring Gauge 68% */}
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600 dark:text-indigo-400"
                  strokeDasharray="68, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-black text-slate-900 dark:text-white">68%</span>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100">Feedback atendidos</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold">+12%</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">11 de 16</p>
              <span className="text-[10px] text-slate-400 font-normal block pt-0.5">vs. período anterior</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 dark:bg-[#1a1e3b] h-2.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full w-[68%] transition-all duration-500"></div>
          </div>
        </div>

        {/* WIDGET 2: ACTIVIDAD RECIENTE (DESARROLLADOR) */}
        <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-6 rounded-3xl shadow-2xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Actividad reciente
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            <div className="py-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare size={14} />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-bold leading-tight truncate">
                  Comentaste en <span className="text-slate-500 dark:text-slate-400 font-semibold">"Mejorar documentación del módulo.."</span>
                </p>
              </div>
              <span className="text-[11px] text-slate-400 font-medium shrink-0">Hace 2 horas</span>
            </div>

            <div className="py-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare size={14} />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-bold leading-tight truncate">
                  El líder respondió en <span className="text-slate-500 dark:text-slate-400 font-semibold">"Refactorizar lógica de validación.."</span>
                </p>
              </div>
              <span className="text-[11px] text-slate-400 font-medium shrink-0">Hace 5 horas</span>
            </div>

            <div className="py-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle size={14} />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-bold leading-tight truncate">
                  Se marcó como resuelto <span className="text-slate-500 dark:text-slate-400 font-semibold">"Agregar pruebas unitarias.."</span>
                </p>
              </div>
              <span className="text-[11px] text-slate-400 font-medium shrink-0">Ayer</span>
            </div>

            <div className="py-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Send size={14} className="rotate-45" />
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-bold leading-tight truncate">
                  Enviaste un nuevo feedback <span className="text-slate-500 dark:text-slate-400 font-semibold">"Ajuste en la visualización.."</span>
                </p>
              </div>
              <span className="text-[11px] text-slate-400 font-medium shrink-0">Ayer</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="lg:col-span-4 space-y-6">
        {/* WIDGET 1: PROYECTOS CON MÁS FEEDBACK */}
        <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-5 rounded-3xl shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Proyectos con más feedback
            </h3>
            <button
              type="button"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {Object.keys(projectCounts).length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-2">No hay proyectos registrados.</p>
            ) : (
              Object.entries(projectCounts).map(([projName, count], idx) => {
                const colors = [
                  { bar: 'bg-purple-600', iconBg: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400', icon: MessageSquare },
                  { bar: 'bg-blue-500', iconBg: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400', icon: Globe },
                  { bar: 'bg-emerald-500', iconBg: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400', icon: Smartphone },
                  { bar: 'bg-amber-500', iconBg: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400', icon: Server }
                ];
                const theme = colors[idx % colors.length];
                const IconComponent = theme.icon;
                const maxVal = Math.max(1, ...Object.values(projectCounts));
                const pct = Math.max(15, Math.round((count / maxVal) * 100));

                return (
                  <div key={projName} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${theme.iconBg} flex items-center justify-center shrink-0`}>
                      <IconComponent size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-slate-800 dark:text-slate-100 truncate">{projName}</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{count}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-[#1a1e3b] h-2 rounded-full overflow-hidden">
                        <div className={`${theme.bar} h-full rounded-full transition-all duration-300`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* WIDGET 2: RESUMEN DE LA GESTIÓN */}
        <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-5 rounded-3xl shadow-2xs space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Target size={18} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Resumen de la gestión
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5 p-3 rounded-2xl bg-white/70 dark:bg-[#1a1e3b]/70 border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <Clock size={15} />
                </div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                  Tiempo promedio de respuesta
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white pl-1 pt-1">18.6 h</div>
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 block pl-1">
                ↓ -28% vs. periodo anterior
              </span>
            </div>

            <div className="space-y-1.5 p-3 rounded-2xl bg-white/70 dark:bg-[#1a1e3b]/70 border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle size={15} />
                </div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                  Feedback resueltos
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white pl-1 pt-1">33%</div>
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 block pl-1">
                ↑ +12% vs. periodo anterior
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VISTA LÍDER: TENDENCIA DEL EQUIPO, ÁREAS QUE REQUIEREN ATENCIÓN Y RESUMEN DE GESTIÓN ──
  return (
    <div className="lg:col-span-4 space-y-6">
      {/* ── WIDGET 1: TENDENCIA DE FEEDBACK DEL EQUIPO ── */}
      <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-5 rounded-3xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Tendencia de feedback del equipo
          </h3>

          <select 
            value={activeTimeframe}
            onChange={(e) => handleTimeframeChange(e.target.value)}
            className="bg-white dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:border-indigo-400 transition-colors shadow-2xs"
          >
            <option value="weekly">Últimos 7 días</option>
            <option value="monthly">Últimos 30 días</option>
            <option value="quarterly">Últimos 90 días</option>
          </select>
        </div>

        {/* Smooth Area Chart */}
        <div className="h-44 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="purpleGradientLeader" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, Math.ceil(maxVal * 1.2)]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="val" 
                stroke="#7c3aed" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#purpleGradientLeader)" 
                dot={{ r: 4, fill: '#7c3aed', strokeWidth: 2, stroke: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── WIDGET 2: ÁREAS QUE REQUIEREN ATENCIÓN ── */}
      <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-5 rounded-3xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Áreas que requieren atención</span>
            <Info size={14} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer" />
          </h3>

          <button
            type="button"
            onClick={() => {
              if (setSidebarCategory) setSidebarCategory('ALL');
              if (setStatusTab) setStatusTab('ALL');
            }}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Ver todas
          </button>
        </div>

        <div className="space-y-4 pt-1">
          {/* Item 1: Código */}
          <div 
            onClick={() => setSidebarCategory && setSidebarCategory(sidebarCategory === 'Código' ? 'ALL' : 'Código')}
            className="space-y-1.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-extrabold text-slate-800 dark:text-slate-100">
                <Code size={15} className="text-rose-500" />
                <span>Código</span>
              </div>
              <span className="text-slate-900 dark:text-white font-black">{categoryCounts['Código'] ?? 5}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#1a1e3b] h-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full transition-all duration-300" style={{ width: `${getWidthPct(categoryCounts['Código'] || 5)}%` }}></div>
            </div>
          </div>

          {/* Item 2: Procesos */}
          <div 
            onClick={() => setSidebarCategory && setSidebarCategory(sidebarCategory === 'Procesos' ? 'ALL' : 'Procesos')}
            className="space-y-1.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-extrabold text-slate-800 dark:text-slate-100">
                <Layers size={15} className="text-amber-500" />
                <span>Procesos</span>
              </div>
              <span className="text-slate-900 dark:text-white font-black">{categoryCounts['Procesos'] ?? 7}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#1a1e3b] h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${getWidthPct(categoryCounts['Procesos'] || 7)}%` }}></div>
            </div>
          </div>

          {/* Item 3: UI/UX */}
          <div 
            onClick={() => setSidebarCategory && setSidebarCategory(sidebarCategory === 'UI/UX' ? 'ALL' : 'UI/UX')}
            className="space-y-1.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-extrabold text-slate-800 dark:text-slate-100">
                <Layout size={15} className="text-emerald-500" />
                <span>UI/UX</span>
              </div>
              <span className="text-slate-900 dark:text-white font-black">{categoryCounts['UI/UX'] ?? 2}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#1a1e3b] h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${getWidthPct(categoryCounts['UI/UX'] || 2)}%` }}></div>
            </div>
          </div>

          {/* Item 4: Documentación */}
          <div 
            onClick={() => setSidebarCategory && setSidebarCategory(sidebarCategory === 'Documentación' ? 'ALL' : 'Documentación')}
            className="space-y-1.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-extrabold text-slate-800 dark:text-slate-100">
                <FileText size={15} className="text-blue-500" />
                <span>Documentación</span>
              </div>
              <span className="text-slate-900 dark:text-white font-black">{categoryCounts['Documentación'] ?? 1}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#1a1e3b] h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${getWidthPct(categoryCounts['Documentación'] || 1)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── WIDGET 3: RESUMEN DE TU GESTIÓN ── */}
      <div className="bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-5 rounded-3xl shadow-2xs space-y-4 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Target size={18} />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Resumen de tu gestión
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Metric 1 */}
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/70 dark:bg-[#1a1e3b]/70 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Clock size={15} />
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                Tiempo promedio de respuesta
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white pl-1 pt-1">12.4 h</div>
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 block pl-1">
              ↓ -32% vs. periodo anterior
            </span>
          </div>

          {/* Metric 2 */}
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/70 dark:bg-[#1a1e3b]/70 border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle size={15} />
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                Feedback resueltos
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white pl-1 pt-1">75%</div>
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 block pl-1">
              ↑ +15% vs. periodo anterior
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
