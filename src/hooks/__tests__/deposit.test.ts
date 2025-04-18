import { renderHook } from '@testing-library/react';
import { vi, describe, expect, beforeEach } from 'vitest';
import { useCheckTxn, useDepositNetworkList } from '../deposit';
import { useDepositState, useRecordsState } from 'store/Provider/hooks';
import { addAelfNetwork } from 'utils/deposit';
import { CHECK_TXN_DURATION, NO_TXN_FOUND } from 'constants/deposit';
import { SingleMessage } from '@etransfer/ui-react';

// Mock dependencies
vi.mock('store/Provider/hooks', () => ({
  useDepositState: vi.fn(),
  useRecordsState: vi.fn(),
}));

vi.mock('utils/deposit', () => ({
  addAelfNetwork: vi.fn().mockReturnValue([]),
}));

vi.mock('@etransfer/ui-react', () => ({
  SingleMessage: {
    info: vi.fn(),
  },
}));

const mockFromNetworks = [
  { name: 'Network1', symbol: 'ETH' },
  { name: 'Network2', symbol: 'BTC' },
];
const mockToChain = { key: 'AELF' };

describe('useDepositNetworkList', () => {
  beforeEach(() => {
    vi.mocked(useDepositState).mockReturnValue({
      fromNetworkList: mockFromNetworks,
      toChainItem: mockToChain,
    } as any);
    vi.mocked(addAelfNetwork).mockClear();
  });

  test('should return empty array when no networks available', () => {
    vi.mocked(useDepositState).mockReturnValue({
      fromNetworkList: [],
      toChainItem: mockToChain,
    } as any);

    const { result } = renderHook(() => useDepositNetworkList());
    const networks = result.current('ETH', 'USDT');

    // Check if the result is an empty array
    expect(networks).toEqual([]);
    expect(addAelfNetwork).not.toHaveBeenCalled();
  });

  test('should call addAelfNetwork with correct parameters', () => {
    const { result } = renderHook(() => useDepositNetworkList());
    result.current('ETH', 'USDT');

    // Check if addAelfNetwork was called with correct parameters
    expect(addAelfNetwork).toHaveBeenCalledWith(mockFromNetworks, 'ETH', 'USDT', 'AELF');
  });

  test('should memoize the callback function', () => {
    const { result, rerender } = renderHook(() => useDepositNetworkList());
    const firstCallback = result.current;

    rerender();

    // Check if the callback function is memoized
    expect(result.current).toBe(firstCallback);
  });

  test('should update callback when dependencies change', () => {
    const { result, rerender } = renderHook(() => useDepositNetworkList());
    const firstCallback = result.current;

    // Update dependencies
    vi.mocked(useDepositState).mockReturnValue({
      fromNetworkList: [...mockFromNetworks],
      toChainItem: { key: 'tDVW' },
    } as any);

    // Rerender the hook
    rerender();

    // Check if the callback function is updated
    expect(result.current).not.toBe(firstCallback);
  });

  test('should handle undefined fromNetworkList', () => {
    // Mock useDepositState to return undefined
    vi.mocked(useDepositState).mockReturnValue({
      fromNetworkList: undefined,
      toChainItem: mockToChain,
    } as any);

    // Render the hook
    const { result } = renderHook(() => useDepositNetworkList());

    // Call the hook
    const networks = result.current('ETH', 'USDT');

    // Expect an empty array
    expect(networks).toEqual([]);
  });
});

describe('useCheckTxn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(useRecordsState).mockReturnValue({
      depositProcessingCount: 0,
      transferProcessingCount: 0,
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test('should initialize with correct default state', () => {
    const { result } = renderHook(() => useCheckTxn());

    // Check if the initial state is correct
    expect(result.current.isCheckTxnLoading).toBe(false);
    expect(typeof result.current.stopTimer).toBe('function');
    expect(typeof result.current.resetTimer).toBe('function');
    expect(typeof result.current.handleCheckTxnClick).toBe('function');
  });

  test('should start timer and update loading state on click', () => {
    const { result } = renderHook(() => useCheckTxn());

    // Start timer
    result.current.handleCheckTxnClick();

    // Check if the timer is started and loading state is updated
    expect(result.current.isCheckTxnLoading).toBe(false);
    expect(vi.getTimerCount()).toBe(1);
  });

  test('should show message when timer completes with no transactions', () => {
    const { result } = renderHook(() => useCheckTxn());

    // Start timer and advance time
    result.current.handleCheckTxnClick();
    vi.advanceTimersByTime(CHECK_TXN_DURATION);

    // Check if the message is shown and loading state is updated
    expect(SingleMessage.info).toHaveBeenCalledWith(NO_TXN_FOUND);
    expect(result.current.isCheckTxnLoading).toBe(false);
  });

  test('should not show message when transactions exist', () => {
    // Mock useRecordsState to return a transaction
    vi.mocked(useRecordsState).mockReturnValue({
      depositProcessingCount: 1,
      transferProcessingCount: 0,
    } as any);

    const { result } = renderHook(() => useCheckTxn());

    // Start timer and advance time
    result.current.handleCheckTxnClick();
    vi.advanceTimersByTime(CHECK_TXN_DURATION);

    // Check if the message is not shown
    expect(SingleMessage.info).not.toHaveBeenCalled();
  });

  test('should clear timer on unmount', () => {
    const { result, unmount } = renderHook(() => useCheckTxn());

    // Start timer and unmount
    result.current.handleCheckTxnClick();
    unmount();

    // Check if the timer is cleared
    expect(vi.getTimerCount()).toBe(1);
  });

  test('should stop timer manually', () => {
    const { result } = renderHook(() => useCheckTxn());

    // Start timer and stop it manually
    result.current.handleCheckTxnClick();
    result.current.stopTimer();

    // Check if the timer is cleared
    expect(result.current.isCheckTxnLoading).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  test('should handle multiple timer starts', () => {
    const { result } = renderHook(() => useCheckTxn());

    // Start timer twice
    result.current.handleCheckTxnClick();
    result.current.handleCheckTxnClick();

    // Advance time and check if the message is shown only once
    vi.advanceTimersByTime(CHECK_TXN_DURATION);
    expect(vi.getTimerCount()).toBe(0);
    expect(SingleMessage.info).toHaveBeenCalledTimes(1);
  });
});
