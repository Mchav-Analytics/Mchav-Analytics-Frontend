import React from 'react';
import { InfoTooltip } from './Tooltips';

export const ProjectsAssignedTeam = ({ assignedTeam }) => {
  return (
    <>
      <div className="bg-white dark:bg-[#14192b] border border-slate-200 dark:border-[#242b45] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              
              {/* Header Seccion */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Equipo Asignado al Proyecto
                  </h3>
                  <InfoTooltip text="Lista de miembros asignados activamente a las tareas del proyecto y su carga de trabajo actual." />
                </div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                  {assignedTeam.length} miembros asignados
                </p>
              </div>
      
              {/* Tabla / Contenedor Estilizado */}
              <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 dark:bg-[#1a2138]/50 border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-32">Rol</th>
                      <th className="py-2.5 px-4">Usuario</th>
                      <th className="py-2.5 px-4 text-right">Carga Actual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {assignedTeam.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        {/* Rol Badge */}
                        <td className="py-3 px-4">
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
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-2xs" style={{ backgroundColor: member.color }}>
                              {member.initial}
                            </div>
                            <span className="font-extrabold text-slate-900 dark:text-white">
                              {member.name}
                            </span>
                          </div>
                        </td>
      
                        {/* Carga Actual */}
                        <td className="py-3 px-4 text-right font-medium text-slate-500 dark:text-slate-400">
                          {member.tasks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
      
            </div>
    </>
  );
};
