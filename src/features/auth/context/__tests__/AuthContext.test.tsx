import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import { authService } from '../../../../services/api';

vi.mock('../../../../services/api', () => {
  return {
    authService: {
      getCurrentUser: vi.fn(),
      loginMock: vi.fn(),
      logout: vi.fn(),
      getLoginUrl: vi.fn(() => 'http://test-url')
    },
    USE_MOCK_DATA: false
  };
});

const TestComponent = () => {
  const { user, login, logout, loading, isAuthenticated } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Autenticado' : 'No Autenticado'}</div>
      <div data-testid="user-email">{user?.email || 'N/A'}</div>
      <button onClick={() => login({ email: 'test@example.com', password: '123' })}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('provides unauthenticated state initially when no tokens exist', async () => {
    authService.getCurrentUser.mockRejectedValue(new Error('No token'));
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('No Autenticado');
      expect(screen.getByTestId('user-email')).toHaveTextContent('N/A');
    });
  });

  it('authenticates user when login is called', async () => {
    const mockUser = { email: 'test@example.com', rol: 'ADMIN', token: 'fake-jwt' };
    authService.loginMock.mockResolvedValue(mockUser);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());
    
    act(() => {
      screen.getByText('Login').click();
    });
    
    await waitFor(() => {
      expect(authService.loginMock).toHaveBeenCalledWith({ email: 'test@example.com', password: '123' });
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticado');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  it('logs out the user', async () => {
    localStorage.setItem('mchav_jwt_token', 'fake-token');
    authService.getCurrentUser.mockResolvedValue({ email: 'test@example.com', rol: 'ADMIN' });
    authService.logout.mockResolvedValue({ status: 'success' });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticado');
    });
    
    act(() => {
      screen.getByText('Logout').click();
    });
    
    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled();
      expect(screen.getByTestId('auth-status')).toHaveTextContent('No Autenticado');
    });
  });
});
