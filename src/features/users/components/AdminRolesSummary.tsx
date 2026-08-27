import React from 'react';
import { ShieldCheck, Users, Code2, CheckCircle2 } from 'lucide-react';
import { ManagementUser } from '../hooks/useAdminUsers';

interface AdminRolesSummaryProps {
  adminUsers: ManagementUser[];
  managerUsers: ManagementUser[];
  developerUsers: ManagementUser[];
  roleFilter: string;
  setRoleFilter: (role: string) => void;
}

export default function AdminRolesSummary({
  adminUsers,
  managerUsers,
  developerUsers,
  roleFilter,
  setRoleFilter
}: AdminRolesSummaryProps) {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-4">
      <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-purple-400/20 dark:bg-purple-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-indigo-400/15 dark:bg-indigo-500/10 blur-3xl" />

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 px-1 sm:px-2 pt-1">
        {/* TARJETA 1: ADMINISTRADOR */}
        <div
          onClick={() => setRoleFilter(roleFilter === 'ADMIN' ? 'ALL' : 'ADMIN')}
          className={`group bg-white dark:bg-[#191c3d] backdrop-blur-xl border rounded-2xl p-5 sm:px-6 sm:py-5 shadow-sm dark:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 hover:scale-[1.02] cursor-pointer flex items-center justify-between ${
            roleFilter === 'ADMIN'
              ? 'border-purple-500 ring-2 ring-purple-500/40 bg-purple-50/50 dark:bg-purple-950/20 shadow-lg shadow-purple-500/20'
              : 'border-purple-200 dark:border-[#33376b] hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-purple-500/15'
          }`}
        >
          <div className="flex items-center gap-4 min-w-0">
            {/* Caja de Icono 20x20 */}
            <div className="w-20 h-20 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-inner ring-1 ring-purple-500/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <ShieldCheck size={36} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">Administrador</h3>
                {roleFilter === 'ADMIN' && <CheckCircle2 size={16} className="text-purple-600 dark:text-purple-400" />}
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300/80 font-semibold">Control Total & Gobernanza</p>

              {/* Stack de Avatares */}
              <div className="flex items-center gap-1 pt-1">
                {adminUsers.map(u => (
                  <div key={u.id} title={u.name} className="w-5 h-5 rounded-full bg-purple-600 border border-white dark:border-slate-900 text-[9px] font-black text-white flex items-center justify-center shadow-md">
                    {u.name[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TARJETA 2: PLANIFICADOR */}
        <div
          onClick={() => setRoleFilter(roleFilter === 'MANAGER' ? 'ALL' : 'MANAGER')}
          className={`group bg-white dark:bg-[#191c3d] backdrop-blur-xl border rounded-2xl p-5 sm:px-6 sm:py-5 shadow-sm dark:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 hover:scale-[1.02] cursor-pointer flex items-center justify-between ${
            roleFilter === 'MANAGER'
              ? 'border-blue-500 ring-2 ring-blue-500/40 bg-blue-50/50 dark:bg-blue-950/20 shadow-lg shadow-blue-500/20'
              : 'border-blue-200 dark:border-[#33376b] hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-blue-500/15'
          }`}
        >
          <div className="flex items-center gap-4 min-w-0">
            {/* Caja de Icono 20x20 */}
            <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-inner ring-1 ring-blue-500/20 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
              <Users size={36} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">Planificador</h3>
                {roleFilter === 'MANAGER' && <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400" />}
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300/80 font-semibold">Gestión de Sprint & Equipo</p>

              {/* Stack de Avatares */}
              <div className="flex items-center gap-1 pt-1">
                {managerUsers.map(u => (
                  <div key={u.id} title={u.name} className="w-5 h-5 rounded-full bg-blue-600 border border-white dark:border-slate-900 text-[9px] font-black text-white flex items-center justify-center shadow-md">
                    {u.name[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TARJETA 3: DESARROLLADOR */}
        <div
          onClick={() => setRoleFilter(roleFilter === 'DEVELOPER' ? 'ALL' : 'DEVELOPER')}
          className={`group bg-white dark:bg-[#191c3d] backdrop-blur-xl border rounded-2xl p-5 sm:px-6 sm:py-5 shadow-sm dark:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 hover:scale-[1.02] cursor-pointer flex items-center justify-between ${
            roleFilter === 'DEVELOPER'
              ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-lg shadow-emerald-500/20'
              : 'border-emerald-200 dark:border-[#33376b] hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-900/70 hover:shadow-xl hover:shadow-emerald-500/15'
          }`}
        >
          <div className="flex items-center gap-4 min-w-0">
            {/* Caja de Icono 20x20 */}
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner ring-1 ring-emerald-500/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <Code2 size={36} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">Desarrollador</h3>
                {roleFilter === 'DEVELOPER' && <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />}
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300/80 font-semibold">Ejecución & Tablero JQL</p>

              {/* Stack de Avatares */}
              <div className="flex items-center gap-1 pt-1">
                {developerUsers.map(u => (
                  <div key={u.id} title={u.name} className="w-5 h-5 rounded-full bg-emerald-600 border border-white dark:border-slate-900 text-[9px] font-black text-white flex items-center justify-center shadow-md">
                    {u.name[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
