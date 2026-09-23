import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTeamScorecards } from '../useTeamScorecards';
import { developerService } from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  developerService: {
    getDevelopers: vi.fn(),
    getDeveloperScorecard: vi.fn(),
  }
}));

describe('useTeamScorecards hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches developers and loads first developer scorecard on mount', async () => {
    const mockDevs = [
      { assignee_id: 'dev-1', nombre: 'Carlos Dev', email: 'carlos@mchav.com' },
      { assignee_id: 'dev-2', nombre: 'Ana Dev', email: 'ana@mchav.com' }
    ];
    const mockCard = { performance_score: 92, completed_issues: 14 };

    developerService.getDevelopers.mockResolvedValue(mockDevs);
    developerService.getDeveloperScorecard.mockResolvedValue(mockCard);

    const { result } = renderHook(() => useTeamScorecards('PROJ-1'));

    expect(result.current.loadingDevs).toBe(true);

    await waitFor(() => {
      expect(result.current.loadingDevs).toBe(false);
    });

    expect(result.current.developers).toHaveLength(2);
    expect(result.current.selectedDev).toEqual(mockDevs[0]);

    await waitFor(() => {
      expect(result.current.scorecard).toEqual(mockCard);
    });

    expect(developerService.getDeveloperScorecard).toHaveBeenCalledWith('dev-1', 'PROJ-1');
  });

  it('handles search filter and pagination correctly', async () => {
    const mockDevs = [
      { assignee_id: 'dev-1', nombre: 'Carlos Dev', email: 'carlos@mchav.com' },
      { assignee_id: 'dev-2', nombre: 'Ana Dev', email: 'ana@mchav.com' }
    ];

    developerService.getDevelopers.mockResolvedValue(mockDevs);
    developerService.getDeveloperScorecard.mockResolvedValue({});

    const { result } = renderHook(() => useTeamScorecards('PROJ-1'));

    await waitFor(() => {
      expect(result.current.loadingDevs).toBe(false);
    });

    act(() => {
      result.current.setSearchFilter('ana');
    });

    expect(result.current.filteredDevs).toHaveLength(1);
    expect(result.current.filteredDevs[0].nombre).toBe('Ana Dev');
  });

  it('handles errors gracefully', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    developerService.getDevelopers.mockRejectedValue(new Error('Devs error'));

    const { result } = renderHook(() => useTeamScorecards('PROJ-1'));

    await waitFor(() => {
      expect(result.current.loadingDevs).toBe(false);
    });

    expect(warnSpy).toHaveBeenCalled();
  });
});
