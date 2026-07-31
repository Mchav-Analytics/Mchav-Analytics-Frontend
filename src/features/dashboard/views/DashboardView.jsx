// ============================================================================
// FEATURE DASHBOARD — VISTA DEL ADMINISTRADOR (DISEÑO MEJORADO Y ESPACIADO)
// ============================================================================
// Vista con 4 KPIs superiores, Velocidad por Sprint, Burndown,
// Salud del Sprint (75% Estable) y Gráfica de Dona interactiva. Adaptada a temas y espaciados limpios.

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Info, 
  TrendingDown, 
  TrendingUp, 
  RefreshCw, 
  AlertTriangle,
  Bug,
  User,
  FileText,
  Shield,
  X
} from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// Datos mock estables para los gráficos de Velocidad por Sprint y Burndown
const mockSprintVelocity = [
  { sprint: 'Sprint SP_1', sp: 32, promedio: 31 },
  { sprint: 'Sprint SP_2', sp: 38, promedio: 35 },
  { sprint: 'Sprint SP_3', sp: 50, promedio: 41 },
  { sprint: 'Sprint SP_4', sp: 46, promedio: 42 }
];

const mockBurndownData = [
  { day: 'D1', real: 42, ideal: 42 },
  { day: 'D2', real: 38, ideal: 37 },
  { day: 'D3', real: 34, ideal: 33 },
  { day: 'D4', real: 28, ideal: 28 },
  { day: 'D5', real: 23, ideal: 23 },
  { day: 'D6', real: 18, ideal: 18 },
  { day: 'D7', real: 13, ideal: 13 },
  { day: 'D8', real: 9, ideal: 9 },
  { day: 'D9', real: 4, ideal: 4 },
  { day: 'D10', real: 0, ideal: 0 }
];

// Datos para la Gráfica de Dona de Distribución del Trabajo
const mockDistributionData = [
  { name: 'Historias de Usuario', value: 11, percentage: 79, color: '#8b5cf6', icon: User },
  { name: 'Bugs y Defectos', value: 3, percentage: 21, color: '#ec4899', icon: Bug },
  { name: 'Tareas / Deuda Técnica', value: 0, percentage: 0, color: '#64748b', icon: FileText }
];

// Tooltip flotante informativo
const InfoTooltip = ({ text }) => (
  <div className="group relative inline-block cursor-help ml-1 z-30">
    <Info size={13} className="text-slate-400 hover:text-indigo-500 transition-colors" />
    <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-905 dark:bg-slate-900 text-slate-100 dark:text-slate-100 text-[11px] rounded-xl shadow-2xl border border-slate-800 pointer-events-none leading-snug">
      {text}
    </div>
  </div>
);

function DashboardView({ subTab = 'dashboard' }) {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false); // Estado de animación del botón de refresco
  const [showActiveToast, setShowActiveToast] = useState(true);

  const isPending = user?.status === 'PENDING' && user?.rol === 'MANAGER';

  useEffect(() => {
    if (user?.rol === 'MANAGER' && !isPending) {
      setShowActiveToast(true);
      const timer = setTimeout(() => setShowActiveToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isPending, user?.rol]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Estilo dinámico de Recharts Tooltip con variables CSS de tema
  const tooltipStyle = {
    backgroundColor: 'var(--bg-card)',
    borderColor: 'var(--border-color)',
    borderRadius: '12px',
    color: 'var(--text-main)',
    fontSize: '12px',
    boxShadow: 'var(--shadow-card)'
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      
      {/* CUADRO DE NOTIFICACIÓN DE ESTADO PENDIENTE PARA MANAGER */}
      {isPending && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 dark:border-amber-500/40 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0 mt-0.5">
              <Clock size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-amber-200">
                  ⏳ Estado: Pendiente de Asignación de Rol de Líder Técnico
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Tu solicitud ha sido enviada al Administrador. Una vez aprobada, tendrás acceso completo a la gestión de proyectos y tableros consolidados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TOAST FLOTANTE TEMPORAL DE ROL ACTIVADO (MÁNAGER) */}
      {!isPending && user?.rol === 'MANAGER' && showActiveToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 shadow-md flex items-center justify-between gap-3 text-emerald-900 dark:text-emerald-300 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold shrink-0">
              <Shield size={18} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold">🎉 ¡Rol Activado: Líder Técnico (MANAGER)!</h4>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">El Administrador te ha asignado el acceso a los tableros consolidados y métricas del equipo.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowActiveToast(false)}
            className="text-emerald-500 hover:text-emerald-700 p-1 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* 1. CABECERA: HISTÓRICO GENERAL Y BOTÓN DE REFRESCO */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-500 dark:text-indigo-400 font-extrabold flex items-center justify-center text-base border border-indigo-500/30 shadow-sm">
            M
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Histórico general
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Rendimiento consolidado del sprint actual</p>
          </div>
        </div>

        {/* Botón de Refrescar Datos */}
        <button
          onClick={handleRefresh}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
          title="Actualizar datos del sprint"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-indigo-500' : ''} />
        </button>
      </div>

      {/* 2. FILA DE 4 TARJETAS KPI SUPERIORES (ESPACIADO COMPACTO Y PROPORCIONADO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Puntos Entregados (SP) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-lg flex flex-col relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide">
              <Zap size={14} className="text-purple-500 dark:text-purple-400 shrink-0" />
              <span>Puntos Entregados</span>
            </div>
            <InfoTooltip text="Suma de Story Points (SP) de las tareas finalizadas en este sprint." />
          </div>
          <div className="flex items-baseline justify-between mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">30</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">SP</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
              <TrendingDown size={11} /> -48%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
            Story Points entregados en el sprint.
          </p>
        </div>

        {/* KPI 2: Tareas Completadas */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-lg flex flex-col relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide">
              <CheckCircle2 size={14} className="text-teal-500 dark:text-teal-400 shrink-0" />
              <span>Tareas Completadas</span>
            </div>
            <InfoTooltip text="Cantidad de tareas completadas en relación al total planificado." />
          </div>
          <div className="flex items-baseline justify-between mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">10</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">de 14</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
              <TrendingDown size={11} /> -38%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
            Tareas resueltas del backlog planificado.
          </p>
        </div>

        {/* KPI 3: Tiempo de Ciclo */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-lg flex flex-col relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide">
              <Clock size={14} className="text-amber-500 dark:text-amber-400 shrink-0" />
              <span>Tiempo de Ciclo</span>
            </div>
            <InfoTooltip text="Días promedio que tarda una tarea en completarse desde que inicia desarrollo." />
          </div>
          <div className="flex items-baseline justify-between mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">4.2</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">días</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
              <TrendingDown size={11} /> -20%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
            Tiempo de resolución en desarrollo.
          </p>
        </div>

        {/* KPI 4: Tasa de Retrabajo */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-lg flex flex-col relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide">
              <RotateCcw size={14} className="text-cyan-500 dark:text-cyan-400 shrink-0" />
              <span>Tasa de Retrabajo</span>
            </div>
            <InfoTooltip text="Porcentaje de bugs reportados sobre el total de tareas en el sprint." />
          </div>
          <div className="flex items-baseline justify-between mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">21%</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
              <TrendingUp size={11} /> +8.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
            Bugs reportados sobre total de tareas.
          </p>
        </div>

      </div>

      {/* 3. FILA MEDIA: GRÁFICAS DE VELOCIDAD Y BURNDOWN (CON ESPACIADO MODERNO Y BORDE SLEEK) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfica 1: Velocidad por Sprint */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-xl space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Velocidad por Sprint</h3>
              <InfoTooltip text="Evolución del rendimiento en Story Points a lo largo de los sprints finalizados." />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Evolución del rendimiento en story points</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mockSprintVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="sprint" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Bar dataKey="sp" fill="#6366f1" radius={[4, 4, 0, 0]} name="Story Points" barSize={32} />
                <Line type="monotone" dataKey="promedio" stroke="#10b981" strokeWidth={3} dot={false} name="Promedio histórico" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 2: Progreso de Tareas (Burndown) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Progreso de tareas (Burndown)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Esfuerzo restante en story points vs. ideal</p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockBurndownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="real" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} name="REAL" />
                <Line type="monotone" dataKey="ideal" stroke="#10b981" strokeDasharray="4 4" strokeWidth={2} dot={false} name="IDEAL" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium pt-1 flex items-center gap-1.5">
            ✨ Avance óptimo. El ritmo real de quemado coincide casi a la perfección con la línea ideal de entrega.
          </p>
        </div>

      </div>

      {/* 4. FILA INFERIOR: SALUD DEL SPRINT Y DISTRIBUCIÓN DE TRABAJO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bloque Salud del Sprint */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-xl space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Salud del sprint</h3>
              <InfoTooltip text="Salud calculada sobre bugs críticos y cuellos de botella detectados." />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Salud calculada sobre bugs críticos y cuellos de botella</p>
          </div>

          {/* Anillo de Medición Circular de Salud */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500"
                  strokeDasharray="75, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white">75%</span>
                <span className="text-[10px] font-extrabold tracking-widest text-amber-500 dark:text-amber-400 uppercase">ESTABLE</span>
              </div>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-2">
              El sprint necesita seguimiento para evitar retrasos.
            </p>
          </div>

          {/* Alertas de Incidencias Críticas */}
          <div className="space-y-2 pt-1">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-slate-300 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-500 dark:text-amber-400 shrink-0" />
              <span><strong>PA-112:</strong> Bug crítico asignado a <strong>Stephany Leon</strong> requiere atención inmediata.</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-slate-300 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-500 dark:text-amber-400 shrink-0" />
              <span><strong>PA-111:</strong> Tarea demorada (5.8d en curso). Sugerencia: revisar con <strong>Carlos Perez</strong> en la Daily.</span>
            </div>
          </div>
        </div>

        {/* Bloque Gráfica de Dona: Distribución del Trabajo */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Distribución del trabajo</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Por tipo de incidencia, sprint actual</p>
          </div>

          {/* GRÁFICA DE DONA DE RECHARTS CON LEYENDA E INTERACTIVIDAD JS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-2">
            
            {/* Gráfica de Dona con Centro Total */}
            <div className="h-48 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 dark:text-white">14</span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Incidencias</span>
              </div>
            </div>

            {/* Leyenda y Porcentajes de la Dona */}
            <div className="space-y-3">
              {mockDistributionData.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <div className="flex items-center gap-1.5">
                        <IconComponent size={14} className="text-slate-500 dark:text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {item.value} <span className="text-slate-500 dark:text-slate-400 text-[10px]">({item.percentage}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DashboardView;
