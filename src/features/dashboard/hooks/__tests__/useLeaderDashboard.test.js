import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLeaderDashboard } from '../useLeaderDashboard';
import { projectService, jqlService, userService } from '../../../../services/api';

// Mock services
vi.mock('../../../../services/api', () => ({
  projectService: {
    getSprintHealth: vi.fn(),
    getKpis: vi.fn(),
    getSprints: vi.fn()
  },
  jqlService: {
    executeJql: vi.fn()
  },
  userService: {
    getUsers: vi.fn()
  }
}));

describe('useLeaderDashboard Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches data successfully and populates state', async () => {
    projectService.getSprintHealth.mockImplementation((projectId, sprintId) => {
      if (sprintId) {
        return Promise.resolve({ metrics: { sp_planned: 40, sp_completed: 35 } });
      }
      return Promise.resolve({ gemini_insights: 'Some insight' });
    });

    userService.getUsers.mockResolvedValue([
      { nombre: 'Andres', rol: 'Dev' },
      { nombre: 'Camilo', rol: 'Dev' }
    ]);

    projectService.getKpis.mockResolvedValue([
      {
        velocity_promedio_historico: 80,
        lead_time_promedio_dias: 5,
        cycle_time_promedio_dias: 3,
        throughput_issues: 10
      }
    ]);

    jqlService.executeJql.mockResolvedValue({
      status: 'success',
      issues: [
        { key: 'PROJ-1', summary: 'Bug 1', assignee: 'Andres', priority: 'High', story_points: 3 }
      ]
    });

    projectService.getSprints.mockResolvedValue([
      { id_sprint: 'S1', nombre: 'Sprint 1' }
    ]);

    const { result } = renderHook(() => useLeaderDashboard('PROJ-1'));

    expect(result.current.loading).toBe(true);

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.geminiInsights).toBe('Some insight');
    expect(result.current.teamMembers.length).toBe(2);
    expect(result.current.kpis.sprintCompliance).toBe(80);
    expect(result.current.criticalIssues.length).toBe(1);
    expect(result.current.velocityData.length).toBe(1);
    expect(result.current.velocityData[0].compromisos).toBe(40);
  });

  it('handles empty responses or errors gracefully', async () => {
    projectService.getSprintHealth.mockRejectedValue(new Error('Health Error'));
    userService.getUsers.mockResolvedValue([]);
    projectService.getKpis.mockResolvedValue([]);
    jqlService.executeJql.mockRejectedValue(new Error('JQL Error'));
    projectService.getSprints.mockRejectedValue(new Error('Sprints Error'));

    const { result } = renderHook(() => useLeaderDashboard('PROJ-1'));

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.geminiInsights).toBe(null);
    expect(result.current.teamMembers.length).toBe(0);
    expect(result.current.kpis).toBe(null);
    expect(result.current.criticalIssues.length).toBe(0);
    expect(result.current.velocityData.length).toBe(0);
  });

  it('handles reassigning an issue', async () => {
    // Setup initial state
    jqlService.executeJql.mockResolvedValue({
      status: 'success',
      issues: [
        { key: 'PROJ-1', summary: 'Bug 1', assignee: 'Andres', priority: 'High', story_points: 3 }
      ]
    });
    userService.getUsers.mockResolvedValue([]);
    projectService.getKpis.mockResolvedValue([]);
    projectService.getSprints.mockResolvedValue([]);
    projectService.getSprintHealth.mockResolvedValue({});

    const { result } = renderHook(() => useLeaderDashboard('PROJ-1'));

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleConfirmReassign('PROJ-1', 'Camilo');
    });

    expect(result.current.criticalIssues[0].assignee).toBe('Camilo');
    expect(result.current.toastMessage).toContain('PROJ-1 reasignada correctamente a Camilo');
  });

  it('handles notifying dev and exporting pdf', async () => {
    vi.useFakeTimers();

    jqlService.executeJql.mockResolvedValue({ status: 'success', issues: [] });
    userService.getUsers.mockResolvedValue([]);
    projectService.getKpis.mockResolvedValue([]);
    projectService.getSprints.mockResolvedValue([]);
    projectService.getSprintHealth.mockResolvedValue({});

    const { result } = renderHook(() => useLeaderDashboard('PROJ-1'));

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleNotifyDev('PROJ-1', 'Andres');
    });

    expect(result.current.toastMessage).toContain('Notificación enviada a Andres sobre la incidencia PROJ-1');

    act(() => {
      result.current.handleExportPdf();
    });

    expect(result.current.isExportingPdf).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1500); // 1200ms timeout for pdf
    });

    expect(result.current.isExportingPdf).toBe(false);
    expect(result.current.toastMessage).toContain('descargado en formato PDF');

    vi.useRealTimers();
  });
});
