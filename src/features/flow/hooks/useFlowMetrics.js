import { useQuery } from '@tanstack/react-query';
import { flowService } from '../../../services/api';

export const useFlowMetrics = (projectId, sprintId = null) => {
  const isEnabled = !!projectId;

  const cycleTimeQuery = useQuery({
    queryKey: ['flow', 'cycleTime', projectId, sprintId],
    queryFn: () => flowService.getCycleTime(projectId, sprintId),
    enabled: isEnabled,
  });

  const efficiencyQuery = useQuery({
    queryKey: ['flow', 'efficiency', projectId, sprintId],
    queryFn: () => flowService.getEfficiency(projectId, sprintId),
    enabled: isEnabled,
  });

  const bottlenecksQuery = useQuery({
    queryKey: ['flow', 'bottlenecks', projectId, sprintId],
    queryFn: () => flowService.getBottlenecks(projectId, sprintId),
    enabled: isEnabled,
  });

  const blockersQuery = useQuery({
    queryKey: ['flow', 'blockers', projectId],
    queryFn: () => flowService.getBlockers(projectId),
    enabled: isEnabled,
  });

  const agingQuery = useQuery({
    queryKey: ['flow', 'aging', projectId],
    queryFn: () => flowService.getAging(projectId),
    enabled: isEnabled,
  });

  const cfdWipQuery = useQuery({
    queryKey: ['flow', 'cfdWip', projectId, sprintId],
    queryFn: () => flowService.getCfdWip(projectId, sprintId),
    enabled: isEnabled,
  });

  const isLoading = 
    cycleTimeQuery.isLoading || 
    efficiencyQuery.isLoading || 
    bottlenecksQuery.isLoading || 
    blockersQuery.isLoading || 
    agingQuery.isLoading || 
    cfdWipQuery.isLoading;

  const isError = 
    cycleTimeQuery.isError || 
    efficiencyQuery.isError || 
    bottlenecksQuery.isError || 
    blockersQuery.isError || 
    agingQuery.isError || 
    cfdWipQuery.isError;

  return {
    cycleTime: cycleTimeQuery.data,
    efficiency: efficiencyQuery.data,
    bottlenecks: bottlenecksQuery.data,
    blockers: blockersQuery.data,
    aging: agingQuery.data,
    cfdWip: cfdWipQuery.data,
    isLoading,
    isError,
    refetch: () => {
      cycleTimeQuery.refetch();
      efficiencyQuery.refetch();
      bottlenecksQuery.refetch();
      blockersQuery.refetch();
      agingQuery.refetch();
      cfdWipQuery.refetch();
    }
  };
};
