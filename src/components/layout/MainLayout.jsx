// ============================================================================
// COMPONENTE DE PLANTILLA PRINCIPAL (MAIN LAYOUT)
// ============================================================================

import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { authService } from '../../services/api';
import { useAuth, normalizeRole } from '../../features/auth/context/AuthContext';
import { Shield, Briefcase, Code, Layers } from 'lucide-react';

function MainLayout({
  children,
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  projects,
  selectedProjectId,
  setSelectedProjectId,
  syncLoading,
  handleSyncNow,
  topbarTitle,
  topbarSubtitle,
  dateFilter,
  setDateFilter,
  alerts,
  setAlerts
}) {
  const [userProfile, setUserProfile] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, switchViewRole, isRealAdmin } = useAuth();

  const currentRole = normalizeRole(user?.rol);

  useEffect(() => {
    authService.getCurrentUser()
      .then(profile => {
        setUserProfile(profile);
      })
      .catch(err => {
        console.log("Perfil cargado mediante AuthContext");
      });
  }, []);

  const handleRoleSwitch = (newRole) => {
    switchViewRole(newRole);
    if (newRole === 'MANAGER') {
      setActiveTab('dashboard');
    } else if (newRole === 'DEVELOPER') {
      setActiveTab('developer');
    } else {
      setActiveTab('usuarios');
    }
  };

  return (
    <div className={`dashboard-layout ${isDarkMode ? 'dark-theme dark' : ''}`}>
      {/* Barra Lateral — Réplica Meraki UI con colapso */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        projects={projects}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
      />

      {/* Contenido Principal */}
      <main className="main-content flex flex-col flex-1 min-h-screen overflow-x-hidden">
        {/* BARRA SUPERIOR DE CONMUTACIÓN DE ROLES RÁPIDA PARA ADMINISTRADOR */}
        {isRealAdmin && (
          <div className="sticky top-0 z-40 px-6 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-extrabold tracking-wide uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers size={14} className="text-indigo-500" />
                Modo de Vista:
              </span>
              <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20">
                {currentRole === 'ADMIN' ? '🛡️ Administrador' : currentRole === 'MANAGER' ? '💼 Líder Técnico' : '💻 Desarrollador'}
              </span>
            </div>

            {/* LOS 3 BOTONES PRINCIPALES DE CAMBIO DE VISTA RÁPIDO */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200/90 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleRoleSwitch('ADMIN')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentRole === 'ADMIN'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/30 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/80'
                }`}
              >
                <Shield size={14} />
                <span>Vista Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSwitch('MANAGER')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentRole === 'MANAGER'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md shadow-purple-500/30 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/80'
                }`}
              >
                <Briefcase size={14} />
                <span>Vista Líder Técnico</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSwitch('DEVELOPER')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentRole === 'DEVELOPER'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/30 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/80'
                }`}
              >
                <Code size={14} />
                <span>Vista Desarrollador</span>
              </button>
            </div>
          </div>
        )}

        <div className="dashboard-inner pt-4 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
