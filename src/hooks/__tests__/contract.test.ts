import { renderHook } from '@testing-library/react';
import { vi, describe, expect, beforeEach } from 'vitest';
import { SingleMessage } from '@etransfer/ui-react';
import { useGetBalanceDivDecimals } from '../contract';
import { getBalance } from 'utils/contract';
import { useGetAelfAccount } from '../wallet/useAelf';
import { SupportedELFChainId } from 'constants/index';
import { divDecimals } from 'utils/calculate';
import { handleWebLoginErrorMessage } from 'utils/api/error';

// Mock dependencies
vi.mock('../wallet/useAelf', () => ({
  useGetAelfAccount: vi.fn(),
}));

vi.mock('utils/contract', () => ({
  getBalance: vi.fn(),
}));

vi.mock('utils/calculate', () => ({
  divDecimals: vi.fn().mockReturnValue(100),
}));

vi.mock('utils/api/error', () => ({
  handleWebLoginErrorMessage: vi.fn().mockReturnValue('Mock error message'),
}));

vi.mock('@etransfer/ui-react', () => ({
  SingleMessage: {
    error: vi.fn(),
  },
}));

const mockAccounts = {
  [SupportedELFChainId.AELF]: 'mock-mainnet-address',
};

describe('useGetBalanceDivDecimals', () => {
  beforeEach(() => {
    vi.mocked(useGetAelfAccount).mockReturnValue(mockAccounts);
    vi.mocked(getBalance).mockResolvedValue('100000000');
    vi.clearAllMocks();
  });

  test('should return formatted balance when successful', async () => {
    const { result } = renderHook(() => useGetBalanceDivDecimals());

    // Call the callback
    const balance = await result.current('ELF', 8, SupportedELFChainId.AELF);

    // Check if the balance is formatted correctly
    expect(balance).toBe('100');
    expect(getBalance).toHaveBeenCalledWith({
      symbol: 'ELF',
      chainId: SupportedELFChainId.AELF,
      caAddress: 'mock-mainnet-address',
    });
    expect(divDecimals).toHaveBeenCalledWith('100000000', 8);
  });

  test('should return empty string when caAddress not found', async () => {
    // Mock empty caAddress
    vi.mocked(useGetAelfAccount).mockReturnValue({});

    // Render the hook and get the result
    const { result } = renderHook(() => useGetBalanceDivDecimals());
    const balance = await result.current('ELF', 8, SupportedELFChainId.AELF);

    // Check if the balance is empty
    expect(balance).toBe('');
  });

  test('should handle error and show message', async () => {
    // Mock error
    const mockError = new Error('Network error');
    vi.mocked(getBalance).mockRejectedValue(mockError);

    const { result } = renderHook(() => useGetBalanceDivDecimals());

    // Check if the error is thrown
    await expect(result.current('ELF', 8, SupportedELFChainId.AELF)).rejects.toThrow(
      'Failed to get balance.',
    );

    // Check if the error message is shown
    expect(SingleMessage.error).toHaveBeenCalledWith('Mock error message');
    expect(handleWebLoginErrorMessage).toHaveBeenCalledWith(mockError);
  });

  test('should memoize the callback properly', async () => {
    const { result, rerender } = renderHook(() => useGetBalanceDivDecimals());
    const firstCallback = result.current;

    rerender();

    // Check if the callback is memoized
    expect(result.current).toBe(firstCallback);
  });

  test('should handle string decimals input', async () => {
    const { result } = renderHook(() => useGetBalanceDivDecimals());

    // Call the callback with a string decimals input
    await result.current('ELF', '8', SupportedELFChainId.AELF);

    // Check if divDecimals is called with a string input
    expect(divDecimals).toHaveBeenCalledWith(expect.any(String), '8');
  });
});
