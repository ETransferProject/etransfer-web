import { describe, it, expect, vi, Mock } from 'vitest';
import { request } from 'api';
import { createWithdrawOrder, getWithdrawInfo } from '../../api/withdraw';
import { formatApiError } from '../../api/error';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';

vi.mock('api', () => ({
  request: {
    withdraw: {
      getWithdrawInfo: vi.fn(),
      createWithdrawOrder: vi.fn(),
    },
  },
}));

vi.mock('../../api/error', () => ({
  formatApiError: vi.fn(),
}));

// Mock API failure
const mockError = new Error('API request failed');
const mockFormattedError = new Error('Formatted error message');

describe('getWithdrawInfo', () => {
  const params = {
    chainId: 'AELF' as TChainId,
  };

  // Mock API success
  const mockResponse = {
    data: {
      withdrawInfo: {},
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    (request.withdraw.getWithdrawInfo as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getWithdrawInfo(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getWithdrawInfo mock was called
    expect(request.withdraw.getWithdrawInfo).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.withdraw.getWithdrawInfo as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getWithdrawInfo(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.withdraw.getWithdrawInfo).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getWithdrawInfo error', true);
  });
});

describe('createWithdrawOrder', () => {
  const params = {
    network: 'AELF',
    symbol: 'USDT',
    amount: '10',
    fromChainId: 'tDVW' as TChainId,
    toAddress: 'toAddress',
    rawTransaction: 'mockRawTransaction',
  };

  const MOCK_TOKEN = 'Bearer token';

  // Mock API success
  const mockResponse = {
    data: {
      orderId: '0000-1111',
      transactionId: 'mockTransactionId',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    (request.withdraw.createWithdrawOrder as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await createWithdrawOrder(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the createWithdrawOrder mock was called
    expect(request.withdraw.createWithdrawOrder).toHaveBeenCalledOnce();
  });

  it('should return token list when the API call succeeds with auth token', async () => {
    (request.withdraw.createWithdrawOrder as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await createWithdrawOrder(params, MOCK_TOKEN);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the createWithdrawOrder mock was called
    expect(request.withdraw.createWithdrawOrder).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.withdraw.createWithdrawOrder as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(createWithdrawOrder(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.withdraw.createWithdrawOrder).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'createWithdrawOrder error', false);
  });
});
