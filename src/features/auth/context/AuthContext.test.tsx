import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { AuthProvider, useAuth, normalizeRole } from './AuthContext';
import { authService } from '../../../services/api';

// Mock authService
vi.mock('../../../services/api', () => ({
  USE_MOCK_DATA: true,
  authService: {
    getCurrentUser: vi.fn(),
    loginMock: vi.fn(),
    logout: vi.fn(),
    getLoginUrl: vi.fn()
  }
}));

const TestComponent = () => {
  const { user, isAuthenticated, loading, login, logout, switchViewRole } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-role">{user?.rol || 'No Role'}</div>
      <button onClick={() => login({ email: 'test@mchav.com' })}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => switchViewRole('DEVELOPER')}>Switch to DEV</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('normalizeRole', () => {
    it('normalizes developer variations', () => {
      expect(normalizeRole('DEV')).toBe('DEVELOPER');
      expect(normalizeRole('DESARROLLADOR')).toBe('DEVELOPER');
    });

    it('normalizes manager variations', () => {
      expect(normalizeRole('LIDER')).toBe('MANAGER');
      expect(normalizeRole('MANAG')).toBe('MANAGER');
    });

    it('defaults to ADMIN', () => {
      expect(normalizeRole('')).toBe('ADMIN');
      expect(normalizeRole('UNKNOWN')).toBe('ADMIN');
    });
  });

  it('provides default unauthenticated state initially', async () => {
    (authService.getCurrentUser as any).mockRejectedValue(new Error('No session'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial state is loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // After loading resolves
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });
  });

  it('handles login successfully', async () => {
    (authService.getCurrentUser as any).mockRejectedValue(new Error('No session'));
    (authService.loginMock as any).mockResolvedValue({ email: 'test@mchav.com', rol: 'ADMIN', nombre: 'Test User' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    // Trigger login
    screen.getByText('Login').click();

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-role')).toHaveTextContent('ADMIN');
    });
  });

  it('handles role switching', async () => {
    (authService.getCurrentUser as any).mockResolvedValue({ email: 'admin@mchav.com', rol: 'ADMIN', nombre: 'Admin' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-role')).toHaveTextContent('ADMIN');
    });

    // Trigger role switch
    screen.getByText('Switch to DEV').click();

    await waitFor(() => {
      expect(screen.getByTestId('user-role')).toHaveTextContent('DEVELOPER');
    });
  });
});
