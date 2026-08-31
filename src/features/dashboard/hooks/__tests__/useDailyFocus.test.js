import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDailyFocus } from '../useDailyFocus';
import { developerService, jiraService } from '../../../../services/api';
import * as agendaLogic from '../../utils/agendaLogic';

// Mock services
vi.mock('../../../../services/api', () => ({
  developerService: {
    getMyScorecard: vi.fn(),
    updateTaskStatus: vi.fn()
  },
  jiraService: {
    triggerSync: vi.fn()
  }
}));

// Mock agendaLogic
vi.mock('../../utils/agendaLogic', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getTodayStr: vi.fn(() => '2026-08-30'),
    classifyAgendaTasks: vi.fn(),
    getNubiaAnalysis: vi.fn()
  };
});

const localStorageMock = (() => {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useDailyFocus Hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    
    // Default mocks
    developerService.getMyScorecard.mockResolvedValue({
      assigned_issues: [
        { id_jira: 1, key_issue: 'TSK-1', summary: 'Task 1', priority: 'High', story_points: 3, status_actual: 'IN PROGRESS', created_at: '2026-08-01', due_date: '2026-08-30' },
        { id_jira: 2, key_issue: 'TSK-2', summary: 'Task 2', priority: 'Media', story_points: 5, status_actual: 'LISTO', created_at: '2026-08-01' }
      ]
    });
    jiraService.triggerSync.mockResolvedValue(true);
    
    agendaLogic.classifyAgendaTasks.mockReturnValue({
      todayTasks: [
        { id: 1, key: 'TSK-1', status: 'POR HACER' },
        { id: 2, key: 'TSK-2', status: 'FINALIZADO' }
      ],
      overdueTasks: [],
      completedToday: 1,
      totalToday: 2,
      progressPct: 50
    });
    
    agendaLogic.getNubiaAnalysis.mockReturnValue({ tip: 'Great job!' });
  });

  it('fetches issues on mount and syncs with Jira', async () => {
    const { result } = renderHook(() => useDailyFocus('PROJ-1', 'Project One'));
    
    // Wait for the async useEffect to finish
    await vi.waitFor(() => {
      expect(jiraService.triggerSync).toHaveBeenCalledWith(true);
    });
    
    // Called once before sync, once after sync
    expect(developerService.getMyScorecard).toHaveBeenCalledTimes(2); 
    
    expect(result.current.loading).toBe(false);
    expect(result.current.isSyncing).toBe(false);
  });

  it('adds and deletes a note', () => {
    const { result } = renderHook(() => useDailyFocus('PROJ-1', 'Project One'));
    
    act(() => {
      result.current.setNewNoteText('New note test');
    });
    
    act(() => {
      result.current.handleAddNote({ preventDefault: vi.fn() });
    });

    expect(result.current.filteredNotes.length).toBe(1);
    expect(result.current.filteredNotes[0].text).toBe('New note test');
    expect(result.current.newNoteText).toBe('');

    const noteId = result.current.filteredNotes[0].id;
    act(() => {
      result.current.handleDeleteNote(noteId);
    });

    expect(result.current.filteredNotes.length).toBe(0);
  });

  it('toggles task done status', async () => {
    const { result } = renderHook(() => useDailyFocus('PROJ-1', 'Project One'));
    developerService.updateTaskStatus.mockResolvedValue({});
    
    // TSK-1 starts as POR HACER because of our mock, we can pass a dummy task to toggle
    const task = { id: 1, key: 'TSK-1', status: 'POR HACER' };
    
    await act(async () => {
      await result.current.handleToggleDone(task);
    });

    expect(developerService.updateTaskStatus).toHaveBeenCalledWith('TSK-1', 'FINALIZADO');
  });

  it('handles task focus and updates current page', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDailyFocus('PROJ-1', 'Project One'));
    
    act(() => {
      result.current.handleTaskFocus('TSK-2');
    });

    expect(result.current.highlightedTaskKey).toBe('TSK-2');
    // Task 2 is at index 1. itemsPerPage is 5. Page should be 1.
    expect(result.current.currentPage).toBe(1);

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(result.current.highlightedTaskKey).toBe(null);
    vi.useRealTimers();
  });
});
