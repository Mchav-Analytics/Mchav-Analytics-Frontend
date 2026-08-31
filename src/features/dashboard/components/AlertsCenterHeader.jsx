import React from 'react';
import { Plus, FileDown, MessageSquare, Clock, CheckCircle2, TrendingUp, Calendar, Folder, Filter, Check } from 'lucide-react';

export const AlertsCenterHeader = ({ 
  setShowCreateModal, handleExportCSV, pendingCount = 3, resolvedCount = 12, inProgressCount = 2 
}) => {
  return (
    <div className="space-y-6">
      {/* ── TOP HEADER ROW ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30 shrink-0 shadow-xs">
            <MessageSquare size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Feedback & Revisiones
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Gestiona observaciones, acciones y mejoras del equipo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              Última sincronización <strong className="font-extrabold text-slate-900 dark:text-white">Hoy, 8:30 a. m.</strong>
            </span>
            <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0">
              <Check size={10} strokeWidth={3} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Nuevo Feedback</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#13162b] hover:bg-slate-50 dark:hover:bg-[#1a1e3b] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#252a4e] text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <FileDown size={16} />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* ── FILTER DROPDOWNS BAR ── */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-2 bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer hover:border-indigo-500/40 transition-colors shrink-0">
          <Calendar size={15} className="text-slate-400" />
          <span>Últimos 30 días</span>
          <span className="text-[10px] text-slate-400 ml-1">▼</span>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer hover:border-indigo-500/40 transition-colors shrink-0">
          <Folder size={15} className="text-slate-400" />
          <span>Todos los proyectos</span>
          <span className="text-[10px] text-slate-400 ml-1">▼</span>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer hover:border-indigo-500/40 transition-colors shrink-0">
          <Filter size={15} className="text-slate-400" />
          <span>Más filtros</span>
          <span className="text-[10px] text-slate-400 ml-1">▼</span>
        </div>
      </div>

      {/* ── 4 SUMMARY METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: PENDIENTES */}
        <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-indigo-500/50 transition-all">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30 shrink-0">
              <MessageSquare size={20} />
            </div>
          </div>
          
          <div className="mt-3">
            <span className="text-[11px] font-black text-slate-400 dark:text-slate-400 tracking-wider uppercase">
              PENDIENTES
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {pendingCount}
              </span>
            </div>
            <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
              <span>↓ 1 vs. período anterior</span>
            </p>
          </div>

          {/* Sparkline Decorativo */}
          <div className="absolute right-4 bottom-4 flex items-end gap-1 h-8 opacity-70 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-3 bg-indigo-200 dark:bg-indigo-900/60 rounded-t-sm"></div>
            <div className="w-1.5 h-5 bg-indigo-300 dark:bg-indigo-700/70 rounded-t-sm"></div>
            <div className="w-1.5 h-4 bg-indigo-400 dark:bg-indigo-600/80 rounded-t-sm"></div>
            <div className="w-1.5 h-7 bg-indigo-600 dark:bg-indigo-400 rounded-t-sm"></div>
          </div>
        </div>

        {/* CARD 2: EN PROCESO */}
        <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/50 transition-all">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-500/30 shrink-0">
              <Clock size={20} />
            </div>
          </div>
          
          <div className="mt-3">
            <span className="text-[11px] font-black text-slate-400 dark:text-slate-400 tracking-wider uppercase">
              EN PROCESO
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {inProgressCount}
              </span>
            </div>
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
              <span>— vs. período anterior</span>
            </p>
          </div>

          {/* Sparkline Decorativo */}
          <div className="absolute right-4 bottom-4 flex items-end gap-1 h-8 opacity-70 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-4 bg-amber-200 dark:bg-amber-900/60 rounded-t-sm"></div>
            <div className="w-1.5 h-6 bg-amber-300 dark:bg-amber-700/70 rounded-t-sm"></div>
            <div className="w-1.5 h-5 bg-amber-400 dark:bg-amber-600/80 rounded-t-sm"></div>
            <div className="w-1.5 h-7 bg-amber-500 dark:bg-amber-400 rounded-t-sm"></div>
          </div>
        </div>

        {/* CARD 3: RESUELTOS */}
        <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30 shrink-0">
              <CheckCircle2 size={20} />
            </div>
          </div>
          
          <div className="mt-3">
            <span className="text-[11px] font-black text-slate-400 dark:text-slate-400 tracking-wider uppercase">
              RESUELTOS
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {resolvedCount}
              </span>
            </div>
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <span>↑ 4 vs. período anterior</span>
            </p>
          </div>

          {/* Sparkline Decorativo */}
          <div className="absolute right-4 bottom-4 flex items-end gap-1 h-8 opacity-70 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-3 bg-emerald-200 dark:bg-emerald-900/60 rounded-t-sm"></div>
            <div className="w-1.5 h-4 bg-emerald-300 dark:bg-emerald-700/70 rounded-t-sm"></div>
            <div className="w-1.5 h-6 bg-emerald-400 dark:bg-emerald-600/80 rounded-t-sm"></div>
            <div className="w-1.5 h-8 bg-emerald-500 dark:bg-emerald-400 rounded-t-sm"></div>
          </div>
        </div>

        {/* CARD 4: PROGRESO DE MEJORA */}
        <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30 shrink-0">
              <TrendingUp size={20} />
            </div>
          </div>
          
          <div className="mt-3">
            <span className="text-[11px] font-black text-slate-400 dark:text-slate-400 tracking-wider uppercase">
              PROGRESO DE MEJORA
            </span>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                68%
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 text-[11px] font-extrabold">
                ↑ 12%
              </span>
            </div>

            {/* Barra de progreso */}
            <div className="w-full bg-slate-100 dark:bg-[#1a1e3b] h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-[68%] transition-all duration-500"></div>
            </div>

            <p className="text-[10px] font-medium text-slate-400 mt-2">
              Basado en acciones completadas este período.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
