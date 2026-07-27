import axios from 'axios';

// Configurar Axios para enviar cookies en todas las peticiones
axios.defaults.withCredentials = true;

export const BACKEND_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  withCredentials: true,
});

export const authService = {
  getLoginUrl() {
    return `${BACKEND_URL}/api/v1/auth/login`;
  },
  getCurrentUser() {
    return api.get('/auth/me').then(res => res.data);
  },
  getJiraCredentials() {
    return api.get('/auth/jira-credentials').then(res => res.data);
  },
  saveJiraCredentials(payload) {
    return api.post('/auth/jira-credentials', payload).then(res => res.data);
  }
};

export const jiraService = {
  getMetrics() {
    return api.get('/jira/metrics').then(res => res.data);
  },
  triggerSync() {
    return api.post('/jira/sync').then(res => res.data);
  },
  getSyncLogs() {
    return api.get('/jira/sync/logs').then(res => res.data);
  }
};

export const projectService = {
  getProjects() {
    return api.get('/projects').then(res => res.data);
  },
  getSprints(projectId) {
    return api.get(`/projects/${projectId}/sprints`).then(res => res.data);
  },
  getKpis(projectId, sprintId = null) {
    let url = `/projects/${projectId}/kpis`;
    if (sprintId) {
      url += `?sprint_id=${sprintId}`;
    }
    return api.get(url).then(res => res.data);
  },
  getStatuses(projectId) {
    return api.get(`/projects/${projectId}/statuses`).then(res => res.data);
  },
  getMappings(projectId) {
    return api.get(`/projects/${projectId}/mappings`).then(res => res.data);
  },
  saveMappings(projectId, mappingsData) {
    return api.post(`/projects/${projectId}/mappings`, mappingsData).then(res => res.data);
  }
};

export default api;