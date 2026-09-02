import { describe, it, expect, vi, beforeEach } from 'vitest';
import api, { authService, jiraService, jqlService, projectService, developerService, alertService, automationService, aiService, userService, reportService, BACKEND_URL } from '../api';

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

  describe('Remaining projectService functions', () => {
    it('getProjectCFD handles project only', async () => {
      api.get.mockResolvedValueOnce({ data: { series: [] } });
      await projectService.getProjectCFD('PROJ-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects/PROJ-1/cfd');
    });

    it('getProjectCFD handles sprint', async () => {
      api.get.mockResolvedValueOnce({ data: { series: [] } });
      await projectService.getProjectCFD('PROJ-1', 'SPRINT-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects/PROJ-1/sprints/SPRINT-1/cfd');
    });

    it('getProjectBurnup handles project only', async () => {
      api.get.mockResolvedValueOnce({ data: { series: [] } });
      await projectService.getProjectBurnup('PROJ-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects/PROJ-1/burnup');
    });

    it('getProjectBurnup handles sprint', async () => {
      api.get.mockResolvedValueOnce({ data: { series: [] } });
      await projectService.getProjectBurnup('PROJ-1', 'SPRINT-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects/PROJ-1/sprints/SPRINT-1/burnup');
    });

    it('getPercentiles calls GET with days', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      await projectService.getPercentiles('PROJ-1', 15);
      expect(api.get).toHaveBeenCalledWith('/api/v1/projects/PROJ-1/percentiles?days=15');
    });
  });

  describe('Remaining developerService functions', () => {
    it('getDevelopers calls GET /developers', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      await developerService.getDevelopers('PROJ-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/developers', { params: { proyecto_id: 'PROJ-1' } });
    });

    it('getDevelopers handles error', async () => {
      api.get.mockRejectedValueOnce(new Error('error'));
      const res = await developerService.getDevelopers('PROJ-1');
      expect(res.length).toBeGreaterThan(0); // mock fallback
    });

    it('getDeveloperScorecard calls GET for specific dev', async () => {
      api.get.mockResolvedValueOnce({ data: { cycle_time_personal: 1.5 } });
      await developerService.getDeveloperScorecard('DEV-1', 'PROJ-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/developers/DEV-1/scorecard', { params: { proyecto_id: 'PROJ-1' } });
    });

    it('getDeveloperScorecard handles error', async () => {
      api.get.mockRejectedValueOnce(new Error('error'));
      // fallback calls getMyScorecard which will also error if we don't mock it, but we let it fall back
      api.get.mockResolvedValueOnce({ data: { cycle_time_personal: 2.0 } }); // mock for getMyScorecard
      const res = await developerService.getDeveloperScorecard('DEV-1', 'PROJ-1');
      expect(api.get).toHaveBeenCalledWith('/api/v1/developers/me/scorecard', { params: { proyecto_id: 'PROJ-1' } });
    });

    it('createAgendaTask calls POST', async () => {
      api.post.mockResolvedValueOnce({ data: { id: 1 } });
      await developerService.createAgendaTask({ task: '1' });
      expect(api.post).toHaveBeenCalledWith('/api/v1/developers/me/agenda-tasks', { task: '1' });
    });

    it('updateTaskStatus calls PATCH', async () => {
      api.patch.mockResolvedValueOnce({ data: { id: 1 } });
      await developerService.updateTaskStatus(1, 'DONE');
      expect(api.patch).toHaveBeenCalledWith('/api/v1/developers/me/agenda-tasks/1', { status: 'DONE' });
    });

    it('createNote calls POST', async () => {
      api.post.mockResolvedValueOnce({ data: { id: 1 } });
      await developerService.createNote('2023-01-01', 'note');
      expect(api.post).toHaveBeenCalledWith('/api/v1/developers/me/notes', { date: '2023-01-01', text: 'note' });
    });

    it('deleteNote calls DELETE', async () => {
      api.delete.mockResolvedValueOnce({ data: { success: true } });
      await developerService.deleteNote(1);
      expect(api.delete).toHaveBeenCalledWith('/api/v1/developers/me/notes/1');
    });

    it('getNotesByDate calls GET', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      await developerService.getNotesByDate('2023-01-01');
      expect(api.get).toHaveBeenCalledWith('/api/v1/developers/me/notes', { params: { date: '2023-01-01' } });
    });
  });

  describe('userService functions', () => {
    it('getUsers calls GET /users', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      await userService.getUsers();
      expect(api.get).toHaveBeenCalledWith('/api/v1/users');
    });

    it('getRoles calls GET /roles', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      await userService.getRoles();
      expect(api.get).toHaveBeenCalledWith('/api/v1/users/roles');
    });

    it('updateUserStatus calls PUT', async () => {
      api.put.mockResolvedValueOnce({ data: {} });
      await userService.updateUserStatus('U1', false);
      expect(api.put).toHaveBeenCalledWith('/api/v1/users/U1/status', { activo: false });
    });

    it('updateUserRole calls PUT', async () => {
      api.put.mockResolvedValueOnce({ data: {} });
      await userService.updateUserRole('U1', 'R1');
      expect(api.put).toHaveBeenCalledWith('/api/v1/users/U1/role', { id_rol: 'R1' });
    });

    it('assignUserProjects calls POST', async () => {
      api.post.mockResolvedValueOnce({ data: {} });
      await userService.assignUserProjects('U1', ['P1']);
      expect(api.post).toHaveBeenCalledWith('/api/v1/users/U1/projects', { id_proyectos: ['P1'] });
    });
  });

  describe('automationService additional functions', () => {
    it('getSchedulerJobs calls GET', async () => {
      api.get.mockResolvedValueOnce({ data: [] });
      await automationService.getSchedulerJobs();
      expect(api.get).toHaveBeenCalledWith('/api/v1/automation/schedulers');
    });

    it('toggleJobState calls PUT', async () => {
      api.put.mockResolvedValueOnce({ data: {} });
      await automationService.toggleJobState('J1');
      expect(api.put).toHaveBeenCalledWith('/api/v1/automation/schedulers/J1/toggle');
    });

    it('triggerJobManual calls POST', async () => {
      api.post.mockResolvedValueOnce({ data: {} });
      await automationService.triggerJobManual('J1');
      expect(api.post).toHaveBeenCalledWith('/api/v1/automation/schedulers/J1/trigger');
    });
  });

  describe('reportService functions', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob())
      })));
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(),
        revokeObjectURL: vi.fn()
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('downloadPdfReport uses fetch', async () => {
      const mockLink = { setAttribute: vi.fn(), click: vi.fn(), remove: vi.fn() };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});

      await import('../api').then(module => {
        module.reportService.downloadPdfReport('P1');
      });
      
      expect(fetch).toHaveBeenCalled();
    });

    it('downloadCsvReport creates link', () => {
      const mockLink = { setAttribute: vi.fn(), click: vi.fn(), remove: vi.fn() };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});

      reportService.downloadCsvReport('P1', []);
      
      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });
});
