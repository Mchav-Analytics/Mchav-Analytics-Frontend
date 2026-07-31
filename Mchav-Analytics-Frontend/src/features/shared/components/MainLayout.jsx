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
  topbarSubtitle,
  dateFilter,
  setDateFilter,
  issues = [],
  onSelectIssueKey,
  userProfile: propUserProfile
}) {
  const [userProfile, setUserProfile] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cargar perfil de usuario en el layout
  useEffect(() => {
    if (propUserProfile) {
      setUserProfile(propUserProfile);
    } else {
      authService.getCurrentUser()
        .then(profile => {
          setUserProfile(profile);
        })
        .catch(err => {
          console.error("Error fetching user profile:", err);
        });
    }
  }, [propUserProfile]);

  // Cerrar el menú móvil automáticamente al cambiar de pestaña
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  return (
    <div className={`dashboard-layout ${isDarkMode ? 'dark-theme dark' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      
      {/* Backdrop overlay para cerrar el menú móvil al hacer click fuera */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden cursor-pointer" 
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

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
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          setActiveTab={setActiveTab}
          issues={issues}
          onSelectIssue={onSelectIssueKey}
        />
        
        <div className="dashboard-inner w-full px-6 sm:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
