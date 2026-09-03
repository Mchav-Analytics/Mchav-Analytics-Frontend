import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDeveloperWorkload } from '../useDeveloperWorkload';
import { developerService, jiraService, projectService } from '../../../../services/api';

vi.mock('../../../../services/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    developerService: {
      getMyScorecard: vi.fn(),
      getDailyFocus: vi.fn(),
      updateTaskStatus: vi.fn()
    },
    jiraService: {
      triggerSync: vi.fn(),
      addComment: vi.fn()
    },
    projectService: {
      getKpiIssuesDetail: vi.fn(),
      transitionIssue: vi.fn()
    }
  };
});

describe('useDeveloperWorkload', () => {
  const defaultProjectId = 'P1';
  const mockUser = { email: 'dev@test.com', nombre: 'Test Dev' };
  const mockAssignedIssues = [
    {
      key_issue: 'MCHAV-1',
      summary: 'Task 1',
      status_actual: 'TO DO',
      story_points: 3,
      issue_type: 'Historia'
    },
    {
      key_issue: 'MCHAV-2',
      summary: 'Task 2',
      status_actual: 'IN PROGRESS',
      story_points: 5,
      issue_type: 'Bug'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    developerService.getMyScorecard.mockResolvedValue({
      assigned_issues: mockAssignedIssues
    });
    developerService.getDailyFocus.mockResolvedValue({
      ai_coach_tip: 'Focus on bugs',
      efficiency_gain_pct: 20,
      clean_deliveries_pct: 95
    });
    
    projectService.getKpiIssuesDetail.mockResolvedValue({
      issues: mockAssignedIssues
    });
    
    jiraService.triggerSync.mockResolvedValue({});
  });

  afterEach(() => {
  });

  it('initializes correctly and loads data', async () => {
    const { result } = renderHook(() => useDeveloperWorkload(defaultProjectId, mockUser));

    await waitFor(() => {
      expect(result.current.scorecard).toBeDefined();
      expect(result.current.aiCoachTip).toBe('Focus on bugs');
      expect(result.current.efficiencyGain).toBe(20);
      expect(result.current.cleanDeliveries).toBe(95);
      expect(result.current.assignedIssuesList.length).toBe(2);
    });

    expect(projectService.getKpiIssuesDetail).toHaveBeenCalledWith('P1', expect.objectContaining({
      assignee_email: 'dev@test.com'
    }));
  });

  it('handles reload data', async () => {
    const { result } = renderHook(() => useDeveloperWorkload(defaultProjectId, mockUser));

    await waitFor(() => {
      expect(result.current.scorecard).not.toBeNull();
    });

    await act(async () => {
      await result.current.handleReloadData();
    });

    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false);
    });
  });

  it('handles update task status', async () => {
    developerService.updateTaskStatus.mockResolvedValue({});
    projectService.transitionIssue.mockResolvedValue({ message: 'Success' });
    
    const { result } = renderHook(() => useDeveloperWorkload(defaultProjectId, mockUser));

    await waitFor(() => {
      expect(result.current.assignedIssuesList.length).toBe(2);
    });

    await act(async () => {
      await result.current.handleUpdateTaskStatus('MCHAV-1', 'EN PROGRESO', 3, 'Task 1');
    });

    expect(developerService.updateTaskStatus).toHaveBeenCalledWith('MCHAV-1', 'EN PROGRESO');
    expect(projectService.transitionIssue).toHaveBeenCalledWith('MCHAV-1', 'EN PROGRESO');
    
    expect(result.current.toastMsg).toContain('Success');
    
    // Check if state was updated
    const updatedIssue = result.current.scorecard.assigned_issues.find(i => i.key_issue === 'MCHAV-1');
    expect(updatedIssue.status_actual).toBe('EN PROGRESO');
  });

  it('handles update task status to DONE logs activity', async () => {
    developerService.updateTaskStatus.mockResolvedValue({});
    projectService.transitionIssue.mockResolvedValue({});
    
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    
    const { result } = renderHook(() => useDeveloperWorkload(defaultProjectId, mockUser));

    await waitFor(() => {
      expect(result.current.assignedIssuesList.length).toBe(2);
    });

    await act(async () => {
      await result.current.handleUpdateTaskStatus('MCHAV-1', 'DONE', 3, 'Bug 1');
    });

    expect(setItemSpy).toHaveBeenCalledWith('mchav_user_activity_log', expect.any(String));
    setItemSpy.mockRestore();
  });

  it('handles sending quick reply', async () => {
    jiraService.addComment.mockResolvedValue({});
    
    const { result } = renderHook(() => useDeveloperWorkload(defaultProjectId, mockUser));

    act(() => {
      result.current.handleOpenReply({ key_issue: 'MCHAV-1', id: 1 });
      result.current.setQuickReplyText('Test reply');
    });

    await act(async () => {
      // Pass a fake event
      await result.current.handleSendQuickReply({ preventDefault: vi.fn() });
    });

    expect(jiraService.addComment).toHaveBeenCalledWith('MCHAV-1', 'Test reply');
    expect(result.current.toastMsg).toContain('Respuesta enviada');
    expect(result.current.replyModalOpen).toBe(false);
  });

  it('handles submitting help request', async () => {
    const { result } = renderHook(() => useDeveloperWorkload(defaultProjectId, mockUser));

    await waitFor(() => {
      expect(result.current.scorecard).not.toBeNull();
    });

    act(() => {
      result.current.setHelpMessage('I need help');
    });

    act(() => {
      result.current.handleSubmitHelpRequest({ preventDefault: vi.fn() });
    });

    expect(result.current.showHelpSuccessToast).toBe(true);
  });

  it('filters tasks correctly', async () => {
    const { result } = renderHook(() => useDeveloperWorkload(defaultProjectId, mockUser));

    await waitFor(() => {
      expect(result.current.assignedIssuesList.length).toBe(2);
    });

    act(() => {
      result.current.setTaskFilter('IN_PROGRESS');
    });

    expect(result.current.filteredTasks.length).toBe(1);
    expect(result.current.filteredTasks[0].key_issue).toBe('MCHAV-2');

    act(() => {
      result.current.setTaskFilter('ALL');
      result.current.setTypeFilter('Bug');
    });

    expect(result.current.filteredTasks.length).toBe(1);
    expect(result.current.filteredTasks[0].key_issue).toBe('MCHAV-2');
  });
});
