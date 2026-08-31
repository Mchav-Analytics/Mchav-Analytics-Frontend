import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSprintHealth } from '../useSprintHealth';
import { projectService } from '../../../../services/api';

// Mock services
vi.mock('../../../../services/api', () => ({
  projectService: {
    getSprints: vi.fn(),
    getSprintHealth: vi.fn()
  }
}));

describe('useSprintHealth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches sprints and sets the first one as selected on mount', async () => {
    projectService.getSprints.mockResolvedValue([
      { id_sprint: 'SPRINT-1', name: 'Sprint 1' },
      { id_sprint: 'SPRINT-2', name: 'Sprint 2' }
    ]);
    
    projectService.getSprintHealth.mockResolvedValue({
      health_score: 85,
      metrics: { total_issues: 10 },
      bottleneck_stages: [{ stage: 'In Progress', count: 5 }],
      scope_creep_warning: 'None'
    });

    const { result } = renderHook(() => useSprintHealth('PROJ-1'));
    
    await vi.waitFor(() => {
      expect(result.current.sprints.length).toBe(2);
    });

    expect(result.current.selectedSprintId).toBe('SPRINT-1');
    
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.healthScore).toBe(85);
    expect(result.current.metrics.total_issues).toBe(10);
    expect(result.current.stages[0].spanishStage).toBe('Desarrollo Activo');
  });

  it('handles empty sprints list', async () => {
    projectService.getSprints.mockResolvedValue([]);
    
    const { result } = renderHook(() => useSprintHealth('PROJ-1'));

    await vi.waitFor(() => {
      expect(projectService.getSprints).toHaveBeenCalled();
    });

    expect(result.current.sprints.length).toBe(0);
    expect(result.current.selectedSprintId).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  it('handles getSprints error', async () => {
    projectService.getSprints.mockRejectedValue(new Error('Network Error'));
    
    const { result } = renderHook(() => useSprintHealth('PROJ-1'));

    await vi.waitFor(() => {
      expect(projectService.getSprints).toHaveBeenCalled();
    });

    expect(result.current.sprints.length).toBe(0);
    expect(result.current.selectedSprintId).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  it('handles getSprintHealth error', async () => {
    projectService.getSprints.mockResolvedValue([
      { id_sprint: 'SPRINT-1', name: 'Sprint 1' }
    ]);
    
    projectService.getSprintHealth.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useSprintHealth('PROJ-1'));

    await vi.waitFor(() => {
      expect(projectService.getSprints).toHaveBeenCalled();
    });
    
    await vi.waitFor(() => {
      expect(projectService.getSprintHealth).toHaveBeenCalled();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.healthScore).toBe(0); // fallback
  });

  it('translates stages correctly', async () => {
    projectService.getSprints.mockResolvedValue([
      { id_sprint: 'SPRINT-1', name: 'Sprint 1' }
    ]);
    
    projectService.getSprintHealth.mockResolvedValue({
      bottleneck_stages: [
        { stage: 'In Progress', count: 1 },
        { stage: 'QA Testing', count: 1 },
        { stage: 'In Review', count: 1 },
        { stage: 'To Do', count: 1 },
        { stage: 'Unknown Stage', count: 1 },
        { stage: null, count: 1 }
      ]
    });

    const { result } = renderHook(() => useSprintHealth('PROJ-1'));

    await vi.waitFor(() => {
      expect(result.current.stages.length).toBeGreaterThan(0);
    });

    const stages = result.current.stages;
    expect(stages.find(s => s.stage === 'In Progress').spanishStage).toBe('Desarrollo Activo');
    expect(stages.find(s => s.stage === 'QA Testing').spanishStage).toBe('Pruebas de Calidad (QA)');
    expect(stages.find(s => s.stage === 'In Review').spanishStage).toBe('Revisión de Código');
    expect(stages.find(s => s.stage === 'To Do').spanishStage).toBe('En Cola de Espera');
    expect(stages.find(s => s.stage === 'Unknown Stage').spanishStage).toBe('Unknown Stage');
    expect(stages.find(s => s.stage === null).spanishStage).toBe('Etapa');
  });

  it('changes selected sprint and fetches new health data', async () => {
    projectService.getSprints.mockResolvedValue([
      { id_sprint: 'SPRINT-1', name: 'Sprint 1' },
      { id_sprint: 'SPRINT-2', name: 'Sprint 2' }
    ]);
    
    projectService.getSprintHealth.mockResolvedValue({ health_score: 90 });

    const { result } = renderHook(() => useSprintHealth('PROJ-1'));

    await vi.waitFor(() => {
      expect(result.current.selectedSprintId).toBe('SPRINT-1');
    });

    act(() => {
      result.current.setSelectedSprintId('SPRINT-2');
    });

    await vi.waitFor(() => {
      expect(projectService.getSprintHealth).toHaveBeenCalledWith('PROJ-1', 'SPRINT-2');
    });
  });
});
