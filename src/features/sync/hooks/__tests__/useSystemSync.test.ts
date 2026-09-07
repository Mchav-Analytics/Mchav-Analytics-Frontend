import { renderHook, act, waitFor } from '@testing-library/react';
import { useSystemSync } from '../useSystemSync';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { jiraService } from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  jiraService: {
    getSyncLogs: vi.fn(),
    triggerSync: vi.fn()
  }
}));

describe('useSystemSync Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches logs on mount and updates status correctly', async () => {
    const mockLogs = [
      {
        id_log: 101,
        fecha_ejecucion: '2026-08-27T10:00:00Z',
        tipo_sincronizacion: 'AUTOMATIC',
        issues_procesados: 50,
        tiempo_ejecucion_segundos: 15,
        resultado: 'SUCCESS',
        ejecutado_por: 'System'
      }
    ];

    (jiraService.getSyncLogs as any).mockResolvedValueOnce(mockLogs);

    const { result } = renderHook(() => useSystemSync());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.logs.length).toBe(1);

    expect(result.current.logs[0].id).toBe('log-101');
    expect(result.current.syncStatus.status).toBe('IDLE');
  });

  it('triggers manual sync and updates status to SYNCING', async () => {
    (jiraService.getSyncLogs as any).mockResolvedValue([]);
    (jiraService.triggerSync as any).mockResolvedValueOnce({ message: 'Sync started' });

    const { result } = renderHook(() => useSystemSync());

    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.syncStatus.status).toBe('IDLE');

    act(() => {
      result.current.handleManualSync();
    });

    expect(result.current.syncStatus.status).toBe('SYNCING');
    expect(jiraService.triggerSync).toHaveBeenCalled();

    // Mock logs for the polling interval
    const mockSuccessLog = [{
      id_log: 999,
      fecha_ejecucion: '2026-08-27T10:05:00Z',
      resultado: 'SUCCESS'
    }];
    (jiraService.getSyncLogs as any).mockResolvedValue(mockSuccessLog);

    // Fast-forward interval
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(result.current.syncStatus.status).toBe('IDLE');
    expect(result.current.showSuccessAlert).toBe(true);

    // Alert disappears after 5 seconds
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(result.current.showSuccessAlert).toBe(false);
  });



  it('handles triggerSync failure', async () => {
    (jiraService.getSyncLogs as any).mockResolvedValue([]);
    (jiraService.triggerSync as any).mockRejectedValueOnce(new Error('API error'));

    const { result } = renderHook(() => useSystemSync());
    await act(async () => { await Promise.resolve(); });
    expect(result.current.syncStatus.status).toBe('IDLE');

    await act(async () => { result.current.handleManualSync(); });

    expect(result.current.syncStatus.status).toBe('FAILED');
    expect(result.current.syncErrorMsg).toContain('No se pudo iniciar');
  });

  it('handles cron time changes and save', async () => {
    (jiraService.getSyncLogs as any).mockResolvedValue([]);
    const { result } = renderHook(() => useSystemSync());

    act(() => {
      result.current.handleCronTimeChange({ target: { value: '15:30' } } as any);
    });
    expect(result.current.cronTime).toBe('15:30');

    act(() => {
      result.current.handleSaveCronTime();
    });
    expect(result.current.isSavingCron).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    
    expect(result.current.isSavingCron).toBe(false);
    expect(result.current.savedCronTime).toBe('15:30');
    expect(result.current.syncStatus.nextScheduledSync).toContain('15:30:00');
  });

  it('filters logs by time successfully', async () => {
    const now = new Date();
    const olderDate = new Date();
    olderDate.setDate(now.getDate() - 40); // 40 days ago

    const mockLogs = [
      {
        id_log: 101,
        fecha_ejecucion: now.toISOString(),
        resultado: 'SUCCESS'
      },
      {
        id_log: 102,
        fecha_ejecucion: olderDate.toISOString(),
        resultado: 'SUCCESS'
      }
    ];

    (jiraService.getSyncLogs as any).mockResolvedValueOnce(mockLogs);

    const { result } = renderHook(() => useSystemSync());

    await act(async () => { await Promise.resolve(); });
    expect(result.current.logs.length).toBe(2);

    act(() => {
      result.current.setTimeFilter('30d');
    });

    expect(result.current.filteredLogs.length).toBe(1);
    expect(result.current.filteredLogs[0].id).toBe('log-101');

    act(() => {
      result.current.setTimeFilter('90d');
    });

    expect(result.current.filteredLogs.length).toBe(2);
  });

  it('handles invalid dates gracefully in filter', async () => {
    const mockLogs = [
      { id_log: 1, fecha_ejecucion: 'invalid-date', resultado: 'SUCCESS' }
    ];
    (jiraService.getSyncLogs as any).mockResolvedValueOnce(mockLogs);

    const { result } = renderHook(() => useSystemSync());
    await act(async () => { await Promise.resolve(); });
    expect(result.current.logs.length).toBe(1);

    act(() => {
      result.current.setTimeFilter('30d');
    });

    // Invalid dates are included by default
    expect(result.current.filteredLogs.length).toBe(1);
  });
});
