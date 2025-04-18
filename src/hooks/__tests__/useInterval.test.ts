import { renderHook } from '@testing-library/react';
import { vi, describe, expect, beforeEach, afterEach } from 'vitest';
import useInterval from '../useInterval';

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  test('should execute callback periodically', () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 1000));

    // Advance timers by 3 seconds
    vi.advanceTimersByTime(3000);

    // Expect callback to have been called 4 times (initial + 3 after advance)
    expect(callback).toHaveBeenCalledTimes(4);
  });

  test('should handle dynamic delay changes', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: 1000 },
    });

    // Advance timers by 2.5 seconds, then change delay to 500ms, then advance by 1.5 seconds
    vi.advanceTimersByTime(2500);
    rerender({ delay: 500 });
    vi.advanceTimersByTime(1500);

    // Expect callback to have been called 7 times (initial + 2 after rerender + 3 after advance)
    expect(callback).toHaveBeenCalledTimes(7);
  });

  test('should stop when delay is null', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: 1000 },
    });

    // Advance timers by 2 seconds, then change delay to null, then advance by 3 seconds
    vi.advanceTimersByTime(2000);
    rerender({ delay: null } as any);
    vi.advanceTimersByTime(3000);

    // Expect callback to have been called 4 times (initial + 2 after rerender)
    expect(callback).toHaveBeenCalledTimes(4);
  });

  test('should trigger immediately when dependencies change', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(({ deps }) => useInterval(callback, 1000, deps), {
      initialProps: { deps: [1] },
    });

    rerender({ deps: [2] });

    // Expect callback to have been called twice (initial + 1 after rerender)
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('should deep compare dependencies', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(({ deps }) => useInterval(callback, 1000, deps), {
      initialProps: { deps: [{ id: 1 }] },
    });

    // Same content, different reference
    rerender({ deps: [{ id: 1 }] });
    vi.advanceTimersByTime(1000);

    // Different content, different reference
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('should clean up on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useInterval(callback, 1000));

    // Advance timers by 3 seconds, then unmount
    unmount();
    vi.advanceTimersByTime(3000);

    // Expect callback to have been called once
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
