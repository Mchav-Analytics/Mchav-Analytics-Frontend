import React, { useState, useRef, useEffect } from 'react';
import { FolderKanban, ChevronDown, Check, Briefcase } from 'lucide-react';

export default function ProjectPickerDropdown({ projects = [], selectedProjectId, setSelectedProjectId }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedProject = projects.find(p => String(p.id_proyecto) === String(selectedProjectId));

  const getDisplayLabel = () => {
    if (!selectedProjectId) return 'Todos los proyectos';
    return selectedProject ? selectedProject.nombre : 'Proyecto Seleccionado';
  };

  const handleSelect = (id) => {
    setSelectedProjectId(id);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-teal-500/50 transition-all shadow-sm"
      >
        <FolderKanban size={15} className="text-teal-600 dark:text-teal-400" />
        <span className="max-w-[160px] truncate">{getDisplayLabel()}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150 text-left">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Seleccionar Proyecto
            </span>
          </div>

          <div className="space-y-1 max-h-60 overflow-y-auto">
            <button
              type="button"
              onClick={() => handleSelect('')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${!selectedProjectId ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <div className="flex items-center gap-2">
                <Briefcase size={14} className={!selectedProjectId ? 'text-teal-600' : 'text-slate-400'} />
                <span>Todos los proyectos</span>
              </div>
              {!selectedProjectId && <Check size={14} className="text-teal-600 dark:text-teal-400" />}
            </button>

            {projects.map((p) => {
              const isSelected = String(p.id_proyecto) === String(selectedProjectId);
              return (
                <button
                  key={p.id_proyecto}
                  type="button"
                  onClick={() => handleSelect(p.id_proyecto)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${isSelected ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FolderKanban size={14} className={isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'} />
                    <div className="flex flex-col truncate">
                      <span className="truncate font-semibold">{p.nombre}</span>
                      {p.key_proyecto && (
                        <span className="text-[10px] text-slate-400 font-mono">Clave: {p.key_proyecto}</span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="text-teal-600 dark:text-teal-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
