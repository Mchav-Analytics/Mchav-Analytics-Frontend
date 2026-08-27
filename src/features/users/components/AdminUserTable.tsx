import React from 'react';
import { PowerOff, CheckCircle2, Clock, Activity } from 'lucide-react';
import { ManagementUser } from '../hooks/useAdminUsers';

interface AdminUserTableProps {
  paginatedUsers: ManagementUser[];
  filteredUsers: ManagementUser[];
  expandedUserId: string | null;
  setExpandedUserId: (id: string | null) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  itemsPerPage: number;
  handleRoleChange: (userId: string, role: 'ADMIN' | 'MANAGER' | 'DEVELOPER') => void;
  toggleUserStatus: (userId: string) => void;
}

export default function AdminUserTable({
  paginatedUsers,
  filteredUsers,
  expandedUserId,
  setExpandedUserId,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  handleRoleChange,
  toggleUserStatus
}: AdminUserTableProps) {
  return (
    <section className="relative bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-4">
      <div className="flex items-center justify-between gap-3 pb-1">
        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">
          Listado de cuentas
        </h4>
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
          {filteredUsers.length} resultado{filteredUsers.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="hidden xl:grid grid-cols-[minmax(220px,1.4fr)_minmax(160px,1fr)_minmax(180px,1.1fr)_minmax(140px,0.9fr)_110px] gap-4 px-5 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
        <span>Usuario</span>
        <span className="text-center">Rol</span>
        <span className="text-center">Estado</span>
        <span className="text-center">Último acceso</span>
        <span className="text-center">Auditoría</span>
      </div>

      {paginatedUsers.map(u => {
        const isExpanded = expandedUserId === u.id;
        return (
          <div
            key={u.id}
            className={`rounded-2xl border transition-all duration-200 ${isExpanded
              ? 'relative z-[45] border-indigo-300 dark:border-indigo-500/40 bg-indigo-50/50 dark:bg-[#12142e] shadow-md shadow-indigo-100 dark:shadow-none'
              : 'border-slate-200 dark:border-[#33376b] bg-slate-50/70 dark:bg-[#12142e] hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900/50 hover:shadow-sm'
              }`}
          >
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(220px,1.4fr)_minmax(160px,1fr)_minmax(180px,1.1fr)_minmax(140px,0.9fr)_110px] gap-4 xl:gap-5 items-center px-5 py-5">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-xs text-white shrink-0 ring-2 shadow-sm ${u.role === 'ADMIN' ? 'bg-gradient-to-br from-purple-500 to-purple-700 ring-purple-300 dark:ring-purple-500/40' :
                  u.role === 'MANAGER' ? 'bg-gradient-to-br from-blue-500 to-blue-700 ring-blue-300 dark:ring-blue-500/40' :
                    'bg-gradient-to-br from-emerald-500 to-emerald-700 ring-emerald-300 dark:ring-emerald-500/40'
                  }`}>
                  {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 space-y-1">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2 flex-wrap">
                    {u.name}
                    {u.role === 'ADMIN' && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold border border-purple-200 dark:border-purple-500/30">
                        ADMIN
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{u.email}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 xl:items-center">
                <span className="xl:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Rol</span>
                <select
                  value={u.role}
                  onChange={e => handleRoleChange(u.id, e.target.value as 'ADMIN' | 'MANAGER' | 'DEVELOPER')}
                  className={`w-full max-w-[200px] border rounded-xl px-3 py-2.5 text-xs font-bold outline-none cursor-pointer transition-all ${u.role === 'ADMIN'
                    ? 'bg-purple-50 dark:bg-purple-950/90 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700/60'
                    : u.role === 'MANAGER'
                      ? 'bg-blue-50 dark:bg-blue-950/90 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700/60'
                      : 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60'
                    }`}
                >
                  <option value="ADMIN">ADMINISTRADOR</option>
                  <option value="MANAGER">PLANIFICADOR</option>
                  <option value="DEVELOPER">DESARROLLADOR</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 xl:items-center">
                <span className="xl:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Estado</span>
                <div className="flex flex-wrap items-center gap-2 xl:justify-center">
                  <span className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold inline-flex items-center gap-2 ${u.status === 'ACTIVE'
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    {u.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    onClick={() => toggleUserStatus(u.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer inline-flex items-center gap-1.5 ${u.status === 'ACTIVE'
                      ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 hover:bg-rose-100 dark:hover:bg-rose-500/20'
                      : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                      }`}
                  >
                    {u.status === 'ACTIVE' ? <PowerOff size={13} /> : <CheckCircle2 size={13} />}
                    {u.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 xl:items-center text-center">
                <span className="xl:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-left">Último acceso</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 justify-center">
                  <Clock size={13} className="text-indigo-500 dark:text-indigo-400" /> {u.lastActive}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Reg: {u.joinedDate}</span>
              </div>

              <div className="flex flex-col gap-1.5 xl:items-center">
                <span className="xl:hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Auditoría</span>
                <button
                  onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                  className={`w-full xl:w-auto px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${isExpanded
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                >
                  <Activity size={14} />
                  <span>{isExpanded ? 'Ocultar' : 'Ver Log'}</span>
                </button>
              </div>
            </div>            </div>
        );
      })}

      {filteredUsers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
          No hay usuarios con esos filtros.
        </div>
      )}

      {/* Controles de Paginación */}
      {filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Mostrando del {((currentPage - 1) * itemsPerPage) + 1} al {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    currentPage === pg
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {pg}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
