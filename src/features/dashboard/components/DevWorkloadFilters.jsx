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
          <option value="TODOS" className="bg-white dark:bg-[#141738] text-slate-800 dark:text-white font-medium">Todos los Estados</option>
          <option value="POR HACER" className="bg-white dark:bg-[#141738] text-slate-800 dark:text-white font-medium">Por Hacer</option>
          <option value="EN CURSO" className="bg-white dark:bg-[#141738] text-slate-800 dark:text-white font-medium">En Curso</option>
          <option value="EN REVISIÓN" className="bg-white dark:bg-[#141738] text-slate-800 dark:text-white font-medium">En Revisión</option>
          <option value="BLOQUEADA" className="bg-white dark:bg-[#141738] text-slate-800 dark:text-white font-medium">Bloqueadas</option>
          <option value="FINALIZADO" className="bg-white dark:bg-[#141738] text-slate-800 dark:text-white font-medium">Finalizados</option>
        </select>

        <select 
          value={priorityFilter} 
          onChange={(e) => setPriorityFilter(e.target.value)} 
          className="flex-1 sm:flex-none bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors shadow-xs"
        >
          <option value="TODAS" className="bg-white dark:bg-[#141738] text-slate-800 dark:text-white font-medium">Todas las Prioridades</option>
          <option value="Crítica" className="bg-white dark:bg-[#141738] text-slate-800 dark:text-white font-medium">Crítica</option>
          <option value="Alta" className="bg-white dark:bg-[#141738] text-slate-800 dark:text-white font-medium">Alta</option>
          <option value="Media" className="bg-white dark:bg-[#141738] text-slate-800 dark:text-white font-medium">Media</option>
          <option value="Baja" className="bg-white dark:bg-[#141738] text-slate-800 dark:text-white font-medium">Baja</option>
        </select>

        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)} 
          className="flex-1 sm:flex-none bg-white dark:bg-[#141738] border border-slate-200 dark:border-[#272b5c] rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors shadow-xs"
        >
          <option value="RECENT" className="bg-white dark:bg-[#141738] text-slate-800 dark:text-white font-medium">Más recientes</option>
          <option value="OLDEST" className="bg-white dark:bg-[#141738] text-slate-800 dark:text-white font-medium">Más antiguas</option>
          <option value="SP_DESC" className="bg-white dark:bg-[#141738] text-slate-800 dark:text-white font-medium">Mayor SP</option>
          <option value="PRIORITY" className="bg-white dark:bg-[#141738] text-slate-800 dark:text-white font-medium">Mayor Prioridad</option>
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
