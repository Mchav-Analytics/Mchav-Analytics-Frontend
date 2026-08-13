import { describe, it, expect, vi } from 'vitest';
import api, { BACKEND_URL, jiraService, projectService, jqlService, userService, developerService, automationService } from './api';

describe('API Service Configuration', () => {
  it('should have the correct base URL', () => {
    expect(api.defaults.baseURL).toBe(BACKEND_URL);
  });

  it('should have withCredentials enabled', () => {
    expect(api.defaults.withCredentials).toBe(true);
  });

  it('should intercept requests and add authorization header if token exists', () => {
    const mockToken = 'test-token-123';
    // Mock localStorage
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(mockToken);
    
    // Simulate interceptor logic
    const config = { headers: {} };
    // Get the registered request interceptor
    const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;
    
    const result = requestInterceptor(config);
    
    expect(getItemSpy).toHaveBeenCalledWith('mchav_jwt_token');
    expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
    
    getItemSpy.mockRestore();
  });
});

describe('jiraService', () => {
  it('should call the correct endpoint for getMetrics', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: { success: true } });
    const result = await jiraService.getMetrics();
    expect(getSpy).toHaveBeenCalledWith('/api/v1/jira/metrics');
    expect(result.success).toBe(true);
    getSpy.mockRestore();
  });
});

describe('projectService', () => {
  it('should call the correct endpoint for getProjects', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: [{ id: 'PROJ-01' }] });
    const result = await projectService.getProjects();
    expect(getSpy).toHaveBeenCalledWith('/api/v1/projects');
    expect(result.length).toBe(1);
    getSpy.mockRestore();
  });
});

describe('jqlService', () => {
  it('should call the correct endpoint for executeJql', async () => {
    const postSpy = vi.spyOn(api, 'post').mockResolvedValue({ data: { success: true } });
    const result = await jqlService.executeJql('project = TEST');
    expect(postSpy).toHaveBeenCalledWith('/api/v1/jql/execute', { jql: 'project = TEST', max_results: 50 });
    expect(result.success).toBe(true);
    postSpy.mockRestore();
  });
});

describe('userService', () => {
  it('should call get endpoints', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: [] });
    await userService.getUsers();
    expect(getSpy).toHaveBeenCalledWith('/api/v1/users');
    await userService.getRoles();
    expect(getSpy).toHaveBeenCalledWith('/api/v1/users/roles');
    getSpy.mockRestore();
  });
});

describe('developerService', () => {
  it('should call the correct endpoint', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: [] });
    await developerService.getDevelopers('PROJ-01');
    expect(getSpy).toHaveBeenCalledWith('/developers', { params: { proyecto_id: 'PROJ-01' } });
    getSpy.mockRestore();
  });
});

describe('automationService', () => {
  it('should call the correct endpoint', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: [] });
    await automationService.getSchedulerJobs();
    expect(getSpy).toHaveBeenCalledWith('/api/v1/automation/schedulers');
    getSpy.mockRestore();
  });
});
