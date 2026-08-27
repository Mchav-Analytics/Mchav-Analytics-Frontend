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

    await waitFor(() => {
      expect(result.current.logs.length).toBe(1);
    });

    expect(result.current.logs[0].id).toBe('log-101');
    expect(result.current.syncStatus.status).toBe('IDLE');
  });

  it('triggers manual sync and updates status to SYNCING', async () => {
    (jiraService.getSyncLogs as any).mockResolvedValue([]);
    (jiraService.triggerSync as any).mockResolvedValueOnce({ message: 'Sync started' });

    const { result } = renderHook(() => useSystemSync());

    await waitFor(() => {
      expect(result.current.syncStatus.status).toBe('IDLE');
    });

    act(() => {
      result.current.handleManualSync();
    });

    expect(result.current.syncStatus.status).toBe('SYNCING');
    expect(jiraService.triggerSync).toHaveBeenCalled();
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

    await waitFor(() => {
      expect(result.current.logs.length).toBe(2);
    });

    act(() => {
      result.current.setTimeFilter('30d');
    });

    expect(result.current.filteredLogs.length).toBe(1);
    expect(result.current.filteredLogs[0].id).toBe('log-101');

    act(() => {
      result.current.setTimeFilter('60d');
    });

    expect(result.current.filteredLogs.length).toBe(2);
  });
});
