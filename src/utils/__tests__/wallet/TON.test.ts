import { describe, expect, it, vi, Mock } from 'vitest';
import TonWeb from 'tonweb';
import {
  CacheJettonWalletAddress,
  getJettonWalletAddress,
  getTONJettonMinter,
  tonWeb,
} from '../../wallet/TON';

// Mock `TonWeb` and its dependencies
vi.mock('tonweb', () => {
  const mockJettonMinter = vi.fn();

  const mockTonWebInstance = {
    provider: {},
  };

  const TonWebMock = vi.fn(() => mockTonWebInstance);

  (TonWebMock as any).token = {
    jetton: {
      JettonMinter: mockJettonMinter,
    },
  };

  (TonWebMock as any).utils = {
    Address: vi.fn((address) => ({ value: address })), // Mock constructor with mock behavior
  };

  return {
    default: TonWebMock,
  };
});

describe('getTONJettonMinter', () => {
  it('should create a TONWeb instance successfully', () => {
    // Validate that `tonWeb` is correctly instantiated
    expect(tonWeb).toBeDefined();
    expect(tonWeb.provider).toBeDefined();
  });

  it('should create a JettonMinter instance with the provided token contract address', () => {
    // Mock a token contract address
    const tokenContractAddress = 'EQBCxF...mock-address...NZZ7';
    const mockTonWeb = TonWeb as any; // Access the mocked constructor
    const mockJettonMinter = mockTonWeb.token.jetton.JettonMinter;

    const result = getTONJettonMinter(tokenContractAddress);

    // Validate that the result is an instance of the mocked JettonMinter
    expect(result).toBeInstanceOf(mockJettonMinter);
  });
});

// Test suite
describe('getJettonWalletAddress', () => {
  beforeEach(() => {
    // Clear all mocks and reset the CacheJettonWalletAddress cache
    vi.clearAllMocks();
    Object.keys(CacheJettonWalletAddress).forEach((key) => delete CacheJettonWalletAddress[key]);
  });

  it('should call `getJettonWalletAddress` when the address is not cached', async () => {
    // Mock resolved value for `getJettonWalletAddress`
    const mockWalletAddress = 'mock-wallet-address';

    const mockTonWeb = TonWeb as any; // Access the mocked constructor
    (mockTonWeb.token.jetton.JettonMinter as Mock).mockReturnValue({
      getJettonWalletAddress: vi.fn().mockResolvedValue(mockWalletAddress),
    });

    // Call the function
    const address = 'test-address';
    const tokenContractAddress = 'test-contract';
    const result = await getJettonWalletAddress(address, tokenContractAddress);

    // Assert returned value from mocked function
    expect(result).toBe(mockWalletAddress);

    // Verify CacheJettonWalletAddress now contains the result
    const cacheKey = tokenContractAddress + address;
    expect(CacheJettonWalletAddress[cacheKey]).toBe(mockWalletAddress);
  });

  it('should return the cached value when the address is already cached', async () => {
    // Set up cache with a mock value
    const cachedContract = 'cached-contract';
    const cacheAddress = 'cached-address';
    const cacheKey = cachedContract + cacheAddress;
    const cacheValue = 'cache-jetton-wallet-address';
    CacheJettonWalletAddress[cacheKey] = cacheValue;

    // Call the function with the cached values
    const result = await getJettonWalletAddress(cacheAddress, cachedContract);

    // Assert returned value comes from the cache
    expect(result).toBe(cacheValue);
  });

  it('should handle errors from `getJettonWalletAddress` gracefully', async () => {
    // Mock `getJettonWalletAddress` to throw an error
    const mockError = new Error('Failed to fetch wallet address');
    const mockTonWeb = TonWeb as any; // Access the mocked constructor
    (mockTonWeb.token.jetton.JettonMinter as Mock).mockReturnValue({
      getJettonWalletAddress: vi.fn().mockRejectedValue(mockError),
    });

    // Call the function and assert it throws
    const address = 'error-address';
    const tokenContractAddress = 'error-contract';
    await expect(getJettonWalletAddress(address, tokenContractAddress)).rejects.toThrow(mockError);

    // Verify cache was NOT updated
    const cacheKey = tokenContractAddress + address;
    expect(CacheJettonWalletAddress[cacheKey]).toBeUndefined();
  });
});
