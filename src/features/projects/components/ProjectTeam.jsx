import React from 'react';
import { ShieldCheck, Users, Info } from 'lucide-react';
import { MetricInfoTooltip } from '../../dashboard/components/LiderVelocityChart';

export const ProjectTeam = ({ activeProject }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
      
      {/* Equipo de Liderazgo */}
      <div className="lg:col-span-4 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 p-5 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck size={100} />
        </div>
        
        <div className="relative z-10">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 mb-2 block">Líder Técnico</span>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-500/30">
              {activeProject.lider_avatar || (activeProject.lider || '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100">{activeProject.lider || 'Sin Asignar'}</p>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">System Lead</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desarrolladores Asignados */}
      <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users size={16} className="text-sky-500" />
            Escuadrón de Desarrollo
          </h4>
          <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-1 rounded-lg">
            {activeProject.desarrolladores?.length || 0} Miembros Activos
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {activeProject.desarrolladores?.map(dev => (
            <div key={dev.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {dev.avatar || dev.name[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{dev.name}</p>
                <p className="text-[9px] text-slate-400 font-medium truncate">Frontend / Backend</p>
              </div>
            </div>
          ))}
          
          {(!activeProject.desarrolladores || activeProject.desarrolladores.length === 0) && (
            <p className="text-xs font-medium text-slate-400 italic">No hay desarrolladores asignados aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};
