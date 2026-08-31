import React from 'react';
import { Code, FileText, Layers, Layout, ShieldCheck } from 'lucide-react';

export const AlertsCenterFilters = ({
  sidebarProject, setSidebarProject, sidebarCategory, setSidebarCategory,
  sidebarPriority, setSidebarPriority, sidebarStatus, setSidebarStatus,
  categoryCounts
}) => {
  return (
    <div className="lg:col-span-4 space-y-6">
      <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Filtros</h3>

        <div className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Proyecto</label>
            <select
              value={sidebarProject}
              onChange={e => setSidebarProject(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
            >
              <option value="ALL">Todos los proyectos</option>
              <option value="Sistema Analytics MCHAV">Sistema Analytics MCHAV</option>
              <option value="Portal de Clientes & Seguridad">Portal de Clientes & Seguridad</option>
              <option value="API Gateway ETL">API Gateway ETL</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tipo de Feedback</label>
            <select
              value={sidebarCategory}
              onChange={e => setSidebarCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
            >
              <option value="ALL">Todos los tipos</option>
              <option value="Código">Código / Backend</option>
              <option value="Documentación">Documentación</option>
              <option value="Procesos">Procesos / ETL</option>
              <option value="UI/UX">UI/UX / Frontend</option>
              <option value="Arquitectura">Arquitectura</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Prioridad</label>
            <select
              value={sidebarPriority}
              onChange={e => setSidebarPriority(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
            >
              <option value="ALL">Todas las prioridades</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Media</option>
              <option value="BAJA">Baja</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estado</label>
            <select
              value={sidebarStatus}
              onChange={e => setSidebarStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1a1e3b] border border-slate-200 dark:border-[#2b305b] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
            >
              <option value="ALL">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="RESUELTO">Resueltos</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#13162b] border border-slate-200 dark:border-[#252a4e] p-5 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Tipos de Feedback</h3>

        <div className="space-y-2">
          <div
            onClick={() => setSidebarCategory(sidebarCategory === 'Código' ? 'ALL' : 'Código')}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${sidebarCategory === 'Código' ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-50 dark:bg-[#1a1e3b] border-slate-200 dark:border-[#2b305b] hover:border-indigo-500/40'
              }`}
          >
            <div className="flex items-center gap-3">
              <Code size={16} className="text-indigo-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Código</span>
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-[#252a4e] px-2 py-0.5 rounded-md">
              {categoryCounts['Código']}
            </span>
          </div>

          <div
            onClick={() => setSidebarCategory(sidebarCategory === 'Documentación' ? 'ALL' : 'Documentación')}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${sidebarCategory === 'Documentación' ? 'bg-purple-600/20 border-purple-500' : 'bg-slate-50 dark:bg-[#1a1e3b] border-slate-200 dark:border-[#2b305b] hover:border-purple-500/40'
              }`}
          >
            <div className="flex items-center gap-3">
              <FileText size={16} className="text-purple-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Documentación</span>
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-[#252a4e] px-2 py-0.5 rounded-md">
              {categoryCounts['Documentación']}
            </span>
          </div>

          <div
            onClick={() => setSidebarCategory(sidebarCategory === 'Procesos' ? 'ALL' : 'Procesos')}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${sidebarCategory === 'Procesos' ? 'bg-amber-600/20 border-amber-500' : 'bg-slate-50 dark:bg-[#1a1e3b] border-slate-200 dark:border-[#2b305b] hover:border-amber-500/40'
              }`}
          >
            <div className="flex items-center gap-3">
              <Layers size={16} className="text-amber-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Procesos</span>
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-[#252a4e] px-2 py-0.5 rounded-md">
              {categoryCounts['Procesos']}
            </span>
          </div>

          <div
            onClick={() => setSidebarCategory(sidebarCategory === 'UI/UX' ? 'ALL' : 'UI/UX')}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${sidebarCategory === 'UI/UX' ? 'bg-teal-600/20 border-teal-500' : 'bg-slate-50 dark:bg-[#1a1e3b] border-slate-200 dark:border-[#2b305b] hover:border-teal-500/40'
              }`}
          >
            <div className="flex items-center gap-3">
              <Layout size={16} className="text-teal-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">UI/UX</span>
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-[#252a4e] px-2 py-0.5 rounded-md">
              {categoryCounts['UI/UX']}
            </span>
          </div>

          <div
            onClick={() => setSidebarCategory(sidebarCategory === 'Arquitectura' ? 'ALL' : 'Arquitectura')}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${sidebarCategory === 'Arquitectura' ? 'bg-sky-600/20 border-sky-500' : 'bg-slate-50 dark:bg-[#1a1e3b] border-slate-200 dark:border-[#2b305b] hover:border-sky-500/40'
              }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-sky-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Arquitectura</span>
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-[#252a4e] px-2 py-0.5 rounded-md">
              {categoryCounts['Arquitectura']}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
