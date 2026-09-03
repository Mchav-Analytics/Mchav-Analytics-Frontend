import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProyectosDashboard } from '../useProyectosDashboard';
import { projectService } from '../../../../services/api';
import { AuthProvider } from '../../../../features/auth/context/AuthContext';
import React from 'react';

vi.mock('../../../../services/api', () => {
  return {
    __esModule: true,
    default: {
      interceptors: { request: { use: vi.fn(), eject: vi.fn() }, response: { use: vi.fn(), eject: vi.fn() } }
    },
    projectService: {
      getProjects: vi.fn(),
      getProjectBurnup: vi.fn(),
      getProjectCFD: vi.fn(),
      getSprints: vi.fn(),
      getKpiIssuesDetail: vi.fn()
    }
  };
});

const wrapper = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useProyectosDashboard hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks returning empty data
    projectService.getProjects.mockResolvedValue([]);
    projectService.getProjectBurnup.mockResolvedValue([]);
    projectService.getProjectCFD.mockResolvedValue([]);
    projectService.getSprints.mockResolvedValue([]);
    projectService.getKpiIssuesDetail.mockResolvedValue([]);
  });

  it('initializes with default state', async () => {
    const { result } = renderHook(() => useProyectosDashboard({ userProfile: {} }), { wrapper });
    
    expect(result.current.searchTerm).toBe('');
    expect(result.current.selectedProjectId).toBe('ALL');
    expect(result.current.syncing).toBe(false);
  });

  it('loads real projects and calculates metrics correctly', async () => {
    const mockProjects = [
      { id_proyecto: 'PROJ-1', key_proyecto: 'P1', nombre: 'Test Project', estado: 'ACTIVE' }
    ];
    
    const mockIssues = [
      { status_actual: 'done', story_points: '5', cycle_time_days: '2.5' },
      { status_actual: 'in progress', story_points: '3', cycle_time_days: '0' }
    ];

    projectService.getProjects.mockResolvedValueOnce(mockProjects);
    projectService.getKpiIssuesDetail.mockResolvedValue(mockIssues); // Same for projects iteration and active project

    const { result } = renderHook(() => useProyectosDashboard({ userProfile: {} }), { wrapper });
    
    // Wait for useEffect
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.allProjectsList.length).toBe(1);
    expect(result.current.allProjectsList[0].name).toBe('Test Project');
    expect(result.current.allProjectsList[0].progress).toBe(50); // 1 done out of 2
    expect(result.current.allProjectsList[0].velocity).toBe('5.0');
    expect(result.current.allProjectsList[0].cycleTime).toBe('2.5 días');
  });

  it('loads fallback metrics if no project data', async () => {
    const { result } = renderHook(() => useProyectosDashboard({ userProfile: {} }), { wrapper });
    
    expect(result.current.activeVelocityData.length).toBeGreaterThan(0);
    expect(result.current.activePercentilesData.p50).toBeDefined();
    expect(result.current.activeCfdData.length).toBeGreaterThan(0);
    expect(result.current.activeBurnupData.length).toBeGreaterThan(0);
    expect(result.current.assignedTeam.length).toBe(3); // default fallback team
  });

  it('computes assignedTeam based on real issues', async () => {
    projectService.getKpiIssuesDetail.mockResolvedValueOnce([
      { assignee_name: 'John Doe', status_actual: 'in progress', story_points: '3' },
      { assignee_name: 'Jane Doe', status_actual: 'done', story_points: '5' },
      { assignee_name: 'John Doe', status_actual: 'por hacer', story_points: '2' },
      { assignee_name: 'Sin Asignar', status_actual: 'por hacer', story_points: '2' }
    ]);

    const { result } = renderHook(() => useProyectosDashboard({ userProfile: {} }), { wrapper });
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const team = result.current.assignedTeam;
    expect(team.length).toBe(2);
    const john = team.find(t => t.name === 'John Doe');
    expect(john.tasks).toBe('2 tareas (5 SP)');
    const jane = team.find(t => t.name === 'Jane Doe');
    expect(jane.tasks).toBe('Sin tareas pendientes');
  });

  it('filters displayProjects based on search term', async () => {
    projectService.getProjects.mockResolvedValueOnce([
      { id_proyecto: 'P1', nombre: 'Alpha' },
      { id_proyecto: 'P2', nombre: 'Beta' }
    ]);
    
    const { result } = renderHook(() => useProyectosDashboard({ userProfile: {} }), { wrapper });
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.setSearchTerm('alpha');
    });

    expect(result.current.displayProjects.length).toBe(1);
    expect(result.current.displayProjects[0].name).toBe('Alpha');
  });

  it('handles sync action', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useProyectosDashboard({ userProfile: {} }), { wrapper });

    act(() => {
      result.current.handleSyncNow();
    });

    expect(result.current.syncing).toBe(true);
    expect(result.current.toastMsg).toContain('sincronización');

    act(() => {
      vi.advanceTimersByTime(1800);
    });

    expect(result.current.syncing).toBe(false);
    expect(result.current.toastMsg).toContain('éxito');

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.toastMsg).toBeNull();
    vi.useRealTimers();
  });
  
  it('handles API errors gracefully', async () => {
    projectService.getProjects.mockRejectedValueOnce(new Error('Network error'));
    projectService.getProjectBurnup.mockRejectedValueOnce(new Error('Network error'));
    projectService.getProjectCFD.mockRejectedValueOnce(new Error('Network error'));
    projectService.getSprints.mockRejectedValueOnce(new Error('Network error'));
    projectService.getKpiIssuesDetail.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useProyectosDashboard({ userProfile: {} }), { wrapper });
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.allProjectsList).toEqual([]);
    expect(result.current.activeBurnupData.length).toBeGreaterThan(0); // uses fallback
  });
});
