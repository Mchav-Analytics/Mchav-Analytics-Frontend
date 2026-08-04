// ============================================================================
// COMPONENTE DESPLEGABLE DE SELECCIÓN DE PROYECTO (DESHABILITADO EN PENDING)
// ============================================================================
// Permite al usuario cambiar el proyecto activo. En estado PENDING se bloquea
// totalmente para no mostrar nada ni desplegar opciones.

import React, { useState, useEffect, useRef } from 'react';
import { FolderGit2, ChevronDown, Check, Lock } from 'lucide-react';

export default function ProjectPickerDropdown({ 
  projects = [], 
  selectedProjectId, 
  setSelectedProjectId, 
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar desplegable si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Si está deshabilitado por estar en estado pendiente, renderizar botón inactivo con candado
  if (disabled) {
    return (
      <div className="relative inline-block text-left">
        <button
          type="button"
          disabled
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-slate-400 opacity-60 cursor-not-allowed shadow-sm"
          title="Sin proyectos asignados por el Administrador"
        >
          <FolderGit2 size={15} className="text-slate-400" />
          <span className="max-w-[140px] truncate">Sin Proyectos</span>
          <Lock size={12} className="text-amber-500/80 ml-0.5" />
        </button>
      </div>
    );
  }

  const selectedProject = projects.find(p => p.id_proyecto === selectedProjectId);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Botón activador del menú */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm transition-all cursor-pointer"
        title="Seleccionar Proyecto Activo"
      >
        <FolderGit2 size={15} className="text-indigo-600 dark:text-indigo-400" />
        <span className="max-w-[140px] truncate">
          {selectedProject ? selectedProject.nombre : 'Seleccionar Proyecto'}
        </span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {/* Menú Desplegable con Lista de Proyectos */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 text-left">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
            Proyectos Disponibles
          </div>

          {projects.length === 0 ? (
            <div className="px-3 py-3 text-xs text-slate-400 text-center">
              No hay proyectos registrados
            </div>
          ) : (
            projects.map((proj) => {
              const isSelected = proj.id_proyecto === selectedProjectId;
              return (
                <button
                  key={proj.id_proyecto}
                  type="button"
                  onClick={() => {
                    setSelectedProjectId(proj.id_proyecto);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{proj.nombre}</span>
                  {isSelected && <Check size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
