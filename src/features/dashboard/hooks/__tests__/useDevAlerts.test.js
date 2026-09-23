import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDevAlerts } from '../useDevAlerts';
import { developerService } from '../../../../services/api';
import * as AuthContext from '../../../auth/context/AuthContext';

vi.mock('../../../../services/api', () => ({
  developerService: {
    getDevAlerts: vi.fn(),
    performAlertAction: vi.fn(),
  },
}));

vi.mock('../../../auth/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('useDevAlerts', () => {
  const mockProjects = [
    { id_proyecto: '1', nombre: 'Alpha Project' },
    { id_proyecto: '2', nombre: 'Beta Project' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { nombre: 'Dev Persona' },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with null alerts when selectedProjectId is empty', () => {
    const { result } = renderHook(() => useDevAlerts('', mockProjects));
    expect(result.current.loading).toBe(true);
    expect(result.current.alerts.length).toBe(2); // defaultAlerts fallback
    expect(developerService.getDevAlerts).not.toHaveBeenCalled();
  });

  it('fetches alerts successfully for selectedProjectId', async () => {
    const customAlerts = [
      { id: 'custom-1', title: 'Alerta Personalizada', level: 'HIGH' },
    ];
    vi.mocked(developerService.getDevAlerts).mockResolvedValueOnce({
      alerts: customAlerts,
    });

    const { result } = renderHook(() => useDevAlerts('1', mockProjects));

    expect(developerService.getDevAlerts).toHaveBeenCalledWith('1');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.alerts).toEqual(customAlerts);
    expect(result.current.projectName).toBe('Alpha Project');
    expect(result.current.devName).toBe('Dev Persona');
  });

  it('handles fetch error and falls back to default alerts and projectName fallback', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(AuthContext.useAuth).mockReturnValue({ user: null });
    vi.mocked(developerService.getDevAlerts).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useDevAlerts('999', mockProjects));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.devName).toBe('Valka Hoyos');
    expect(result.current.projectName).toBe('Proyecto 999');
    expect(result.current.alerts.length).toBe(2);
    consoleSpy.mockRestore();
  });

  it('handles handleAlertAction success with message and schedules clear after 5s', async () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
    vi.mocked(developerService.getDevAlerts).mockResolvedValueOnce({ alerts: [] });
    vi.mocked(developerService.performAlertAction).mockResolvedValueOnce({
      message: 'Completado con éxito',
    });

    const { result } = renderHook(() => useDevAlerts('1', mockProjects));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleAlertAction('101', 'RESOLVE');
    });

    expect(result.current.executingAction).toBe(true);

    await waitFor(() => {
      expect(result.current.executingAction).toBe(false);
    });

    expect(result.current.actionMsg).toBe('✅ Completado con éxito');
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);

    const timerCallback = setTimeoutSpy.mock.calls.find(c => c[1] === 5000)?.[0];
    if (timerCallback) {
      act(() => {
        timerCallback();
      });
      expect(result.current.actionMsg).toBe('');
    }
    setTimeoutSpy.mockRestore();
  });

  it('handles handleAlertAction success fallback message when message is empty', async () => {
    vi.mocked(developerService.getDevAlerts).mockResolvedValueOnce({ alerts: [] });
    vi.mocked(developerService.performAlertAction).mockResolvedValueOnce({});

    const { result } = renderHook(() => useDevAlerts('1', mockProjects));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleAlertAction('101', 'RESOLVE');
    });

    await waitFor(() => {
      expect(result.current.actionMsg).toBe('✅ Acción registrada correctamente.');
    });
  });

  it('handles handleAlertAction failure gracefully', async () => {
    vi.mocked(developerService.getDevAlerts).mockResolvedValueOnce({ alerts: [] });
    vi.mocked(developerService.performAlertAction).mockRejectedValueOnce(
      new Error('API failure')
    );

    const { result } = renderHook(() => useDevAlerts('1', mockProjects));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleAlertAction('102', 'DISMISS');
    });

    await waitFor(() => {
      expect(result.current.executingAction).toBe(false);
    });

    expect(result.current.actionMsg).toContain('⚠️ Error al ejecutar la acción para el ticket #102');
  });
});
