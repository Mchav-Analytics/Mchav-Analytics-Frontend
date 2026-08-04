// ============================================================================
// COMPONENTE DE PLANTILLA PRINCIPAL (MAIN LAYOUT)
// ============================================================================
// Envuelve la aplicación integrando la barra lateral (Sidebar) y la barra superior (Topbar).

import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
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
  topbarTitle,
  topbarSubtitle,
  dateFilter,
  setDateFilter,
  alerts,
  setAlerts
}) {
  const [userProfile, setUserProfile] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Cargar perfil de usuario en el layout si es necesario
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
    <div className={`dashboard-layout ${isDarkMode ? 'dark-theme dark' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Barra Lateral de Navegación */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Contenido Principal de la Aplicación */}
      <main className="main-content no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Topbar
          title={topbarTitle}
          subtitle={topbarSubtitle}
          projects={projects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          syncLoading={syncLoading}
          handleSyncNow={handleSyncNow}
          userProfile={userProfile}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          setActiveTab={setActiveTab}
          alerts={alerts}
          setAlerts={setAlerts}
        />

        <div className="dashboard-inner">
          {children}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
