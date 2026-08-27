import { renderHook, act, waitFor } from '@testing-library/react';
import { useDeveloperWorkload } from '../useDeveloperWorkload';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { developerService, projectService, jiraService } from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  developerService: {
    getMyScorecard: vi.fn(),
    getDailyFocus: vi.fn(),
    updateTaskStatus: vi.fn()
  },
  projectService: {
    getKpiIssuesDetail: vi.fn(),
    transitionIssue: vi.fn()
  },
  jiraService: {
    triggerSync: vi.fn(),
    addComment: vi.fn()
  }
}));

describe('useDeveloperWorkload Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = { email: 'dev@test.com', nombre: 'Test Dev' };

  it('fetches scorecard and formats issues on mount', async () => {
    developerService.getMyScorecard.mockResolvedValue({
      cycle_time_personal: 2.5,
      wip_tickets: 3
    });
    
    projectService.getKpiIssuesDetail.mockResolvedValue({
      issues: [
        { key_issue: 'TSK-1', summary: 'Tarea 1', status_actual: 'IN PROGRESS', issue_type: 'Historia' },
        { key_issue: 'TSK-2', summary: 'Tarea 2', status_actual: 'DONE', issue_type: 'Bug' }
      ]
    });

    const { result } = renderHook(() => useDeveloperWorkload('PROJ-1', mockUser));

    await waitFor(() => {
      expect(result.current.scorecard).not.toBeNull();
    });

    expect(result.current.scorecard.cycle_time_personal).toBe(2.5);
    expect(result.current.assignedIssuesList).toHaveLength(2);
    
    // Status normalization checks
    expect(result.current.assignedIssuesList[0].status_actual).toBe('EN PROGRESO');
    expect(result.current.assignedIssuesList[1].status_actual).toBe('LISTO');
    
    // Derived state check
    expect(result.current.historiasCount).toBe(1);
    expect(result.current.bugsCount).toBe(1);
  });

  it('handles filtering correctly', async () => {
    developerService.getMyScorecard.mockResolvedValue({});
    projectService.getKpiIssuesDetail.mockResolvedValue({
      issues: [
        { key_issue: 'TSK-1', status_actual: 'IN PROGRESS', issue_type: 'Historia' },
        { key_issue: 'TSK-2', status_actual: 'DONE', issue_type: 'Bug' },
        { key_issue: 'TSK-3', status_actual: 'TO DO', issue_type: 'Tarea' }
      ]
    });

    const { result } = renderHook(() => useDeveloperWorkload('PROJ-1', mockUser));

    await waitFor(() => {
      expect(result.current.assignedIssuesList).toHaveLength(3);
    });

    // Test Status Filter
    act(() => {
      result.current.setTaskFilter('IN_PROGRESS');
    });
    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].key_issue).toBe('TSK-1');

    act(() => {
      result.current.setTaskFilter('ALL');
      result.current.setTypeFilter('Bug');
    });
    expect(result.current.filteredTasks).toHaveLength(1);
    expect(result.current.filteredTasks[0].key_issue).toBe('TSK-2');
  });
});
