import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, ChevronDown, CheckCircle2, Search, Check } from 'lucide-react';

export default function DeveloperProjectHeader({ 
  projects = [], 
  selectedProjectId, 
  setSelectedProjectId, 
  syncSuccessMsg,
  isGlobalView = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedProject = projects.find(p => String(p.id_proyecto) === String(selectedProjectId));

  const filteredProjects = projects.filter(p => {
    const s = search.toLowerCase();
    return (p.nombre || '').toLowerCase().includes(s) || 
           (p.key_proyecto || '').toLowerCase().includes(s);
  });

  const getSyncStatus = () => {
    if (syncSuccessMsg) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_#10b981]"></span>
          Sincronizado
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
        Sincronizado hoy
      </span>
    );
  };

  return (
    <div className="relative flex flex-col items-end" ref={containerRef}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pr-1">
        Proyecto Activo {isGlobalView && '(Global)'}
      </span>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-[#1c1f43] px-3 py-1.5 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-[#33376b] text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      >
        <div className="flex flex-col items-end">
          {selectedProject ? (
            <>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                {selectedProject.nombre || `Proyecto ${selectedProject.id_proyecto}`}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {selectedProject.key_proyecto || 'Sin Key'}
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                {getSyncStatus()}
              </div>
            </>
          ) : (
            <span className="font-extrabold text-sm text-slate-400 dark:text-slate-500 py-1">
              Seleccionar proyecto...
            </span>
          )}
        </div>
        <div className={`w-6 h-6 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform ${isOpen ? 'rotate-180 bg-indigo-50 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400' : ''}`}>
          <ChevronDown size={14} strokeWidth={3} />
        </div>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-[100%] mt-2 w-[320px] bg-white dark:bg-[#141738] rounded-2xl border border-slate-200 dark:border-[#33376b] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[9999]"
        >
          <div className="p-3 border-b border-slate-100 dark:border-[#272b5c] bg-slate-50 dark:bg-[#191c3d]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar proyecto por nombre o key..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs rounded-xl pl-8 pr-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[250px] overflow-y-auto p-2 space-y-1">
            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                <Briefcase size={24} className="mb-2 opacity-20" />
                <p className="text-xs font-medium">No se encontraron proyectos</p>
              </div>
            ) : (
              filteredProjects.map(p => {
                const isSelected = String(p.id_proyecto) === String(selectedProjectId);
                return (
                  <button
                    key={p.id_proyecto}
                    onClick={() => {
                      if (setSelectedProjectId) setSelectedProjectId(p.id_proyecto);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${isSelected ? 'bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30' : 'hover:bg-slate-50 dark:hover:bg-[#1c1f43] border border-transparent'}`}
                  >
                    <div className="flex flex-col">
                      <span className={`block text-sm font-extrabold ${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {p.nombre || `Proyecto ${p.id_proyecto}`}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        {p.key_proyecto || 'N/A'} · {p.estado || 'Activo'}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-500/30 flex items-center justify-center">
                        <Check size={14} className="text-indigo-600 dark:text-indigo-400 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
