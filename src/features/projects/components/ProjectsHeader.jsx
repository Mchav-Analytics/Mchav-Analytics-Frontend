import React from 'react';
import { Filter, Sparkles } from 'lucide-react';
import LiderNotificationBell from '../../dashboard/components/LiderNotificationBell';
import LastSyncBadge from '../../dashboard/components/LastSyncBadge';

export const ProjectsHeader = ({ 
  userProfile, 
  user, 
  selectedProjectId, 
  setSelectedProjectId, 
  allProjectsList,
  activeTab = 'proyectos',
  setActiveTab 
}) => {
  const userFirstName = userProfile?.first_name || user?.email?.split('@')[0] || 'Camilo';

  return (
    <div className="bg-white/90 dark:bg-[#121533]/90 border border-slate-200/80 dark:border-[#232752] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs backdrop-blur-md transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Lado Izquierdo: Saludo con Avatar Inicial & Título */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-indigo-500/20 shrink-0 border border-indigo-400/30">
            {userFirstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                ¡Hola, {userFirstName}! 👋
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold border border-indigo-500/20">
                <Sparkles size={10} />
                Analytics Live
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Resumen general del rendimiento y métricas de tus proyectos
            </p>
          </div>
        </div>

        {/* Lado Derecho: Barra de Controles Organizada */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Botón de Campana de Notificaciones & Alertas IA Nubi */}
          <LiderNotificationBell onNavigateTab={setActiveTab} />

          {/* Badge de Última Sincronización */}
          <LastSyncBadge />

          {/* Filtro Dropdown de Proyecto Seleccionado */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-[#181c3d] border border-slate-200 dark:border-[#272b5c] rounded-2xl shadow-2xs hover:border-indigo-500/50 transition-all">
              <Filter size={14} className="text-slate-400 shrink-0" />
              <select
                value={selectedProjectId || 'ALL'}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-slate-800 dark:text-slate-100 outline-none cursor-pointer pr-2 max-w-[180px] sm:max-w-[220px] truncate"
              >
                <option value="ALL" className="bg-white dark:bg-[#141738] font-bold">
                  Todos los proyectos
                </option>
                {allProjectsList?.map(p => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-[#141738] font-semibold">
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};


