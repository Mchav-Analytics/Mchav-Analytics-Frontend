import React from 'react';
import { Plus, MessageSquare, Clock, CheckCircle2, Calendar, Folder, Send, ChevronRight, Check, Search } from 'lucide-react';
import LastSyncBadge from './LastSyncBadge';
import { useAuth } from '../../auth/context/AuthContext';

// ── VISTA DESARROLLADOR: CENTRO DE ACTIVIDAD (3 TARJETAS) ──
const DevAlertsHeader = ({
  setShowCreateModal,
  pendingCount,
  resolvedCount,
  inProgressCount,
  statusTab,
  setStatusTab,
  sidebarProject,
  setSidebarProject,
  projectsList
}) => (
  <div className="space-y-6">
    {/* TOP HEADER ROW */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30 shrink-0 shadow-xs">
          <MessageSquare size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Centro de Actividad
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Revisa los feedback que has enviado, su estado y mantén el seguimiento desde aquí.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        <LastSyncBadge />
        <button
          type="button"
          onClick={() => setShowCreateModal?.(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Nuevo Feedback</span>
        </button>
      </div>
    </div>

    {/* PROJECT SELECTOR DROPDOWN */}
    <div className="flex items-center justify-end gap-3 pb-1">
      <div className="flex items-center gap-2 bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs shrink-0">
        <Folder size={15} className="text-slate-400" />
        <select
          value={sidebarProject || 'ALL'}
          onChange={e => setSidebarProject?.(e.target.value)}
          className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
        >
          <option value="ALL" className="bg-white dark:bg-slate-900">Todos los proyectos</option>
          {projectsList?.map(p => (
            <option key={p.id_proyecto || p.id || p.nombre} value={p.nombre || p.id_proyecto} className="bg-white dark:bg-slate-900">
              {p.nombre || p.id_proyecto}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* 3 TARJETAS MÉTRICAS INDEPENDIENTES */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* CARD 1: ENVIADOS */}
      <button 
        type="button"
        onClick={() => setStatusTab?.('ALL')}
        className={`text-left w-full bg-[#f8faff] dark:bg-[#14192b] border ${
          statusTab === 'ALL' || statusTab === 'PENDING' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-indigo-100/80 dark:border-[#252a4e]'
        } p-5 rounded-2xl shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-indigo-500/50 transition-all cursor-pointer`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100/70 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Send size={18} className="rotate-45" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">Enviados</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{pendingCount + inProgressCount + resolvedCount}</div>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Feedback enviados</p>
          </div>
        </div>
      </button>

      {/* CARD 2: EN PROCESO */}
      <button 
        type="button"
        onClick={() => setStatusTab?.('IN_PROGRESS')}
        className={`text-left w-full bg-[#f8faff] dark:bg-[#14192b] border ${
          statusTab === 'IN_PROGRESS' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-indigo-100/80 dark:border-[#252a4e]'
        } p-5 rounded-2xl shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-blue-500/50 transition-all cursor-pointer`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100/70 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <MessageSquare size={18} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">En proceso</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{inProgressCount}</div>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Con respuesta de líder</p>
          </div>
        </div>
      </button>

      {/* CARD 3: RESUELTOS */}
      <button 
        type="button"
        onClick={() => setStatusTab?.('RESOLVED')}
        className={`text-left w-full bg-[#f8faff] dark:bg-[#14192b] border ${
          statusTab === 'RESOLVED' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-indigo-100/80 dark:border-[#252a4e]'
        } p-5 rounded-2xl shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-emerald-500/50 transition-all cursor-pointer`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Check size={18} strokeWidth={3} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Resueltos</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{resolvedCount}</div>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Cerrados</p>
          </div>
        </div>
      </button>
    </div>
  </div>
);

// ── VISTA ADMINISTRADOR: CENTRO DE ACTIVIDAD ──
const AdminAlertsHeader = ({
  timeRange,
  setTimeRange,
  searchTerm,
  setSearchTerm,
  setShowCreateModal,
  statusTab,
  setStatusTab
}) => (
  <div className="space-y-6">
    {/* BREADCRUMB & TOP HEADER */}
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <span>Centro de Actividad</span>
          <span>&gt;</span>
          <span className="text-slate-600 dark:text-slate-300 font-bold">Feedback y revisiones</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30 shrink-0">
            <MessageSquare size={20} />
          </div>
          <span>Centro de Actividad</span>
        </h1>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Revisa el estado de los feedback recibidos de los líderes, gestiona su atención y mantén el seguimiento desde aquí.
        </p>
      </div>

      {/* TOP RIGHT CONTROLS */}
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap justify-end">
        <div className="flex items-center gap-2 bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#252a4e] px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs shrink-0">
          <Calendar size={15} className="text-slate-400" />
          <select
            value={timeRange || '30'}
            onChange={e => setTimeRange?.(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
          >
            <option value="30" className="bg-white dark:bg-slate-900">Últimos 30 días</option>
            <option value="7" className="bg-white dark:bg-slate-900">Últimos 7 días</option>
            <option value="90" className="bg-white dark:bg-slate-900">Últimos 90 días</option>
          </select>
        </div>

        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm || ''}
            onChange={e => setSearchTerm?.(e.target.value)}
            placeholder="Buscar por título, proyecto o usuario..."
            className="w-full bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#252a4e] pl-9 pr-3 py-2 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium outline-none focus:border-indigo-500 transition-colors shadow-xs"
          />
        </div>
        
        <button
          type="button"
          onClick={() => setShowCreateModal?.(true)}
          className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer active:scale-95 bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          <Plus size={15} />
          <span>Nuevo feedback</span>
        </button>
      </div>
    </div>

    {/* SUBHEADER FILTER PILLS ROW */}
    <div className="flex items-center gap-2.5 pt-1 overflow-x-auto pb-1">
      <button
        type="button"
        onClick={() => setStatusTab?.('ALL')}
        className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
          statusTab === 'ALL'
            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
            : 'bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#252a4e] text-slate-700 dark:text-slate-300 hover:bg-slate-50'
        }`}
      >
        Todos
      </button>
      <button
        type="button"
        onClick={() => setStatusTab?.('PENDING')}
        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
          statusTab === 'PENDING'
            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
            : 'bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#252a4e] text-slate-700 dark:text-slate-300 hover:bg-slate-50'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        <span>Pendientes</span>
      </button>
      <button
        type="button"
        onClick={() => setStatusTab?.('IN_PROGRESS')}
        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
          statusTab === 'IN_PROGRESS'
            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
            : 'bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#252a4e] text-slate-700 dark:text-slate-300 hover:bg-slate-50'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        <span>En conversación</span>
      </button>
      <button
        type="button"
        onClick={() => setStatusTab?.('RESOLVED')}
        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
          statusTab === 'RESOLVED'
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
            : 'bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#252a4e] text-slate-700 dark:text-slate-300 hover:bg-slate-50'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>Resueltos</span>
      </button>
    </div>

    {/* 4 SUMMARY METRIC CARDS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: TOTAL DE FEEDBACK */}
      <button 
        type="button"
        onClick={() => setStatusTab?.('ALL')}
        className="text-left w-full bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-5 rounded-2xl shadow-xs flex items-center gap-4 cursor-pointer hover:border-indigo-500/50 transition-all"
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-100/70 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Send size={18} className="rotate-45" />
        </div>
        <div>
          <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">Total de feedback</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">18</div>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">Recibidos de líderes</p>
        </div>
      </button>

      {/* CARD 2: PENDIENTES */}
      <button 
        type="button"
        onClick={() => setStatusTab?.('PENDING')}
        className="text-left w-full bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-5 rounded-2xl shadow-xs flex items-center gap-4 cursor-pointer hover:border-amber-500/50 transition-all"
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-100/70 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Clock size={18} />
        </div>
        <div>
          <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">Pendientes</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">7</div>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">Requieren atención</p>
        </div>
      </button>

      {/* CARD 3: EN CONVERSACIÓN */}
      <button 
        type="button"
        onClick={() => setStatusTab?.('IN_PROGRESS')}
        className="text-left w-full bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-5 rounded-2xl shadow-xs flex items-center gap-4 cursor-pointer hover:border-blue-500/50 transition-all"
      >
        <div className="w-12 h-12 rounded-2xl bg-blue-100/70 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <MessageSquare size={18} />
        </div>
        <div>
          <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">En conversación</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">5</div>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">Con comentarios</p>
        </div>
      </button>

      {/* CARD 4: RESUELTOS */}
      <button 
        type="button"
        onClick={() => setStatusTab?.('RESOLVED')}
        className="text-left w-full bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] p-5 rounded-2xl shadow-xs flex items-center gap-4 cursor-pointer hover:border-emerald-500/50 transition-all"
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Resueltos</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">6</div>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">Cerrados</p>
        </div>
      </button>
    </div>
  </div>
);

// ── VISTA LÍDER TÉCNICO: CENTRO DE ACTIVIDAD ──
const LeaderAlertsHeader = ({
  timeRange,
  setTimeRange,
  setShowCreateModal,
  statusTab,
  setStatusTab,
  pendingCount,
  inProgressCount,
  resolvedCount
}) => (
  <div className="space-y-6">
    {/* TOP HEADER ROW: TITLE + CONTROLS */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30 shrink-0 shadow-xs">
          <MessageSquare size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Centro de Actividad
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Revisa los feedback que has recibido de tu equipo y mantén la comunicación con el administrador.
          </p>
        </div>
      </div>

      {/* TOP CONTROLS */}
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap justify-end">
        <div className="flex items-center gap-2 bg-[#f8faff] dark:bg-[#14192b] border border-indigo-100/80 dark:border-[#252a4e] px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs shrink-0">
          <Calendar size={15} className="text-slate-400" />
          <select
            value={timeRange || '30'}
            onChange={e => setTimeRange?.(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
          >
            <option value="30" className="bg-white dark:bg-slate-900">Últimos 30 días</option>
            <option value="7" className="bg-white dark:bg-slate-900">Últimos 7 días</option>
            <option value="90" className="bg-white dark:bg-slate-900">Últimos 90 días</option>
          </select>
        </div>

        <LastSyncBadge />

        <button
          type="button"
          onClick={() => setShowCreateModal?.(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Nuevo Feedback</span>
        </button>
      </div>
    </div>

    {/* 4 SUMMARY METRIC CARDS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: RECIBIDOS (DEV) */}
      <button 
        type="button"
        onClick={() => setStatusTab?.('RECEIVED_DEV')}
        className={`text-left w-full bg-[#f8faff] dark:bg-[#14192b] border ${
          statusTab === 'RECEIVED_DEV' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-indigo-100/80 dark:border-[#252a4e]'
        } p-5 rounded-2xl shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-purple-500/50 transition-all cursor-pointer`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100/70 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Send size={18} className="rotate-45" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">Recibidos (Dev)</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{pendingCount + inProgressCount}</div>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Feedback de desarrolladores</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-purple-500 transition-colors" />
      </button>

      {/* CARD 2: ENVIADOS (ADMIN) */}
      <button 
        type="button"
        onClick={() => setStatusTab?.('SENT_ADMIN')}
        className={`text-left w-full bg-[#f8faff] dark:bg-[#14192b] border ${
          statusTab === 'SENT_ADMIN' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-indigo-100/80 dark:border-[#252a4e]'
        } p-5 rounded-2xl shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-blue-500/50 transition-all cursor-pointer`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100/70 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Send size={18} className="rotate-45" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">Enviados (Admin)</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">3</div>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Feedback al administrador</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
      </button>

      {/* CARD 3: EN CONVERSACIÓN */}
      <button 
        type="button"
        onClick={() => setStatusTab?.('IN_PROGRESS')}
        className={`text-left w-full bg-[#f8faff] dark:bg-[#14192b] border ${
          statusTab === 'IN_PROGRESS' ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-indigo-100/80 dark:border-[#252a4e]'
        } p-5 rounded-2xl shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-yellow-500/50 transition-all cursor-pointer`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MessageSquare size={18} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">En conversación</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{inProgressCount || 5}</div>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Con respuesta pendiente</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
      </button>

      {/* CARD 4: RESUELTOS */}
      <button 
        type="button"
        onClick={() => setStatusTab?.('RESOLVED')}
        className={`text-left w-full bg-[#f8faff] dark:bg-[#14192b] border ${
          statusTab === 'RESOLVED' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-indigo-100/80 dark:border-[#252a4e]'
        } p-5 rounded-2xl shadow-xs relative overflow-hidden flex items-center justify-between group hover:border-emerald-500/50 transition-all cursor-pointer`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Check size={18} strokeWidth={3} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Resueltos</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{resolvedCount || 6}</div>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Cerrados</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
      </button>
    </div>
  </div>
);

// ── COMPONENTE PRINCIPAL CON COMPLEJIDAD COGNITIVA MINIMIZADA ──
export const AlertsCenterHeader = ({ 
  setShowCreateModal, 
  pendingCount = 3, 
  resolvedCount = 12, 
  inProgressCount = 2,
  statusTab = 'ALL',
  setStatusTab,
  searchTerm,
  setSearchTerm,
  sidebarProject = 'ALL',
  setSidebarProject,
  timeRange = '30',
  setTimeRange,
  sidebarPriority,
  setSidebarPriority,
  projectsList = [],
  isDev: isDevProp,
  isAdmin: isAdminProp,
  isLeader: isLeaderProp
}) => {
  const effectiveTimeRange = sidebarPriority !== undefined ? sidebarPriority : timeRange;
  const effectiveSetTimeRange = setSidebarPriority || setTimeRange;
  const { user } = useAuth();
  const roleRaw = (user?.rol || user?.role || '').toUpperCase();
  const isAdminCalculated = roleRaw.includes('ADMIN');
  const isLeaderCalculated = roleRaw.includes('MANAG') || roleRaw.includes('LIDER') || roleRaw.includes('LEAD');
  
  const isDev = isDevProp !== undefined ? isDevProp : (!isAdminCalculated && !isLeaderCalculated);
  const isAdmin = isAdminProp !== undefined ? isAdminProp : isAdminCalculated;

  if (isDev) {
    return (
      <DevAlertsHeader
        setShowCreateModal={setShowCreateModal}
        pendingCount={pendingCount}
        resolvedCount={resolvedCount}
        inProgressCount={inProgressCount}
        statusTab={statusTab}
        setStatusTab={setStatusTab}
        sidebarProject={sidebarProject}
        setSidebarProject={setSidebarProject}
        projectsList={projectsList}
      />
    );
  }

  if (isAdmin) {
    return (
      <AdminAlertsHeader
        timeRange={effectiveTimeRange}
        setTimeRange={effectiveSetTimeRange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setShowCreateModal={setShowCreateModal}
        statusTab={statusTab}
        setStatusTab={setStatusTab}
      />
    );
  }

  return (
    <LeaderAlertsHeader
      timeRange={effectiveTimeRange}
      setTimeRange={effectiveSetTimeRange}
      setShowCreateModal={setShowCreateModal}
      statusTab={statusTab}
      setStatusTab={setStatusTab}
      pendingCount={pendingCount}
      inProgressCount={inProgressCount}
      resolvedCount={resolvedCount}
    />
  );
};
