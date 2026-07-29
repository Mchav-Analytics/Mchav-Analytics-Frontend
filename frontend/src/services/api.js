import axios from 'axios';

// =============================================================================
// CONFIGURACIÓN DE MODO MOCK / SIN BACKEND
// Cambia a 'false' si deseas conectarte a la API real del backend.
// =============================================================================
export const USE_MOCK_DATA = true;

// Configurar Axios para enviar cookies en todas las peticiones (usado en modo real)
axios.defaults.withCredentials = true;

export const BACKEND_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BACKEND_URL,
});

// =============================================================================
// BASE DE DATOS DE SIMULACIÓN (MOCK DATA)
// =============================================================================

// Cambia 'nombre_rol' a 'Líder Técnico' o 'Desarrollador' para probar las vistas por rol.
let mockCurrentUser = {
  id_usuario: 1,
  email: "stephanyleon326@gmail.com",
  nombre: "Stephany Leon",
  rol: "Administrador", 
  activo: true,
  api_token_vinculado: true
};

const mockProjects = [
  { id_proyecto: "10033", key_proyecto: "PASD", nombre: "Prueba ASD", estado: "Active" },
  { id_proyecto: "10034", key_proyecto: "MCHAV", nombre: "MCHAV Analytics", estado: "Active" }
];

const mockSprints = {
  "10033": [
    { id_sprint: "SP_1", nombre: "Sprint 1", estado: "CLOSED", fecha_inicio: "2026-06-01T08:00:00Z", fecha_fin: "2026-06-15T18:00:00Z" },
    { id_sprint: "SP_2", nombre: "Sprint 2", estado: "CLOSED", fecha_inicio: "2026-06-16T08:00:00Z", fecha_fin: "2026-06-30T18:00:00Z" },
    { id_sprint: "SP_3", nombre: "Sprint 3", estado: "CLOSED", fecha_inicio: "2026-07-01T08:00:00Z", fecha_fin: "2026-07-15T18:00:00Z" },
    { id_sprint: "SP_4", nombre: "Sprint 4 (Actual)", estado: "ACTIVE", fecha_inicio: "2026-07-16T08:00:00Z", fecha_fin: "2026-07-30T18:00:00Z" }
  ],
  "10034": [
    { id_sprint: "SP_M1", nombre: "Sprint 1 MCHAV", estado: "CLOSED", fecha_inicio: "2026-06-01T08:00:00Z", fecha_fin: "2026-06-15T18:00:00Z" },
    { id_sprint: "SP_M2", nombre: "Sprint 2 (Actual)", estado: "ACTIVE", fecha_inicio: "2026-07-01T08:00:00Z", fecha_fin: "2026-07-30T18:00:00Z" }
  ]
};

const mockIssues = {
  "10033": {
    "SP_1": [
      { key: "PA-101", summary: "Establecer conexión inicial a BD", status: "Done", type: "Story", priority: "High", assignee: "Stephany Leon", lead_time: 4.5, cycle_time: 2.1 },
      { key: "PA-102", summary: "Configuración del entorno Docker", status: "Done", type: "Story", priority: "Medium", assignee: "Carlos Perez", lead_time: 5.0, cycle_time: 3.5 },
      { key: "PA-103", summary: "Bug: Error al conectar PostgreSQL", status: "Done", type: "Bug", priority: "Highest", assignee: "Stephany Leon", lead_time: 1.2, cycle_time: 0.8 }
    ],
    "SP_2": [
      { key: "PA-104", summary: "Diseñar estructura base de FastAPI", status: "Done", type: "Story", priority: "High", assignee: "Stephany Leon", lead_time: 5.2, cycle_time: 3.0 },
      { key: "PA-105", summary: "Implementación del controlador de proyectos", status: "Done", type: "Story", priority: "Medium", assignee: "Carlos Perez", lead_time: 6.8, cycle_time: 4.2 },
      { key: "PA-106", summary: "Configurar logs de auditoría en backend", status: "Done", type: "Story", priority: "Low", assignee: "Stephany Leon", lead_time: 3.0, cycle_time: 1.5 }
    ],
    "SP_3": [
      { key: "PA-107", summary: "Crear lógica de cálculo de KPIs en backend", status: "Done", type: "Story", priority: "High", assignee: "Carlos Perez", lead_time: 7.0, cycle_time: 4.5 },
      { key: "PA-108", summary: "Endpoint para obtener métricas históricas", status: "Done", type: "Story", priority: "High", assignee: "Stephany Leon", lead_time: 5.5, cycle_time: 3.2 },
      { key: "PA-109", summary: "Crear migración Alembic inicial", status: "Done", type: "Story", priority: "Medium", assignee: "Carlos Perez", lead_time: 4.0, cycle_time: 2.0 }
    ],
    "SP_4": [
      { key: "PA-110", summary: "Maquetación del Dashboard en React", status: "Done", type: "Story", priority: "High", assignee: "Stephany Leon", lead_time: 3.8, cycle_time: 2.2 },
      { key: "PA-111", summary: "Gráficos interactivos de Lead y Cycle Time", status: "In Progress", type: "Story", priority: "High", assignee: "Carlos Perez", lead_time: 6.5, cycle_time: 5.8 }, // Bottleneck!
      { key: "PA-112", summary: "Bug crítico: Fuga de memoria en el login", status: "To Do", type: "Bug", priority: "Highest", assignee: "Stephany Leon", lead_time: 1.5, cycle_time: 0.0 }, // Critical bug!
      { key: "PA-113", summary: "Crear panel de alertas por umbrales", status: "In Progress", type: "Story", priority: "Medium", assignee: "Stephany Leon", lead_time: 2.1, cycle_time: 1.5 },
      { key: "PA-114", summary: "Bug: Estilos de la tabla rotos en Safari", status: "To Do", type: "Bug", priority: "Medium", assignee: "Carlos Perez", lead_time: 0.5, cycle_time: 0.0 }
    ]
  },
  "10034": {
    "SP_M1": [
      { key: "MH-201", summary: "Configuración inicial de Vite", status: "Done", type: "Story", priority: "High", assignee: "Carlos Perez", lead_time: 3.2, cycle_time: 1.8 }
    ],
    "SP_M2": [
      { key: "MH-202", summary: "Diseño del layout e identidad visual", status: "In Progress", type: "Story", priority: "High", assignee: "Stephany Leon", lead_time: 4.8, cycle_time: 3.5 },
      { key: "MH-203", summary: "Implementar autenticación por API Token", status: "To Do", type: "Story", priority: "Medium", assignee: "Carlos Perez", lead_time: 1.0, cycle_time: 0.0 }
    ]
  }
};

const mockKpis = {
  "10033": [
    // General / Promedio Histórico
    { id_sprint: null, sprintName: "Proyecto General", fecha_calculo: "2026-07-27T08:00:00Z", throughput_issues: 38, velocity_total_sp: 120, velocity_promedio_historico: 40, cycle_time_promedio_dias: 4.2, lead_time_promedio_dias: 7.1, defect_density: 0.12 },
    // Sprint 1
    { id_sprint: "SP_1", sprintName: "Sprint 1", fecha_calculo: "2026-06-15T18:00:00Z", throughput_issues: 10, velocity_total_sp: 32, velocity_promedio_historico: 32, cycle_time_promedio_dias: 5.5, lead_time_promedio_dias: 9.2, defect_density: 0.15 },
    // Sprint 2
    { id_sprint: "SP_2", sprintName: "Sprint 2", fecha_calculo: "2026-06-30T18:00:00Z", throughput_issues: 12, velocity_total_sp: 38, velocity_promedio_historico: 35, cycle_time_promedio_dias: 4.8, lead_time_promedio_dias: 8.0, defect_density: 0.10 },
    // Sprint 3
    { id_sprint: "SP_3", sprintName: "Sprint 3", fecha_calculo: "2026-07-15T18:00:00Z", throughput_issues: 16, velocity_total_sp: 50, velocity_promedio_historico: 40, cycle_time_promedio_dias: 3.5, lead_time_promedio_dias: 6.1, defect_density: 0.08 },
    // Sprint 4 (Actual)
    { id_sprint: "SP_4", sprintName: "Sprint 4 (Actual)", fecha_calculo: "2026-07-27T08:00:00Z", throughput_issues: 14, velocity_total_sp: 45, velocity_promedio_historico: 41, cycle_time_promedio_dias: 3.8, lead_time_promedio_dias: 6.5, defect_density: 0.11 }
  ],
  "10034": [
    // General
    { id_sprint: null, sprintName: "Proyecto General", fecha_calculo: "2026-07-27T08:00:00Z", throughput_issues: 22, velocity_total_sp: 70, velocity_promedio_historico: 35, cycle_time_promedio_dias: 3.2, lead_time_promedio_dias: 5.4, defect_density: 0.05 },
    // Sprint 1
    { id_sprint: "SP_M1", sprintName: "Sprint 1 MCHAV", fecha_calculo: "2026-06-15T18:00:00Z", throughput_issues: 12, velocity_total_sp: 38, velocity_promedio_historico: 38, cycle_time_promedio_dias: 3.4, lead_time_promedio_dias: 5.8, defect_density: 0.06 },
    // Sprint 2 (Actual)
    { id_sprint: "SP_M2", sprintName: "Sprint 2 (Actual)", fecha_calculo: "2026-07-27T08:00:00Z", throughput_issues: 10, velocity_total_sp: 32, velocity_promedio_historico: 35, cycle_time_promedio_dias: 3.0, lead_time_promedio_dias: 5.0, defect_density: 0.04 }
  ]
};

const mockStatuses = {
  "10033": ["To Do", "In Progress", "Code Review", "Done", "Closed"],
  "10034": ["Backlog", "Selected for Development", "In Progress", "QA", "Done"]
};

let mockMappings = {
  "10033": [
    { estado_jira: "To Do", estado_base: "TODO" },
    { estado_jira: "In Progress", estado_base: "IN_PROGRESS" },
    { estado_jira: "Code Review", estado_base: "IN_PROGRESS" },
    { estado_jira: "Done", estado_base: "DONE" },
    { estado_jira: "Closed", estado_base: "DONE" }
  ],
  "10034": [
    { estado_jira: "Backlog", estado_base: "TODO" },
    { estado_jira: "Selected for Development", estado_base: "TODO" },
    { estado_jira: "In Progress", estado_base: "IN_PROGRESS" },
    { estado_jira: "QA", estado_base: "IN_PROGRESS" },
    { estado_jira: "Done", estado_base: "DONE" }
  ]
};

let mockSyncLogs = [
  { id_log: 1, fecha_ejecucion: "2026-07-27T09:00:00Z", resultado: "SUCCESS", total_issues_procesados: 54, detalle_error: null },
  { id_log: 2, fecha_ejecucion: "2026-07-26T09:00:00Z", resultado: "SUCCESS", total_issues_procesados: 48, detalle_error: null },
  { id_log: 3, fecha_ejecucion: "2026-07-25T09:00:00Z", resultado: "ERROR", total_issues_procesados: 0, detalle_error: "Jira API Timeout - 504" }
];

let mockJiraCredentials = {
  jira_domain: "https://beltrancamilo592.atlassian.net",
  jira_email: "stephanyleon326@gmail.com",
  api_token_vinculado: true
};

// =============================================================================
// IMPLEMENTACIÓN DE SERVICIOS
// =============================================================================

export const authService = {
  getLoginUrl() {
    if (USE_MOCK_DATA) {
      return `/dashboard?login=success`;
    }
    return `${BACKEND_URL}/api/auth/login`;
  },
  getCurrentUser() {
    if (USE_MOCK_DATA) {
      return Promise.resolve(mockCurrentUser);
    }
    return api.get('/api/auth/me').then(res => res.data);
<<<<<<< Updated upstream:frontend/src/services/api.js
=======
  },
  getJiraCredentials() {
    if (USE_MOCK_DATA) {
      return Promise.resolve(mockJiraCredentials);
    }
    return api.get('/api/auth/jira-credentials').then(res => res.data);
  },
  saveJiraCredentials(payload) {
    if (USE_MOCK_DATA) {
      mockJiraCredentials = {
        jira_domain: payload.jira_domain,
        jira_email: payload.jira_email,
        api_token_vinculado: true
      };
      return Promise.resolve(mockJiraCredentials);
    }
    return api.post('/api/auth/jira-credentials', payload).then(res => res.data);
  },
  // Función helper de utilidad para testing local: permite cambiar de rol en vivo
  setMockUserRole(roleName) {
    mockCurrentUser = {
      ...mockCurrentUser,
      rol: roleName
    };
>>>>>>> Stashed changes:src/services/api.js
  }
};

export const jiraService = {
  getMetrics() {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        active_projects: mockProjects.length,
        completed_tickets: 48,
        in_progress_tickets: 12,
        critical_bugs: 2
      });
    }
    return api.get('/api/jira/metrics').then(res => res.data);
  },
  triggerSync() {
    if (USE_MOCK_DATA) {
      // Simular retraso y agregar log exitoso
      const newLog = {
        id_log: mockSyncLogs.length + 1,
        fecha_ejecucion: new Date().toISOString(),
        resultado: "RUNNING",
        total_issues_procesados: 0,
        detalle_error: null
      };
      mockSyncLogs = [newLog, ...mockSyncLogs];

      setTimeout(() => {
        mockSyncLogs = mockSyncLogs.map(log => 
          log.id_log === newLog.id_log 
            ? { ...log, resultado: "SUCCESS", total_issues_procesados: Math.floor(Math.random() * 30) + 15 }
            : log
        );
      }, 4000);

      return Promise.resolve({ message: "Sincronización simulada iniciada" });
    }
    return api.post('/api/jira/sync').then(res => res.data);
  },
  getSyncLogs() {
    if (USE_MOCK_DATA) {
      return Promise.resolve(mockSyncLogs);
    }
    return api.get('/api/jira/sync/logs').then(res => res.data);
  }
};

export const projectService = {
  getProjects() {
    if (USE_MOCK_DATA) {
      return Promise.resolve(mockProjects);
    }
    return api.get('/api/projects').then(res => res.data);
  },
  getSprints(projectId) {
    if (USE_MOCK_DATA) {
      return Promise.resolve(mockSprints[projectId] || []);
    }
    return api.get(`/api/projects/${projectId}/sprints`).then(res => res.data);
  },
  getKpis(projectId, sprintId = null) {
    if (USE_MOCK_DATA) {
      const allKpis = mockKpis[projectId] || [];
      if (sprintId) {
        return Promise.resolve(allKpis.filter(kpi => kpi.id_sprint === sprintId));
      }
      return Promise.resolve(allKpis);
    }
    let url = `/api/projects/${projectId}/kpis`;
    if (sprintId) {
      url += `?sprint_id=${sprintId}`;
    }
    return api.get(url).then(res => res.data);
  },
  getStatuses(projectId) {
    if (USE_MOCK_DATA) {
      return Promise.resolve(mockStatuses[projectId] || []);
    }
    return api.get(`/api/projects/${projectId}/statuses`).then(res => res.data);
  },
  getMappings(projectId) {
    if (USE_MOCK_DATA) {
      return Promise.resolve(mockMappings[projectId] || []);
    }
    return api.get(`/api/projects/${projectId}/mappings`).then(res => res.data);
  },
  saveMappings(projectId, mappingsData) {
    if (USE_MOCK_DATA) {
      mockMappings[projectId] = mappingsData;
      return Promise.resolve({ message: "Mapeos guardados correctamente", data: mappingsData });
    }
    return api.post(`/api/projects/${projectId}/mappings`, mappingsData).then(res => res.data);
  },
  getSprintIssues(projectId, sprintId = null) {
    if (USE_MOCK_DATA) {
      const projIssues = mockIssues[projectId] || {};
      if (sprintId && sprintId !== 'general') {
        return Promise.resolve(projIssues[sprintId] || []);
      }
      const allIssues = Object.values(projIssues).flat();
      return Promise.resolve(allIssues);
    }
    return api.get(`/api/projects/${projectId}/issues?sprint_id=${sprintId}`).then(res => res.data);
  }
};

export default api;
