import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTeamMatrix } from '../useTeamMatrix';
import { developerService } from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  developerService: {
    getTeamMatrix: vi.fn(),
    saveMatrixConfig: vi.fn(),
  }
}));

describe('useTeamMatrix hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches team matrix on mount and updates state with config', async () => {
    const mockData = {
      team_summary: {
        top_performer: 'Dev Alice',
        conteo_cuadrantes: { Q1: 3, Q2: 2 }
      },
      developers: [{ id: '1', name: 'Dev Alice' }],
      matrix_config: {
        quality_threshold: 85,
        weights: { w_tp: 30, w_sp: 25 },
        nombre_modelo: 'Modelo Ágil Personalizado'
      }
    };

    developerService.getTeamMatrix.mockResolvedValue(mockData);

    const { result } = renderHook(() => useTeamMatrix('PROJ-01'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(developerService.getTeamMatrix).toHaveBeenCalledWith('PROJ-01', null, {});
    expect(result.current.activeThreshold).toBe(85);
    expect(result.current.activeWeights).toEqual({ w_tp: 30, w_sp: 25 });
    expect(result.current.activeModelName).toBe('Modelo Ágil Personalizado');
    expect(result.current.topPerformer).toBe('Dev Alice');
    expect(result.current.developers).toHaveLength(1);
  });

  it('handles error in fetch gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    developerService.getTeamMatrix.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTeamMatrix('PROJ-01'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(consoleSpy).toHaveBeenCalled();
  });

  it('saveConfig saves and refetches with new config parameters', async () => {
    developerService.getTeamMatrix.mockResolvedValue({});
    developerService.saveMatrixConfig.mockResolvedValue({
      config: {
        quality_threshold: 90,
        weights: { w_tp: 35 },
        nombre_modelo: 'Modelo Optimizado'
      }
    });

    const { result } = renderHook(() => useTeamMatrix('PROJ-01'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.saveConfig({
        quality_threshold: 90,
        weight_throughput: 35
      });
    });

    expect(developerService.saveMatrixConfig).toHaveBeenCalledWith('PROJ-01', {
      quality_threshold: 90,
      weight_throughput: 35
    });
    expect(result.current.activeThreshold).toBe(90);
    expect(result.current.activeModelName).toBe('Modelo Optimizado');
  });

  it('applyPreview updates threshold, weights and triggers fetch', async () => {
    developerService.getTeamMatrix.mockResolvedValue({});
    const { result } = renderHook(() => useTeamMatrix('PROJ-01'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.applyPreview({
        threshold: 88,
        weights: { w_tp: 40 }
      });
    });

    expect(result.current.activeThreshold).toBe(88);
    expect(result.current.activeWeights).toEqual({ w_tp: 40 });
  });
});
