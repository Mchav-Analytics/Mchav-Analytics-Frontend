import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLogin } from '../useLogin';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

const mockAuth = {
  loginWithJira: vi.fn(),
  isAuthenticated: false,
  loading: false,
  error: null
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuth
}));

describe('useLogin hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.isAuthenticated = false;
    mockAuth.loading = false;
    mockAuth.error = null;
  });

  it('redirects to /dashboard if already authenticated', () => {
    mockAuth.isAuthenticated = true;
    renderHook(() => useLogin());
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('handles parallax mouse movement and reset on mouse leave', () => {
    const { result } = renderHook(() => useLogin());

    const dummyEl = {
      style: {
        setProperty: vi.fn()
      }
    };
    result.current.containerRef.current = dummyEl;

    act(() => {
      result.current.handleMouseMove({ clientX: 500, clientY: 400 });
    });
    expect(dummyEl.style.setProperty).toHaveBeenCalledWith('--mouse-norm-x', expect.any(Number));
    expect(dummyEl.style.setProperty).toHaveBeenCalledWith('--mouse-norm-y', expect.any(Number));

    act(() => {
      result.current.handleMouseLeave();
    });
    expect(dummyEl.style.setProperty).toHaveBeenCalledWith('--mouse-norm-x', 0);
    expect(dummyEl.style.setProperty).toHaveBeenCalledWith('--mouse-norm-y', 0);
  });

  it('handles successful Jira authentication', async () => {
    mockAuth.loginWithJira.mockResolvedValueOnce();
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.handleJiraAuth();
    });

    expect(mockAuth.loginWithJira).toHaveBeenCalled();
    expect(result.current.errorMessage).toBe('');
  });

  it('handles failed Jira authentication with error message', async () => {
    mockAuth.loginWithJira.mockRejectedValueOnce(new Error('Jira connection failed'));
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.handleJiraAuth();
    });

    expect(mockAuth.loginWithJira).toHaveBeenCalled();
    expect(result.current.errorMessage).toBe('No se pudo conectar con Atlassian Jira. Inténtalo nuevamente.');
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handles local dev login', () => {
    delete window.location;
    window.location = { href: '' };

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.handleLocalDevLogin();
    });

    expect(result.current.isSubmitting).toBe(true);
    expect(localStorage.getItem('mock_user_session')).toContain('admin@mchav.com');
    expect(window.location.href).toBe('/dashboard');
  });

  it('toggles isFlipped state', () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setIsFlipped(true);
    });
    expect(result.current.isFlipped).toBe(true);
  });
});
