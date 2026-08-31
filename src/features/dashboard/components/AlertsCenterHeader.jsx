import React from 'react';
import { Plus, FileDown, MessageSquare, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { MetricInfoTooltip } from './MetricInfoTooltip';

export const AlertsCenterHeader = ({ 
  setShowCreateModal, handleExportCSV, pendingCount, resolvedCount, inProgressCount 
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Feedback & Revisiones</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Seguimiento de feedback, revisiones y acciones de mejora del equipo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>Nuevo Feedback</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#1a1e3b] hover:bg-slate-200 dark:hover:bg-[#252a4e] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-[#33376b] text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <FileDown size={16} />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Feedback Pendiente</span>
              <MetricInfoTooltip text="Items de feedback recibidos pendientes por revisar o asignar." />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{pendingCount}</p>
            <p className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-400 mt-1">
              +2 desde la semana pasada
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
            <MessageSquare size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Feedback Resuelto</span>
              <MetricInfoTooltip text="Acciones de mejora atendidas e implementadas." />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{resolvedCount}</p>
            <p className="text-[11px] font-semibold text-emerald-500 dark:text-emerald-400 mt-1">
              +5 desde la semana pasada
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones en Proceso</span>
              <MetricInfoTooltip text="Planes de mejora técnica actualmente en ejecución." />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{inProgressCount || 5}</p>
            <p className="text-[11px] font-semibold text-amber-500 dark:text-amber-400 mt-1">
              En seguimiento
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mejora del Equipo</span>
              <MetricInfoTooltip text="Porcentaje de feedback convertido en refactorizaciones de valor." />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">50%</p>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              Basado en feedback aplicado
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center border border-teal-500/30 shrink-0">
            <Users size={20} />
          </div>
        </div>
      </div>
    </>
  );
};
