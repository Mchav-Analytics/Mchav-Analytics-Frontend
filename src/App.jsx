// ============================================================================
// APLICACIÓN PRINCIPAL (APP.JSX) — INTEGRACIÓN CON BROWSERROUTER
// ============================================================================
// Enlaza el proveedor de autenticación (AuthProvider) y el enrutador principal (BrowserRouter)
// para resolver errores de hooks de navegación en el navegador.

import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import DashboardView from './features/dashboard/views/DashboardView';
import DeveloperView from './features/dashboard/views/DeveloperView';
import SystemSyncTab from './features/sync/views/SystemSyncTab';
import UserManagementTab from './features/users/views/UserManagementTab';
import LoginView from './features/auth/views/LoginView';
import { useAuth, AuthProvider } from './features/auth/context/AuthContext';
import { jiraService, projectService } from './services/api';

function MainAppContent() {
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // Contexto de autenticación
  const [activeTab, setActiveTab] = useState('dashboard');          // Pestaña activa actual
  const [isDarkMode, setIsDarkMode] = useState(true);              // Estado de tema claro / oscuro

  // Filtro de rango de fechas activo
  const [dateFilter, setDateFilter] = useState({ label: 'Todos los tiempos', key: 'all' });

  // Estados de datos generales y métricas
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  // Estados para Proyectos, Sprints y KPIs
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const [alerts, setAlerts] = useState([]); // Almacena la lista de alertas activas del sistema


  // Inicializar o redirigir pestaña según el rol al autenticar
  useEffect(() => {
    if (user?.rol === 'DEVELOPER') {
      setActiveTab('developer');
    } else if ((user?.rol === 'ADMIN' || user?.rol === 'MANAGER') && activeTab === 'developer') {
      setActiveTab('dashboard');
    }
  }, [user]);

  // Cargar métricas e información inicial al autenticarse
  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics();
      fetchProjects();
    }
  }, [isAuthenticated]);

  // Recargar KPIs al seleccionar un proyecto
  useEffect(() => {
    if (selectedProjectId) {
      fetchSprints(selectedProjectId);
      fetchKpis(selectedProjectId, null);
    }
  }, [selectedProjectId]);

  const fetchMetrics = () => {
    setMetricsLoading(true);
    setMetricsError(null);
    jiraService.getMetrics()
      .then(data => {
        setMetrics(data);
        setMetricsLoading(false);
        evaluateAlerts(data, kpis); // Evaluar alertas con nuevas métricas
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
        setKpis(data);
        setKpisLoading(false);
        evaluateAlerts(metrics, data); // Evaluar alertas con nuevas métricas
      })
      .catch(err => {
        console.error("Error fetching KPIs:", err);
        setKpisLoading(false);
      });
  };

  const evaluateAlerts = (metricsData, kpiData) => {
    const newAlerts = [];

    // 1. Evaluar Bugs Críticos desde Métricas Generales
    if (metricsData && metricsData.critical_bugs > 1) {
      newAlerts.push({
        id: 'alert-bugs',
        tipo: 'danger',
        titulo: 'Bugs Críticos Pendientes 🚨',
        descripcion: `Hay ${metricsData.critical_bugs} bugs críticos pendientes que requieren atención inmediata.`
      });
    }

    // 2. Evaluar Tiempo de Ciclo desde KPIs del Proyecto
    if (kpiData && kpiData.length > 0) {
      const latestKpi = kpiData[kpiData.length - 1]; // Obtiene la métrica más reciente
      if (latestKpi.cycle_time_promedio_dias > 3.0) {
        newAlerts.push({
          id: 'alert-cycle-time',
          tipo: 'warning',
          titulo: 'Tiempo de Ciclo Elevado ⚠️',
          descripcion: `El tiempo de ciclo promedio actual es de ${latestKpi.cycle_time_promedio_dias} días (límite objetivo: 3 días).`
        });
      }
    }

    setAlerts(newAlerts);
  };


  const handleSyncNow = () => {
    setSyncLoading(true);
    setSyncSuccessMsg('');
    jiraService.triggerSync()
      .then(res => {
        setSyncSuccessMsg(res.message || "Sincronización simulada exitosa.");
        fetchMetrics();
        if (selectedProjectId) {
          fetchKpis(selectedProjectId, null);
        }
        setTimeout(() => setSyncSuccessMsg(''), 4000);
      })
      .catch(err => {
        console.error("Error triggering sync:", err);
      })
      .finally(() => {
        setSyncLoading(false);
      });
  };

  // Filtrar KPIs según el rango de fecha seleccionado (los Hooks siempre deben ir al inicio del componente)
  const filteredKpis = React.useMemo(() => {
    if (!kpis) return null;
    if (dateFilter.key === 'all') return kpis;
    return kpis;
  }, [kpis, dateFilter]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Cargando MCHAV Analytics...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Configurar títulos y subtítulos legibles en el Topbar por pestaña activa
  const getTabHeaderDetails = () => {
    switch (activeTab) {
      case 'developer':
        return {
          title: "Espacio de Trabajo del Desarrollador 👨‍💻",
          subtitle: "Consola de consultas JQL y métricas de tu trabajo personal."
        };
      case 'tasks':
        return {
          title: "Gestión de Tareas y Burndown 📝",
          subtitle: "Seguimiento al esfuerzo restante, historiales de usuario y tipos de incidencias."
        };
      case 'history':
        return {
          title: "Histórico General de Rendimiento 🕒",
          subtitle: "Análisis acumulado de velocidad por sprint y tendencias de entrega."
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
      setSelectedProjectId={activeTab === 'dashboard' || activeTab === 'tasks' || activeTab === 'history' || activeTab === 'developer' ? setSelectedProjectId : null}
      syncLoading={syncLoading}
      handleSyncNow={activeTab === 'dashboard' && user?.rol !== 'DEVELOPER' ? handleSyncNow : null}
      topbarTitle={headerDetails.title}
      topbarSubtitle={headerDetails.subtitle}
      dateFilter={dateFilter}
      setDateFilter={setDateFilter}
      alerts={alerts}
      setAlerts={setAlerts}

    >
      {(activeTab === 'dashboard' || activeTab === 'tasks' || activeTab === 'history') && (
        <DashboardView
          metrics={metrics}
          metricsLoading={metricsLoading}
          metricsError={metricsError}
          syncSuccessMsg={syncSuccessMsg}
          kpis={filteredKpis}
          selectedProjectId={selectedProjectId}
          setActiveTab={setActiveTab}
          subTab={activeTab}
        />
      )}

      {activeTab === 'developer' && (
        <DeveloperView
          kpis={filteredKpis}
          selectedProjectId={selectedProjectId}
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
    <BrowserRouter>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;