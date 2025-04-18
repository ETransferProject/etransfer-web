import { renderHook } from '@testing-library/react';
import { vi, describe, expect, beforeEach } from 'vitest';
import { useGoWithdraw, useWithdraw } from '../withdraw';
import { useAppDispatch, useWithdrawState } from 'store/Provider/hooks';
import { CHAIN_LIST } from 'constants/index';
import {
  InitialWithdrawState,
  setCurrentSymbol,
  setWithdrawAddress,
  setWithdrawChainItem,
  setWithdrawCurrentNetwork,
} from 'store/reducers/withdraw/slice';
import { removeELFAddressSuffix } from '@etransfer/utils';
import { useGetAelfAccount } from 'hooks/wallet/useAelf';

// Mock dependencies
vi.mock('store/Provider/hooks', () => ({
  useWithdrawState: vi.fn(),
  useAppDispatch: vi.fn(),
}));

vi.mock('../wallet/useAelf', () => ({
  useGetAelfAccount: vi.fn(),
}));

vi.mock(import('@etransfer/utils'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    sleep: vi.fn(),
  };
});

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

vi.mock('utils/aelf/aelfBase', () => ({
  removeELFAddressSuffix: vi.fn((addr) => addr.replace('.elf', '')),
}));

const mockDispatch = vi.fn();
const mockPush = vi.fn();
const mockAccounts = { AELF: 'address1', tDVV: 'address2', tDVW: 'address3' };

const mockChainItem = {
  key: 'AELF',
  name: 'Main Chain',
  networkType: 'MAINNET',
};

const mockTokenList = [
  { symbol: 'ETH', balance: '1.5' },
  { symbol: 'BTC', balance: '0.2' },
];

describe('useWithdraw', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return default values when store is empty', () => {
    // Mock the useWithdrawState hook to return an empty object
    vi.mocked(useWithdrawState).mockReturnValue({
      currentChainItem: null,
      tokenList: null,
      currentSymbol: null,
    } as any);

    // Render the hook
    const { result } = renderHook(() => useWithdraw());

    // Assert the result
    expect(result.current).toEqual({
      tokenList: InitialWithdrawState.tokenList,
      currentSymbol: InitialWithdrawState.currentSymbol,
      currentChainItem: CHAIN_LIST[0],
    });
  });

  test('should return store values when available', () => {
    // Mock the useWithdrawState hook to return a non-empty object
    vi.mocked(useWithdrawState).mockReturnValue({
      currentChainItem: mockChainItem,
      tokenList: mockTokenList,
      currentSymbol: 'ETH',
    } as any);

    // Render the hook
    const { result } = renderHook(() => useWithdraw());

    // Assert the result
    expect(result.current).toEqual({
      tokenList: mockTokenList,
      currentSymbol: 'ETH',
      currentChainItem: mockChainItem,
    });
  });

  test('should handle partial store data', () => {
    // Mock the useWithdrawState hook to return a partial object
    vi.mocked(useWithdrawState).mockReturnValue({
      currentChainItem: null,
      tokenList: mockTokenList,
      currentSymbol: 'BTC',
    } as any);

    // Render the hook
    const { result } = renderHook(() => useWithdraw());

    // Assert the result
    expect(result.current).toEqual({
      tokenList: mockTokenList,
      currentSymbol: 'BTC',
      currentChainItem: CHAIN_LIST[0],
    });
  });

  test('should memoize the result correctly', () => {
    const mockReturn: any = {
      currentChainItem: mockChainItem,
      tokenList: mockTokenList,
      currentSymbol: 'ETH',
    };

    // Mock the useWithdrawState hook to return a mock object
    vi.mocked(useWithdrawState).mockReturnValue(mockReturn);

    // Render the hook and check if the result is memoized
    const { result, rerender } = renderHook(() => useWithdraw());
    const firstResult = result.current;

    // Rerender the hook to check if the result is memoized
    rerender();

    // Check if the result is memoized
    expect(result.current).toBe(firstResult);
  });
});

describe('useGoWithdraw', () => {
  beforeEach(() => {
    // Clear all mocks and use fake timers
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch);
    vi.mocked(useGetAelfAccount).mockReturnValue(mockAccounts);
  });

  afterEach(() => {
    // Restore the original timers
    vi.useRealTimers();
  });

  test('should handle AELF network type', async () => {
    const { result } = renderHook(() => useGoWithdraw());
    const testNetwork: any = { network: 'AELF' };

    // Call the function
    await result.current(CHAIN_LIST[1], 'ETH', testNetwork);

    // Check if the correct action is dispatched
    expect(mockDispatch).toHaveBeenCalledWith(setWithdrawChainItem(CHAIN_LIST[1]));
  });

  test('should handle tDVW network types', async () => {
    const { result } = renderHook(() => useGoWithdraw());
    const testNetwork: any = { network: 'tDVW' };

    // Call the function
    await result.current(
      {
        key: 'tDVW',
        label: 'aelf dAppChain',
      } as any,
      'BTC',
      testNetwork,
    );

    // Check if the correct action is dispatched
    expect(mockDispatch).toHaveBeenCalledWith(
      setWithdrawChainItem({
        key: 'tDVW',
        label: 'aelf dAppChain',
      } as any),
    );
  });

  test('should handle tDVV network types', async () => {
    const { result } = renderHook(() => useGoWithdraw());
    const testNetwork: any = { network: 'tDVV' };

    // Call the function
    await result.current(
      {
        key: 'tDVW',
        label: 'aelf dAppChain',
      } as any,
      'BTC',
      testNetwork,
    );

    // Check if the correct action is dispatched
    expect(mockDispatch).toHaveBeenCalledWith(
      setWithdrawChainItem({
        key: 'tDVW',
        label: 'aelf dAppChain',
      } as any),
    );
  });

  test('should process address correctly', async () => {
    const { result } = renderHook(() => useGoWithdraw());
    const testChainItem: any = { key: 'AELF' };

    // Call the function
    await result.current(testChainItem, 'ETH');

    // Check if the correct action is dispatched
    expect(mockDispatch).toHaveBeenCalledWith(
      setWithdrawAddress(removeELFAddressSuffix(mockAccounts.AELF)),
    );
  });

  test('should dispatch network and symbol', async () => {
    // Render the hook
    const { result } = renderHook(() => useGoWithdraw());
    const testChainItem: any = { key: 'tDVV' };
    const testSymbol = 'USDT';

    // Call the function
    await result.current(testChainItem, testSymbol);

    // Check if the correct actions are dispatched
    expect(mockDispatch).toHaveBeenCalledWith(
      setWithdrawCurrentNetwork({ network: testChainItem.key } as any),
    );
    expect(mockDispatch).toHaveBeenCalledWith(setCurrentSymbol(testSymbol));
  });

  test('should navigate after delay', async () => {
    // Render the hook
    const { result } = renderHook(() => useGoWithdraw());

    // Call the function
    await result.current(CHAIN_LIST[0], 'ETH');

    // Advance timers by the delay
    vi.advanceTimersByTime(200);

    // Ensure navigation is called after delay
    expect(mockPush).toHaveBeenCalledWith('/withdraw');
  });

  test('should handle missing account address', async () => {
    // Mock missing account address
    vi.mocked(useGetAelfAccount).mockReturnValue({});

    // Render the hook
    const { result } = renderHook(() => useGoWithdraw());

    // Call the function
    await result.current(CHAIN_LIST[0], 'ETH');

    // Ensure no address is dispatched
    expect(mockDispatch).not.toHaveBeenCalledWith(setWithdrawAddress(expect.anything()));
  });
});
