import { describe, it, expect, vi, Mock } from 'vitest';
import { request } from 'api';
import { getDepositCalculate, getDepositInfo, getDepositTokenList } from '../../api/deposit';
import { formatApiError } from '../../api/error';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import { BusinessType } from 'types/api';

vi.mock('api', () => ({
  request: {
    deposit: {
      getDepositInfo: vi.fn(),
      getDepositTokenList: vi.fn(),
      depositCalculator: vi.fn(),
    },
  },
}));

vi.mock('../../api/error', () => ({
  formatApiError: vi.fn(),
}));

// Mock API failure
const mockError = new Error('API request failed');
const mockFormattedError = new Error('Formatted error message');

describe('getDepositInfo', () => {
  const params = {
    chainId: 'AELF' as TChainId,
    network: 'tDVW',
  };
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        depositInfo: {},
      },
    };
    (request.deposit.getDepositInfo as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getDepositInfo(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.deposit.getDepositInfo).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.deposit.getDepositInfo as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getDepositInfo(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.deposit.getDepositInfo).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getDepositInfo error', true);
  });
});

describe('getDepositTokenList', () => {
  const params = {
    type: BusinessType.Deposit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        tokenList: [],
      },
    };
    (request.deposit.getDepositTokenList as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getDepositTokenList(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getDepositTokenList mock was called
    expect(request.deposit.getDepositTokenList).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.deposit.getDepositTokenList as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getDepositTokenList(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.deposit.getDepositTokenList).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getDepositTokenList error', false);
  });
});

describe('getDepositCalculate', () => {
  const params = {
    toChainId: 'AELF' as TChainId,
    fromSymbol: 'USDT',
    toSymbol: 'USDT',
    fromAmount: '10',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        conversionRate: {
          fromSymbol: 'USDT',
          toSymbol: 'USDT',
          fromAmount: '10',
          toAmount: '9',
          minimumReceiveAmount: '9',
        },
      },
    };
    (request.deposit.depositCalculator as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getDepositCalculate(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getDepositCalculate mock was called
    expect(request.deposit.depositCalculator).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.deposit.depositCalculator as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getDepositCalculate(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.deposit.depositCalculator).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getDepositCalculate error', false);
  });
});
