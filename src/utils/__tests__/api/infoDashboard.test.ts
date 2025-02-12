import { describe, it, expect, vi, Mock } from 'vitest';
import { request } from 'api';
import { formatApiError } from '../../api/error';
import {
  getTokenDashboard,
  getTransactionOverview,
  getTransferDashboard,
  getTransferFilterOption,
  getVolumeOverview,
} from '../../api/infoDashboard';
import { TokensDashboardType, TOverviewTimeType } from 'types/api';

vi.mock('api', () => ({
  request: {
    infoDashboard: {
      getTransactionOverview: vi.fn(),
      getVolumeOverview: vi.fn(),
      getTokens: vi.fn(),
      getNetworkOption: vi.fn(),
      geTransfers: vi.fn(),
    },
  },
}));

vi.mock('../../api/error', () => ({
  formatApiError: vi.fn(),
}));

// Mock API failure
const mockError = new Error('API request failed');
const mockFormattedError = new Error('Formatted error message');

describe('getTransactionOverview', () => {
  const params = {
    type: TOverviewTimeType.Day,
  };
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        transaction: {
          totalTx: '0',
          latest: '2024-01-01',
        },
      },
    };
    (request.infoDashboard.getTransactionOverview as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getTransactionOverview(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.infoDashboard.getTransactionOverview).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.infoDashboard.getTransactionOverview as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getTransactionOverview(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.infoDashboard.getTransactionOverview).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getTransactionOverview error', false);
  });
});

describe('getVolumeOverview', () => {
  const params = {
    type: TOverviewTimeType.Day,
  };
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        volume: { totalAmountUsd: '10', latest: '2024-01-01' },
      },
    };
    (request.infoDashboard.getVolumeOverview as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getVolumeOverview(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.infoDashboard.getVolumeOverview).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.infoDashboard.getVolumeOverview as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getVolumeOverview(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.infoDashboard.getVolumeOverview).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getVolumeOverview error', false);
  });
});

describe('getTokenDashboard', () => {
  const params = {
    type: TokensDashboardType.All,
  };
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        USDT: {
          icon: '',
          networks: ['EVM'],
          chainIds: ['AELF'],
        },
      },
    };
    (request.infoDashboard.getTokens as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getTokenDashboard(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.infoDashboard.getTokens).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.infoDashboard.getTokens as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getTokenDashboard(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.infoDashboard.getTokens).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getTokenDashboard error', false);
  });
});

describe('getTransferFilterOption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        networkList: [],
        tokenList: [],
      },
    };
    (request.infoDashboard.getNetworkOption as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getTransferFilterOption();

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.infoDashboard.getNetworkOption).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.infoDashboard.getNetworkOption as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getTransferFilterOption()).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.infoDashboard.getNetworkOption).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getTransferFilterOption error', false);
  });
});

describe('getTransferDashboard', () => {
  const params = {
    type: TokensDashboardType.All,
    fromToken: 0,
    fromChainId: 1,
    toToken: 0,
    toChainId: 2,
  };
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        totalCount: 10,
        items: [],
      },
    };
    (request.infoDashboard.geTransfers as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getTransferDashboard(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.infoDashboard.geTransfers).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.infoDashboard.geTransfers as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getTransferDashboard(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.infoDashboard.geTransfers).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getTransferDashboard error', false);
  });
});
