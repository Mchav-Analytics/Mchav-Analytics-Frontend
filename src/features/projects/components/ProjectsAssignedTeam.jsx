import React from 'react';
import { InfoTooltip } from './Tooltips';

export const ProjectsAssignedTeam = ({ assignedTeam }) => {
  return (
    <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
      
      {/* Header Sección */}
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Equipo Asignado al Proyecto
          </h3>
          <InfoTooltip text="Lista de miembros asignados activamente a las tareas del proyecto y su carga de trabajo actual." />
        </div>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
          {assignedTeam.length} miembros asignados
        </p>
      </div>

      {/* Tabla Estilizada */}
      <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-[#1a2138]/50 border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-3 w-28">
                <span className="flex items-center">
                  Rol
                  <InfoTooltip text="Función principal del miembro en el proyecto." align="left" />
                </span>
              </th>
              <th className="py-2.5 px-3">
                <span className="flex items-center">
                  Usuario
                  <InfoTooltip text="Nombre del desarrollador o líder técnico asignado." align="left" />
                </span>
              </th>
              <th className="py-2.5 px-3">
                <span className="flex items-center">
                  Estado Usuario
                  <InfoTooltip text="Disponibilidad o estado activo del desarrollador." />
                </span>
              </th>
              <th className="py-2.5 px-3 text-right">
                <span className="flex items-center justify-end">
                  Carga Actual
                  <InfoTooltip text="Tareas pendientes y Story Points asignados actualmente." align="right" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {assignedTeam.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                {/* Rol Badge */}
                <td className="py-2 px-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1.5 ${
                    member.role === 'LÍDER'
                      ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                      : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${member.role === 'LÍDER' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                    {member.role}
                  </span>
                </td>

                {/* Usuario */}
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-2xs" style={{ backgroundColor: member.color }}>
                      {member.initial}
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {member.name}
                    </span>
                  </div>
                </td>

                {/* Estado Usuario */}
                <td className="py-2 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                    member.userStatus === 'Activo'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border border-slate-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${member.userStatus === 'Activo' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {member.userStatus}
                  </span>
                </td>

                {/* Carga Actual */}
                <td className="py-2 px-3 text-right font-medium text-slate-500 dark:text-slate-400">
                  {member.tasks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
