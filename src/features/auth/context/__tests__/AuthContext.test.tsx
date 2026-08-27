import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth, normalizeRole } from '../AuthContext';
import { authService } from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  USE_MOCK_DATA: true,
  authService: {
    getCurrentUser: vi.fn(),
    loginMock: vi.fn(),
    logout: vi.fn(),
    getLoginUrl: vi.fn(() => 'http://test-jira-login.com'),
  }
}));

const TestComponent = () => {
  const auth = useAuth();
  
  if (auth.loading) return <div>Cargando...</div>;

  return (
    <div>
      <span data-testid="is-authenticated">{auth.isAuthenticated.toString()}</span>
      <span data-testid="user-role">{auth.user?.rol || 'NONE'}</span>
      <span data-testid="user-status">{auth.user?.status || 'NONE'}</span>
      <span data-testid="error">{auth.error || 'NONE'}</span>
      
      <button onClick={() => auth.login({ email: 'test@mchav.com', password: '123' }).catch(() => {})} data-testid="btn-login">Login</button>
      <button onClick={() => auth.logout()} data-testid="btn-logout">Logout</button>
      <button onClick={() => auth.approveUserPermission('test@mchav.com', 'MANAGER')} data-testid="btn-approve">Approve</button>
      <button onClick={() => auth.switchViewRole('DEVELOPER')} data-testid="btn-switch-role">Switch Role</button>
      <button onClick={() => auth.loginWithJira()} data-testid="btn-login-jira">Login Jira</button>
      <button onClick={() => auth.resetDemoState()} data-testid="btn-reset-demo">Reset Demo</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('normalizeRole', () => {
    it('normalizes undefined to ADMIN', () => {
      expect(normalizeRole(undefined)).toBe('ADMIN');
    });
    
    it('normalizes DEV roles to DEVELOPER', () => {
      expect(normalizeRole('DEV_ROLE')).toBe('DEVELOPER');
      expect(normalizeRole('DESARROLLADOR_SENIOR')).toBe('DEVELOPER');
    });

    it('normalizes MANAGER roles to MANAGER', () => {
      expect(normalizeRole('MANAGER_ROLE')).toBe('MANAGER');
      expect(normalizeRole('LÍDER_TÉCNICO')).toBe('MANAGER');
    });

    it('normalizes other roles to ADMIN', () => {
      expect(normalizeRole('ADMIN')).toBe('ADMIN');
      expect(normalizeRole('UNKNOWN')).toBe('ADMIN');
    });
  });

  it('renders default values correctly when not authenticated', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user-role').textContent).toBe('NONE');
  });

  it('login updates user state and localStorage correctly', async () => {
    const mockUser = { email: 'test@mchav.com', rol: 'ADMIN', token: 'fake-token' };
    vi.mocked(authService.loginMock).mockResolvedValueOnce(mockUser);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    act(() => {
      screen.getByTestId('btn-login').click();
    });

    await waitFor(() => {
      expect(authService.loginMock).toHaveBeenCalledWith({ email: 'test@mchav.com', password: '123' });
      expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
      expect(screen.getByTestId('user-role').textContent).toBe('ADMIN');
      expect(localStorage.getItem('mchav_jwt_token')).toBe('fake-token');
      expect(localStorage.getItem('mock_user_session')).toBeTruthy();
    });
  });

  it('login handles errors correctly', async () => {
    vi.mocked(authService.loginMock).mockRejectedValueOnce({ response: { data: { detail: 'Credenciales inválidas' } } });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    act(() => {
      screen.getByTestId('btn-login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Credenciales inválidas');
      expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    });
  });

  it('logout clears state and storage', async () => {
    const mockUser = { email: 'test@mchav.com', rol: 'ADMIN', token: 'fake-token' };
    vi.mocked(authService.loginMock).mockResolvedValueOnce(mockUser);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    act(() => {
      screen.getByTestId('btn-login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    });

    act(() => {
      screen.getByTestId('btn-logout').click();
    });

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled();
      expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
      expect(localStorage.getItem('mchav_jwt_token')).toBeNull();
      expect(localStorage.getItem('mock_user_session')).toBeNull();
    });
  });

  it('approveUserPermission updates state when editing current user', async () => {
    const mockUser = { email: 'test@mchav.com', rol: 'ADMIN', token: 'fake-token' };
    vi.mocked(authService.loginMock).mockResolvedValueOnce(mockUser);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    act(() => {
      screen.getByTestId('btn-login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-role').textContent).toBe('ADMIN');
    });
    
    act(() => {
      screen.getByTestId('btn-approve').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-role').textContent).toBe('MANAGER');
      expect(screen.getByTestId('user-status').textContent).toBe('ACTIVE');
    });
  });

  it('switchViewRole updates the user view role', async () => {
    const mockUser = { email: 'test@mchav.com', rol: 'ADMIN', token: 'fake-token' };
    vi.mocked(authService.loginMock).mockResolvedValueOnce(mockUser);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    act(() => {
      screen.getByTestId('btn-login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-role').textContent).toBe('ADMIN');
    });

    act(() => {
      screen.getByTestId('btn-switch-role').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-role').textContent).toBe('DEVELOPER');
    });
  });

  it('loginWithJira redirects', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { href: '' } as any;

    act(() => {
      screen.getByTestId('btn-login-jira').click();
    });

    await waitFor(() => {
      expect(authService.getLoginUrl).toHaveBeenCalled();
      expect(window.location.href).toBe('http://test-jira-login.com');
    });

    window.location = originalLocation;
  });

  it('resetDemoState works correctly', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    localStorage.setItem('mock_approved_users', '[]');
    localStorage.setItem('mock_user_roles_map', '{"test": "MANAGER"}');
    
    act(() => {
      screen.getByTestId('btn-reset-demo').click();
    });

    await waitFor(() => {
      expect(localStorage.getItem('mock_approved_users')).toBeNull();
      expect(localStorage.getItem('mock_user_roles_map')).toBeNull();
    });
  });

  it('checkAuthSession sets user from stored session', async () => {
    const mockUser = { email: 'stored@mchav.com', rol: 'ADMIN' };
    localStorage.setItem('mock_user_session', JSON.stringify(mockUser));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
      expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    });
  });
});
