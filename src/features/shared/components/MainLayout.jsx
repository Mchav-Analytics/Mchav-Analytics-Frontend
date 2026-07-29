import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { authService } from '../../../services/api';

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
<<<<<<<< Updated upstream:frontend/src/components/common/MainLayout.jsx
  topbarSubtitle
}) {
  const [userProfile, setUserProfile] = useState(null);
========
  topbarSubtitle,
  dateFilter,
  setDateFilter,
  issues = []
}) {
  const [userProfile, setUserProfile] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
>>>>>>>> Stashed changes:src/features/shared/components/MainLayout.jsx

  // Cargar perfil de usuario en el layout
  useEffect(() => {
    authService.getCurrentUser()
      .then(profile => {
        setUserProfile(profile);
      })
      .catch(err => {
        console.error("Error fetching user profile:", err);
      });
  }, []);

  // Cerrar el menú móvil automáticamente al cambiar de pestaña
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  return (
<<<<<<<< Updated upstream:frontend/src/components/common/MainLayout.jsx
    <div className={`dashboard-layout ${isDarkMode ? 'dark-theme' : ''}`}>
========
    <div className={`dashboard-layout ${isDarkMode ? 'dark-theme dark' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      
      {/* Backdrop overlay para cerrar el menú móvil al hacer click fuera */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden cursor-pointer" 
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

>>>>>>>> Stashed changes:src/features/shared/components/MainLayout.jsx
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
      />
      
      <main className="main-content">
        <Topbar 
          title={topbarTitle}
          subtitle={topbarSubtitle}
          projects={projects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          syncLoading={syncLoading}
          handleSyncNow={handleSyncNow}
          userProfile={userProfile}
<<<<<<<< Updated upstream:frontend/src/components/common/MainLayout.jsx
========
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          setActiveTab={setActiveTab}
          issues={issues}
>>>>>>>> Stashed changes:src/features/shared/components/MainLayout.jsx
        />
        
        <div className="dashboard-inner w-full px-6 sm:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
