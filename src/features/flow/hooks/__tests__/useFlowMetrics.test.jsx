import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFlowMetrics } from '../useFlowMetrics';
import { flowService } from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  flowService: {
    getCycleTime: vi.fn(),
    getEfficiency: vi.fn(),
    getBottlenecks: vi.fn(),
    getBlockers: vi.fn(),
    getAging: vi.fn(),
    getCfdWip: vi.fn(),
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      }
    }
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useFlowMetrics hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch when projectId is empty', () => {
    const { result } = renderHook(() => useFlowMetrics(null), { wrapper: createWrapper() });
    expect(flowService.getCycleTime).not.toHaveBeenCalled();
    expect(result.current.cycleTime).toBeUndefined();
  });

  it('fetches all flow metrics when projectId is provided', async () => {
    flowService.getCycleTime.mockResolvedValue({ p50: 5, p75: 10 });
    flowService.getEfficiency.mockResolvedValue({ active_pct: 40 });
    flowService.getBottlenecks.mockResolvedValue([{ state: 'In Review' }]);
    flowService.getBlockers.mockResolvedValue([{ issue_key: 'ISSUE-1' }]);
    flowService.getAging.mockResolvedValue([{ issue_key: 'ISSUE-2' }]);
    flowService.getCfdWip.mockResolvedValue({ wip: { total: 5 } });

    const { result } = renderHook(() => useFlowMetrics('PROJ-1', 'SP-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(flowService.getCycleTime).toHaveBeenCalledWith('PROJ-1', 'SP-1');
    expect(flowService.getEfficiency).toHaveBeenCalledWith('PROJ-1', 'SP-1');
    expect(flowService.getBottlenecks).toHaveBeenCalledWith('PROJ-1', 'SP-1');
    expect(flowService.getBlockers).toHaveBeenCalledWith('PROJ-1');
    expect(flowService.getAging).toHaveBeenCalledWith('PROJ-1');
    expect(flowService.getCfdWip).toHaveBeenCalledWith('PROJ-1', 'SP-1');

    expect(result.current.cycleTime).toEqual({ p50: 5, p75: 10 });
    expect(result.current.efficiency).toEqual({ active_pct: 40 });
    expect(result.current.bottlenecks).toEqual([{ state: 'In Review' }]);
    expect(result.current.blockers).toEqual([{ issue_key: 'ISSUE-1' }]);
    expect(result.current.aging).toEqual([{ issue_key: 'ISSUE-2' }]);
    expect(result.current.cfdWip).toEqual({ wip: { total: 5 } });
  });

  it('exposes refetch and handles error state', async () => {
    flowService.getCycleTime.mockRejectedValue(new Error('Network error'));
    flowService.getEfficiency.mockResolvedValue({});
    flowService.getBottlenecks.mockResolvedValue([]);
    flowService.getBlockers.mockResolvedValue([]);
    flowService.getAging.mockResolvedValue([]);
    flowService.getCfdWip.mockResolvedValue({});

    const { result } = renderHook(() => useFlowMetrics('PROJ-1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(typeof result.current.refetch).toBe('function');
    result.current.refetch();
  });
});
