// ============================================================================
// COMPONENTE DE PLANTILLA PRINCIPAL (MAIN LAYOUT)
// ============================================================================

import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { authService } from '../../services/api';

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
  dateFilter,
  setDateFilter
}) {
  const [userProfile, setUserProfile] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      <main className="main-content">
        <div className="dashboard-inner pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
