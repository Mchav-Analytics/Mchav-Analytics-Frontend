// ============================================================================
// APLICACIÓN PRINCIPAL (APP.JSX) — INTEGRACIÓN CON BROWSERROUTER
// ============================================================================
// Enlaza el proveedor de autenticación (AuthProvider) y el enrutador principal (BrowserRouter)
// para resolver errores de hooks de navegación en el navegador.

import CentroReportesView from './features/reports/views/CentroReportesView';
import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './components/layout/MainLayout';
import DashboardView from './features/dashboard/views/DashboardView';
import LiderTecnicoDashboardView from './features/dashboard/views/LiderTecnicoDashboardView';
import CapacityCalculatorView from './features/dashboard/views/CapacityCalculatorView';
import DeveloperView from './features/dashboard/views/DeveloperView';
import DailyFocusView from './features/dashboard/views/DailyFocusView';
import DevWorkloadView from './features/dashboard/views/DevWorkloadView';
import DevAlertsView from './features/dashboard/views/DevAlertsView';
import ActivityHistoryView from './features/dashboard/views/ActivityHistoryView';
import TeamDevScorecardsView from './features/dashboard/views/TeamDevScorecardsView';
import TeamMatrixView from './features/dashboard/views/TeamMatrixView';
import SprintHealthView from './features/dashboard/views/SprintHealthView';
import AlertsCenterView from './features/dashboard/views/AlertsCenterView';
import SystemSyncTab from './features/sync/views/SystemSyncTab';
import AdminUsuariosView from './features/users/views/AdminUsuariosView';
import ProyectosDashboardView from './features/projects/views/ProyectosDashboardView';
import JqlConsultasView from './features/jql/views/JqlConsultasView';
import LoginView from './features/auth/views/LoginView';
import { useAuth, AuthProvider, normalizeRole } from './features/auth/context/AuthContext';
import { jiraService, projectService } from './services/api';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: 'red', color: 'white', zIndex: 9999, position: 'relative' }}>
          <h2>Algo salió mal en el renderizado:</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          <button onClick={() => this.setState({ hasError: false })}>Intentar de nuevo</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainAppContent() {
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // Contexto de autenticación
  // Persistir pestaña activa actual en localStorage para no volver al inicio al hacer Refresh
  const [activeTab, setActiveTabState] = useState(() => {
    try {
      const savedTab = localStorage.getItem('mchav_active_tab');
      return savedTab || 'dashboard';
    } catch (e) {
      return 'dashboard';
    }
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('mchav_active_tab', tab);
    } catch (e) { }
  };

  // Persistir estado de Modo Blanco / Oscuro en localStorage para que se mantenga al recargar
  const [isDarkMode, setIsDarkModeState] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('mchav_is_dark_mode');
      return savedTheme !== null ? JSON.parse(savedTheme) : true;
    } catch (e) {
      return true;
    }
  });

  const setIsDarkMode = (valOrFn) => {
    setIsDarkModeState((prev) => {
      const nextVal = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      try {
        localStorage.setItem('mchav_is_dark_mode', JSON.stringify(nextVal));
      } catch (e) { }
      return nextVal;
    });
  };

  // Guardar pestaña activa en localStorage al cambiar
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('mchav_active_tab', activeTab);
    }
  }, [activeTab]);

  // Filtro de rango de fechas activo
  const [dateFilter, setDateFilter] = useState({ label: 'Todos los tiempos', key: 'all' });

  // Estados de datos generales y métricas
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState(null);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  // Estados para Proyectos, Sprints y KPIs (con persistencia de proyecto seleccionado)
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectIdState] = useState(() => {
    try {
      return localStorage.getItem('mchav_selected_project_id') || null;
    } catch (e) {
      return null;
    }
  });

  const setSelectedProjectId = (projId) => {
    setSelectedProjectIdState(projId);
    try {
      if (projId) localStorage.setItem('mchav_selected_project_id', projId);
    } catch (e) { }
  };

  const [sprints, setSprints] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const [alerts, setAlerts] = useState([]); // Almacena la lista de alertas activas del sistema


  // Inicializar o redirigir pestaña según el rol al autenticar (respetando la pestaña guardada)
  useEffect(() => {
    if (!user?.rol) return;
    const role = normalizeRole(user.rol);
    const savedTab = localStorage.getItem('mchav_active_tab');

    if (role === 'DEVELOPER') {
      const devTabs = ['developer', 'daily_focus', 'dev_workload', 'dev_alerts', 'alerts_center', 'activity_history'];
      if (!devTabs.includes(activeTab)) {
        const nextTab = devTabs.includes(savedTab) ? savedTab : 'developer';
        setActiveTab(nextTab);
      }
    } else {
      // Si es ADMIN o MANAGER y está en una vista exclusiva de DEVELOPER, enviarlo a dashboard
      const exclusiveDevTabs = ['developer', 'daily_focus', 'dev_workload', 'dev_alerts', 'activity_history'];
      if (exclusiveDevTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [user?.rol]);

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
        setMetricsError("Error al conectar con el servidor backend de métricas.");
        setMetricsLoading(false);
      });
  };

  const fetchProjects = () => {
    projectService.getProjects()
      .then(data => {
        setProjects(data);
        if (data.length > 0) {
          const projectExists = data.some(p => String(p.id_proyecto) === String(selectedProjectId));
          if (!selectedProjectId || !projectExists) {
            setSelectedProjectId(data[0].id_proyecto);
          }
        }
      })
      .catch(err => {
        console.error("Error fetching projects:", err);
      });
  };

  const fetchSprints = (projId) => {
    projectService.getSprints(projId)
      .then(data => {
        setSprints(data);
      })
      .catch(err => {
        console.error("Error fetching sprints:", err);
      });
  };

  const fetchKpis = (projId, sprintId) => {
    setKpisLoading(true);
    projectService.getKpis(projId, sprintId)
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

  const evaluateAlerts = (genMetrics, projKpis) => {
    const newAlerts = [];
    if (projKpis?.lead_time_medio_dias > 14) {
      newAlerts.push({ id: 1, type: 'critical', text: `Lead Time elevado (${projKpis.lead_time_medio_dias} días) en ${projKpis.proyecto_id}` });
    }
    if (genMetrics?.proyectos_totales > 0) {
      newAlerts.push({ id: 2, type: 'info', text: `Sincronización activa con Jira Cloud` });
    }
    setAlerts(newAlerts);
  };


  const handleSyncNow = () => {
    setSyncLoading(true);
    jiraService.triggerSync()
      .then(res => {
        setSyncSuccessMsg("Sincronización completada exitosamente.");
        fetchMetrics();
        if (selectedProjectId) {
          fetchKpis(selectedProjectId, null);
        }
        setTimeout(() => setSyncSuccessMsg(''), 5000);
      })
      .catch(err => {
        console.error("Error triggering sync:", err);
      })
      .finally(() => {
        setSyncLoading(false);
      });
  };

  // Filtrar KPIs según el rango de fecha seleccionado (los Hooks siempre deben ir al inicio del componente)
  const filteredKpis = useMemo(() => {
    if (!kpis) return null;
    return kpis;
  }, [kpis]);

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
      case 'proyectos':
        return {
          title: "Proyectos y Equipos",
          subtitle: "Estructura de equipos, líderes técnicos y desarrolladores asignados."
        };
      case 'developer':
        return {
          title: "Mi Trabajo ",
          subtitle: "Consola interactiva de trabajo individual y métricas de carga de trabajo."
        };
      case 'daily_focus':
        return {
          title: "Mi Agenda de Hoy",
          subtitle: "Tu jornada de ejecución: lo que tienes que hacer hoy."
        };
      case 'dev_workload':
        return {
          title: "Plan de Trabajo",
          subtitle: "Visión general, backlog y planificación de todas tus tareas."
        };
      case 'dev_alerts':
        return {
          title: "Mis Bloqueos y Alertas ",
          subtitle: "Detector automático de inactividad, multitarea excesiva y cuellos de botella."
        };
      case 'alerts_center':
        return {
          title: "Centro de Actividad ",
          subtitle: "Consola centralizada de notificaciones, solicitudes de equipo y seguimiento de incidencias."
        };
      case 'activity_history':
        return {
          title: "Historial de Actividad y Logros ",
          subtitle: "Cronología de cambios para Standups y medallas de desempeño."
        };
      case 'team_devs':
        return {
          title: "Rendimiento por Desarrollador ",
          subtitle: "Supervisación y auditoría individual por integrante del equipo (Fase 5)."
        };
      case 'team_matrix':
        return {
          title: "Matriz Comparativa de Equipo & Performance Score ",
          subtitle: "Evaluación de rendimiento en 4 cuadrantes (Estrella, Metódico, Alto Volumen, Atascado)."
        };
      case 'sprint_health':
        return {
          title: "Salud del Sprint & Predictibilidad ",
          subtitle: "Cumplimiento de compromisos, análisis de Scope Creep y Eficiencia del Flujo de Trabajo."
        };
      case 'tasks':
        return {
          title: "Gestión de Tareas y Burndown ",
          subtitle: "Seguimiento al esfuerzo restante, historiales de usuario y tipos de incidencias."
        };
      case 'history':
        return {
          title: "Histórico General de Rendimiento ",
          subtitle: "Análisis acumulado de velocidad por sprint y tendencias de entrega."
        };
      case 'usuarios':
        return {
          title: "Gestión de Usuarios y Roles (RBAC) ",
          subtitle: "Control de accesos y administración de roles del equipo."
        };
      case 'jql_queries':
        return {
          title: "Consola de Consultas JQL & Sintaxis ",
          subtitle: "Validador sintáctico en tiempo real, ejecutor de consultas JQL y diccionario de campos (Solo Admin)."
        };
      case 'sincronizacion':
      case 'reports_center':
        return {
          title: 'Centro de Análisis y Generación de Reportes',
          subtitle: 'Módulo integral para generación de reportes en vivo y auditoría de historiales inmutables.'
        };
        return {
          title: "Auditoría de ETL y Schedulers ",
          subtitle: "Historial de sincronización, programaciones CRON y tareas automáticas."
        };

      case 'dashboard':
      default:
        return normalizeRole(user?.rol) === 'MANAGER'
          ? {
            title: "Panel Operativo del Líder Técnico ",
            subtitle: "Predictibilidad del sprint, velocidad del equipo y resolución de bloqueos."
          }
          : {
            title: "Panel Ejecutivo de Gobernanza ",
            subtitle: "Resumen de usuarios activos, salud de integraciones y estado del sistema."
          };
    }
  };

  const headerDetails = getTabHeaderDetails();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Cargando MCHAV Analytics...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      projects={projects}
      selectedProjectId={selectedProjectId}
      setSelectedProjectId={['dashboard', 'tasks', 'history', 'developer', 'daily_focus', 'dev_workload', 'dev_alerts', 'activity_history', 'team_devs'].includes(activeTab) ? setSelectedProjectId : null}
      syncLoading={syncLoading}
      handleSyncNow={handleSyncNow}
      topbarTitle={headerDetails.title}
      topbarSubtitle={headerDetails.subtitle}
      dateFilter={dateFilter}
      setDateFilter={setDateFilter}
      alerts={alerts}
      setAlerts={setAlerts}
    >
      {(activeTab === 'dashboard' || activeTab === 'tasks' || activeTab === 'history') && (
        normalizeRole(user?.rol) === 'MANAGER' ? (
          <ProyectosDashboardView userProfile={user} />
        ) : (
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
        )
      )}

      {activeTab === 'capacity_calculator' && (
        <CapacityCalculatorView isDarkMode={isDarkMode} />
      )}

      {activeTab === 'developer' && (
        <ErrorBoundary>
          <DeveloperView
            kpis={filteredKpis}
            projects={projects}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            syncSuccessMsg={syncSuccessMsg}
            alerts={alerts}
            onNavigateToAlerts={() => setActiveTab('alerts_center')}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        </ErrorBoundary>
      )}

      {activeTab === 'daily_focus' && (
        <DailyFocusView
          projects={projects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          syncSuccessMsg={syncSuccessMsg}
        />
      )}

      {activeTab === 'dev_workload' && (
        <DevWorkloadView
          projects={projects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          syncSuccessMsg={syncSuccessMsg}
        />
      )}

      {activeTab === 'dev_alerts' && (
        <DevAlertsView
          projects={projects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          syncSuccessMsg={syncSuccessMsg}
        />
      )}

      {activeTab === 'activity_history' && (
        <ActivityHistoryView
          projects={projects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          syncSuccessMsg={syncSuccessMsg}
        />
      )}

      {activeTab === 'team_devs' && (
        <TeamDevScorecardsView
          selectedProjectId={selectedProjectId}
          onNavigateToMatrix={() => setActiveTab('team_matrix')}
          onNavigateToHealth={() => setActiveTab('sprint_health')}
          onNavigateToAlerts={() => setActiveTab('alerts_center')}
        />
      )}

      {activeTab === 'team_matrix' && (
        <TeamMatrixView
          selectedProjectId={selectedProjectId}
          isDarkMode={isDarkMode}
          onSelectDevForScorecard={(assigneeId) => {
            setActiveTab('team_devs');
          }}
          onNavigateToHealth={() => {
            setActiveTab('sprint_health');
          }}
        />
      )}

      {activeTab === 'sprint_health' && (
        <SprintHealthView
          selectedProjectId={selectedProjectId}
          isDarkMode={isDarkMode}
          onNavigateToMatrix={() => setActiveTab('team_matrix')}
          onNavigateToScorecards={() => setActiveTab('team_devs')}
        />
      )}

      {activeTab === 'alerts_center' && (
        <AlertsCenterView selectedProjectId={selectedProjectId} />
      )}

      {activeTab === 'sincronizacion' && (
        <SystemSyncTab />
      )}

      {activeTab === 'reports_center' && (
        <CentroReportesView selectedProjectId={selectedProjectId} />
      )}


      {activeTab === 'proyectos' && (
        <ProyectosDashboardView />
      )}

      {activeTab === 'usuarios' && (
        <AdminUsuariosView />
      )}

      {activeTab === 'jql_queries' && (
        <JqlConsultasView />
      )}
    </MainLayout>
  );
}

// Instancia global de TanStack Query Client con staleTime de 5 minutos (Item 3)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de caché
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;