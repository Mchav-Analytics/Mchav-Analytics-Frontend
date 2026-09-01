import React from 'react';
import { Trophy, Sliders, BookOpen, Users } from 'lucide-react';

export default function TeamMatrixHeader({
  selectedProjectId,
  onSelectProject,
  allProjects = [],
  onOpenSettings,
  onOpenGuide
}) {
  return (
    <div className="w-full rounded-3xl bg-white dark:bg-[#141738] p-5 sm:p-6 shadow-sm dark:shadow-2xl border border-slate-200 dark:border-[#272b5c] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      
      {/* Lado Izquierdo: Ícono en Gradiente + Insignia + Título */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold shadow-md shrink-0">
          <Trophy size={24} />
        </div>
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5 text-[13px] mb-2 font-medium">
            <span className="text-blue-600 dark:text-blue-400">Matriz de Rendimiento</span>
            <span className="text-slate-400 dark:text-slate-500 mx-0.5">&gt;</span>
            <span className="text-slate-900 dark:text-white font-bold">Cuadrantes</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
              Supervisión Ejecutiva
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Matriz de Rendimiento
          </h1>
        </div>
      </div>

      {/* Lado Derecho: Selector de Equipo + Acciones de Configuración + Bell Popup */}
      <div className="flex items-center gap-2.5 flex-wrap shrink-0">
        
        {/* SELECTOR DE EQUIPO (PROYECTO JIRA) */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700/80 shrink-0">
          <Users className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">Equipo:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => onSelectProject && onSelectProject(e.target.value)}
            className="bg-transparent text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[220px] truncate"
          >
            <option value="PROJ-01">Proyecto PROJ-01 (MCHAV Core)</option>
            {allProjects.map((p) => (
              <option key={p.id || p.id_proyecto} value={p.id || p.id_proyecto}>
                {p.name || p.nombre || p.id_proyecto}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onOpenGuide}
          className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700/60"
          title="Ver especificación exacta de métricas y fórmulas"
        >
          <BookOpen size={15} />
          <span className="hidden sm:inline">Metodología</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          title="Ajustar umbral de calidad y ponderaciones del score"
        >
          <Sliders size={15} />
          <span>Configurar Umbrales</span>
        </button>
      </div>

    </div>
  );
}
