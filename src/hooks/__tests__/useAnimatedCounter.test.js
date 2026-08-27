import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAnimatedCounter } from '../useAnimatedCounter';

describe('useAnimatedCounter hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with 0 and increments towards target', () => {
    const { result } = renderHook(() => useAnimatedCounter(100, 1000));
    
    expect(result.current).toBe(0);

    // Advance by half the duration (500ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should be around 50
    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(100);

    // Advance to the end
    act(() => {
      vi.advanceTimersByTime(550);
    });

    expect(result.current).toBe(100);
  });

  it('handles target 0 correctly', () => {
    const { result } = renderHook(() => useAnimatedCounter(0, 1000));
    
    expect(result.current).toBe(0);

    act(() => {
      vi.advanceTimersByTime(16);
    });

    expect(result.current).toBe(0);
  });

  it('clears interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const { unmount } = renderHook(() => useAnimatedCounter(100, 1000));
    
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
