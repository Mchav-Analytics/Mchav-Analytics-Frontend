// ============================================================================
// APLICACIÓN PRINCIPAL (APP.JSX) — INTEGRACIÓN CON BROWSERROUTER
// ============================================================================
// Enlaza el proveedor de autenticación (AuthProvider) y el enrutador principal (BrowserRouter)
// para resolver errores de hooks de navegación en el navegador.

import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './components/layout/MainLayout';
import DashboardView from './features/dashboard/views/DashboardView';
import DeveloperView from './features/dashboard/views/DeveloperView';
import DailyFocusView from './features/dashboard/views/DailyFocusView';
import DevAlertsView from './features/dashboard/views/DevAlertsView';
import ActivityHistoryView from './features/dashboard/views/ActivityHistoryView';
import TeamDevScorecardsView from './features/dashboard/views/TeamDevScorecardsView';
import TeamMatrixView from './features/dashboard/views/TeamMatrixView';
import SprintHealthView from './features/dashboard/views/SprintHealthView';
import AlertsCenterView from './features/dashboard/views/AlertsCenterView';
import SystemSyncTab from './features/sync/views/SystemSyncTab';
import AdminUsuariosView from './features/users/views/AdminUsuariosView';
import ProyectosDashboardView from './features/projects/views/ProyectosDashboardView';
import LoginView from './features/auth/views/LoginView';
import { useAuth, AuthProvider, normalizeRole } from './features/auth/context/AuthContext';
import { jiraService, projectService } from './services/api';

function MainAppContent() {
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // Contexto de autenticación
  const [activeTab, setActiveTab] = useState('dashboard');           // Pestaña activa actual (por defecto Dashboard principal)
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


  // Inicializar o redirigir pestaña según el rol al autenticar (sin bucle de re-render)
  useEffect(() => {
    if (!user?.rol) return;
    const role = normalizeRole(user.rol);
    if (role === 'DEVELOPER' && !['developer', 'daily_focus', 'dev_alerts', 'activity_history'].includes(activeTab)) {
      setActiveTab('developer');
    } else if ((role === 'MANAGER' || role === 'ADMIN') && ['developer', 'daily_focus', 'dev_alerts', 'activity_history'].includes(activeTab)) {
      setActiveTab('dashboard');
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
        if (data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data[0].id_proyecto);
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
          title: "Espacio de Trabajo del Desarrollador ",
          subtitle: "Dashboard principal de métricas personales y entregas asignadas."
        };
      case 'daily_focus':
        return {
          title: "Enfoque y Prioridades de Hoy ",
          subtitle: "Jerarquización de atención diaria y Asistente Inteligente AI Dev Coach."
        };
      case 'dev_alerts':
        return {
          title: "Mis Bloqueos y Alertas ",
          subtitle: "Detector automático de inactividad, multitarea excesiva y cuellos de botella."
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
      case 'sincronizacion':
        return {
          title: "Auditoría de ETL y Schedulers ",
          subtitle: "Historial de sincronización, programaciones CRON y tareas automáticas."
        };
      case 'health':
        return {
          title: "Monitoreo & Salud del Sistema ",
          subtitle: "Telemetría en tiempo real, rendimiento de API y pruebas de carga."
        };
      case 'dashboard':
      default:
        return {
          title: "Resumen",
          subtitle: "Aquí tienes un panorama general de tus proyectos."
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
      setSelectedProjectId={['dashboard', 'tasks', 'history', 'developer', 'daily_focus', 'dev_alerts', 'activity_history', 'team_devs'].includes(activeTab) ? setSelectedProjectId : null}
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
          onNavigateToAlerts={() => setActiveTab('alerts_center')}
        />
      )}

      {activeTab === 'daily_focus' && (
        <DailyFocusView
          selectedProjectId={selectedProjectId}
        />
      )}

      {activeTab === 'dev_alerts' && (
        <DevAlertsView
          selectedProjectId={selectedProjectId}
        />
      )}

      {activeTab === 'activity_history' && (
        <ActivityHistoryView
          selectedProjectId={selectedProjectId}
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
          onNavigateToMatrix={() => setActiveTab('team_matrix')}
          onNavigateToScorecards={() => setActiveTab('team_devs')}
        />
      )}

      {activeTab === 'alerts_center' && (
        <AlertsCenterView
          selectedProjectId={selectedProjectId}
        />
      )}

      {activeTab === 'sincronizacion' && (
        <SystemSyncTab />
      )}

      {activeTab === 'health' && (
        <SystemSyncTab />
      )}

      {activeTab === 'proyectos' && (
        <ProyectosDashboardView />
      )}

      {activeTab === 'usuarios' && (
        <AdminUsuariosView />
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