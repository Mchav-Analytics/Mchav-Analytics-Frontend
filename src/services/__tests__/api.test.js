import { describe, it, expect, vi, beforeEach } from 'vitest';
import api, { authService, jiraService, jqlService, projectService, BACKEND_URL } from '../api';

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
      expect(api.post).toHaveBeenCalledWith('/api/v1/jira/sync');
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
});
