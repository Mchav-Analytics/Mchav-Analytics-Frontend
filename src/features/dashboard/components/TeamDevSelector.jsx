import React from 'react';
import { Users, Search } from 'lucide-react';

export default function TeamDevSelector({ 
  developers, 
  filteredDevs, 
  selectedDev, 
  setSelectedDev, 
  searchFilter, 
  setSearchFilter 
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Users size={16} className="text-indigo-600 dark:text-indigo-400" /> Desarrolladores del Proyecto ({developers.length})
        </h2>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Buscar desarrollador..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#191c3d] border border-slate-200 dark:border-[#33376b] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredDevs.map((dev) => {
          const isSelected = selectedDev?.assignee_id === dev.assignee_id;
          const initials = (dev.nombre || 'Dev').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

          return (
            <button
              key={dev.assignee_id || dev.email}
              onClick={() => setSelectedDev(dev)}
              className={`relative flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 shadow-sm ring-1 ring-indigo-500/50' 
                  : 'bg-white dark:bg-[#191c3d] border-slate-200 dark:border-[#33376b] hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold text-sm text-white shrink-0 ${
                isSelected 
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md' 
                  : 'bg-slate-200 dark:bg-[#12142e] text-slate-700 dark:text-slate-300'
              }`}>
                {initials}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <h3 className={`text-sm font-bold truncate ${isSelected ? 'text-indigo-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                  {dev.nombre}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{dev.email || (dev.nombre ? dev.nombre.toLowerCase().replace(/\s+/g, '') + '@gmail.com' : 'dev@gmail.com')}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
