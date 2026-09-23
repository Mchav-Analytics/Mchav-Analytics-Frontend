import React from 'react';
import { Users, Search, Info } from 'lucide-react';

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
        <h2 className="text-[17px] font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          <Users size={18} className="text-indigo-600 dark:text-indigo-400" /> 
          <span>{`Desarrolladores del Proyecto (${developers.length})`}</span>
          <Info size={14} className="text-slate-400 cursor-pointer" />
        </h2>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Buscar desarrollador..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-[#14192b] border border-slate-200 dark:border-slate-700/80 rounded-2xl text-[13px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all shadow-2xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {filteredDevs.map((dev) => {
          const isSelected = selectedDev?.assignee_id === dev.assignee_id;
          const initials = (dev.nombre || 'Dev').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

          return (
            <button
              key={dev.assignee_id || dev.email}
              onClick={() => setSelectedDev(dev)}
              className={`relative flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-2 border-indigo-500/80 dark:border-indigo-500/80 shadow-xs ring-1 ring-indigo-500/30' 
                  : 'bg-white dark:bg-[#14192b] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl font-black text-xs text-white shrink-0 shadow-2xs ${
                isSelected 
                  ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60'
              }`}>
                {initials}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <h3 className={`text-sm font-bold truncate ${isSelected ? 'text-indigo-950 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                  {dev.nombre}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate">{dev.email || (dev.nombre ? dev.nombre.toLowerCase().replace(/\s+/g, '') + '@gmail.com' : 'dev@gmail.com')}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
