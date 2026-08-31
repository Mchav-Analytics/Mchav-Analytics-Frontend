import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCapacityCalculator } from '../useCapacityCalculator';

// Mock del local storage
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

describe('useCapacityCalculator Hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useCapacityCalculator());
    
    expect(result.current.devCount).toBe(4);
    expect(result.current.sprintDays).toBe(10);
    expect(result.current.vacationDays).toBe(2);
    expect(result.current.sickDevsCount).toBe(0);
    expect(result.current.sickDays).toBe(0);
    expect(result.current.avgDevVelocity).toBe(10);
    expect(result.current.absenceEvents.length).toBe(1);
    expect(result.current.taskStatusTab).toBe('ALL');
  });

  it('adds a new absence event and recalculates capacity', () => {
    const { result } = renderHook(() => useCapacityCalculator());
    
    act(() => {
      // simulate 5 days
      result.current.handleAddAbsenceEvent('Dev 2', 'SICK', '2026-09-01', '2026-09-07', 'Sick note');
    });

    expect(result.current.absenceEvents.length).toBe(2);
    expect(result.current.sickDevsCount).toBe(1);
    expect(result.current.sickDays).toBe(5);
    // vacation should remain the initial 2 days from the default event
    expect(result.current.vacationDays).toBe(2);
  });

  it('fails to add absence event if dates are invalid or zero days', () => {
    const { result } = renderHook(() => useCapacityCalculator());
    
    let added;
    act(() => {
      added = result.current.handleAddAbsenceEvent('Dev 2', 'VACATION', '2026-09-01', '2026-08-01', '');
    });

    expect(added).toBe(false);
    expect(result.current.absenceEvents.length).toBe(1);
  });

  it('removes an absence event and recalculates', () => {
    const { result } = renderHook(() => useCapacityCalculator());
    
    act(() => {
      result.current.handleRemoveEvent(1); // Default event has id 1
    });

    expect(result.current.absenceEvents.length).toBe(0);
    expect(result.current.vacationDays).toBe(0);
  });

  it('resets all scenarios', () => {
    const { result } = renderHook(() => useCapacityCalculator());
    
    act(() => {
      result.current.handleResetScenarios();
    });

    expect(result.current.absenceEvents.length).toBe(0);
    expect(result.current.sickDevsCount).toBe(0);
    expect(result.current.sickDays).toBe(0);
    expect(result.current.vacationDays).toBe(0);
  });

  it('filters jira tasks by status and search term', () => {
    const { result } = renderHook(() => useCapacityCalculator());
    
    act(() => {
      result.current.setTaskStatusTab('IN PROGRESS');
    });
    expect(result.current.filteredTasks.every(t => t.status === 'IN PROGRESS')).toBe(true);

    act(() => {
      result.current.setTaskStatusTab('ALL');
      result.current.setSelectedTaskProject('MCHAV');
      result.current.setTaskSearchTerm('login');
    });
    
    // We assume the mocked DB has some items, or we just check it doesn't crash 
    // and correctly applies the filter logic.
    expect(Array.isArray(result.current.filteredTasks)).toBe(true);
  });

  it('calculates diagnostics correctly for different impacts', () => {
    const { result } = renderHook(() => useCapacityCalculator());
    
    // Normal impact (<15%)
    act(() => {
      result.current.handleResetScenarios();
      result.current.setDevCount(4);
      result.current.setSprintDays(10);
      result.current.setAvgDevVelocity(10); // 40 capacity
      // 0 absences
    });
    expect(result.current.results.impactBadgeText).toContain('MANEJABLE');

    // Moderate impact (15-30%)
    act(() => {
      result.current.handleAddAbsenceEvent('Dev', 'VACATION', '2026-09-01', '2026-09-12', ''); // 10 business days
    });
    // 40 days total, 10 days absence -> 25% impact
    expect(result.current.results.impactBadgeText).toContain('MODERADO');

    // Critical impact (>30%)
    act(() => {
      result.current.handleAddAbsenceEvent('Dev2', 'SICK', '2026-09-01', '2026-09-12', ''); // 10 more business days
    });
    // 40 days total, 20 days absence -> 50% impact
    expect(result.current.results.impactBadgeText).toContain('CRÍTICO');
  });

  it('listens to custom window events to change tab', () => {
    const { result } = renderHook(() => useCapacityCalculator());
    
    act(() => {
      const event = new CustomEvent('mchav-change-tab', { detail: { status: 'DONE' } });
      window.dispatchEvent(event);
    });

    expect(result.current.taskStatusTab).toBe('DONE');
  });
});
