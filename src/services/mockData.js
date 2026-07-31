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
  }
};
