import axios from 'axios';

// Configurar Axios para enviar cookies en todas las peticiones
axios.defaults.withCredentials = true;

export const BACKEND_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BACKEND_URL,
});

export const authService = {
  getLoginUrl() {
    return `${BACKEND_URL}/api/auth/login`;
  },
  getCurrentUser() {
    return api.get('/api/auth/me').then(res => res.data);
  },
  getJiraCredentials() {
    return api.get('/api/auth/jira-credentials').then(res => res.data);
  },
  saveJiraCredentials(payload) {
    return api.post('/api/auth/jira-credentials', payload).then(res => res.data);
  }
};

export const jiraService = {
  getMetrics() {
    return api.get('/api/jira/metrics').then(res => res.data);
  },
  triggerSync() {
    return api.post('/api/jira/sync').then(res => res.data);
  },
  getSyncLogs() {
    return api.get('/api/jira/sync/logs').then(res => res.data);
  }
};

export const projectService = {
  getProjects() {
    return api.get('/api/projects').then(res => res.data);
  },
  getSprints(projectId) {
    return api.get(`/api/projects/${projectId}/sprints`).then(res => res.data);
  },
  getKpis(projectId, sprintId = null) {
    let url = `/api/projects/${projectId}/kpis`;
    if (sprintId) {
      url += `?sprint_id=${sprintId}`;
    }
    return api.get(url).then(res => res.data);
  },
  getStatuses(projectId) {
    return api.get(`/api/projects/${projectId}/statuses`).then(res => res.data);
  },
  getMappings(projectId) {
    return api.get(`/api/projects/${projectId}/mappings`).then(res => res.data);
  },
  saveMappings(projectId, mappingsData) {
    return api.post(`/api/projects/${projectId}/mappings`, mappingsData).then(res => res.data);
  }
};

export default api;
