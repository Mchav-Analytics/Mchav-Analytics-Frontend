import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import LoginView from '../LoginView';
import { useAuth } from '../../context/AuthContext';

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('LoginView', () => {
  const mockNavigate = vi.fn();
  const mockLoginWithJira = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('redirects to dashboard if already authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loginWithJira: mockLoginWithJira,
      loading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <LoginView />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('renders login components correctly', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loginWithJira: mockLoginWithJira,
      loading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <LoginView />
      </MemoryRouter>
    );

    expect(screen.getByText('Bienvenido a MCHAV')).toBeInTheDocument();
    expect(screen.getByText('Continuar con Atlassian (Jira)')).toBeInTheDocument();
    expect(screen.getByText('MCHAV Analytics')).toBeInTheDocument();
  });

  it('calls loginWithJira when button is clicked', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loginWithJira: mockLoginWithJira,
      loading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <LoginView />
      </MemoryRouter>
    );

    const button = screen.getByText('Continuar con Atlassian (Jira)').closest('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLoginWithJira).toHaveBeenCalled();
    });
  });

  it('displays auth error if present', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loginWithJira: mockLoginWithJira,
      loading: false,
      error: 'Error de autenticación mock',
    });

    render(
      <MemoryRouter>
        <LoginView />
      </MemoryRouter>
    );

    expect(screen.getByText('⚠️ Error de autenticación mock')).toBeInTheDocument();
  });
});
