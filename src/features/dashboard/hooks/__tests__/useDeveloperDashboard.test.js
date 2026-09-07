import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDeveloperDashboard } from '../useDeveloperDashboard';
import { developerService, jiraService } from '../../../../services/api';
import { useAuth } from '../../../auth/context/AuthContext';

vi.mock('../../../../services/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    developerService: {
      getMyScorecard: vi.fn(),
      getDailyFocus: vi.fn()
    },
    jiraService: {
      triggerSync: vi.fn(),
      addComment: vi.fn()
    }
  };
});

vi.mock('../../../auth/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('useDeveloperDashboard', () => {
  const defaultProps = {
    projects: [{ id_proyecto: 'P1', nombre: 'Project 1' }],
    selectedProjectId: 'P1'
  };

  const mockUser = { nombre: 'Test Developer', email: 'test@dev.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });

    developerService.getMyScorecard.mockResolvedValue({
      assigned_issues: [
        { key_issue: 'MCHAV-1', status_actual: 'TO DO', tipo: 'Historia', fecha_creacion: '2026-09-01T10:00:00Z' },
        { key_issue: 'MCHAV-2', status_actual: 'IN PROGRESS', tipo: 'Bug', fecha_creacion: '2026-09-02T10:00:00Z' }
      ]
    });

    developerService.getDailyFocus.mockResolvedValue({
      ai_coach_tip: 'Write tests',
      efficiency_gain_pct: 15,
      clean_deliveries_pct: 90
    });

    jiraService.triggerSync.mockResolvedValue({});
  });

  afterEach(() => {
  });

  it('initializes and loads data correctly', async () => {
    const { result } = renderHook(() => useDeveloperDashboard(defaultProps));

    await waitFor(() => {
      expect(result.current.scorecard).toBeDefined();
      expect(result.current.aiCoachTip).toBe('Write tests');
    });

    expect(result.current.devName).toBe('Test Developer');
    expect(result.current.efficiencyGain).toBe(15);
    expect(result.current.cleanDeliveries).toBe(90);
    expect(result.current.assignedIssuesList.length).toBe(2);
    
    // Status normalization
    expect(result.current.assignedIssuesList[0].status_actual).toBe('PENDIENTE');
    expect(result.current.assignedIssuesList[1].status_actual).toBe('EN PROGRESO');
  });

  it('handles reload data', async () => {
    const { result } = renderHook(() => useDeveloperDashboard(defaultProps));

    await waitFor(() => {
      expect(result.current.scorecard).toBeDefined();
    });

    await act(async () => {
      await result.current.handleReloadData();
    });

    expect(jiraService.triggerSync).toHaveBeenCalledTimes(2);
    expect(result.current.isRefreshing).toBe(true);

    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false);
    });
  });

  it('filters tasks by status and type', async () => {
    const { result } = renderHook(() => useDeveloperDashboard(defaultProps));

    await waitFor(() => {
      expect(result.current.assignedIssuesList.length).toBe(2);
    });

    act(() => {
      result.current.setTaskFilter('IN_PROGRESS');
    });

    expect(result.current.filteredTasks.length).toBe(1);
    expect(result.current.filteredTasks[0].key_issue).toBe('MCHAV-2');

    act(() => {
      result.current.setTaskFilter('PENDING');
      result.current.setTypeFilter('Historia');
    });

    expect(result.current.filteredTasks.length).toBe(1);
    expect(result.current.filteredTasks[0].key_issue).toBe('MCHAV-1');
  });

  it('handles sending quick reply', async () => {
    jiraService.addComment.mockResolvedValue({});
    
    const { result } = renderHook(() => useDeveloperDashboard(defaultProps));

    act(() => {
      result.current.handleOpenReply({ key_issue: 'MCHAV-1', id: 1 });
      result.current.setQuickReplyText('Test reply');
    });

    await act(async () => {
      await result.current.handleSendQuickReply({ preventDefault: vi.fn() });
    });

    expect(jiraService.addComment).toHaveBeenCalledWith('MCHAV-1', 'Test reply');
    expect(result.current.toastMsg).toContain('Respuesta enviada');
    expect(result.current.replyModalOpen).toBe(false);
  });

  it('handles submitting help request', async () => {
    const { result } = renderHook(() => useDeveloperDashboard(defaultProps));

    await waitFor(() => {
      expect(result.current.scorecard).toBeDefined();
    });

    act(() => {
      result.current.setHelpMessage('Help me');
      result.current.setHelpIssueKey('MCHAV-1');
    });

    act(() => {
      result.current.handleSubmitHelpRequest({ preventDefault: vi.fn() });
    });

    expect(result.current.submittedHelpRequests.length).toBe(1);
    expect(result.current.submittedHelpRequests[0].issueKey).toBe('MCHAV-1');
    expect(result.current.helpMessage).toBe('');
    expect(result.current.showHelpSuccessToast).toBe(true);

  });
});
