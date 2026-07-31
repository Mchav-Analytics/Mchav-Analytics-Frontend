import React, { useEffect, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Vistas y Componentes
import LoginView from './features/auth/views/LoginView';
import MainLayout from './features/shared/components/MainLayout';
import DashboardView from './features/dashboard/views/DashboardView';
import UserManagementTab from './features/admin/views/UserManagementTab';
import SystemSyncTab from './features/admin/views/SystemSyncTab';
import IssuesTable from './features/tasks/components/IssuesTable';
import ActivityTimeline from './features/activity-timeline/components/ActivityTimeline';
import ConfigView from './views/admin/ConfigView';
import ReportsView from './features/reports/views/ReportsView';

// Datos estáticos para el historial de actividad reciente de Jira
const recentActivity = [
  { type: 'created', time: 'Hace 2 horas', user: 'Stephany León', desc: 'creó el ticket de soporte', key: 'PA-114' },
  { type: 'closed', time: 'Hace 5 horas', user: 'Stephany León', desc: 'cerró el ticket', key: 'PA-110' },
  { type: 'bug', time: 'Ayer', user: 'Sistema', desc: 'detectó un Bug crítico de Base de datos', key: 'PA-112' },
  { type: 'blocked', time: 'Hace 2 días', user: 'Carlos Pérez', desc: 'marcó bloqueo en desarrollo', key: 'PA-111' }
];

// Servicios API
import { jiraService, projectService, authService } from './services/api';

function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-theme', 'dark');
    }
  }, [isDarkMode]);

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'proyectos' | 'sincronizacion' | 'configuracion'
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const handleSelectIssue = (issue) => {
    setSelectedIssue(issue);
    setActiveTab('proyectos');
  };
  
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

  // Estados para Tareas (Issues) del Sprint
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);

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
    
    // Cargar perfil de usuario para rol-based dashboard
    authService.getCurrentUser()
      .then(profile => {
        setUserProfile(profile);
      })
      .catch(err => {
        console.error("Error loading user profile in App.jsx:", err);
      });
  }, []);

  // 2. Cargar sprints cuando cambie el proyecto seleccionado
  useEffect(() => {
    if (selectedProjectId) {
      fetchSprints(selectedProjectId);
      fetchKpis(selectedProjectId, selectedSprintId);
      fetchIssues(selectedProjectId, selectedSprintId);
    } else {
      setSprints([]);
      setKpis([]);
      setIssues([]);
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

  const fetchIssues = (projectId, sprintId) => {
    setIssuesLoading(true);
    projectService.getSprintIssues(projectId, sprintId)
      .then(data => {
        setIssues(data);
        setIssuesLoading(false);
      })
      .catch(err => {
        console.error("Error fetching sprint issues:", err);
        setIssuesLoading(false);
      });
  };

  const filteredKpis = useMemo(() => {
    if (!kpis || kpis.length === 0) return kpis;
    if (!dateFilter || dateFilter === 'all' || (typeof dateFilter === 'object' && dateFilter.type === 'all')) return kpis;

    const now = new Date();

    return kpis.filter(kpi => {
      let targetDate = new Date(kpi.fecha_calculo);
      if (kpi.id_sprint) {
        const spr = sprints.find(s => s.id_sprint === kpi.id_sprint);
        if (spr && spr.fecha_fin) {
          targetDate = new Date(spr.fecha_fin);
        }
      }

      if (typeof dateFilter === 'string') {
        const diffTime = Math.abs(now.getTime() - targetDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (dateFilter === '30d') return diffDays <= 30;
        if (dateFilter === '60d') return diffDays <= 60;
        if (dateFilter === '90d') return diffDays <= 90;
        return true;
      }

      if (typeof dateFilter === 'object') {
        const { type, startDate, endDate, year, month, day } = dateFilter;

        if (type === '30d') {
          const diffTime = Math.abs(now.getTime() - targetDate.getTime());
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 30;
        }
        if (type === '60d') {
          const diffTime = Math.abs(now.getTime() - targetDate.getTime());
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 60;
        }
        if (type === '90d') {
          const diffTime = Math.abs(now.getTime() - targetDate.getTime());
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 90;
        }

        if (type === 'day' && day) {
          const kpiDayStr = targetDate.toISOString().split('T')[0];
          return kpiDayStr === day;
        }

        if (type === 'month' && month) {
          const kpiMonthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
          return kpiMonthStr === month;
        }

        if (type === 'year' && year) {
          return targetDate.getFullYear() === parseInt(year, 10);
        }

        if (type === 'range') {
          if (startDate && new Date(startDate) > targetDate) return false;
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (end < targetDate) return false;
          }
          return true;
        }
      }

      return true;
    });
  }, [kpis, dateFilter, sprints]);

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

  const handleUpdateIssueStatus = (issueKey, newStatus) => {
    // 1. Actualizar la lista de tareas local en memoria
    setIssues(prevIssues =>
      prevIssues.map(iss => {
        if (iss.key === issueKey) {
          const updated = { ...iss, status: newStatus };
          // Si pasa a completado, normalizamos el cycle time para que no sea bottleneck
          if (newStatus === 'Done' || newStatus === 'Finalizado' || newStatus === 'Cerrado') {
            updated.cycle_time = 2.5; 
          }
          return updated;
        }
        return iss;
      })
    );

    // 2. Actualizar las métricas generales "al vuelo" del Dashboard
    setMetrics(prev => {
      let completedCount = 0;
      let inProgressCount = 0;
      let criticalCount = 0;

      issues.forEach(iss => {
        const isCurrent = iss.key === issueKey;
        const currentStatus = isCurrent ? newStatus : iss.status;
        const isDone = ['Done', 'Finalizado', 'Cerrado'].includes(currentStatus);
        const isInProgress = ['In Progress', 'En curso', 'En revisión'].includes(currentStatus);
        const isBugCrit = iss.type === 'Bug' && ['Highest', 'Critical'].includes(iss.priority);

        if (isDone) completedCount++;
        if (isInProgress) inProgressCount++;
        if (isBugCrit && !isDone) criticalCount++;
      });

      return {
        ...prev,
        completed_tickets: completedCount,
        in_progress_tickets: inProgressCount,
        critical_bugs: criticalCount
      };
    });
  };

  // Título y subtítulo dinámico para el Topbar según la vista activa
  const getTabHeaderDetails = () => {
    switch (activeTab) {
      case 'proyectos':
        return {
          title: "Tareas del Sprint 📋",
          subtitle: "Listado detallado e interactivo de los tickets de Jira de este sprint."
        };
      case 'historial':
        return {
          title: "Historial de Actividad ⏳",
          subtitle: "Línea de tiempo cronológica de los últimos eventos y cambios del equipo."
        };
      case 'usuarios':
        return {
          title: "Seguridad y RBAC 🔐",
          subtitle: "Control de accesos y administración de roles del equipo."
        };
      case 'reportes':
        return {
          title: "Reportes 📊",
          subtitle: "Generación de reportes PDF por proyecto y equipo."
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
        return userProfile?.rol === 'Administrador' ? {
          title: "Dashboard Administrador",
          subtitle: "Resumen general de la plataforma"
        } : {
          title: "Resumen 👋",
          subtitle: "Aquí tienes un panorama general de tus proyectos."
        };
    }
  };

  const headerDetails = getTabHeaderDetails();

  const isFilterableTab = activeTab === 'dashboard' || activeTab === 'proyectos';

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      userProfile={userProfile}
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      projects={projects}
      selectedProjectId={selectedProjectId}
      setSelectedProjectId={isFilterableTab ? setSelectedProjectId : null} // Mostrar selector de proyecto en Dashboard y Tareas
      syncLoading={syncLoading}
      handleSyncNow={isFilterableTab ? handleSyncNow : null} // Mostrar botón sinc en Dashboard y Tareas
      topbarTitle={headerDetails.title}
      topbarSubtitle={headerDetails.subtitle}
      dateFilter={dateFilter}
      setDateFilter={setDateFilter}
      issues={issues}
      onSelectIssueKey={handleSelectIssue}
    >
      {activeTab === 'dashboard' && (
        <DashboardView 
          metrics={metrics}
          metricsLoading={metricsLoading}
          metricsError={metricsError}
          syncSuccessMsg={syncSuccessMsg}
          kpis={filteredKpis}
          issues={issues}
          issuesLoading={issuesLoading}
          selectedProjectId={selectedProjectId}
          setActiveTab={setActiveTab}
          onSync={handleSyncNow}
          onSelectIssue={handleSelectIssue}
          isDarkMode={isDarkMode}
          userProfile={userProfile}
        />
      )}

      {activeTab === 'proyectos' && (
        <div className="w-full flex flex-col gap-y-8 text-slate-800 dark:text-slate-100 pb-8">
          <IssuesTable 
            issues={issues} 
            issuesLoading={issuesLoading} 
            sprintName={sprints.find(s => s.id_sprint === selectedSprintId)?.nombre || "General"}
            onUpdateIssueStatus={handleUpdateIssueStatus}
            selectedIssue={selectedIssue}
            setSelectedIssue={setSelectedIssue}
          />
        </div>
      )}

      {activeTab === 'historial' && (
        <div className="w-full flex flex-col gap-y-8 text-slate-800 dark:text-slate-100 pb-8">
          <ActivityTimeline recentActivity={recentActivity} />
        </div>
      )}

      {activeTab === 'sincronizacion' && (
        <SystemSyncTab />
      )}

      {activeTab === 'usuarios' && (
        <UserManagementTab />
      )}

      {activeTab === 'reportes' && (
        <ReportsView isDarkMode={isDarkMode} />
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
