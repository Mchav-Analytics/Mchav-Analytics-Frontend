import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLogin } from '../hooks/useLogin';

// Mock dependencias externas
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

const mockLoginWithJira = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    loginWithJira: mockLoginWithJira,
    isAuthenticated: false,
    loading: false,
    error: null
  }))
}));

import { useAuth } from '../context/AuthContext';

describe('Hook: useLogin (Fase 4.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restaurar los valores por defecto del mock de AuthContext
    useAuth.mockImplementation(() => ({
      loginWithJira: mockLoginWithJira,
      isAuthenticated: false,
      loading: false,
      error: null
    }));
  });

  it('debe inicializar con los estados por defecto correctos', () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.isFlipped).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errorMessage).toBe('');
  });

  it('debe redirigir a /dashboard si ya está autenticado', () => {
    useAuth.mockImplementation(() => ({
      loginWithJira: mockLoginWithJira,
      isAuthenticated: true,
      loading: false,
      error: null
    }));

    renderHook(() => useLogin());

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('handleJiraAuth debe establecer isSubmitting en true y llamar a loginWithJira', async () => {
    mockLoginWithJira.mockResolvedValueOnce();

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.handleJiraAuth();
    });

    expect(result.current.isSubmitting).toBe(true);
    expect(mockLoginWithJira).toHaveBeenCalled();
    expect(result.current.errorMessage).toBe('');
  });

  it('handleJiraAuth debe manejar errores de autenticación', async () => {
    mockLoginWithJira.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.handleJiraAuth();
    });

    expect(mockLoginWithJira).toHaveBeenCalled();
    // isSubmitting debe volver a false si falla
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errorMessage).toBe('No se pudo conectar con Atlassian Jira. Inténtalo nuevamente.');
  });
});
