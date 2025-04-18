import { renderHook } from '@testing-library/react';
import { vi, describe, expect, beforeEach } from 'vitest';
import { useClearStore, useFindToken, useMixAllTokenList, useSetCurrentChainItem } from '../common';
import { SideMenuKey } from 'constants/home';
import { setToChainItem } from 'store/reducers/deposit/slice';
import { setWithdrawChainItem } from 'store/reducers/withdraw/slice';
import { CHAIN_NAME_ENUM, SupportedELFChainId } from 'constants/index';
import { resetLocalJWT } from 'api/utils';
import { useDepositState, useWithdrawState } from 'store/Provider/hooks';

// Mock Redux dependencies
vi.mock('store/Provider/hooks', () => ({
  useAppDispatch: vi.fn(() => mockDispatch),
  useResetStore: vi.fn(() => mockResetStore),
  useDepositState: vi.fn(),
  useWithdrawState: vi.fn(),
}));

vi.mock('store/reducers/deposit/slice', () => ({
  setToChainItem: vi.fn(),
}));

vi.mock('store/reducers/withdraw/slice', () => ({
  setWithdrawChainItem: vi.fn(),
}));

vi.mock('api/utils', () => ({
  resetLocalJWT: vi.fn(),
}));

const mockResetStore = vi.fn();
const mockDispatch = vi.fn();
const mockChainItem = { key: SupportedELFChainId.AELF, label: CHAIN_NAME_ENUM.MainChain };

describe('useSetCurrentChainItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should dispatch setToChainItem for Deposit key', () => {
    const { result } = renderHook(() => useSetCurrentChainItem());

    // Call the hook with a mock chain item and a Deposit key
    result.current(mockChainItem, SideMenuKey.Deposit);

    // Check if the correct action was dispatched
    expect(setToChainItem).toHaveBeenCalledWith(mockChainItem);
    expect(setWithdrawChainItem).not.toHaveBeenCalled();
  });

  test('should dispatch setWithdrawChainItem for Withdraw key', () => {
    const { result } = renderHook(() => useSetCurrentChainItem());

    result.current(mockChainItem, SideMenuKey.Withdraw);

    // Check if the correct action was dispatched
    expect(setWithdrawChainItem).toHaveBeenCalledWith(mockChainItem);
    expect(setToChainItem).not.toHaveBeenCalled();
  });

  test('should dispatch both actions when no key provided', () => {
    const { result } = renderHook(() => useSetCurrentChainItem());

    // Call the hook with a mock chain item and no key
    result.current(mockChainItem);

    // Check if both actions were dispatched
    expect(setToChainItem).toHaveBeenCalledWith(mockChainItem);
    expect(setWithdrawChainItem).toHaveBeenCalledWith(mockChainItem);
  });

  test('should dispatch both actions for unknown key', () => {
    const { result } = renderHook(() => useSetCurrentChainItem());

    result.current(mockChainItem, 'unknown' as SideMenuKey);

    // Check if both actions were dispatched
    expect(setToChainItem).toHaveBeenCalledWith(mockChainItem);
    expect(setWithdrawChainItem).toHaveBeenCalledWith(mockChainItem);
  });
});

describe('useClearStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should call both reset functions when executed', () => {
    const { result } = renderHook(() => useClearStore());

    result.current();

    // Check if both reset functions were called
    expect(mockResetStore).toHaveBeenCalledTimes(1);
    expect(resetLocalJWT).toHaveBeenCalledTimes(1);
  });

  test('should return a memoized callback', () => {
    const { result, rerender } = renderHook(() => useClearStore());
    const firstCallback = result.current;

    rerender();

    // Check if the callback is memoized
    expect(result.current).toBe(firstCallback);
  });
});

describe('useMixAllTokenList', () => {
  const mockDepositTokens = [{ symbol: 'ETH' }, { symbol: 'BTC' }];
  const mockReceiveTokens = [{ symbol: 'USDT' }];
  const mockWithdrawTokens = [{ symbol: 'DAI' }];

  beforeEach(() => {
    vi.mocked(useDepositState).mockReturnValue({
      fromTokenList: mockDepositTokens,
      toTokenList: mockReceiveTokens,
    } as any);
    vi.mocked(useWithdrawState).mockReturnValue({
      tokenList: mockWithdrawTokens,
    } as any);
  });

  test('should merge all token lists correctly', () => {
    const { result } = renderHook(() => useMixAllTokenList());

    expect(result.current).toEqual([
      ...mockDepositTokens,
      ...mockWithdrawTokens,
      ...mockReceiveTokens,
    ]);
  });

  test('should handle non-array inputs', () => {
    vi.mocked(useDepositState).mockReturnValue({
      fromTokenList: null,
      toTokenList: undefined,
    } as any);
    vi.mocked(useWithdrawState).mockReturnValue({
      tokenList: 'invalid' as any,
    } as any);

    const { result } = renderHook(() => useMixAllTokenList());

    expect(result.current).toEqual([]);
  });

  test('should handle empty arrays', () => {
    vi.mocked(useDepositState).mockReturnValue({
      fromTokenList: [],
      toTokenList: [],
    } as any);
    vi.mocked(useWithdrawState).mockReturnValue({
      tokenList: [],
    } as any);

    const { result } = renderHook(() => useMixAllTokenList());

    expect(result.current).toEqual([]);
  });

  test('should maintain order: deposit + withdraw + receive', () => {
    vi.mocked(useDepositState).mockReturnValue({
      fromTokenList: [{ symbol: 'A' }],
      toTokenList: [{ symbol: 'C' }],
    } as any);
    vi.mocked(useWithdrawState).mockReturnValue({
      tokenList: [{ symbol: 'B' }],
    } as any);

    const { result } = renderHook(() => useMixAllTokenList());

    expect(result.current.map((t) => t.symbol)).toEqual(['A', 'B', 'C']);
  });
});

describe('useFindToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return undefined for non-existent symbol', () => {
    const { result } = renderHook(() => useFindToken());
    const foundToken = result.current('XRP');

    expect(foundToken).toBeUndefined();
  });

  test('should return undefined when symbol is empty', () => {
    const { result } = renderHook(() => useFindToken());

    expect(result.current('')).toBeUndefined();
    expect(result.current(undefined)).toBeUndefined();
  });

  test('should handle empty token list', () => {
    const { result } = renderHook(() => useFindToken());

    expect(result.current('ETH')).toBeUndefined();
  });
});
