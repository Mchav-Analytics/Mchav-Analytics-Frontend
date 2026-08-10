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
    return api.get('/api/v1/auth/jira-credentials').then(res => res.data);
  },
  saveJiraCredentials(payload) {
    if (USE_MOCK_DATA) return mockAuthService.saveJiraCredentials(payload);
    return api.post('/api/v1/auth/jira-credentials', payload).then(res => res.data);
  }
};

export const jiraService = {
  getMetrics() {
    if (USE_MOCK_DATA) return mockJiraService.getMetrics();
    return api.get('/api/v1/jira/metrics').then(res => res.data);
  },
  triggerSync() {
    if (USE_MOCK_DATA) return mockJiraService.triggerSync();
    return api.post('/api/v1/jira/sync').then(res => res.data);
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
    return api.get('/api/v1/projects').then(res => res.data);
  },
  getSprints(projectId) {
    if (USE_MOCK_DATA) return mockProjectService.getSprints(projectId);
    return api.get(`/api/v1/projects/${projectId}/sprints`).then(res => res.data);
  },
  getKpis(projectId, sprintId = null) {
    if (USE_MOCK_DATA) return mockProjectService.getKpis(projectId, sprintId);
    let url = `/api/v1/projects/${projectId}/kpis`;
    if (sprintId) {
      url += `?sprint_id=${sprintId}`;
    }
    return api.get(url).then(res => res.data);
  },
  getStatuses(projectId) {
    if (USE_MOCK_DATA) return mockProjectService.getStatuses(projectId);
    return api.get(`/api/v1/projects/${projectId}/statuses`).then(res => res.data);
  },
  getMappings(projectId) {
    if (USE_MOCK_DATA) return mockProjectService.getMappings(projectId);
    return api.get(`/api/v1/projects/${projectId}/mappings`).then(res => res.data);
  },
  saveMappings(projectId, mappingsData) {
    if (USE_MOCK_DATA) return mockProjectService.saveMappings(projectId, mappingsData);
    return api.post(`/api/v1/projects/${projectId}/mappings`, mappingsData).then(res => res.data);
  },
  getKpiIssuesDetail(projectId, params = {}) {
    if (USE_MOCK_DATA) return mockProjectService.getKpiIssuesDetail ? mockProjectService.getKpiIssuesDetail(projectId, params) : Promise.resolve({ total_issues: 0, issues: [] });
    return api.get(`/api/v1/projects/${projectId}/kpis/issues-detail`, { params }).then(res => res.data);
  },
  async getSprintHealth(projectId = 'PROJ-01', sprintId = null) {
    try {
      let url = `/api/v1/projects/${projectId}/health`;
      if (sprintId) url = `/api/v1/projects/${projectId}/sprints/${sprintId}/health`;
      const response = await api.get(url);
      return response.data;
    } catch (err) {
      console.warn("Error obteniendo salud del sprint...", err);
      return {
        proyecto_id: projectId,
        health_score: 0,
        diagnostico: "SIN_DATOS",
        diagnostico_label: "Sin datos suficientes — Sincronice un proyecto desde Jira",
        color: "slate",
        metrics: {
          commitment_reliability_pct: 0,
          scope_creep_pct: 0,
          carryover_pct: 0,
          flow_efficiency_pct: 0,
          sp_planned: 0,
          sp_completed: 0,
          sp_added_mid_sprint: 0,
          sp_carryover: 0,
          active_dev_days: 0,
          waiting_queue_days: 0
        },
        bottleneck_stages: [],
        bottleneck_insight: null,
        scope_creep_warning: null
      };
    }
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
      console.warn("Error cargando scorecard desarrollador...", err);
      return {
        proyecto_id: projectId,
        cycle_time_personal: 0,
        cycle_time_prev: 0,
        wip_tickets: 0,
        wip_max: 0,
        wip_avg: 0,
        throughput_tickets: 0,
        throughput_avg_daily: 0,
        throughput_last_sprint: 0,
        story_points_burned: 0,
        story_points_target: 0,
        story_points_achieved_pct: 0,
        work_distribution: { pct_historias: 0, pct_bugs: 0, pct_tareas: 0 },
        assigned_issues: []
      };
    }
  },
  async getDevelopers(projectId = 'PROJ-01') {
    try {
      const response = await api.get(`/api/v1/developers`, { params: { proyecto_id: projectId } });
      return response.data;
    } catch (err) {
      console.warn("Error cargando desarrolladores...", err);
      return [];
    }
  },
  async getDeveloperScorecard(assigneeId, projectId = 'PROJ-01') {
    try {
      const response = await api.get(`/api/v1/developers/${assigneeId}/scorecard`, { params: { proyecto_id: projectId } });
      return response.data;
    } catch (err) {
      console.warn("Error cargando scorecard del desarrollador...", err);
      return this.getMyScorecard(projectId);
    }
  },
  async getDailyFocus(projectId = 'PROJ-01') {
    try {
      const response = await api.get(`/api/v1/developers/me/daily-focus`, { params: { proyecto_id: projectId } });
      return response.data;
    } catch (err) {
      console.warn("Error cargando daily focus...", err);
      return {
        ai_coach_tip: "No hay información disponible. Sincronice datos desde Jira.",
        efficiency_gain_pct: 0,
        clean_deliveries_pct: 0,
        urgent_qa_bugs: [],
        active_in_progress: [],
        in_review: []
      };
    }
  },
  async getDevAlerts(projectId = 'PROJ-01') {
    try {
      const response = await api.get(`/api/v1/developers/me/alerts`, { params: { proyecto_id: projectId } });
      return response.data;
    } catch (err) {
      console.warn("Error cargando alertas de desarrollador...", err);
      return {
        total_active_alerts: 0,
        alerts: []
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
      console.warn("Error cargando historial de actividad...", err);
      return {
        unlocked_badges_count: 0,
        activity_feed: [],
        badges: []
      };
    }
  },
  async getTeamMatrix(projectId = 'PROJ-01', sprintId = null) {
    try {
      const params = { proyecto_id: projectId };
      if (sprintId) params.sprint_id = sprintId;
      const response = await api.get(`/api/v1/developers/matrix`, { params });
      return response.data;
    } catch (err) {
      console.warn("Error cargando matriz de equipo...", err);
      return {
        proyecto_id: projectId,
        team_summary: {
          total_desarrolladores: 0,
          promedio_score_equipo: 0,
          team_avg_tickets: 0,
          team_avg_sp: 0,
          team_avg_cycle_time: 0,
          conteo_cuadrantes: { ESTRELLA: 0, METODICO: 0, ALTO_VOLUMEN: 0, ATASCADO: 0 }
        },
        developers: []
      };
    }
  }
};

export const alertService = {
  async getAlerts(projectId = 'PROJ-01') {
    try {
      const response = await api.get(`/api/v1/alerts`, { params: { proyecto_id: projectId } });
      return response.data;
    } catch (err) {
      console.warn("Error cargando alertas del sistema...", err);
      return [];
    }
  },
  async acknowledgeAlert(alertId) {
    try {
      const response = await api.post(`/api/v1/alerts/${alertId}/acknowledge`);
      return response.data;
    } catch (err) {
      return { alert_id: alertId, atendida: true };
    }
  },
  async getHelpRequests(projectId = 'PROJ-01') {
    try {
      const response = await api.get(`/api/v1/alerts/help-requests`, { params: { proyecto_id: projectId } });
      return response.data;
    } catch (err) {
      console.warn("Error cargando solicitudes de ayuda...", err);
      return [];
    }
  },
  async createHelpRequest(payload) {
    try {
      const response = await api.post(`/api/v1/alerts/help-requests`, payload);
      return response.data;
    } catch (err) {
      return {
        id_solicitud: Date.now(),
        ...payload,
        estado: "PENDIENTE",
        fecha_creacion: new Date().toISOString()
      };
    }
  },
  async updateHelpRequestStatus(requestId, status, respondedBy = null) {
    try {
      const response = await api.patch(`/api/v1/alerts/help-requests/${requestId}`, null, {
        params: { status, responded_by: respondedBy }
      });
      return response.data;
    } catch (err) {
      return { id_solicitud: requestId, estado: status, atendido_por_name: respondedBy };
    }
  }
};

export default api;
