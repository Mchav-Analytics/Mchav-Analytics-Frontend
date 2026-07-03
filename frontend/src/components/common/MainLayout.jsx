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
  topbarSubtitle
}) {
  const [userProfile, setUserProfile] = useState(null);

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

  return (
    <div className={`dashboard-layout ${isDarkMode ? 'dark-theme' : ''}`}>
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
        />
        
        <div className="dashboard-inner">
          {children}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
