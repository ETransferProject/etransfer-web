import { describe, it, expect, vi, Mock } from 'vitest';
import { request } from 'api';
import { getRecordDetail, getRecordsList, getRecordStatus } from '../../api/records';
import { formatApiError } from '../../api/error';

vi.mock('api', () => ({
  request: {
    records: {
      getRecordsList: vi.fn(),
      getRecordStatus: vi.fn(),
      getRecordDetail: vi.fn(),
    },
  },
}));

vi.mock('../../api/error', () => ({
  formatApiError: vi.fn(),
}));

// Mock API failure
const mockError = new Error('API request failed');
const mockFormattedError = new Error('Formatted error message');

describe('getRecordsList', () => {
  const params = {
    type: 0,
    status: 1,
    skipCount: 0,
    maxResultCount: 10,
  };

  // Mock API success
  const mockResponse = {
    data: {
      totalCount: 20,
      items: [],
    },
  };

  const MOCK_AUTH = 'mock auth';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    (request.records.getRecordsList as Mock).mockImplementation((config: any) => {
      config?.paramsSerializer();
      return Promise.resolve(mockResponse);
    });

    // Call the function
    const result = await getRecordsList(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.records.getRecordsList).toHaveBeenCalledOnce();
  });

  it('should return token list when the API call succeeds with auth token', async () => {
    (request.records.getRecordsList as Mock).mockImplementation((config: any) => {
      config?.paramsSerializer();
      return Promise.resolve(mockResponse);
    });

    // Call the function
    const result = await getRecordsList(params, MOCK_AUTH);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.records.getRecordsList).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.records.getRecordsList as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getRecordsList(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.records.getRecordsList).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getRecordsList error', false);
  });
});

describe('getRecordStatus', () => {
  const params = {
    addressList: ['address1', 'address2'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        status: true,
      },
    };

    (request.records.getRecordStatus as Mock).mockImplementation((config: any) => {
      config?.paramsSerializer();
      return Promise.resolve(mockResponse);
    });

    // Call the function
    const result = await getRecordStatus(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getRecordStatus mock was called
    expect(request.records.getRecordStatus).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.records.getRecordStatus as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getRecordStatus(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.records.getRecordStatus).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getRecordStatus error', false);
  });
});

describe('getRecordDetail', () => {
  const mockId = '0000-1111-2222';

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
    (request.records.getRecordDetail as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getRecordDetail(mockId);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getRecordDetail mock was called
    expect(request.records.getRecordDetail).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.records.getRecordDetail as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getRecordDetail(mockId)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.records.getRecordDetail).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getRecordDetail error', false);
  });
});
