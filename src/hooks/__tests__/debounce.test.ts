import { afterEach, vi, describe, expect, it, Mock } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useDebounce, useDebounceCallback, useLatestRef, useThrottleCallback } from '../debounce';

describe('useDebounce', () => {
  vi.useFakeTimers();

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('should update value after delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'first', delay: 500 },
    });

    rerender({ value: 'updated', delay: 500 });

    // Should not be updated before the delay time
    act(() => vi.advanceTimersByTime(499));
    expect(result.current).toBe('first');

    // Update after the delay time is reached
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout when value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });
    act(() => vi.advanceTimersByTime(300));

    rerender({ value: 'third' });
    act(() => vi.advanceTimersByTime(500));

    expect(result.current).toBe('third');
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(({ delay }) => useDebounce('test', delay), {
      initialProps: { delay: 500 },
    });

    rerender({ delay: 200 });
    act(() => vi.advanceTimersByTime(200));

    expect(result.current).toBe('test');
  });
});

describe('useDebounceCallback', () => {
  const mockCallback = vi.fn();

  // Use fake timers for testing setTimeout
  vi.useFakeTimers();

  it('should not invoke callback immediately', () => {
    const { result } = renderHook(() => useDebounceCallback(mockCallback, []));

    act(() => {
      result.current('test arg');
    });

    // Ensure the callback is not called immediately
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should invoke callback after delay', () => {
    const { result } = renderHook(() => useDebounceCallback(mockCallback, [], 500));

    act(() => {
      result.current('test arg');
    });

    // Make sure time has passed
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Ensure the callback is called after the delay
    expect(mockCallback).toHaveBeenCalledWith('test arg');
  });

  it('should cancel previous timer when called again', () => {
    const { result } = renderHook(() => useDebounceCallback(mockCallback, [], 500));

    act(() => {
      result.current('first call');
    });

    // Call again before the timer finishes
    act(() => {
      result.current('second call');
    });

    act(() => {
      // Advance time
      vi.advanceTimersByTime(500);
    });

    // Ensure only one call was made
    expect(mockCallback).toHaveBeenCalledTimes(1);
    // Ensure it called with the most recent argument
    expect(mockCallback).toHaveBeenCalledWith('second call');
  });

  it('should do nothing if callback is undefined', () => {
    const { result } = renderHook(() => useDebounceCallback(undefined, [], 500));

    act(() => {
      result.current('test arg');
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Ensure callback is not called
    expect(mockCallback).not.toHaveBeenCalled();
  });
});

describe('useThrottleCallback', () => {
  vi.useFakeTimers();

  let mockCallback: Mock;

  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
    // Create a new mock function for each test
    mockCallback = vi.fn();
  });

  it('should call callback on first invocation', () => {
    const { result } = renderHook(() => useThrottleCallback(mockCallback, [], 500));

    act(() => {
      // Invoke the throttled function
      result.current('arg1', 'arg2');
    });

    // Verify callback was called
    expect(mockCallback).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should not call callback during throttle period', () => {
    const { result } = renderHook(() => useThrottleCallback(mockCallback, [], 500));

    act(() => {
      // First invocation
      result.current();
    });

    act(() => {
      // Second invocation within the throttle period
      result.current();
    });

    // Ensure callback was called only once
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should call callback after throttle period expires', async () => {
    const { result } = renderHook(() => useThrottleCallback(mockCallback, [], 500));

    act(() => {
      result.current('arg1');
    });

    act(() => {
      // Fast-forward time by 500ms to end the throttle period
      vi.advanceTimersByTime(500);
    });

    act(() => {
      // Invocation after throttle period
      result.current('arg2');
    });

    // Ensure callback was called twice
    expect(mockCallback).toHaveBeenCalledTimes(2);
    // Check last argument is correct
    expect(mockCallback).toHaveBeenCalledWith('arg2');
  });

  it('should not call callback if it is undefined', () => {
    const { result } = renderHook(() => useThrottleCallback(undefined, [], 500));

    act(() => {
      // Invoke the throttled function
      result.current();
    });

    // Ensure callback was not called
    expect(mockCallback).not.toHaveBeenCalled();
  });
});

describe('useLatestRef', () => {
  it('should return the latest value in ref', () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: { value: 'initial value' },
    });

    // Check initial value
    expect(result.current.current).toBe('initial value');

    // Update value and rerender
    rerender({ value: 'updated value' });

    // Check if the ref holds the updated value
    expect(result.current.current).toBe('updated value');
  });

  it('should return the same reference object on rerender', () => {
    const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
      initialProps: { value: 'value 1' },
    });

    const initialRef = result.current;
    rerender({ value: 'value 2' });

    // Ensure the same ref object is returned
    expect(result.current).toBe(initialRef);
  });
});
