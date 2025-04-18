import { renderHook } from '@testing-library/react';
import { vi, describe, expect, beforeEach } from 'vitest';
import useGetTokenIcon from '../infoDashboard';
import { useInfoDashboardState } from 'store/Provider/hooks';
import { TTransferDashboardFilterToken } from 'types/api';

// Mock the store hook
vi.mock('store/Provider/hooks', () => ({
  useInfoDashboardState: vi.fn(() => ({
    tokensInfo: [],
  })),
}));

const mockTokenList: TTransferDashboardFilterToken[] = [
  { key: 1, symbol: 'BNB', name: 'BSC', icon: 'binance.png' },
  { key: 2, symbol: 'ETH', name: 'Ethereum', icon: 'ethereum.png' },
  { key: 3, symbol: 'ELF', name: 'aelf', icon: 'aelf.png' },
];

describe('useGetTokenIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should find existing token by symbol', () => {
    // Setup mock data
    vi.mocked(useInfoDashboardState).mockImplementation(() => ({
      tokensInfo: mockTokenList,
      tokens: [],
      transferList: [],
    }));

    const { result } = renderHook(() => useGetTokenIcon());
    const getTokenIcon = result.current;

    // Test existing symbol
    expect(getTokenIcon('ETH')).toEqual({
      key: 2,
      name: 'Ethereum',
      symbol: 'ETH',
      icon: 'ethereum.png',
    });
    expect(getTokenIcon('ELF')).toEqual({
      key: 3,
      symbol: 'ELF',
      name: 'aelf',
      icon: 'aelf.png',
    });
  });

  test('should return undefined for non-existent symbol', () => {
    // Setup mock data
    vi.mocked(useInfoDashboardState).mockImplementation(() => ({
      tokensInfo: mockTokenList,
      tokens: [],
      transferList: [],
    }));

    const { result } = renderHook(() => useGetTokenIcon());
    const getTokenIcon = result.current;

    // Test non-existent symbol
    expect(getTokenIcon('DOGE')).toBeUndefined();
    expect(getTokenIcon('')).toBeUndefined();
  });

  test('should handle empty tokensInfo', () => {
    // Setup mock data
    vi.mocked(useInfoDashboardState).mockImplementation(() => ({
      tokensInfo: [],
      tokens: [],
      transferList: [],
    }));

    const { result } = renderHook(() => useGetTokenIcon());
    const getTokenIcon = result.current;

    // Test with empty tokensInfo
    expect(getTokenIcon('BNB')).toBeUndefined();
  });

  test('should update when tokensInfo changes', () => {
    const { result, rerender } = renderHook(() => useGetTokenIcon());

    // Initial empty state
    expect(result.current('BNB')).toBeUndefined();

    // Update mock data
    vi.mocked(useInfoDashboardState).mockImplementation(() => ({
      tokensInfo: mockTokenList,
      tokens: [],
      transferList: [],
    }));
    rerender();

    // Verify new data
    expect(result.current('BNB')).toEqual({
      key: 1,
      symbol: 'BNB',
      name: 'BSC',
      icon: 'binance.png',
    });
  });
});
