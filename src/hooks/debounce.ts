import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';

/**
 * modified from https://usehooks.com/useDebounce/
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent debounced value from updating if value is changed ...
    // .. within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * that deal with the debounced function.
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T | undefined,
  deps: DependencyList,
  delay = 500,
) {
  const timer = useRef<NodeJS.Timeout | number>();
  const callbackRef = useLatestRef(callback);

  return useCallback(async (...args: any[]) => {
    if (!callbackRef.current) return;
    timer.current && clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await callbackRef.current?.(...args);
    }, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * that deal with the throttled function.
 */
export function useThrottleCallback<T extends (...args: any[]) => any>(
  callback: T | undefined,
  deps: DependencyList,
  delay = 500,
) {
  const lock = useRef<number>();
  return useCallback((...args: any[]) => {
    if (!callback) return;
    const now = Date.now();
    if (lock.current && lock.current + delay > now) return;
    lock.current = now;
    return callback(...args);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
/**
 * returns the latest value, effectively avoiding the closure problem.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;

  return ref;
}
