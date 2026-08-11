// ============================================================================
// MOCK DATA — DATOS DE PRUEBA SIMULADOS PARA EL DESARROLLO EN FRONTEND
// ============================================================================
// Este archivo contiene objetos y funciones ficticias para simular la respuesta
// del servidor FastAPI cuando el modo offline / mock está activado (USE_MOCK_DATA = true).

// 1. Objeto de usuario simulado que representa la sesión del usuario Administrador
export const mockUserAdmin = {
  id_usuario: 1,                          // Identificador único del usuario Administrador
  nombre: "Valka Hoyos",                 // Nombre completo que se muestra en la interfaz
  email: "vhoyos@mchav.com",              // Correo electrónico del usuario Administrador
  rol: "ADMIN",                           // Rol asignado: ADMINISTRADOR (Acceso Total)
  avatar_url: null,                       // URL de avatar personalizado (opcional)
  jira_connected: true                    // Estado de vinculación con Atlassian Jira
};

// 1b. Objeto de usuario simulado que representa la sesión del Desarrollador
export const mockUserDeveloper = {
  id_usuario: 2,                          // Identificador único del usuario Desarrollador
  nombre: "Clara Gomez",                 // Nombre completo que se muestra en la interfaz
  email: "cgomez@mchav.com",                 // Correo electrónico del usuario Desarrollador
  rol: "DEVELOPER",                       // Rol asignado: DESARROLLADOR (Acceso Restringido y Vista Propia)
  avatar_url: null,                       // URL de avatar personalizado (opcional)
  jira_connected: true                    // Estado de vinculación con Atlassian Jira
};

// 1c. Objeto de usuario simulado que representa la sesión del Manager (Líder Técnico)
export const mockUserManager = {
  id_usuario: 3,                          // Identificador único del usuario Manager
  nombre: "Andrés Felipe Torres",        // Nombre completo que se muestra en la interfaz
  email: "aftorres@mchav.com",            // Correo electrónico del usuario Manager
  rol: "MANAGER",                         // Rol asignado: MANAGER (Acceso Restringido y Vista Propia)
  avatar_url: null,                       // URL de avatar personalizado (opcional)
  jira_connected: true                    // Estado de vinculación con Atlassian Jira
};

export const mockUser = mockUserAdmin;

// 2. Credenciales simuladas de integración con Jira
export const mockJiraCredentials = {
  jira_url: "https://mchav-analytics.atlassian.net", // Dominio de la instancia Jira
  jira_email: "vhoyos@mchav.com",                     // Correo registrado en Atlassian
  api_token_configured: true                           // Indica si el API Token está activo
};

// 3. Resumen de métricas generales mostradas en las tarjetas del Dashboard
export const mockGeneralMetrics = {
  active_projects: 3,       // Cantidad de proyectos activos
  completed_tickets: 64,    // Total de tickets resueltos
  in_progress_tickets: 14,  // Tickets actualmente en desarrollo
  critical_bugs: 2          // Errores críticos pendientes
};

// 4. Lista de proyectos disponibles para el selector desplegable (ProjectPicker)
export const mockProjects = [
  { id_proyecto: "PROJ-01", nombre: "MCHAV Analytics SPA", clave: "MCHAV" }, // Proyecto Principal
  { id_proyecto: "PROJ-02", nombre: "Portal CRM Clientes", clave: "CRM" },    // Proyecto Secundario 1
  { id_proyecto: "PROJ-03", nombre: "API Gateway Microservicios", clave: "GW" } // Proyecto Secundario 2
];

// 5. Lista de Sprints simulados para filtrar KPIs en el Dashboard
export const mockSprints = [
  { id_sprint: "SPRINT-101", nombre: "Sprint 1 - Autenticación y Base", estado: "CLOSED" }, // Sprint finalizado
  { id_sprint: "SPRINT-102", nombre: "Sprint 2 - Dashboard & KPIs", estado: "ACTIVE" },    // Sprint actual en curso
  { id_sprint: "SPRINT-103", nombre: "Sprint 3 - Filtros y Exportación", estado: "FUTURE" } // Sprint futuro planificado
];

// 6. Lista de métricas e indicadores de rendimiento calculados (KPIs) por Sprint
export const mockKpis = [
  {
    id_kpi: 1,
    id_proyecto: "PROJ-01",
    id_sprint: "SPRINT-101",
    sprintName: "Sprint 1",
    fecha_calculo: "2026-07-10",
    lead_time_promedio_dias: 6.4,
    cycle_time_promedio_dias: 3.2,
    throughput_issues: 18,
    velocity_total_sp: 42,
    velocity_promedio_historico: 38.0
  },
  {
    id_kpi: 2,
    id_proyecto: "PROJ-01",
    id_sprint: "SPRINT-102",
    sprintName: "Sprint 2 (Actual)",
    fecha_calculo: "2026-07-24",
    lead_time_promedio_dias: 5.1,
    cycle_time_promedio_dias: 2.4,
    throughput_issues: 22,
    velocity_total_sp: 48,
    velocity_promedio_historico: 40.0
  }
];

// 7. Lista de logs de auditoría de sincronizaciones con Jira
export const mockSyncLogs = [
  {
    id_log: 101,
    fecha_ejecucion: "2026-07-27 10:30:00",
    tipo_sincronizacion: "MANUAL",
    resultado: "SUCCESS",
    issues_procesados: 45,
    tiempo_ejecucion_segundos: 14,
    ejecutado_por: "Valka Hoyos (Admin)"
  },
  {
    id_log: 100,
    fecha_ejecucion: "2026-07-26 23:00:00",
    tipo_sincronizacion: "AUTOMATIC",
    resultado: "SUCCESS",
    issues_procesados: 12,
    tiempo_ejecucion_segundos: 8,
    ejecutado_por: "Sistema (CRON)"
  }
];

// Helper asíncrono para emular el retraso natural de la red en milisegundos (0 ms para ejecucion instantanea)
const delay = () => Promise.resolve();

// ============================================================================
// SERVICIOS MOCK (Simulan las llamadas HTTP a la API REST)
// ============================================================================

export const mockAuthService = {
  // Simula la obtención de la URL de redirección a Jira
  getLoginUrl() {
    return "#";
  },
  // Simula la consulta del usuario en sesión desde el localStorage del navegador
  async getCurrentUser() {
    await delay(200);
    const sessionUser = localStorage.getItem('mock_user_session'); // Obtiene la sesión guardada en localStorage
    if (!sessionUser) {
      throw { response: { status: 401, data: { detail: "No hay sesión activa" } } };
    }
    return JSON.parse(sessionUser); // Devuelve el objeto JavaScript del usuario
  },
  // Simula el inicio de sesión exitoso distinguiendo entre Administrador, Desarrollador y Manager
  async loginMock(credentials) {
    await delay(400);
    const email = credentials?.email?.toLowerCase();
    const isDev = email === 'dev@mchav.com' || email === 'cgomez@mchav.com' || credentials?.role === 'DEVELOPER';
    const isManager = email === 'aftorres@mchav.com' || credentials?.role === 'MANAGER';

    // Seleccionar datos mock según el perfil solicitado
    let userToSave = mockUserAdmin;
    if (isDev) {
      userToSave = mockUserDeveloper;
    } else if (isManager) {
      userToSave = mockUserManager;
    }

    localStorage.setItem('mock_user_session', JSON.stringify(userToSave)); // Guarda la sesión localmente
    return userToSave; // Retorna los datos del usuario logueado
  },
  // Simula la destrucción de la sesión al hacer clic en "Cerrar Sesión"
  async logoutMock() {
    await delay(150);
    localStorage.removeItem('mock_user_session'); // Elimina la sesión de localStorage
    return { message: "Sesión cerrada correctamente" };
  },
  // Simula la obtención de credenciales Jira guardadas
  async getJiraCredentials() {
    await delay(200);
    return mockJiraCredentials;
  },
  // Simula el guardado de credenciales Jira en la base de datos
  async saveJiraCredentials(payload) {
    await delay(300);
    return { ...mockJiraCredentials, ...payload };
  }
};

export const mockJiraService = {
  // Simula la llamada GET /api/jira/metrics
  async getMetrics() {
    await delay(300);
    return mockGeneralMetrics;
  },
  // Simula la llamada POST /api/jira/sync
  async triggerSync() {
    await delay(400);
    return { message: "Sincronización simulada iniciada" };
  },
  // Simula la llamada GET /api/jira/sync/logs
  async getSyncLogs() {
    await delay(250);
    return mockSyncLogs;
  }
};

export const mockProjectService = {
  // Simula la llamada GET /api/projects
  async getProjects() {
    await delay(200);
    return mockProjects;
  },
  // Simula la llamada GET /api/projects/{projectId}/sprints
  async getSprints(projectId) {
    await delay(250);
    return mockSprints;
  },
  // Simula la llamada GET /api/projects/{projectId}/kpis
  async getKpis(projectId, sprintId = null) {
    await delay(300);
    return mockKpis;
  },
  // Simula los estados de workflow en Jira
  async getStatuses(projectId) {
    await delay(200);
    return ["To Do", "In Progress", "In Review", "Done"];
  },
  // Simula los mapeos de estados entre Jira y MCHAV
  async getMappings(projectId) {
    await delay(200);
    return [];
  },
  // Simula la actualización de mapeos
  async saveMappings(projectId, mappingsData) {
    await delay(300);
    return { success: true };
  },
  // Simula el detalle de tickets para el modal de Drill-down (HU-015)
  async getKpiIssuesDetail(projectId, params = {}) {
    await delay(200);
    const mockIssues = [
      {
        id_jira: "101",
        key_issue: "MCHAV-101",
        summary: "Configuración de autenticación OAuth 2.0 y JWT",
        status_actual: "Done",
        story_points: 5.0,
        created_at: "2026-07-10T09:00:00Z",
        resolved_at: "2026-07-14T17:30:00Z",
        lead_time_days: 4.35,
        cycle_time_days: 2.15,
        sprint_nombre: "Sprint 2 (Actual)"
      },
      {
        id_jira: "102",
        key_issue: "MCHAV-102",
        summary: "Integración de API Rest v3 de Jira para extracción de tableros",
        status_actual: "Done",
        story_points: 8.0,
        created_at: "2026-07-12T11:00:00Z",
        resolved_at: "2026-07-18T16:00:00Z",
        lead_time_days: 6.21,
        cycle_time_days: 3.80,
        sprint_nombre: "Sprint 2 (Actual)"
      },
      {
        id_jira: "103",
        key_issue: "MCHAV-103",
        summary: "Desarrollo del motor analítico de cálculo de Lead Time y Cycle Time",
        status_actual: "In Progress",
        story_points: 5.0,
        created_at: "2026-07-15T14:20:00Z",
        resolved_at: null,
        lead_time_days: 0.0,
        cycle_time_days: 0.0,
        sprint_nombre: "Sprint 2 (Actual)"
      },
      {
        id_jira: "104",
        key_issue: "MCHAV-104",
        summary: "Creación de la interfaz gráfica interactiva del Dashboard en React",
        status_actual: "Done",
        story_points: 3.0,
        created_at: "2026-07-16T10:00:00Z",
        resolved_at: "2026-07-19T11:00:00Z",
        lead_time_days: 3.04,
        cycle_time_days: 1.50,
        sprint_nombre: "Sprint 2 (Actual)"
      },
      {
        id_jira: "105",
        key_issue: "MCHAV-105",
        summary: "Corrección de bug en cálculo de promedios históricos de velocidad",
        status_actual: "Done",
        story_points: 2.0,
        created_at: "2026-07-18T08:30:00Z",
        resolved_at: "2026-07-20T12:00:00Z",
        lead_time_days: 2.14,
        cycle_time_days: 1.10,
        sprint_nombre: "Sprint 2 (Actual)"
      }
    ];

    return {
      proyecto_id: projectId || "PROJ-01",
      total_issues: mockIssues.length,
      issues: mockIssues
    };
  }
};

// 8. Lista de tareas programadas (Schedulers / Cron Jobs)
export const mockSchedulerJobs = [
  {
    id: "job-etl-jira",
    name: "Extracción Incremental Jira (ETL)",
    description: "Extrae proyectos, sprints, tickets e historiales de cambios desde Jira Cloud.",
    frequency: "Diaria (02:00 AM UTC)",
    cronExpression: "0 2 * * *",
    status: "ACTIVE",
    lastRun: "2026-08-05 02:00:00",
    nextRun: "2026-08-06 02:00:00",
    successRate: 99.4,
    retriesCount: 0,
    lastDurationSec: 42
  },
  {
    id: "job-recalc-kpi",
    name: "Recálculo Masivo de KPIs y Velocidad",
    description: "Consolida Lead Time, Cycle Time, Velocity y Throughput por Sprint y Desarrollador.",
    frequency: "Semanal (Domingos 23:50 PM UTC)",
    cronExpression: "50 23 * * 0",
    status: "ACTIVE",
    lastRun: "2026-08-03 23:50:00",
    nextRun: "2026-08-10 23:50:00",
    successRate: 100.0,
    retriesCount: 0,
    lastDurationSec: 18
  },
  {
    id: "job-log-cleanup",
    name: "Archivado & Mantenimiento de Logs",
    description: "Depura logs de auditoría de sincronización antiguos y optimiza la base de datos.",
    frequency: "Mensual (Día 1 04:00 AM UTC)",
    cronExpression: "0 4 1 * *",
    status: "ACTIVE",
    lastRun: "2026-08-01 04:00:00",
    nextRun: "2026-09-01 04:00:00",
    successRate: 98.0,
    retriesCount: 1,
    lastDurationSec: 12
  }
];

// 9. Métricas de salud del sistema y rendimiento de API
export const mockHealthMetrics = {
  avgLatencyMs: 138,
  p95LatencyMs: 185,
  p99LatencyMs: 240,
  throughputReqMin: 420,
  errorRatePct: 0.15,
  cpuUsagePct: 24,
  memoryUsagePct: 42,
  cacheHitRatioPct: 91.5,
  status: "HEALTHY"
};

export const mockAutomationService = {
  async getSchedulerJobs() {
    await delay(250);
    return mockSchedulerJobs;
  },
  async toggleJobState(jobId) {
    await delay(300);
    const job = mockSchedulerJobs.find(j => j.id === jobId);
    if (job) {
      job.status = job.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    }
    return { success: true, job };
  },
  async triggerJobManual(jobId) {
    await delay(400);
    const job = mockSchedulerJobs.find(j => j.id === jobId);
    if (job) {
      job.lastRun = new Date().toISOString().replace('T', ' ').slice(0, 19);
    }
    return { message: `Job ${jobId} ejecutado manualmente con éxito.`, job };
  },
  async getHealthMetrics() {
    await delay(200);
    return mockHealthMetrics;
  }
};

