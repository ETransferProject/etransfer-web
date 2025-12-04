import { describe, it, expect, vi, Mock } from 'vitest';
import { request } from 'api';
import { checkEOARegistration, checkRegistration, getTokenPrices } from '../../api/user';
import { formatApiError } from '../../api/error';
import { WalletSourceType } from 'types/api';

vi.mock('api', () => ({
  request: {
    user: {
      checkEOARegistration: vi.fn(),
      checkRegistration: vi.fn(),
      getTokenPrices: vi.fn(),
    },
  },
}));

vi.mock('../../api/error', () => ({
  formatApiError: vi.fn(),
}));

// Mock API failure
const mockError = new Error('API request failed');
const mockFormattedError = new Error('Formatted error message');

describe('checkEOARegistration', () => {
  const params = {
    address: 'mockAddress',
  };

  // Mock API success
  const mockResponse = {
    data: {
      result: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    (request.user.checkEOARegistration as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await checkEOARegistration(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the checkEOARegistration mock was called
    expect(request.user.checkEOARegistration).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.user.checkEOARegistration as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(checkEOARegistration(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.user.checkEOARegistration).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'checkEOARegistration error', false);
  });
});

describe('checkRegistration', () => {
  const params = {
    address: 'mockAddress',
    sourceType: WalletSourceType.EVM,
  };

  // Mock API success
  const mockResponse = {
    data: {
      result: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    (request.user.checkRegistration as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await checkRegistration(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the checkRegistration mock was called
    expect(request.user.checkRegistration).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.user.checkRegistration as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(checkRegistration(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.user.checkRegistration).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'checkRegistration error', false);
  });
});

describe('getTokenPrices', () => {
  const params = {
    symbols: 'USDT',
  };

  // Mock API success
  const mockResponse = {
    data: {
      result: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    (request.user.getTokenPrices as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getTokenPrices(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenPrices mock was called
    expect(request.user.getTokenPrices).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.user.getTokenPrices as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getTokenPrices(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.user.getTokenPrices).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getTokenPrices error', false);
  });
});
