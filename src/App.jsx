import React, { useEffect, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Vistas y Componentes
import LoginView from './views/auth/LoginView';
import MainLayout from './components/common/MainLayout';
import DashboardView from './views/common/DashboardView';
import UserManagementTab from './views/admin/UserManagementTab';
import SystemSyncTab from './views/admin/SystemSyncTab';

// Servicios API
import { jiraService, projectService } from './services/api';

function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'proyectos' | 'sincronizacion' | 'configuracion'
  const [dateFilter, setDateFilter] = useState('all');
  
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
      case 'usuarios':
        return {
          title: "Seguridad y RBAC 🔐",
          subtitle: "Control de accesos y administración de roles del equipo."
        };
      case 'sincronizacion':
        return {
          title: "Auditoría de ETL 🔄",
          subtitle: "Historial de sincronización y estado de los datos."
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
      dateFilter={dateFilter}
      setDateFilter={setDateFilter}
    >
      {activeTab === 'dashboard' && (
        <DashboardView 
          metrics={metrics}
          metricsLoading={metricsLoading}
          metricsError={metricsError}
          syncSuccessMsg={syncSuccessMsg}
          kpis={filteredKpis}
          selectedProjectId={selectedProjectId}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'sincronizacion' && (
        <SystemSyncTab />
      )}

      {activeTab === 'usuarios' && (
        <UserManagementTab />
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