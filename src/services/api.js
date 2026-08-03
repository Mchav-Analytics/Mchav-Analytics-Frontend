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
  baseURL: `${BACKEND_URL}/api/v1`,
  withCredentials: true,
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
  getSyncLogs() {
    if (USE_MOCK_DATA) return mockJiraService.getSyncLogs();
    return api.get('/api/jira/sync/logs').then(res => res.data);
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
  }
};

export default api;