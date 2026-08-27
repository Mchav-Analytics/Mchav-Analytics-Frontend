import axios from 'axios';
import { mockAuthService, mockJiraService, mockProjectService, mockAutomationService } from './mockData.js';

// Configurar Axios para enviar cookies en todas las peticiones
axios.defaults.withCredentials = true;

// INTERRUPTOR DE CONEXIÓN DE BACKEND:
// false = Modo Real (Conectado a FastAPI en http://localhost:8000 -> PostgreSQL / Jira API)
// true  = Modo Mock (Desconectado de FastAPI)
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
    return `${BACKEND_URL}/api/v1/auth/login`;
  },
  getCurrentUser() {
    if (USE_MOCK_DATA) return mockAuthService.getCurrentUser();
    return api.get('/api/v1/auth/me').then(res => res.data).catch(() => mockAuthService.getCurrentUser());
  },
  loginMock(credentials) {
    if (USE_MOCK_DATA) return mockAuthService.loginMock(credentials);
    return api.post('/api/v1/auth/login', credentials).then(res => res.data).catch(() => mockAuthService.loginMock(credentials));
  },
  logout() {
    if (USE_MOCK_DATA) return mockAuthService.logoutMock();
    return api.post('/api/v1/auth/logout').then(res => res.data).catch(() => mockAuthService.logoutMock());
  },
  logoutMock() {
    if (USE_MOCK_DATA) return mockAuthService.logoutMock();
    return api.post('/api/v1/auth/logout').then(res => res.data).catch(() => mockAuthService.logoutMock());
  },
  getJiraCredentials() {
    if (USE_MOCK_DATA) return mockAuthService.getJiraCredentials();
    return api.get('/api/v1/auth/jira-credentials').then(res => res.data).catch(() => mockAuthService.getJiraCredentials());
  },
  saveJiraCredentials(payload) {
    if (USE_MOCK_DATA) return mockAuthService.saveJiraCredentials(payload);
    return api.post('/api/v1/auth/jira-credentials', payload).then(res => res.data).catch(() => mockAuthService.saveJiraCredentials(payload));
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
  },
  getPresets(projectKey = 'MCHAV') {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        status: "success",
        project_key: projectKey,
        categories: [
          {
            category: "Consultas Básicas del Proyecto",
            queries: [
              { id: "all", nombre: "Todas las Incidencias del Proyecto", jql: `project = "${projectKey}"`, description: "Obtiene la totalidad de incidencias del proyecto." },
              { id: "todo", nombre: "Pendientes por Iniciar (To Do)", jql: `project = "${projectKey}" AND status = "To Do"`, description: "Incidencias registradas aún no iniciadas." },
              { id: "in_progress", nombre: "En Progreso (Trabajo Activo)", jql: `project = "${projectKey}" AND status = "In Progress"`, description: "Incidencias en desarrollo actualmente." },
              { id: "done", nombre: "Completadas (Done)", jql: `project = "${projectKey}" AND status = "Done"`, description: "Incidencias finalizadas con éxito." }
            ]
          },
          {
            category: "Filtros de Control Operativo y Calidad",
            queries: [
              { id: "high_priority", nombre: "Alta Prioridad / Críticos Pendientes", jql: `project = "${projectKey}" AND priority in (High, Highest) AND status != "Done"`, description: "Incidencias críticas pendientes de solución." },
              { id: "unassigned", nombre: "Incidencias Sin Asignar", jql: `project = "${projectKey}" AND assignee is EMPTY AND status != "Done"`, description: "Tareas pendientes sin responsable asignado." },
              { id: "bugs", nombre: "Bugs y Errores Activos", jql: `project = "${projectKey}" AND issuetype = Bug AND status != "Done"`, description: "Fallas o bugs en estado activo." },
              { id: "recent_7d", nombre: "Actualizadas en los últimos 7 días", jql: `project = "${projectKey}" AND updated >= -7d ORDER BY updated DESC`, description: "Histórico reciente de cambios." }
            ]
          }
        ]
      });
    }
    return api.get('/api/v1/jql/presets', { params: { project_key: projectKey } }).then(res => res.data);
  }
};

export const projectService = {

  // Obtener data para el Burndown Chart
  getProjectBurndown: async (projectId, sprintId = null) => {
    let url = `/api/v1/projects/${projectId}/burndown`;
    if (sprintId) url = `/api/v1/projects/${projectId}/sprints/${sprintId}/burndown`;
    const response = await api.get(url);
    return response.data;
  },

  getProjects() {
    if (USE_MOCK_DATA) return mockProjectService.getProjects();
    return api.get('/api/v1/projects').then(res => res.data);
  },
  createProject(projectData) {
    if (USE_MOCK_DATA) return Promise.resolve(projectData);
    return api.post('/api/v1/projects', projectData).then(res => res.data);
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
  transitionIssue(issueKey, targetStatus, transitionId = null) {
    return api.post(`/api/v1/jira/issues/${issueKey}/transition`, {
      target_status: targetStatus,
      transition_id: transitionId
    }).then(res => res.data);
  },
  getIssueTransitions(issueKey) {
    return api.get(`/api/v1/jira/issues/${issueKey}/transitions`).then(res => res.data);
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
        health_score: 75,
        diagnostico: "ESTABLE",
        diagnostico_label: "Sprint saludable con alertas leves",
        color: "emerald",
        metrics: {
          commitment_reliability_pct: 82,
          scope_creep_pct: 5,
          carryover_pct: 10,
          flow_efficiency_pct: 85,
          sp_planned: 40,
          sp_completed: 30,
          sp_added_mid_sprint: 2,
          sp_carryover: 4,
          active_dev_days: 12,
          waiting_queue_days: 2
        },
        bottleneck_stages: [],
        bottleneck_insight: null,
        scope_creep_warning: null
      };
    }
  },
  getPercentiles(projectId, days = 15) {
    if (USE_MOCK_DATA) {
      return Promise.resolve([
        {
          issue_type: "Story",
          has_enough_data: true,
          count: 12,
          lead_time: { avg: 5.2, p25: 2.1, p50: 4.5, p75: 7.2, p90: 10.5 },
          cycle_time: { avg: 3.1, p25: 1.5, p50: 2.8, p75: 4.2, p90: 6.1 }
        },
        {
          issue_type: "Bug",
          has_enough_data: true,
          count: 8,
          lead_time: { avg: 2.5, p25: 0.8, p50: 1.5, p75: 3.2, p90: 5.1 },
          cycle_time: { avg: 1.8, p25: 0.5, p50: 1.2, p75: 2.5, p90: 3.8 }
        },
        {
          issue_type: "Epic",
          has_enough_data: false,
          count: 2,
          lead_time: { avg: 15.0 },
          cycle_time: { avg: 10.0 }
        }
      ]);
    }
    return api.get(`/api/v1/projects/${projectId}/percentiles?days=${days}`).then(res => res.data);
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
  },

  downloadCsvReport(projectId, data) {
    const targetProject = projectId || 'PROJ-01';
    const csvContent = [];
    csvContent.push(["Clave Ticket", "Título", "Tipo", "Estado", "Puntos (SP)", "Tiempo Ciclo (días)", "Lead Time (días)", "Asignado", "Fecha"]);
    
    const items = data && data.length > 0 ? data : [
      { key: 'MCHAV-101', title: 'Autenticación mediante OAuth 2.0 y JWT', type: 'Historia', status: 'Done', sp: 8, cycleTime: 3.5, leadTime: 5.2, assignee: 'Camilo Corredor', date: '2026-08-02' },
      { key: 'MCHAV-102', title: 'Integración API v3 de Jira Cloud', type: 'Historia', status: 'Done', sp: 5, cycleTime: 4.1, leadTime: 6.0, assignee: 'Andrés Alcalá', date: '2026-08-02' },
      { key: 'MCHAV-104', title: 'Crear componentes de gráficos Recharts', type: 'Historia', status: 'Done', sp: 5, cycleTime: 4.8, leadTime: 7.1, assignee: 'Heidy Lozano', date: '2026-08-03' },
      { key: 'MCHAV-108', title: 'Configuración de Dockerfile y Compose', type: 'Tarea', status: 'Done', sp: 8, cycleTime: 5.2, leadTime: 8.0, assignee: 'Valentina Hoyos', date: '2026-08-04' },
      { key: 'MCHAV-110', title: 'Filtro global por rango de fechas', type: 'Historia', status: 'Done', sp: 4, cycleTime: 3.5, leadTime: 4.9, assignee: 'Michael Salamanca', date: '2026-08-04' },
      { key: 'MCHAV-112', title: 'Error de desbordamiento en tooltip de Recharts', type: 'Bug', status: 'In Progress', sp: 3, cycleTime: 2.1, leadTime: 3.0, assignee: 'Heidy Lozano', date: '2026-08-03' }
    ];

    items.forEach(item => {
      csvContent.push([
        `"${item.key || item.key_issue || ''}"`,
        `"${(item.title || item.summary || '').replace(/"/g, '""')}"`,
        `"${item.type || 'Historia'}"`,
        `"${item.status || item.status_actual || ''}"`,
        item.sp || item.story_points || 0,
        item.cycleTime || item.cycle_time_days || 0,
        item.leadTime || 0,
        `"${item.assignee || 'Sin Asignar'}"`,
        `"${item.date || ''}"`
      ]);
    });

    const csvString = csvContent.map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvString], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `reporte_metricas_${targetProject}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
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
  },
  // STUBS PARA LA AGENDA DIARIA
  async createAgendaTask(payload) {
    if (USE_MOCK_DATA) return Promise.reject(new Error("Funcionalidad no implementada en el backend"));
    return api.post(`/api/v1/developers/me/agenda-tasks`, payload).then(res => res.data);
  },
  async updateTaskStatus(taskId, status) {
    if (USE_MOCK_DATA) return Promise.reject(new Error("Funcionalidad no implementada en el backend"));
    return api.patch(`/api/v1/developers/me/agenda-tasks/${taskId}`, { status }).then(res => res.data);
  },
  async createNote(date, text) {
    if (USE_MOCK_DATA) return Promise.reject(new Error("Funcionalidad no implementada en el backend"));
    return api.post(`/api/v1/developers/me/notes`, { date, text }).then(res => res.data);
  },
  async deleteNote(noteId) {
    if (USE_MOCK_DATA) return Promise.reject(new Error("Funcionalidad no implementada en el backend"));
    return api.delete(`/api/v1/developers/me/notes/${noteId}`).then(res => res.data);
  },
  async getNotesByDate(date) {
    if (USE_MOCK_DATA) return Promise.reject(new Error("Funcionalidad no implementada en el backend"));
    return api.get(`/api/v1/developers/me/notes`, { params: { date } }).then(res => res.data);
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

export const automationService = {
  getSchedulerJobs() {
    if (USE_MOCK_DATA) return mockAutomationService.getSchedulerJobs();
    return api.get('/api/v1/automation/schedulers').then(res => res.data);
  },
  toggleJobState(jobId) {
    if (USE_MOCK_DATA) return mockAutomationService.toggleJobState(jobId);
    return api.put(`/api/v1/automation/schedulers/${jobId}/toggle`).then(res => res.data);
  },
  triggerJobManual(jobId) {
    if (USE_MOCK_DATA) return mockAutomationService.triggerJobManual(jobId);
    return api.post(`/api/v1/automation/schedulers/${jobId}/trigger`).then(res => res.data);
  },
  getHealthMetrics() {
    if (USE_MOCK_DATA) return mockAutomationService.getHealthMetrics();
    return api.get('/api/v1/system/health').then(res => res.data);
  }
};

export const aiService = {
  chat(message, projectId = 'PROJ-01', history = []) {
    return api.post('/api/v1/ai/chat', { message, project_id: projectId, history }).then(res => res.data);
  },
  getSuggestedPrompts() {
    return api.get('/api/v1/ai/prompts').then(res => res.data);
  }
};

export default api;