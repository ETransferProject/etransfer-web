import { describe, it, expect, vi, Mock } from 'vitest';
import { request } from 'api';
import {
  addApplicationChain,
  changeApplicationStatus,
  commitTokenInfo,
  getApplicationChainStatusList,
  getApplicationDetail,
  getApplicationIssue,
  getApplicationTokenConfig,
  getApplicationTokenInfo,
  getApplicationTokenList,
  getMyApplicationList,
  prepareBindIssue,
} from '../../api/application';
import { formatApiError } from '../../api/error';
import { ApplicationChainStatusEnum } from 'types/api';

vi.mock('api', () => ({
  request: {
    application: {
      getTokenList: vi.fn(),
      commitTokenInfo: vi.fn(),
      getTokenInfo: vi.fn(),
      getChainStatus: vi.fn(),
      addChain: vi.fn(),
      prepareBindIssue: vi.fn(),
      getIssue: vi.fn(),
      getMyApplicationList: vi.fn(),
      getApplicationDetail: vi.fn(),
      getTokenConfig: vi.fn(),
      changeStatus: vi.fn(),
    },
  },
}));

vi.mock('../../api/error', () => ({
  formatApiError: vi.fn(),
}));

// Mock API failure
const mockError = new Error('API request failed');
const mockFormattedError = new Error('Formatted error message');
const USDT_MOCK = 'USDT_MOCK';

describe('getApplicationTokenList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        tokenList: [
          { symbol: 'A', tokenName: 'TokenA' },
          { symbol: 'B', tokenName: 'TokenB' },
        ],
      },
    };
    (request.application.getTokenList as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getApplicationTokenList();

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getTokenList mock was called
    expect(request.application.getTokenList).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.application.getTokenList as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getApplicationTokenList()).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.application.getTokenList).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getApplicationTokenList error', false);
  });
});

describe('commitTokenInfo', () => {
  const params = {
    symbol: USDT_MOCK,
    officialWebsite: '',
    officialTwitter: '',
    title: '',
    personName: '',
    telegramHandler: '',
    email: 'example@com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: true,
    };
    (request.application.commitTokenInfo as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await commitTokenInfo(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the commitTokenInfo mock was called
    expect(request.application.commitTokenInfo).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.application.commitTokenInfo as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(commitTokenInfo(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.application.commitTokenInfo).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'commitTokenInfo error', false);
  });
});

describe('getApplicationTokenInfo', () => {
  const params = {
    symbol: USDT_MOCK,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        symbol: USDT_MOCK,
        userAddress: '',
        officialWebsite: '',
        officialTwitter: '',
        title: '',
        personName: '',
        telegramHandler: '',
        email: 'example@com',
      },
    };
    (request.application.getTokenInfo as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getApplicationTokenInfo(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getApplicationTokenInfo mock was called
    expect(request.application.getTokenInfo).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.application.getTokenInfo as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getApplicationTokenInfo(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.application.getTokenInfo).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getApplicationTokenInfo error', false);
  });
});

describe('getApplicationChainStatusList', () => {
  const params = {
    symbol: USDT_MOCK,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        chainList: [],
        otherChainList: [],
      },
    };
    (request.application.getChainStatus as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getApplicationChainStatusList(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getApplicationChainStatusList mock was called
    expect(request.application.getChainStatus).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.application.getChainStatus as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getApplicationChainStatusList(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.application.getChainStatus).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(
      mockError,
      'getApplicationChainStatusList error',
      false,
    );
  });
});

describe('addApplicationChain', () => {
  const params = {
    symbol: USDT_MOCK,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {},
    };
    (request.application.addChain as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await addApplicationChain(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the addApplicationChain mock was called
    expect(request.application.addChain).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.application.addChain as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(addApplicationChain(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.application.addChain).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'addApplicationChain error', false);
  });
});

describe('prepareBindIssue', () => {
  const params = {
    address: '0x',
    symbol: USDT_MOCK,
    chainId: 'EVM',
    contractAddress: '0x',
    supply: '100',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        bindingId: '',
        thirdTokenId: '',
      },
    };
    (request.application.prepareBindIssue as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await prepareBindIssue(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the prepareBindIssue mock was called
    expect(request.application.prepareBindIssue).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.application.prepareBindIssue as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(prepareBindIssue(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.application.prepareBindIssue).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'prepareBindIssue error', false);
  });
});

describe('getApplicationIssue', () => {
  const params = {
    bindingId: '',
    thirdTokenId: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        bindingId: '',
        thirdTokenId: '',
      },
    };
    (request.application.getIssue as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getApplicationIssue(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getApplicationIssue mock was called
    expect(request.application.getIssue).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.application.getIssue as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getApplicationIssue(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.application.getIssue).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getApplicationIssue error', false);
  });
});

describe('getMyApplicationList', () => {
  const params = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        bindingId: '',
        thirdTokenId: '',
      },
    };
    (request.application.getMyApplicationList as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getMyApplicationList(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getMyApplicationList mock was called
    expect(request.application.getMyApplicationList).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.application.getMyApplicationList as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getMyApplicationList(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.application.getMyApplicationList).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getMyApplicationList error', false);
  });
});

describe('getApplicationDetail', () => {
  const params = { symbol: USDT_MOCK };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: [
        {
          id: 'id',
          symbol: USDT_MOCK,
          userAddress: '',
          status: ApplicationChainStatusEnum.Complete,
          createTime: '1234567',
          updateTime: '12345678',
        },
      ],
    };
    (request.application.getApplicationDetail as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getApplicationDetail(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getApplicationDetail mock was called
    expect(request.application.getApplicationDetail).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.application.getApplicationDetail as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getApplicationDetail(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.application.getApplicationDetail).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getApplicationDetail error', false);
  });
});

describe('getApplicationTokenConfig', () => {
  const params = { symbol: USDT_MOCK };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        liquidityInUsd: '100',
        holders: '2',
      },
    };
    (request.application.getTokenConfig as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await getApplicationTokenConfig(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the getApplicationTokenConfig mock was called
    expect(request.application.getTokenConfig).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.application.getTokenConfig as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(getApplicationTokenConfig(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.application.getTokenConfig).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'getTokenConfig error', false);
  });
});

describe('changeApplicationStatus', () => {
  const params = { symbol: USDT_MOCK };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token list when the API call succeeds', async () => {
    // Mock API success
    const mockResponse = {
      data: {
        liquidityInUsd: '100',
        holders: '2',
      },
    };
    (request.application.changeStatus as Mock).mockResolvedValue(mockResponse);

    // Call the function
    const result = await changeApplicationStatus(params);

    // Assert the result
    expect(result).toEqual(mockResponse.data);

    // Ensure the changeApplicationStatus mock was called
    expect(request.application.changeStatus).toHaveBeenCalledOnce();
  });

  it('should format and throw an error when the API call fails', async () => {
    (request.application.changeStatus as Mock).mockRejectedValue(mockError);

    // Mock formatApiError to return the mockFormattedError
    (formatApiError as Mock).mockReturnValue(mockFormattedError);

    // Assert the function throws the formatted error
    await expect(changeApplicationStatus(params)).rejects.toThrow(mockFormattedError);

    // Ensure the mocks were called
    expect(request.application.changeStatus).toHaveBeenCalledOnce();
    expect(formatApiError).toHaveBeenCalledWith(mockError, 'changeApplicationStatus error', false);
  });
});
