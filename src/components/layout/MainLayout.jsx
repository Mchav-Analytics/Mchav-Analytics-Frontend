// ============================================================================
// COMPONENTE DE PLANTILLA PRINCIPAL (MAIN LAYOUT)
// ============================================================================

import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { authService } from '../../services/api';
import { useAuth } from '../../features/auth/context/AuthContext';

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
  const { user } = useAuth();

  useEffect(() => {
    authService.getCurrentUser()
      .then(profile => {
        setUserProfile(profile);
      })
      .catch(err => {
        console.log("Perfil cargado mediante AuthContext");
      });
  }, []);

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
        
        <div className="dashboard-inner pt-4 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
