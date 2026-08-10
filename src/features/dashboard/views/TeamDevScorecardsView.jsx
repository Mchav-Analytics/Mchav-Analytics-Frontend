// ============================================================================
// FASE 5: VISTA ADMINISTRADOR/LÍDER TÉCNICO — RENDIMIENTO POR DESARROLLADOR
// ============================================================================
// Permite al Administrador / Líder Técnico seleccionar cualquier desarrollador del equipo
// y visualizar sus métricas individuales (Cycle Time, WIP, Throughput, SP, Incidencias Asignadas).

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  ClipboardList, 
  CheckCircle, 
  Zap, 
  Target,
  Info, 
  Search, 
  Filter,
  Download,
  ShieldAlert,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { developerService } from '../../../services/api';

const MetricInfoTooltip = ({ text, align = "auto" }) => {
  return (
    <div className="relative group/tooltip flex items-center inline-flex">
      <Info size={14} className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer ml-1" />
      <div className={`absolute bottom-full mb-2 ${align === "right" ? "right-0" : align === "left" ? "left-0" : "left-1/2 -translate-x-1/2"} hidden group-hover/tooltip:block w-56 p-2.5 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl shadow-2xl z-50 pointer-events-none text-left backdrop-blur-md`}>
        {text}
        <div className={`absolute top-full ${align === "right" ? "right-3" : align === "left" ? "left-3" : "left-1/2 -translate-x-1/2"} border-4 border-transparent border-t-slate-900`}></div>
      </div>
    </div>
  );
};

const SparklineMini = ({ color = "#10b981" }) => {
  const dummyData = [{ v: 4.2 }, { v: 3.8 }, { v: 4.5 }, { v: 3.1 }, { v: 2.8 }, { v: 3.2 }];
  return (
    <div className="w-20 h-7 inline-block">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dummyData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`grad_${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#grad_${color.replace('#', '')})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function TeamDevScorecardsView({ selectedProjectId = 'PROJ-01', onNavigateToMatrix, onNavigateToHealth, onNavigateToAlerts }) {
  const [developers, setDevelopers] = useState([]);
  const [selectedDev, setSelectedDev] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [loadingDevs, setLoadingDevs] = useState(true);
  const [loadingCard, setLoadingCard] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // 1. Cargar la lista de desarrolladores del proyecto activo
  useEffect(() => {
    setLoadingDevs(true);
    developerService.getDevelopers(selectedProjectId)
      .then(devs => {
        setDevelopers(devs || []);
        if (devs && devs.length > 0) {
          setSelectedDev(prev => {
            if (prev && devs.some(d => (d.assignee_id || d.email) === (prev.assignee_id || prev.email))) {
              return prev;
            }
            return devs[0];
          });
        }
        setLoadingDevs(false);
      })
      .catch(err => {
        console.warn("Error al listar desarrolladores:", err);
        setLoadingDevs(false);
      });
  }, [selectedProjectId]);

  // 2. Cargar el Scorecard individual cuando cambia el desarrollador seleccionado
  const targetDevId = selectedDev?.assignee_id || selectedDev?.email;
  useEffect(() => {
    if (!targetDevId) return;
    setLoadingCard(true);
    developerService.getDeveloperScorecard(targetDevId, selectedProjectId)
      .then(card => {
        setScorecard(card);
        setLoadingCard(false);
      })
      .catch(err => {
        console.warn("Error al cargar scorecard del desarrollador:", err);
        setLoadingCard(false);
      });
  }, [targetDevId, selectedProjectId]);

  const filteredDevs = developers.filter(d => 
    (d.nombre || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (d.email || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

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
    <div className="w-full max-w-full overflow-x-hidden space-y-8 py-4 text-left font-sans min-h-[85vh] flex flex-col justify-between">
      
      {/* BARRA SUPERIOR DE ACCESO RÁPIDO Y NAVEGACIÓN */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 px-4 rounded-xl shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button 
            onClick={onNavigateToMatrix}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Users size={14} />
            <span>Matriz 4 Cuadrantes</span>
          </button>
          <button 
            onClick={onNavigateToHealth}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Zap size={14} className="text-amber-400" />
            <span>Salud del Sprint & Flow</span>
          </button>
          <button className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg shadow border border-indigo-500 flex items-center gap-1.5 cursor-pointer">
            <Target size={14} className="text-cyan-400" />
            <span>Scorecards Devs</span>
          </button>
          <button 
            onClick={onNavigateToAlerts}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle size={14} className="text-rose-400" />
            <span>Alertas & Solicitudes</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5 bg-emerald-950/40 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-800/40 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ETL Sync Activa
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="font-semibold text-slate-300">Proyecto: {selectedProjectId}</span>
        </div>
      </div>

      {/* ENCABEZADO PRINCIPAL PARA ADMINISTRADOR */}
      <div className="relative rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-800 transition-all duration-300">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-teal-500 text-white font-extrabold shadow-xl shadow-indigo-500/25">
              <UserCheck size={28} />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                Rendimiento Individual por Desarrollador
                <span className="flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse"></span>
                  Fase 5 Administrator View
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Supervisación y auditoría de velocidad, capacidad WIP y entregas por integrante del equipo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer">
              <Download size={15} /> Exportar Reporte Dev
            </button>
          </div>
        </div>
      </div>

      {/* SELECTOR DE DESARROLLADORES (CARDS INTERACTIVAS) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Users size={16} className="text-indigo-600 dark:text-indigo-400" /> Desarrolladores del Proyecto ({developers.length})
          </h2>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Buscar desarrollador..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredDevs.map((dev) => {
            const isSelected = selectedDev?.assignee_id === dev.assignee_id;
            const initials = (dev.nombre || 'Dev').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            return (
              <button
                key={dev.assignee_id || dev.email}
                onClick={() => setSelectedDev(dev)}
                className={`relative flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 shadow-sm ring-1 ring-indigo-500/50' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold text-sm text-white shrink-0 ${
                  isSelected 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {initials}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <h3 className={`text-sm font-bold truncate ${isSelected ? 'text-indigo-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                    {dev.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{dev.email || 'dev@mchav.com'}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DASHBOARD INDIVIDUAL DEL DESARROLLADOR SELECCIONADO */}
      {selectedDev && (
        <div className="space-y-8 pt-4 border-t border-slate-200 dark:border-slate-800">
          
          {/* BANNER DEL DESARROLLADOR SELECCIONADO */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-lg">
                {(selectedDev.nombre || 'Dev').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Scorecard de {selectedDev.nombre}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">ID Assignee: <span className="font-mono text-indigo-600 dark:text-indigo-400">{selectedDev.assignee_id}</span> | Email: {selectedDev.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3.5 py-1.5 rounded-full">
                Rendimiento: Alto (81% SP)
              </span>
            </div>
          </div>

          {/* TARJETAS KPI DEL DESARROLLADOR SELECCIONADO */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* TARJETA 1: Cycle Time Personal */}
            <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 p-7 shadow-sm dark:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-slate-200 dark:border-slate-800 min-h-[220px] justify-between">
              <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Cycle Time Dev</h3>
                  </div>
                  <MetricInfoTooltip align="left" text="Cycle Time del Desarrollador: Tiempo promedio en días dedicado por este integrante para resolver tickets." />
                </div>

                <div>
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {scorecard?.cycle_time_personal || 3.2} <span className="text-lg font-bold text-emerald-600 dark:text-emerald-500">días</span>
                  </span>
                  <div className="w-full h-12 mt-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparklineCycleTime}>
                        <defs>
                          <linearGradient id="ctGradDev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.5}/>
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="url(#ctGradDev)" isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Promedio Equipo</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">3.8d</span>
                </div>
              </div>
            </div>

            {/* TARJETA 2: Tickets WIP */}
            <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 p-7 shadow-sm dark:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-slate-200 dark:border-slate-800 min-h-[220px] justify-between">
              <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
                      <ClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Tickets WIP</h3>
                  </div>
                  <MetricInfoTooltip align="left" text="Work In Progress del Desarrollador: Número de tareas en progreso asignadas a este desarrollador." />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
                      {scorecard?.wip_tickets || 7}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tickets activos</p>
                  </div>
                  <div className="w-16 h-16 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutWipData} innerRadius={18} outerRadius={28} dataKey="value" stroke="none">
                          {donutWipData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 1 ? (document.documentElement.classList.contains('dark') ? '#1e293b' : '#e2e8f0') : entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <span className="absolute text-[9px] font-bold text-purple-600 dark:text-purple-300">WIP</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Capacidad Máx</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{scorecard?.wip_max || 10} Tickets</span>
                </div>
              </div>
            </div>

            {/* TARJETA 3: Throughput */}
            <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 p-7 shadow-sm dark:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-slate-200 dark:border-slate-800 min-h-[220px] justify-between">
              <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-sky-600 shadow-md">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Throughput Dev</h3>
                  </div>
                  <MetricInfoTooltip align="right" text="Throughput del Desarrollador: Entregables completados por este desarrollador en el sprint." />
                </div>

                <div>
                  <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight">
                    {scorecard?.throughput_tickets || 14} <span className="text-xs font-bold text-teal-600 dark:text-teal-500">Tickets</span>
                  </span>
                  <div className="w-full h-11 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={throughputDaily}>
                        <Bar dataKey="v" fill="#14b8a6" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Promedio Diario</span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400">{scorecard?.throughput_avg_daily || 2.3}/día</span>
                </div>
              </div>
            </div>

            {/* TARJETA 4: Story Points */}
            <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 p-7 shadow-sm dark:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-slate-200 dark:border-slate-800 min-h-[220px] justify-between">
              <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-md">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Story Points Dev</h3>
                  </div>
                  <MetricInfoTooltip align="right" text="Puntos de Historia del Desarrollador: Puntos de esfuerzo completados por este desarrollador." />
                </div>

                <div>
                  <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
                    {scorecard?.story_points_burned || 65} <span className="text-sm font-bold text-indigo-600 dark:text-indigo-500">SP</span>
                  </span>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 h-3 rounded-full mt-4 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${scorecard?.story_points_achieved_pct || 81}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Meta Sprint</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{scorecard?.story_points_target || 80} SP</span>
                </div>
              </div>
            </div>

          </div>

          {/* TABLA DE INCIDENCIAS DEL DESARROLLADOR SELECCIONADO */}
          <div className="relative rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-800 transition-all duration-300 space-y-6">
            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    Incidencias Asignadas a {selectedDev.nombre}
                  </h2>
                  <MetricInfoTooltip text="Incidencias asignadas activas e históricas a este desarrollador." />
                </div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3.5 py-1.5 rounded-full">
                  {assignedIssuesList.length} Tareas Totales
                </span>
              </div>

              <div className="w-full max-w-full overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-4">CLAVE</th>
                      <th className="px-5 py-4">RESUMEN</th>
                      <th className="px-5 py-4 text-center">ESTADO ACTUAL</th>
                      <th className="px-5 py-4 text-right">Story Points</th>
                      <th className="px-5 py-4 text-right">Cycle Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                    {assignedIssuesList.map((issue, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                          {issue.key_issue}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer max-w-md truncate">
                          {issue.summary}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase border ${
                            issue.status_actual?.toUpperCase().includes('LISTO') || issue.status_actual?.toUpperCase().includes('DONE')
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                              : issue.status_actual?.toUpperCase().includes('REVISI')
                              ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20'
                              : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                          }`}>
                            {issue.status_actual}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-slate-200 text-sm">
                          {issue.story_points}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-teal-600 dark:text-teal-400 flex items-center justify-end gap-3">
                          <span className="text-sm">{issue.cycle_time_days > 0 ? `${issue.cycle_time_days}d` : '-'}</span>
                          <SparklineMini color={issue.cycle_time_days > 3.5 ? "#f43f5e" : "#10b981"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
