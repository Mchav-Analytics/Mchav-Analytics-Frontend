import { describe, it, expect, vi, beforeEach } from 'vitest';
import api, { authService, jiraService, jqlService, projectService, developerService, alertService, automationService, aiService, BACKEND_URL } from '../api';

// Mock del almacenamiento local para interceptores
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    clear: vi.fn(() => { store = {}; })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock the axios instance methods
vi.mock('axios', () => {
  const axiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    defaults: { withCredentials: true },
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() }
    }
  };
  return {
    default: {
      create: vi.fn(() => axiosInstance),
      defaults: { withCredentials: true }
    }
  };
});

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  describe('authService', () => {
    it('getLoginUrl returns correct URL', () => {
      const url = authService.getLoginUrl();
      expect(url).toBe(`${BACKEND_URL}/api/v1/auth/login`);
    });

    it('getCurrentUser calls correct endpoint', async () => {
      api.get.mockResolvedValueOnce({ data: { name: 'Test User' } });
      const user = await authService.getCurrentUser();
      expect(api.get).toHaveBeenCalledWith('/api/v1/auth/me');
      expect(user).toEqual({ name: 'Test User' });
    });

    it('loginMock calls POST /login', async () => {
      const credentials = { email: 'test@test.com', password: '123' };
      api.post.mockResolvedValueOnce({ data: { token: 'xyz' } });
      const res = await authService.loginMock(credentials);
      expect(api.post).toHaveBeenCalledWith('/api/v1/auth/login', credentials);
      expect(res).toEqual({ token: 'xyz' });
    });
    
    it('logout calls POST /logout', async () => {
      api.post.mockResolvedValueOnce({ data: { status: 'success' } });
      const res = await authService.logout();
      expect(api.post).toHaveBeenCalledWith('/api/v1/auth/logout');
      expect(res).toEqual({ status: 'success' });
    });
  });

  describe('jiraService', () => {
    it('getMetrics calls correct endpoint', async () => {
      api.get.mockResolvedValueOnce({ data: { metrics: [] } });
      const res = await jiraService.getMetrics();
      expect(api.get).toHaveBeenCalledWith('/api/v1/jira/metrics');
      expect(res).toEqual({ metrics: [] });
    });

    it('triggerSync calls POST sync', async () => {
      api.post.mockResolvedValueOnce({ data: { synced: true } });
      const res = await jiraService.triggerSync();
      expect(api.post).toHaveBeenCalledWith('/api/v1/jira/sync', null, { params: { wait: false } });
      expect(res).toEqual({ synced: true });
    });

    it('getSyncLogs calls correct endpoint', async () => {
      api.get.mockResolvedValueOnce({ data: { logs: [] } });
      const res = await jiraService.getSyncLogs({ page: 1 });
      expect(api.get).toHaveBeenCalledWith('/api/v1/jira/sync/logs', { params: { page: 1 } });
      expect(res).toEqual({ logs: [] });
    });
  });

  describe('jqlService', () => {
    it('executeJql calls POST execute', async () => {
      api.post.mockResolvedValueOnce({ data: { total: 5 } });
      const res = await jqlService.executeJql('project = MCHAV', 10);
      expect(api.post).toHaveBeenCalledWith('/api/v1/jql/execute', { jql: 'project = MCHAV', max_results: 10 });
      expect(res).toEqual({ total: 5 });
    });

    it('getPresets calls GET presets', async () => {
      api.get.mockResolvedValueOnce({ data: { categories: [] } });
      const res = await jqlService.getPresets('MCHAV');
      expect(api.get).toHaveBeenCalledWith('/api/v1/jql/presets', { params: { project_key: 'MCHAV' } });
      expect(res).toEqual({ categories: [] });
    });
  });

  describe('projectService', () => {
    it('getProjectBurndown handles project only', async () => {
      api.get.mockResolvedValueOnce({ data: { series: [] } });
      await projectService.getProjectBurndown('PROJ-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects/PROJ-1/burndown');
    });

    it('getProjectBurndown handles sprint', async () => {
      api.get.mockResolvedValueOnce({ data: { series: [] } });
      await projectService.getProjectBurndown('PROJ-1', 'SPRINT-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects/PROJ-1/sprints/SPRINT-1/burndown');
    });

    it('getProjects calls GET projects', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      await projectService.getProjects();
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects');
    });

    it('createProject calls POST projects', async () => {
      api.post.mockResolvedValueOnce({ data: { id: 'P1' } });
      await projectService.createProject({ name: 'Test' });
      expect(api.post).toHaveBeenCalledWith('/api/v1/projects', { name: 'Test' });
    });

    it('getSprints calls GET sprints', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      await projectService.getSprints('P1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects/P1/sprints');
    });

    it('getKpis handles with and without sprint', async () => {
      api.get.mockResolvedValueOnce({ data: {} }).mockResolvedValueOnce({ data: {} });
      await projectService.getKpis('P1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects/P1/kpis');
      await projectService.getKpis('P1', 'S1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects/P1/kpis?sprint_id=S1');
    });

    it('getStatuses calls GET statuses', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      await projectService.getStatuses('P1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects/P1/statuses');
    });

    it('getMappings and saveMappings work', async () => {
      api.get.mockResolvedValueOnce({ data: {} });
      await projectService.getMappings('P1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects/P1/mappings');

      api.post.mockResolvedValueOnce({ data: {} });
      await projectService.saveMappings('P1', { map: true });
      expect(api.post).toHaveBeenCalledWith('/api/v1/projects/P1/mappings', { map: true });
    });

    it('getKpiIssuesDetail calls GET with params', async () => {
      api.get.mockResolvedValueOnce({ data: {} });
      await projectService.getKpiIssuesDetail('P1', { kpi: 'test' });
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects/P1/kpis/issues-detail', { params: { kpi: 'test' } });
    });

    it('transitions and getIssueTransitions work', async () => {
      api.post.mockResolvedValueOnce({ data: {} });
      await projectService.transitionIssue('ISSUE-1', 'Done', 31);
      expect(api.post).toHaveBeenCalledWith('/api/v1/jira/issues/ISSUE-1/transition', { target_status: 'Done', transition_id: 31 });

      api.get.mockResolvedValueOnce({ data: [] });
      await projectService.getIssueTransitions('ISSUE-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/jira/issues/ISSUE-1/transitions');
    });

    it('getSprintHealth handles error gracefully', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));
      const res = await projectService.getSprintHealth('P1');
      expect(res).toHaveProperty('diagnostico', 'ESTABLE'); // Default mock fallback behavior
    });
  });

  describe('developerService', () => {
    it('getMyScorecard calls GET /api/v1/developers/me/scorecard', async () => {
      api.get.mockResolvedValueOnce({ data: { cycle_time_personal: 2.5 } });
      const res = await developerService.getMyScorecard('PROJ-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/developers/me/scorecard', { params: { proyecto_id: 'PROJ-1' } });
      expect(res).toEqual({ cycle_time_personal: 2.5 });
    });

    it('getMyScorecard handles error gracefully', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));
      const res = await developerService.getMyScorecard('PROJ-1');
      expect(res).toHaveProperty('cycle_time_personal'); // Fallback mock behavior
    });
    
    it('getDailyFocus calls GET /api/v1/developers/me/daily-focus', async () => {
      api.get.mockResolvedValueOnce({ data: { efficiency_gain_pct: 10 } });
      const res = await developerService.getDailyFocus('PROJ-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/developers/me/daily-focus', { params: { proyecto_id: 'PROJ-1' } });
      expect(res).toEqual({ efficiency_gain_pct: 10 });
    });

    it('getDailyFocus handles error gracefully', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));
      const res = await developerService.getDailyFocus('PROJ-1');
      expect(res).toHaveProperty('efficiency_gain_pct'); // Fallback mock behavior
    });
    
    it('getDevAlerts calls GET /api/v1/developers/me/alerts', async () => {
      api.get.mockResolvedValueOnce({ data: { total_active_alerts: 1 } });
      const res = await developerService.getDevAlerts('PROJ-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/developers/me/alerts', { params: { proyecto_id: 'PROJ-1' } });
      expect(res).toEqual({ total_active_alerts: 1 });
    });

    it('getDevAlerts handles error gracefully', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));
      const res = await developerService.getDevAlerts('PROJ-1');
      expect(res).toHaveProperty('total_active_alerts'); // Fallback mock behavior
    });
    
    it('performAlertAction calls POST /api/v1/developers/me/alerts/:id/action', async () => {
      api.post.mockResolvedValueOnce({ data: { status: 'success' } });
      const res = await developerService.performAlertAction('ISSUE-1', 'request_help');
      expect(api.post).toHaveBeenCalledWith('/api/v1/developers/me/alerts/ISSUE-1/action', null, { params: { action_type: 'request_help' } });
      expect(res).toEqual({ status: 'success' });
    });

    it('performAlertAction handles error gracefully', async () => {
      api.post.mockRejectedValueOnce(new Error('API Error'));
      const res = await developerService.performAlertAction('ISSUE-1', 'request_help');
      expect(res).toHaveProperty('status', 'SUCCESS'); // Fallback mock behavior
    });
    
    it('getActivityHistory calls GET /api/v1/developers/me/activity-history', async () => {
      api.get.mockResolvedValueOnce({ data: { unlocked_badges_count: 2 } });
      const res = await developerService.getActivityHistory('PROJ-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/developers/me/activity-history', { params: { proyecto_id: 'PROJ-1' } });
      expect(res).toEqual({ unlocked_badges_count: 2 });
    });

    it('getActivityHistory handles error gracefully', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));
      const res = await developerService.getActivityHistory('PROJ-1');
      expect(res).toHaveProperty('unlocked_badges_count'); // Fallback mock behavior
    });
    
    it('getTeamMatrix calls GET /api/v1/developers/matrix', async () => {
      api.get.mockResolvedValueOnce({ data: { team_summary: {} } });
      const res = await developerService.getTeamMatrix('PROJ-1', 'SPRINT-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/developers/matrix', { params: { proyecto_id: 'PROJ-1', sprint_id: 'SPRINT-1' } });
      expect(res).toEqual({ team_summary: {} });
    });

    it('getTeamMatrix handles error gracefully', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));
      const res = await developerService.getTeamMatrix('PROJ-1');
      expect(res).toHaveProperty('team_summary'); // Fallback mock behavior
    });
  });

  describe('alertService', () => {
    it('getAlerts calls GET /api/v1/alerts', async () => {
      api.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
      const res = await alertService.getAlerts('PROJ-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/alerts', { params: { proyecto_id: 'PROJ-1' } });
      expect(res).toEqual([{ id: 1 }]);
    });

    it('getAlerts handles error gracefully', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));
      const res = await alertService.getAlerts('PROJ-1');
      expect(res).toEqual([]);
    });

    it('acknowledgeAlert calls POST /api/v1/alerts/:id/acknowledge', async () => {
      api.post.mockResolvedValueOnce({ data: { status: 'success' } });
      const res = await alertService.acknowledgeAlert(1);
      expect(api.post).toHaveBeenCalledWith('/api/v1/alerts/1/acknowledge');
      expect(res).toEqual({ status: 'success' });
    });

    it('acknowledgeAlert handles error gracefully', async () => {
      api.post.mockRejectedValueOnce(new Error('API Error'));
      const res = await alertService.acknowledgeAlert(1);
      expect(res).toEqual({ alert_id: 1, atendida: true });
    });
    
    it('getHelpRequests calls GET /api/v1/alerts/help-requests', async () => {
      api.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
      const res = await alertService.getHelpRequests('PROJ-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/alerts/help-requests', { params: { proyecto_id: 'PROJ-1' } });
      expect(res).toEqual([{ id: 1 }]);
    });
    
    it('getHelpRequests handles error gracefully', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));
      const res = await alertService.getHelpRequests('PROJ-1');
      expect(res).toEqual([]);
    });

    it('createHelpRequest calls POST /api/v1/alerts/help-requests', async () => {
      api.post.mockResolvedValueOnce({ data: { id: 1 } });
      const res = await alertService.createHelpRequest({ msg: 'help' });
      expect(api.post).toHaveBeenCalledWith('/api/v1/alerts/help-requests', { msg: 'help' });
      expect(res).toEqual({ id: 1 });
    });

    it('createHelpRequest handles error gracefully', async () => {
      api.post.mockRejectedValueOnce(new Error('API Error'));
      const res = await alertService.createHelpRequest({ msg: 'help' });
      expect(res).toHaveProperty('estado', 'PENDIENTE');
    });

    it('updateHelpRequestStatus calls PATCH /api/v1/alerts/help-requests/:id', async () => {
      api.patch.mockResolvedValueOnce({ data: { status: 'success' } });
      const res = await alertService.updateHelpRequestStatus(1, 'RESOLVED', 'Admin');
      expect(api.patch).toHaveBeenCalledWith('/api/v1/alerts/help-requests/1', null, { params: { status: 'RESOLVED', responded_by: 'Admin' } });
      expect(res).toEqual({ status: 'success' });
    });

    it('updateHelpRequestStatus handles error gracefully', async () => {
      api.patch.mockRejectedValueOnce(new Error('API Error'));
      const res = await alertService.updateHelpRequestStatus(1, 'RESOLVED', 'Admin');
      expect(res).toEqual({ id_solicitud: 1, estado: 'RESOLVED', atendido_por_name: 'Admin' });
    });
  });

  describe('automationService', () => {
    it('getHealthMetrics calls GET /api/v1/system/health', async () => {
      api.get.mockResolvedValueOnce({ data: { status: 'ok' } });
      const res = await automationService.getHealthMetrics();
      expect(api.get).toHaveBeenCalledWith('/api/v1/system/health');
      expect(res).toEqual({ status: 'ok' });
    });
  });

  describe('aiService', () => {
    it('chat calls POST /api/v1/ai/chat', async () => {
      api.post.mockResolvedValueOnce({ data: { reply: 'Hi' } });
      const res = await aiService.chat('Hello', 'PROJ-1', []);
      expect(api.post).toHaveBeenCalledWith('/api/v1/ai/chat', { message: 'Hello', project_id: 'PROJ-1', history: [] });
      expect(res).toEqual({ reply: 'Hi' });
    });
    
    it('getSuggestedPrompts calls GET /api/v1/ai/prompts', async () => {
      api.get.mockResolvedValueOnce({ data: [{ text: 'Prompt 1' }] });
      const res = await aiService.getSuggestedPrompts();
      expect(api.get).toHaveBeenCalledWith('/api/v1/ai/prompts');
      expect(res).toEqual([{ text: 'Prompt 1' }]);
    });
  });
});
