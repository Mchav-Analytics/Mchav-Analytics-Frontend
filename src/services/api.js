import axios from 'axios';
import { mockAuthService, mockJiraService, mockProjectService } from './mockData';

// Configurar Axios para enviar cookies en todas las peticiones
axios.defaults.withCredentials = true;

// INTERRUPTOR DE DESCONEXIÓN DE BACKEND:
// true  = Modo Mock (Desconectado de FastAPI, desarrollo exclusivo en Frontend)
// false = Modo Real (Conectado a FastAPI en http://localhost:8000)
export const USE_MOCK_DATA = false;

export const BACKEND_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mchav_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  getLoginUrl() {
    if (USE_MOCK_DATA) return mockAuthService.getLoginUrl();
    return `${BACKEND_URL}/api/v1/auth/login`;
  },
  getCurrentUser() {
    if (USE_MOCK_DATA) return mockAuthService.getCurrentUser();
    return api.get('/api/v1/auth/me').then(res => res.data);
  },
  loginMock(credentials) {
    if (USE_MOCK_DATA) return mockAuthService.loginMock(credentials);
    return api.post('/api/v1/auth/login', credentials).then(res => res.data);
  },
  logout() {
    if (USE_MOCK_DATA) return mockAuthService.logoutMock();
    return api.post('/api/v1/auth/logout').then(res => res.data);
  },
  logoutMock() {
    if (USE_MOCK_DATA) return mockAuthService.logoutMock();
    return api.post('/api/v1/auth/logout').then(res => res.data);
  },
  getJiraCredentials() {
    if (USE_MOCK_DATA) return mockAuthService.getJiraCredentials();
    return api.get('/api/auth/jira-credentials').then(res => res.data);
  },
  saveJiraCredentials(payload) {
    if (USE_MOCK_DATA) return mockAuthService.saveJiraCredentials(payload);
    return api.post('/api/auth/jira-credentials', payload).then(res => res.data);
  }
};

export const jiraService = {
  getMetrics() {
    if (USE_MOCK_DATA) return mockJiraService.getMetrics();
    return api.get('/api/jira/metrics').then(res => res.data);
  },
  triggerSync() {
    if (USE_MOCK_DATA) return mockJiraService.triggerSync();
    return api.post('/api/jira/sync').then(res => res.data);
  },
  getSyncLogs(params = {}) {
    if (USE_MOCK_DATA) return mockJiraService.getSyncLogs();
    return api.get('/api/v1/jira/sync/logs', { params }).then(res => res.data);
  }
};

export const jqlService = {
  executeJql(jql, maxResults = 50) {
    if (USE_MOCK_DATA) {
      if (!jql.toLowerCase().includes('project') && !jql.toLowerCase().includes('assignee') && !jql.toLowerCase().includes('status')) {
        return Promise.reject({ response: { data: { detail: "Sintaxis JQL inválida: La consulta no contiene un campo JQL reconocido." } } });
      }
      return Promise.resolve({
        status: "success",
        jql_executed: jql,
        total: 6,
        issues: [
          { key_issue: 'MCHAV-101', summary: 'Implementar autenticación JWT con OAuth 2.0 Jira', status_actual: 'Done', story_points: 5 },
          { key_issue: 'MCHAV-102', summary: 'Optimizar pipeline ETL para extracción incremental', status_actual: 'In Progress', story_points: 3 },
          { key_issue: 'MCHAV-103', summary: 'Corregir desfasamiento de zona horaria en calculador de Lead Time', status_actual: 'In Progress', story_points: 2 },
          { key_issue: 'MCHAV-104', summary: 'Diseñar interfaz responsiva para tabla de logs auditoría', status_actual: 'Done', story_points: 3 },
          { key_issue: 'MCHAV-105', summary: 'Configurar contenedor Docker con PostgreSQL y volúmenes', status_actual: 'Done', story_points: 5 },
          { key_issue: 'MCHAV-106', summary: 'Añadir exportación de reportes consolidados en formato PDF', status_actual: 'To Do', story_points: 8 }
        ]
      });
    }
    return api.post('/api/v1/jql/execute', { jql, max_results: maxResults }).then(res => res.data);
  }
};

export const projectService = {
  getProjects() {
    if (USE_MOCK_DATA) return mockProjectService.getProjects();
    return api.get('/api/projects').then(res => res.data);
  },
  getSprints(projectId) {
    if (USE_MOCK_DATA) return mockProjectService.getSprints(projectId);
    return api.get(`/api/projects/${projectId}/sprints`).then(res => res.data);
  },
  getKpis(projectId, sprintId = null) {
    if (USE_MOCK_DATA) return mockProjectService.getKpis(projectId, sprintId);
    let url = `/api/projects/${projectId}/kpis`;
    if (sprintId) {
      url += `?sprint_id=${sprintId}`;
    }
    return api.get(url).then(res => res.data);
  },
  getStatuses(projectId) {
    if (USE_MOCK_DATA) return mockProjectService.getStatuses(projectId);
    return api.get(`/api/projects/${projectId}/statuses`).then(res => res.data);
  },
  getMappings(projectId) {
    if (USE_MOCK_DATA) return mockProjectService.getMappings(projectId);
    return api.get(`/api/projects/${projectId}/mappings`).then(res => res.data);
  },
  saveMappings(projectId, mappingsData) {
    if (USE_MOCK_DATA) return mockProjectService.saveMappings(projectId, mappingsData);
    return api.post(`/api/projects/${projectId}/mappings`, mappingsData).then(res => res.data);
  },
  getKpiIssuesDetail(projectId, params = {}) {
    if (USE_MOCK_DATA) return mockProjectService.getKpiIssuesDetail ? mockProjectService.getKpiIssuesDetail(projectId, params) : Promise.resolve({ total_issues: 0, issues: [] });
    return api.get(`/api/v1/projects/${projectId}/kpis/issues-detail`, { params }).then(res => res.data);
  }
};

export const userService = {
  getUsers() {
    if (USE_MOCK_DATA) return Promise.resolve([]);
    return api.get('/api/v1/users').then(res => res.data);
  },
  getRoles() {
    if (USE_MOCK_DATA) return Promise.resolve([]);
    return api.get('/api/v1/users/roles').then(res => res.data);
  },
  updateUserStatus(userId, activo) {
    if (USE_MOCK_DATA) return Promise.resolve({ status: 'success' });
    return api.put(`/api/v1/users/${userId}/status`, { activo }).then(res => res.data);
  },
  updateUserRole(userId, roleId) {
    if (USE_MOCK_DATA) return Promise.resolve({ status: 'success' });
    return api.put(`/api/v1/users/${userId}/role`, { id_rol: roleId }).then(res => res.data);
  },
  assignUserProjects(userId, projectIds) {
    if (USE_MOCK_DATA) return Promise.resolve({ status: 'success' });
    return api.post(`/api/v1/users/${userId}/projects`, { id_proyectos: projectIds }).then(res => res.data);
  }
};

export const reportService = {
  downloadPdfReport(projectId) {
    const targetProject = projectId || 'PROJ-01';
    const backendUrl = `${BACKEND_URL}/api/v1/reports/pdf?proyecto_id=${targetProject}`;

    fetch(backendUrl)
      .then(res => {
        if (!res.ok) throw new Error("Error al obtener el reporte PDF del servidor");
        return res.blob();
      })
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `reporte_kpis_${targetProject}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(err => {
        console.warn("Abriendo reporte PDF directamente en pestaña...", err);
        window.open(backendUrl, '_blank');
      });
  }
};

export const developerService = {
  async getMyScorecard(projectId = 'PROJ-01') {
    try {
      const response = await api.get(`/api/v1/developers/me/scorecard`, { params: { proyecto_id: projectId } });
      return response.data;
    } catch (err) {
      console.warn("Fallback scorecard desarrollador...", err);
      return {
        proyecto_id: projectId,
        cycle_time_personal: 3.2,
        cycle_time_prev: 3.5,
        wip_tickets: 7,
        wip_max: 10,
        wip_avg: 5.5,
        throughput_tickets: 14,
        throughput_avg_daily: 2.3,
        throughput_last_sprint: 12,
        story_points_burned: 65.0,
        story_points_target: 80.0,
        story_points_achieved_pct: 81,
        work_distribution: { pct_historias: 45, pct_bugs: 15, pct_tareas: 40 },
        assigned_issues: [
          { id_jira: "101", key_issue: "MCHAV-101", summary: "Implementar autenticación SSO y OAuth 2.0", status_actual: "EN PROGRESO", status_base: "IN_PROGRESS", story_points: 8.0, cycle_time_days: 4.1 },
          { id_jira: "105", key_issue: "MCHAV-105", summary: "Corregir bug en la API de pagos y transacciones", status_actual: "LISTO", status_base: "DONE", story_points: 5.0, cycle_time_days: 2.5 },
          { id_jira: "112", key_issue: "MCHAV-112", summary: "Rediseñar vista de desarrollador con Recharts", status_actual: "EN REVISIÓN", status_base: "IN_PROGRESS", story_points: 13.0, cycle_time_days: 3.2 },
          { id_jira: "118", key_issue: "MCHAV-118", summary: "Optimizar rendimiento de consultas SQL en reportes", status_actual: "LISTO", status_base: "DONE", story_points: 7.0, cycle_time_days: 2.9 },
          { id_jira: "120", key_issue: "MCHAV-120", summary: "Pruebas de integración para Service Gateway X", status_actual: "LISTO", status_base: "DONE", story_points: 8.0, cycle_time_days: 2.9 }
        ]
      };
    }
  },
  async getDevelopers(projectId = 'PROJ-01') {
    try {
      const response = await api.get(`/api/v1/developers`, { params: { proyecto_id: projectId } });
      return response.data;
    } catch (err) {
      return [
        { assignee_id: "DEV-101", nombre: "Andrés Felipe Torres", email: "aftorres@mchav.com" },
        { assignee_id: "DEV-102", nombre: "Clara Gomez", email: "cgomez@mchav.com" },
        { assignee_id: "DEV-103", nombre: "Michael Salamanca", email: "msalamanca@mchav.com" }
      ];
    }
  },
  async getDeveloperScorecard(assigneeId, projectId = 'PROJ-01') {
    try {
      const response = await api.get(`/api/v1/developers/${assigneeId}/scorecard`, { params: { proyecto_id: projectId } });
      return response.data;
    } catch (err) {
      return this.getMyScorecard(projectId);
    }
  },
  async getDailyFocus(projectId = 'PROJ-01') {
    try {
      const response = await api.get(`/api/v1/developers/me/daily-focus`, { params: { proyecto_id: projectId } });
      return response.data;
    } catch (err) {
      return {
        ai_coach_tip: "Tu tiempo de ciclo personal en tareas de 5 SP ha mejorado un +14% respecto al sprint anterior. Te recomendamos resolver primero el bug MCHAV-105 en QA antes de avanzar en MCHAV-101.",
        efficiency_gain_pct: 14,
        clean_deliveries_pct: 100,
        urgent_qa_bugs: [{ id_jira: "105", key_issue: "MCHAV-105", summary: "Corregir desbordamiento en API de transacciones", issue_type: "Bug", status_actual: "Bug en QA", time_ago: "Hace 3 horas" }],
        active_in_progress: [{ id_jira: "101", key_issue: "MCHAV-101", summary: "Implementar autenticación SSO y OAuth 2.0", story_points: 8.0, time_spent: "1.8d / 3.0d" }],
        in_review: [{ id_jira: "112", key_issue: "MCHAV-112", summary: "Rediseñar vista de desarrollador con Recharts", story_points: 13.0, time_ago: "Hace 18h" }]
      };
    }
  },
  async getDevAlerts(projectId = 'PROJ-01') {
    try {
      const response = await api.get(`/api/v1/developers/me/alerts`, { params: { proyecto_id: projectId } });
      return response.data;
    } catch (err) {
      return {
        total_active_alerts: 2,
        alerts: [
          { id: "alert-101", issue_id: "101", key_issue: "MCHAV-101", type: "INACTIVITY", level: "CRITICAL", title: "Inactividad: Tarea sin cambios por más de 48 horas", description: "Tu ticket MCHAV-101 (SSO OAuth 2.0) lleva 3.2 días en 'In Progress' sin registrar avances ni notas." },
          { id: "alert-wip", type: "WIP_EXCEEDED", level: "WARNING", title: "Advertencia de Multitarea Excesiva (WIP = 7 Tareas)", description: "Tienes 7 tareas abiertas en progreso. Mantener más de 3 tareas abiertas ralentiza el tiempo de ciclo." }
        ]
      };
    }
  },
  async performAlertAction(issueId, actionType = 'request_help') {
    try {
      const response = await api.post(`/api/v1/developers/me/alerts/${issueId}/action`, null, { params: { action_type: actionType } });
      return response.data;
    } catch (err) {
      return { status: "SUCCESS", issue_id: issueId, action_type: actionType, message: `Acción '${actionType}' ejecutada exitosamente para el ticket #${issueId}.` };
    }
  },
  async getActivityHistory(projectId = 'PROJ-01') {
    try {
      const response = await api.get(`/api/v1/developers/me/activity-history`, { params: { proyecto_id: projectId } });
      return response.data;
    } catch (err) {
      return {
        unlocked_badges_count: 3,
        activity_feed: [
          { time: "Hoy 09:30 AM", key: "MCHAV-101", action: "Pasaste a En Desarrollo (In Progress)", points: "8 SP", type: "Story" },
          { time: "Ayer 04:15 PM", key: "MCHAV-105", action: "Resolviste e hiciste entrega a QA (Done)", points: "5 SP", type: "Bug" },
          { time: "Hace 2 días", key: "MCHAV-112", action: "Enviaste a Code Review de Pares", points: "13 SP", type: "Story" },
          { time: "Hace 3 días", key: "MCHAV-118", action: "Completaste optimización de consultas SQL (Done)", points: "7 SP", type: "Task" },
          { time: "Hace 4 días", key: "MCHAV-120", action: "Completaste pruebas de integración (Done)", points: "8 SP", type: "Task" }
        ],
        badges: [
          { id: "zero-defect", title: "Zero Defect Delivery", description: "2 Sprints consecutivos completados sin re-apertura de bugs en QA.", status: "UNLOCKED" },
          { id: "fast-delivery", title: "Fast Delivery Hero", description: "Cycle Time menor a 2.5 días en tickets de 5 Story Points.", status: "UNLOCKED" },
          { id: "sprint-master", title: "Sprint Master", description: "Cumplimiento del 81% de Story Points comprometidos en Sprint 2.", status: "UNLOCKED" }
        ]
      };
    }
  }
};

export default api;
