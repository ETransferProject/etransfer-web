import { describe, expect, it, vi } from 'vitest';
import TonWeb from 'tonweb';
import { getTONJettonMinter, tonWeb } from '../../wallet/TON';

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

  return {
    default: TonWebMock,
  };
});

describe('tonwebUtils', () => {
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
