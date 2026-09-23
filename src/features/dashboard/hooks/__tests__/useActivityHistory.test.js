import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useActivityHistory } from '../useActivityHistory';
import { projectService } from '../../../../services/api';

vi.mock('../../../../features/auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { email: 'dev@test.com', nombre: 'Test Dev' }
  }))
}));

vi.mock('../../../../services/api', () => ({
  projectService: {
    getKpiIssuesDetail: vi.fn()
  }
}));

describe('useActivityHistory Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('initializes with empty activityFeed when selectedProjectId is falsy', () => {
    const { result } = renderHook(() => useActivityHistory({ projects: [], selectedProjectId: null }));
    expect(result.current.activityFeed).toEqual([]);
  });

  it('fetches and formats activity feed successfully', async () => {
    const mockIssues = [
      {
        key_issue: 'KEY-1',
        status_actual: 'Done',
        resolved_at: '2026-03-01T12:00:00Z',
        story_points: 5,
        issue_type: 'Story'
      },
      {
        key_issue: 'KEY-2',
        status_actual: 'In Review',
        created_at: '2026-03-02T10:00:00Z',
        story_points: 3,
        issue_type: 'Bug'
      },
      {
        key_issue: 'KEY-3',
        status_actual: 'In Progress',
        created_at: '2026-03-02T11:00:00Z',
        story_points: 2,
        issue_type: 'Task'
      },
      {
        key_issue: 'KEY-4',
        status_actual: 'Open',
        story_points: 1
      }
    ];

    projectService.getKpiIssuesDetail.mockResolvedValueOnce({ issues: mockIssues });

    const { result } = renderHook(() => useActivityHistory({ projects: [], selectedProjectId: 'PROJ-01' }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.activityFeed.length).toBe(4);
    expect(result.current.unlockedCount).toBeGreaterThan(0);
    expect(result.current.fullBadgesCatalog.length).toBeGreaterThan(0);
  });

  it('allows changing filters, tabs, search query, and pagination', async () => {
    projectService.getKpiIssuesDetail.mockResolvedValueOnce({
      issues: [
        { key_issue: 'KEY-1', status_actual: 'Done', story_points: 5 },
        { key_issue: 'KEY-2', status_actual: 'Review', story_points: 2 }
      ]
    });

    const { result } = renderHook(() => useActivityHistory({ projects: [], selectedProjectId: 'PROJ-01' }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setActiveTab('ACHIEVEMENTS');
      result.current.setSearchQuery('KEY-1');
      result.current.setActionFilter('DONE');
      result.current.setCategoryFilter('Calidad');
      result.current.setBadgeStatusFilter('UNLOCKED');
      result.current.setSelectedBadgeModal({ title: 'Test Badge' });
      result.current.setCurrentPage(1);
    });

    expect(result.current.activeTab).toBe('ACHIEVEMENTS');
    expect(result.current.searchQuery).toBe('KEY-1');
    expect(result.current.actionFilter).toBe('DONE');
    expect(result.current.selectedBadgeModal).toEqual({ title: 'Test Badge' });
  });

  it('handles API failure gracefully', async () => {
    projectService.getKpiIssuesDetail.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useActivityHistory({ projects: [], selectedProjectId: 'PROJ-01' }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.activityFeed).toEqual([]);
  });
});
