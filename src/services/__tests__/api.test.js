import { describe, it, expect, vi, beforeEach } from 'vitest';
import api, { authService, jiraService, BACKEND_URL } from '../api';

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
  });
});
