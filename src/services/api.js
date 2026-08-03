import axios from 'axios';
import { mockAuthService, mockJiraService, mockProjectService } from './mockData';

// Configurar Axios para enviar cookies en todas las peticiones
axios.defaults.withCredentials = true;

// INTERRUPTOR DE DESCONEXIÓN DE BACKEND:
// true  = Modo Mock (Desconectado de FastAPI, desarrollo exclusivo en Frontend)
// false = Modo Real (Conectado a FastAPI en http://localhost:8000)
export const USE_MOCK_DATA = true;

export const BACKEND_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BACKEND_URL,
});

export const authService = {
  getLoginUrl() {
    if (USE_MOCK_DATA) return mockAuthService.getLoginUrl();
    return `${BACKEND_URL}/api/auth/login`;
  },
  getCurrentUser() {
    if (USE_MOCK_DATA) return mockAuthService.getCurrentUser();
    return api.get('/api/auth/me').then(res => res.data);
  },
  loginMock(credentials) {
    if (USE_MOCK_DATA) return mockAuthService.loginMock(credentials);
    return api.post('/api/auth/login', credentials).then(res => res.data);
  },
  logoutMock() {
    if (USE_MOCK_DATA) return mockAuthService.logoutMock();
    return api.post('/api/auth/logout').then(res => res.data);
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

export default api;
