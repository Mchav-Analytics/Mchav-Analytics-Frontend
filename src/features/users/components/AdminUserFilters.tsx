import React from 'react';
import { Search, X } from 'lucide-react';

interface AdminUserFiltersProps {
  usersCount: number;
  pendingRequestsCount: number;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function AdminUserFilters({
  usersCount,
  pendingRequestsCount,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  searchTerm,
  setSearchTerm
}: AdminUserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] p-3 px-4 rounded-xl shadow-sm dark:shadow-lg backdrop-blur-md">
      {/* Botones de Filtro Todos / Inactivos */}
      <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
        <button
          onClick={() => { setRoleFilter('ALL'); setStatusFilter('ALL'); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            roleFilter === 'ALL' && statusFilter === 'ALL'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Todos ({usersCount})
        </button>
        <button
          onClick={() => setStatusFilter(statusFilter === 'INACTIVE' ? 'ALL' : 'INACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'INACTIVE'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-amber-50 dark:bg-slate-950/80 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-900/40'
          }`}
        >
          Inactivos ({pendingRequestsCount})
        </button>
      </div>

      {/* Buscador de Nombre o Correo */}
      <label className="relative flex items-center w-full sm:w-[320px] shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/80 shadow-inner focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        <span className="flex items-center justify-center w-10 shrink-0 text-indigo-500 dark:text-indigo-400 pointer-events-none">
          <Search size={15} />
        </span>
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full min-h-[38px] bg-transparent border-0 py-2 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="pr-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </label>
    </div>
  );
}
