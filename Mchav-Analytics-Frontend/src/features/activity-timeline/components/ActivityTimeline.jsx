import React, { useState, useMemo } from "react";
import {
  Bug,
  CheckCircle2,
  Clock3,
  PlusCircle,
  AlertTriangle,
  Search,
  Filter,
  Users,
  Activity,
  Calendar,
  Tag
} from "lucide-react";

const activityConfig = {
  created: {
    icon: <PlusCircle size={12} />,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    border: "border-sky-200 dark:border-sky-500/20",
    title: "Tarea Creada",
  },
  closed: {
    icon: <CheckCircle2 size={12} />,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20",
    title: "Tarea Completada",
  },
  bug: {
    icon: <Bug size={12} />,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-200 dark:border-rose-500/20",
    title: "Bug Reportado",
  },
  blocked: {
    icon: <AlertTriangle size={12} />,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/20",
    title: "Alerta / Impedimento",
  },
};

// Generar iniciales del usuario
const getInitials = (name = "") => {
  if (name.toLowerCase() === "sistema") return "SYS";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

// Asignar gradiente único por usuario
const getUserGradient = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("stephany")) {
    return "bg-indigo-600 text-white";
  }
  if (lower.includes("carlos")) {
    return "bg-amber-600 text-white";
  }
  if (lower.includes("sistema")) {
    return "bg-slate-700 text-white";
  }
  return "bg-emerald-600 text-white";
};

export default function ActivityTimeline({ recentActivity = [], onSelectIssueKey }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'created' | 'closed' | 'bug' | 'blocked'

  // Estadísticas para tarjetas KPI superiores
  const stats = useMemo(() => {
    const total = recentActivity.length;
    const bugs = recentActivity.filter(a => a.type === 'bug').length;
    const closed = recentActivity.filter(a => a.type === 'closed').length;
    const users = new Set(recentActivity.map(a => a.user)).size;

    return { total, bugs, closed, users };
  }, [recentActivity]);

  // Filtrado dinámico por búsqueda y tipo
  const filteredActivity = useMemo(() => {
    return recentActivity.filter(act => {
      const matchesType = typeFilter === 'ALL' || act.type === typeFilter;
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch = !term || 
        act.user.toLowerCase().includes(term) ||
        act.desc.toLowerCase().includes(term) ||
        act.key.toLowerCase().includes(term);

      return matchesType && matchesSearch;
    });
  }, [recentActivity, searchTerm, typeFilter]);

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-300 pb-16">
      
      {/* SECCIÓN 1: TARJETAS KPI RESUMEN AL ESTILO REPORTES */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6" style={{ marginBottom: '2.5rem' }}>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Eventos</p>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-50 tracking-tight">{stats.total}</p>
              <p className="text-xs text-slate-400 font-medium">Registrados en sprint</p>
            </div>
            <div className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30">
              <Activity size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bugs Detectados</p>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-50 tracking-tight">{stats.bugs}</p>
              <p className="text-xs text-slate-400 font-medium">Alertas en tiempo real</p>
            </div>
            <div className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/30">
              <Bug size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tareas Entregadas</p>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-50 tracking-tight">{stats.closed}</p>
              <p className="text-xs text-slate-400 font-medium">Cierres completados</p>
            </div>
            <div className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Integrantes Activos</p>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-50 tracking-tight">{stats.users}</p>
              <p className="text-xs text-slate-400 font-medium">Interactuando hoy</p>
            </div>
            <div className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/15 border-sky-200 dark:border-sky-500/30">
              <Users size={22} />
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: TARJETA PRINCIPAL DE LÍNEA DE TIEMPO AL ESTILO REPORTES */}
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-300"
        style={{ marginTop: '2.5rem' }}
      >
        {/* CABECERA DE LA TARJETA */}
        <div 
          className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6"
          style={{ padding: '1.75rem 2rem', marginBottom: '1.5rem' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Clock3 size={22} />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Historial de Actividad del Sprint
              </h2>
              <p className="text-xs text-slate-400">
                Línea de tiempo cronológica de los últimos eventos y cambios del equipo.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-1.5 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 shrink-0">
            {filteredActivity.length} eventos visibles
          </span>
        </div>

        {/* BUSCADOR A LA IZQUIERDA Y PÍLDORAS DE FILTRO A LA DERECHA */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5" style={{ padding: '0 2rem', marginBottom: '2.5rem' }}>
          
          {/* Buscador a la izquierda */}
          <div className="flex-1 min-w-[280px]">
            <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar por usuario (ej. Stephany), evento o clave (PA-114)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm font-medium"
              />
            </div>
          </div>

          {/* Filtros a la derecha */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 justify-start lg:justify-end">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1.5">
              <Filter size={14} /> FILTRAR POR:
            </span>

            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                typeFilter === 'ALL'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
            >
              Todos ({recentActivity.length})
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('created')}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                typeFilter === 'created'
                  ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-sky-400'
              }`}
            >
              Creadas
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('closed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                typeFilter === 'closed'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
              }`}
            >
              Completadas
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('bug')}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                typeFilter === 'bug'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-rose-400'
              }`}
            >
              Bugs
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('blocked')}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                typeFilter === 'blocked'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400'
              }`}
            >
              Alertas
            </button>
          </div>

        </div>

        {/* LISTADO CRONOLÓGICO DE EVENTOS SIN LÍNEA VERTICAL CON TARJETAS INDEPENDIENTES */}
        <div style={{ padding: '0 2rem 2.5rem 2rem' }}>
          {filteredActivity.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs font-semibold">
              No se encontraron eventos con los criterios de búsqueda aplicados.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredActivity.map((act, index) => {
                const cfg = activityConfig[act.type] || activityConfig.created;

                return (
                  <div 
                    key={index} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#070D1B] border border-slate-200/90 dark:border-slate-800 shadow-sm shadow-slate-200/50 transition-all hover:border-indigo-400/50 dark:hover:border-slate-700 hover:shadow-md"
                  >
                    
                    {/* LADO IZQUIERDO: AVATAR + DETALLES DEL EVENTO */}
                    <div className="flex items-center gap-4 min-w-0">
                      
                      {/* Avatar del Usuario */}
                      <div className="relative shrink-0">
                        <div className={`
                          w-11 h-11 rounded-2xl flex items-center justify-center
                          ${getUserGradient(act.user)}
                          font-mono font-black text-xs tracking-wider shadow-md
                        `}>
                          {getInitials(act.user)}
                        </div>

                        <div className={`
                          absolute -bottom-1 -right-1 w-5 h-5 rounded-full 
                          bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                          flex items-center justify-center ${cfg.color} shadow-sm z-10
                        `}>
                          {cfg.icon}
                        </div>
                      </div>

                      {/* Información de Usuario y Acción */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <strong className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {act.user}
                          </strong>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                            {cfg.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                          {act.desc}
                        </p>
                      </div>

                    </div>

                    {/* LADO DERECHO: HORA Y CHIP INTERACTIVO DE CLAVE DE TAREA */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <span className="text-[11px] text-slate-400 font-medium font-mono">
                        {act.time}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectIssueKey && onSelectIssueKey(act.key)}
                        className="rounded-lg bg-indigo-50 dark:bg-indigo-500/10 px-3.5 py-1.5 text-xs font-mono font-black tracking-wider text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shadow-sm cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all"
                      >
                        {act.key}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}