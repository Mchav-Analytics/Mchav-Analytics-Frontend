import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Vistas y Componentes
import LoginView from './views/auth/LoginView';
import MainLayout from './components/common/MainLayout';
import DashboardView from './views/common/DashboardView';
import MetricsView from './views/common/MetricsView';
import SyncView from './views/admin/SyncView';
import ConfigView from './views/admin/ConfigView';

// Servicios API
import { jiraService, projectService } from './services/api';

function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'proyectos' | 'sincronizacion' | 'configuracion'
  
  // Estados para métricas "al vuelo"
  const [metrics, setMetrics] = useState({
    active_projects: 0,
    completed_tickets: 0,
    in_progress_tickets: 0,
    critical_bugs: 0
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(null);

  // Estados para proyectos y sprints (filtros)
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState('');

  // Estados para KPIs históricos
  const [kpis, setKpis] = useState([]);
  const [kpisLoading, setKpisLoading] = useState(false);

  // Estados para logs de sincronización
  const [syncLogs, setSyncLogs] = useState([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  // Estados para configuración de flujos
  const [projectStatuses, setProjectStatuses] = useState([]);
  const [statusMappings, setStatusMappings] = useState({});
  const [configLoading, setConfigLoading] = useState(false);
  const [configSuccessMsg, setConfigSuccessMsg] = useState('');

  // 1. Cargar métricas generales al inicio
  useEffect(() => {
    fetchGeneralMetrics();
    fetchProjects();
    fetchSyncLogs();
  }, []);

  // 2. Cargar sprints cuando cambie el proyecto seleccionado
  useEffect(() => {
    if (selectedProjectId) {
      fetchSprints(selectedProjectId);
      fetchKpis(selectedProjectId, selectedSprintId);
    } else {
      setSprints([]);
      setKpis([]);
    }
  }, [selectedProjectId, selectedSprintId]);

  const fetchGeneralMetrics = () => {
    setMetricsLoading(true);
    jiraService.getMetrics()
      .then(data => {
        setMetrics(data);
        setMetricsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching general metrics:", err);
        setMetricsError("No se pudieron cargar las métricas generales de Jira. Comprueba tu inicio de sesión.");
        setMetricsLoading(false);
      });
  };

  const fetchProjects = () => {
    projectService.getProjects()
      .then(data => {
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0].id_proyecto);
        }
      })
      .catch(err => {
        console.error("Error fetching projects:", err);
      });
  };

  const fetchSprints = (projectId) => {
    projectService.getSprints(projectId)
      .then(data => {
        setSprints(data);
      })
      .catch(err => {
        console.error("Error fetching sprints:", err);
      });
  };

  const fetchKpis = (projectId, sprintId) => {
    setKpisLoading(true);
    projectService.getKpis(projectId, sprintId)
      .then(data => {
        // Formatear los KPIs para visualización en Recharts
        const formattedKpis = data.map(kpi => {
          let sprintName = "Proyecto General";
          if (kpi.id_sprint) {
            const spr = sprints.find(s => s.id_sprint === kpi.id_sprint);
            sprintName = spr ? spr.nombre : `Sprint ${kpi.id_sprint}`;
          }
          return {
            ...kpi,
            sprintName,
            fechaFormateada: new Date(kpi.fecha_calculo).toLocaleDateString()
          };
        });
        setKpis(formattedKpis);
        setKpisLoading(false);
      })
      .catch(err => {
        console.error("Error fetching KPIs:", err);
        setKpisLoading(false);
      });
  };

  const fetchSyncLogs = () => {
    jiraService.getSyncLogs()
      .then(data => {
        setSyncLogs(data);
      })
      .catch(err => {
        console.error("Error fetching sync logs:", err);
      });
  };

  // Cargar configuraciones si estamos en la pestaña de configuración
  useEffect(() => {
    if (activeTab === 'configuracion' && selectedProjectId) {
      fetchProjectStatusesAndMappings(selectedProjectId);
    }
  }, [activeTab, selectedProjectId]);

  const fetchProjectStatusesAndMappings = (projectId) => {
    setConfigLoading(true);
    setConfigSuccessMsg('');
    
    Promise.all([
      projectService.getStatuses(projectId),
      projectService.getMappings(projectId)
    ])
      .then(([statuses, mappings]) => {
        setProjectStatuses(statuses);
        
        const mappingObj = {};
        mappings.forEach(m => {
          mappingObj[m.estado_jira] = m.estado_base;
        });
        setStatusMappings(mappingObj);
        setConfigLoading(false);
      })
      .catch(err => {
        console.error("Error loading config:", err);
        setConfigLoading(false);
      });
  };

  const handleSaveMappings = () => {
    setConfigLoading(true);
    setConfigSuccessMsg('');
    
    const mappingsData = Object.entries(statusMappings).map(([estado_jira, estado_base]) => ({
      estado_jira,
      estado_base
    }));
    
    projectService.saveMappings(selectedProjectId, mappingsData)
      .then(() => {
        setConfigSuccessMsg("Configuración de flujo guardada y KPIs recalculados con éxito.");
        setConfigLoading(false);
        fetchKpis(selectedProjectId, selectedSprintId);
      })
      .catch(err => {
        console.error("Error saving mappings:", err);
        setConfigLoading(false);
      });
  };

  const handleMappingChange = (statusName, baseState) => {
    setStatusMappings(prev => ({
      ...prev,
      [statusName]: baseState
    }));
  };

  const handleSyncNow = () => {
    setSyncLoading(true);
    setSyncSuccessMsg('');
    jiraService.triggerSync()
      .then(() => {
        setSyncSuccessMsg("Sincronización iniciada en segundo plano. Espera unos segundos...");
        let attempts = 0;
        const interval = setInterval(() => {
          jiraService.getSyncLogs()
            .then(logRes => {
              setSyncLogs(logRes);
              attempts++;
              if ((logRes.length > 0 && logRes[0].resultado !== 'RUNNING') || attempts > 6) {
                clearInterval(interval);
                setSyncLoading(false);
                setSyncSuccessMsg("Sincronización finalizada. Los datos locales se han actualizado.");
                fetchGeneralMetrics();
                if (selectedProjectId) {
                  fetchKpis(selectedProjectId, selectedSprintId);
                }
              }
            })
            .catch(() => clearInterval(interval));
        }, 4000);
      })
      .catch(err => {
        console.error("Error launching sync:", err);
        setSyncLoading(false);
      });
  };

  // Título y subtítulo dinámico para el Topbar según la vista activa
  const getTabHeaderDetails = () => {
    switch (activeTab) {
      case 'proyectos':
        return {
          title: "Métricas de Rendimiento 📈",
          subtitle: "Analíticas avanzadas del rendimiento del equipo en sprints."
        };
      case 'sincronizacion':
        return {
          title: "Auditoría de ETL 🔄",
          subtitle: "Historial de sincronización y estado de los datos."
        };
      case 'configuracion':
        return {
          title: "Mapeo de Flujos 🛠️",
          subtitle: "Configuración personalizada para el motor de KPIs."
        };
      case 'dashboard':
      default:
        return {
          title: "Resumen 👋",
          subtitle: "Aquí tienes un panorama general de tus proyectos."
        };
    }
  };

  const headerDetails = getTabHeaderDetails();

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      projects={projects}
      selectedProjectId={selectedProjectId}
      setSelectedProjectId={activeTab === 'dashboard' ? setSelectedProjectId : null} // Solo mostrar selector de proyecto en Topbar para el Dashboard
      syncLoading={syncLoading}
      handleSyncNow={activeTab === 'dashboard' ? handleSyncNow : null} // Solo mostrar botón sinc en Topbar para el Dashboard
      topbarTitle={headerDetails.title}
      topbarSubtitle={headerDetails.subtitle}
    >
      {activeTab === 'dashboard' && (
        <DashboardView 
          metrics={metrics}
          metricsLoading={metricsLoading}
          metricsError={metricsError}
          syncSuccessMsg={syncSuccessMsg}
          kpis={kpis}
          selectedProjectId={selectedProjectId}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'proyectos' && (
        <MetricsView 
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          projects={projects}
          selectedSprintId={selectedSprintId}
          setSelectedSprintId={setSelectedSprintId}
          sprints={sprints}
          kpis={kpis}
          kpisLoading={kpisLoading}
        />
      )}

      {activeTab === 'sincronizacion' && (
        <SyncView 
          syncLogs={syncLogs}
        />
      )}

      {activeTab === 'configuracion' && (
        <ConfigView 
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          projects={projects}
          configLoading={configLoading}
          projectStatuses={projectStatuses}
          configSuccessMsg={configSuccessMsg}
          statusMappings={statusMappings}
          handleMappingChange={handleMappingChange}
          handleSaveMappings={handleSaveMappings}
        />
      )}
    </MainLayout>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginView />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
