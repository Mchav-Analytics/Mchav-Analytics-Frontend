import React from 'react';
import { Search, X } from 'lucide-react';

export const DevWorkloadFilters = ({
  searchQuery, setSearchQuery, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter,
  sortBy, setSortBy, hasActiveFilters, clearFilters
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2 pt-1">
      <div className="flex flex-1 items-center gap-2 px-3 py-2 bg-white dark:bg-[#141738] rounded-xl border border-slate-200 dark:border-[#272b5c] focus-within:border-indigo-500 transition-colors shadow-xs">
        <Search size={15} className="text-slate-400 shrink-0" />
        <input 
          type="text" 
          placeholder="Buscar por clave (ej. SCRUM-152) o resumen..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className="flex-1 sm:flex-none bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors shadow-xs"
        >
          <option value="TODOS" className="dark:bg-[#141738]">Todos los Estados</option>
          <option value="POR HACER" className="dark:bg-[#141738]">Por Hacer</option>
          <option value="EN CURSO" className="dark:bg-[#141738]">En Curso</option>
          <option value="EN REVISIÓN" className="dark:bg-[#141738]">En Revisión</option>
          <option value="BLOQUEADA" className="dark:bg-[#141738]">Bloqueadas</option>
          <option value="FINALIZADO" className="dark:bg-[#141738]">Finalizados</option>
        </select>

        <select 
          value={priorityFilter} 
          onChange={(e) => setPriorityFilter(e.target.value)} 
          className="flex-1 sm:flex-none bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors shadow-xs"
        >
          <option value="TODAS" className="dark:bg-[#141738]">Todas las Prioridades</option>
          <option value="Crítica" className="dark:bg-[#141738]">Crítica</option>
          <option value="Alta" className="dark:bg-[#141738]">Alta</option>
          <option value="Media" className="dark:bg-[#141738]">Media</option>
          <option value="Baja" className="dark:bg-[#141738]">Baja</option>
        </select>

        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)} 
          className="flex-1 sm:flex-none bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors shadow-xs"
        >
          <option value="RECENT" className="dark:bg-[#141738]">Más recientes</option>
          <option value="OLDEST" className="dark:bg-[#141738]">Más antiguas</option>
          <option value="SP_DESC" className="dark:bg-[#141738]">Mayor SP</option>
          <option value="PRIORITY" className="dark:bg-[#141738]">Mayor Prioridad</option>
        </select>

        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-500 dark:hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
};
