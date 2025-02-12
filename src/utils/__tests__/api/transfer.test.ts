import { describe, it, expect, vi, Mock } from 'vitest';
import { request } from 'api';
import {
  getTokenNetworkRelation,
  getTokenList,
  getNetworkList,
  getTransferNetworkList,
  getTransferInfo,
  createTransferOrder,
  updateTransferOrder,
} from '../../api/transfer';
import { formatApiError } from '../../api/error';
import { BusinessType } from 'types/api';
import { CancelTokenSourceKey } from 'api/types';

vi.mock('api', () => ({
  request: {
    transfer: {
      getTokenNetworkRelation: vi.fn(),
      getTokenList: vi.fn(),
      getNetworkList: vi.fn(),
      getTransferInfo: vi.fn(),
      createTransferOrder: vi.fn(),
      updateTransferOrder: vi.fn(),
    },
  },
}));

vi.mock('../../api/error', () => ({
  formatApiError: vi.fn(),
}));

// Mock API failure
const mockError = new Error('API request failed');
const mockFormattedError = new Error('Formatted error message');

describe('getTokenNetworkRelation', () => {
  const params = {};

  // Mock API success
  const mockResponse = {
    data: {
      AELF: { USDT: [{ network: 'tDVW' }] },
    },
  };

  const MOCK_AUTH = 'mock auth';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    (request.transfer.getTokenNetworkRelation as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getTokenNetworkRelation(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.transfer.getTokenNetworkRelation).toHaveBeenCalledOnce();
  });

  it('should return token list when the API call succeeds with auth token', async () => {
    (request.transfer.getTokenNetworkRelation as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getTokenNetworkRelation(params, MOCK_AUTH);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.transfer.getTokenNetworkRelation).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.transfer.getTokenNetworkRelation as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getTokenNetworkRelation(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.transfer.getTokenNetworkRelation).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getTokenNetworkRelation error', false);
  });
});

describe('getTokenList', () => {
  const params = {
    type: BusinessType.Transfer,
  };

  // Mock API success
  const mockResponse = {
    data: {
      tokenList: [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    (request.transfer.getTokenList as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getTokenList(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.transfer.getTokenList).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.transfer.getTokenList as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getTokenList(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.transfer.getTokenList).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getTokenList error', false);
  });
});

describe('getNetworkList', () => {
  const params = {
    type: BusinessType.Transfer,
  };

  // Mock API success
  const mockResponse = {
    data: {
      tokenList: [],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    (request.transfer.getNetworkList as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getNetworkList(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getNetworkList mock was called
    expect(request.transfer.getNetworkList).toHaveBeenCalledWith({
      params,
      cancelTokenSourceKey: CancelTokenSourceKey.GET_NETWORK_LIST,
    });
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.transfer.getNetworkList as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getNetworkList(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.transfer.getNetworkList).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getNetworkList error', true);
  });
});

describe('getTransferNetworkList', () => {
  const params = {
    type: BusinessType.Transfer,
  };

  // Mock API success
  const mockResponse = {
    data: {
      networkList: [{ network: 'EVM' }],
    },
  };

  const MOCK_AUTH = 'mock auth';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    (request.transfer.getNetworkList as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getTransferNetworkList(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.transfer.getNetworkList).toHaveBeenCalledOnce();
  });

  it('should return token list when the API call succeeds with auth token', async () => {
    (request.transfer.getNetworkList as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getTransferNetworkList(params, MOCK_AUTH);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.transfer.getNetworkList).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.transfer.getNetworkList as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getTransferNetworkList(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.transfer.getNetworkList).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getTransferNetworkList error', true);
  });
});

describe('getTransferInfo', () => {
  const params = {
    fromNetwork: 'AELF',
    symbol: 'USDT',
  };

  // Mock API success
  const mockResponse = {
    data: {
      transferInfo: {},
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    (request.transfer.getTransferInfo as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getTransferInfo(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTransferInfo mock was called
    expect(request.transfer.getTransferInfo).toHaveBeenCalledWith({
      params,
      cancelTokenSourceKey: CancelTokenSourceKey.GET_TRANSFER_INFO,
      headers: {
        Authorization: '',
      },
    });
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.transfer.getTransferInfo as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getTransferInfo(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.transfer.getTransferInfo).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getTransferInfo error', true);
  });
});

describe('createTransferOrder', () => {
  const params = {
    amount: '10',
    fromNetwork: 'AELF',
    toNetwork: 'tDVW',
    fromSymbol: 'USDT',
    toSymbol: 'USDT',
    fromAddress: 'address',
    toAddress: 'address',
  };

  // Mock API success
  const mockResponse = {
    data: {
      orderId: '0000-1111',
    },
  };

  const MOCK_AUTH = 'mock auth';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    (request.transfer.createTransferOrder as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await createTransferOrder(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.transfer.createTransferOrder).toHaveBeenCalledOnce();
  });

  it('should return token list when the API call succeeds with auth token', async () => {
    (request.transfer.createTransferOrder as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await createTransferOrder(params, MOCK_AUTH);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.transfer.createTransferOrder).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.transfer.createTransferOrder as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(createTransferOrder(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.transfer.createTransferOrder).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'createTransferOrder error', false);
  });
});

describe('updateTransferOrder', () => {
  const params = {
    amount: '10',
    fromNetwork: 'AELF',
    toNetwork: 'tDVW',
    fromSymbol: 'USDT',
    toSymbol: 'USDT',
    fromAddress: 'fromAddress',
    toAddress: 'toAddress',
    address: 'tokenPoolAddress',
    txId: '0000-1111',
  };

  // Mock API success
  const mockResponse = {
    data: true,
  };

  const MOCK_AUTH = 'mock auth';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    (request.transfer.updateTransferOrder as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await updateTransferOrder(params, '0000-1111');

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.transfer.updateTransferOrder).toHaveBeenCalledOnce();
  });

  it('should return token list when the API call succeeds with auth token', async () => {
    (request.transfer.updateTransferOrder as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await updateTransferOrder(params, MOCK_AUTH);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.transfer.updateTransferOrder).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.transfer.updateTransferOrder as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(updateTransferOrder(params, '0000-1111')).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.transfer.updateTransferOrder).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'updateTransferOrder error', false);
  });
});
