import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDevWorkload } from '../useDevWorkload';
import { developerService, jiraService } from '../../../../services/api';
import { useAuth } from '../../../auth/context/AuthContext';

vi.mock('../../../../services/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    developerService: {
      getMyScorecard: vi.fn()
    },
    jiraService: {
      getIssueTransitions: vi.fn(),
      triggerSync: vi.fn(),
      executeIssueTransition: vi.fn()
    }
  };
});

vi.mock('../../../auth/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('useDevWorkload', () => {
  const defaultProps = {
    projects: [{ id_proyecto: 'P1', nombre: 'Test Project' }],
    selectedProjectId: 'P1'
  };

  const mockAssignedIssues = [
    {
      id_jira: '100',
      key_issue: 'MCHAV-1',
      summary: 'Task 1',
      issue_type: 'Story',
      priority: 'High',
      status_actual: 'IN PROGRESS',
      created_at: '2026-09-01T10:00:00Z',
      story_points: 3
    },
    {
      id_jira: '101',
      key_issue: 'MCHAV-2',
      summary: 'Task 2',
      issue_type: 'Bug',
      priority: 'Critica',
      status_actual: 'DONE',
      created_at: '2026-09-02T10:00:00Z',
      story_points: 5
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: { nombre: 'Test Dev' } });
    
    developerService.getMyScorecard.mockResolvedValue({
      assigned_issues: mockAssignedIssues
    });
    
    jiraService.triggerSync.mockResolvedValue({});
    jiraService.getIssueTransitions.mockResolvedValue({ transitions: [] });
    jiraService.executeIssueTransition.mockResolvedValue({ status: 'DONE' });

  });

  afterEach(() => {
  });

  it('initializes correctly and loads data', async () => {
    const { result } = renderHook(() => useDevWorkload(defaultProps));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.tasksList.length).toBe(2);
    });

    expect(result.current.projectName).toBe('Test Project');
    expect(result.current.devName).toBe('Test Dev');
    expect(result.current.totalSPAssigned).toBe(8);
    expect(result.current.totalSPBurned).toBe(5);
  });

  it('filters tasks by search query', async () => {
    const { result } = renderHook(() => useDevWorkload(defaultProps));

    await waitFor(() => {
      expect(result.current.tasksList.length).toBe(2);
    });

    act(() => {
      result.current.setSearchQuery('Bug');
    });

    expect(result.current.filteredTasks.length).toBe(1);
    expect(result.current.filteredTasks[0].key).toBe('MCHAV-2');
  });

  it('filters tasks by status', async () => {
    const { result } = renderHook(() => useDevWorkload(defaultProps));

    await waitFor(() => {
      expect(result.current.tasksList.length).toBe(2);
    });

    act(() => {
      result.current.setStatusFilter('EN CURSO');
    });

    expect(result.current.filteredTasks.length).toBe(1);
    expect(result.current.filteredTasks[0].key).toBe('MCHAV-1');
  });

  it('filters tasks by priority', async () => {
    const { result } = renderHook(() => useDevWorkload(defaultProps));

    await waitFor(() => {
      expect(result.current.tasksList.length).toBe(2);
    });

    act(() => {
      result.current.setPriorityFilter('alta');
    });

    expect(result.current.filteredTasks.length).toBe(1);
    expect(result.current.filteredTasks[0].key).toBe('MCHAV-1'); // High matches 'alta' or 'high'
  });

  it('sorts tasks correctly', async () => {
    const { result } = renderHook(() => useDevWorkload(defaultProps));

    await waitFor(() => {
      expect(result.current.tasksList.length).toBe(2);
    });

    act(() => {
      result.current.setSortBy('SP_DESC');
    });

    expect(result.current.filteredTasks[0].key).toBe('MCHAV-2'); // 5 SP > 3 SP
  });

  it('handles task selection and loads transitions', async () => {
    const mockTransitions = [{ id: '21', name: 'In Progress' }];
    jiraService.getIssueTransitions.mockResolvedValueOnce({ transitions: mockTransitions });
    
    const { result } = renderHook(() => useDevWorkload(defaultProps));

    await waitFor(() => {
      expect(result.current.tasksList.length).toBe(2);
    });

    await act(async () => {
      result.current.setSelectedTaskModal(result.current.tasksList[0]);
    });

    expect(jiraService.getIssueTransitions).toHaveBeenCalledWith('MCHAV-1');
    
    await waitFor(() => {
      expect(result.current.availableTransitions).toEqual(mockTransitions);
    });
  });

  it('handles issue transition successfully', async () => {
    const { result } = renderHook(() => useDevWorkload(defaultProps));

    await waitFor(() => {
      expect(result.current.tasksList.length).toBe(2);
    });

    // Select task
    await act(async () => {
      result.current.setSelectedTaskModal(result.current.tasksList[0]);
    });

    // Handle transition
    await act(async () => {
      await result.current.handleSelectTransition({ id: '31', name: 'Done', to_status: 'DONE' });
    });

    expect(jiraService.executeIssueTransition).toHaveBeenCalledWith('MCHAV-1', {
      transition_id: '31',
      target_status: 'DONE'
    });
    
    expect(result.current.selectedTaskModal.status).toBe('FINALIZADO');
    expect(result.current.toastMsg).toContain('actualizado a "DONE"');
  });

  it('handles issue transition failure', async () => {
    jiraService.executeIssueTransition.mockRejectedValueOnce({
      response: { status: 403, data: { detail: 'Unauthorized' } }
    });
    
    const { result } = renderHook(() => useDevWorkload(defaultProps));

    await waitFor(() => {
      expect(result.current.tasksList.length).toBe(2);
    });

    await act(async () => {
      result.current.setSelectedTaskModal(result.current.tasksList[0]);
    });

    await act(async () => {
      await result.current.handleSelectTransition('Done');
    });

    expect(result.current.errorMsg).toContain('Unauthorized');
  });

  it('handles copy git branch', async () => {
    const writeTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const { result } = renderHook(() => useDevWorkload(defaultProps));

    await waitFor(() => {
      expect(result.current.tasksList.length).toBe(2);
    });

    act(() => {
      result.current.handleCopyGitBranch(result.current.tasksList[0]);
    });

    expect(writeTextMock).toHaveBeenCalledWith('git checkout -b feature/MCHAV-1-task-1');
    expect(result.current.copiedBranch).toBe(true);
  });
  
  it('sorts tasks correctly by OLDEST and PRIORITY', async () => {
    const { result } = renderHook(() => useDevWorkload(defaultProps));

    await waitFor(() => {
      expect(result.current.tasksList.length).toBe(2);
    });

    act(() => {
      result.current.setSortBy('OLDEST');
    });
    // Task 1 is older than Task 2
    expect(result.current.filteredTasks[0].key).toBe('MCHAV-1');

    act(() => {
      result.current.setSortBy('PRIORITY');
    });
    // Task 2 (Critica) > Task 1 (High)
    expect(result.current.filteredTasks[0].key).toBe('MCHAV-2');
  });

  it('closes modals on Escape key', async () => {
    const { result } = renderHook(() => useDevWorkload(defaultProps));
    
    await waitFor(() => {
      expect(result.current.tasksList.length).toBe(2);
    });

    act(() => {
      result.current.setSelectedTaskModal(result.current.tasksList[0]);
    });
    
    expect(result.current.selectedTaskModal).toBeDefined();

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
    });

    expect(result.current.selectedTaskModal).toBeNull();
  });

  it('closes dropdown on outside click', async () => {
    const { result } = renderHook(() => useDevWorkload(defaultProps));
    
    act(() => {
      // Mock the ref so the hook thinks it's attached to a DOM node
      result.current.dropdownRef.current = document.createElement('div');
      result.current.setIsStatusDropdownOpen(true);
    });
    
    expect(result.current.isStatusDropdownOpen).toBe(true);

    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true });
      document.dispatchEvent(event);
    });

    expect(result.current.isStatusDropdownOpen).toBe(false);
  });

  it('handles Jira 500 error with specific message', async () => {
    jiraService.executeIssueTransition.mockRejectedValueOnce({
      response: { status: 502, data: {} }
    });
    
    const { result } = renderHook(() => useDevWorkload(defaultProps));

    await waitFor(() => {
      expect(result.current.tasksList.length).toBe(2);
    });

    await act(async () => {
      result.current.setSelectedTaskModal(result.current.tasksList[0]);
    });

    await act(async () => {
      await result.current.handleSelectTransition('Done');
    });

    expect(result.current.errorMsg).toContain('No fue posible comunicarse con Jira');
  });
});
