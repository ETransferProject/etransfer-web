import { renderHook } from '@testing-library/react';
import { vi, describe, expect, beforeEach } from 'vitest';
import {
  useChangeSideMenu,
  useCheckAllowSearch,
  useRouteParamType,
  useRouterPush,
  useRouteSearchString,
  useWithdrawRouter,
} from '../route';
import { setActiveMenuKey } from 'store/reducers/common/slice';
import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SideMenuKey } from 'constants/home';
import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import { TWithdrawEntryConfig } from 'types';
import { stringifyUrl } from 'query-string';

// Mock dependencies
vi.mock('store/Provider/hooks', () => ({
  useAppDispatch: vi.fn(() => mockDispatch),
  useCommonState: vi.fn(() => mockCommonState),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock('query-string', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    stringify: vi.fn().mockReturnValue(''),
  };
});

const mockPush = vi.fn();
const mockDispatch = vi.fn();
let mockCommonState = { activeMenuKey: SideMenuKey.Deposit };

const mockSearchParams = (params: string) => {
  const searchParams = new URLSearchParams(params);
  return {
    ...searchParams,
    append: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    toString: () => searchParams.toString(),
  } as unknown as ReadonlyURLSearchParams;
};

describe('useRouteParamType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCommonState = { activeMenuKey: SideMenuKey.Deposit };
  });

  test('should return route type when URL has type param', () => {
    // Mock URL with type param
    vi.mocked(useSearchParams).mockReturnValue({ get: vi.fn().mockReturnValue('Withdraw') } as any);

    const { result } = renderHook(() => useRouteParamType());

    // Expect the result to be the route type
    expect(result.current.type).toBe(SideMenuKey.Withdraw);
    expect(mockDispatch).toHaveBeenCalledWith(setActiveMenuKey(SideMenuKey.Withdraw));
  });

  test('should return activeMenuKey when no type param exists', () => {
    // Mock empty URL params
    vi.mocked(useSearchParams).mockReturnValue({ get: vi.fn().mockReturnValue('') } as any);
    mockCommonState.activeMenuKey = SideMenuKey.History;

    const { result } = renderHook(() => useRouteParamType());

    // Expect the result to be the active menu key
    expect(result.current.type).toBe(SideMenuKey.History);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test('should prioritize route type over activeMenuKey', () => {
    // Mock URL with type param
    vi.mocked(useSearchParams).mockReturnValue({ get: vi.fn().mockReturnValue('Info') } as any);
    mockCommonState.activeMenuKey = SideMenuKey.Withdraw;

    const { result } = renderHook(() => useRouteParamType());

    // Expect the result to be the route type
    expect(result.current.type).toBe(SideMenuKey.Info);
  });

  test('should update active menu when path changes', () => {
    // Mock different path
    vi.mocked(usePathname).mockReturnValue('/');
    vi.mocked(useSearchParams).mockReturnValue({ get: vi.fn().mockReturnValue('History') } as any);

    renderHook(() => useRouteParamType());

    // Expect dispatch to be called with the new active menu key
    expect(mockDispatch).toHaveBeenCalledWith(setActiveMenuKey(SideMenuKey.History));
  });

  test('should not dispatch when not on home page', () => {
    // Mock different path
    vi.mocked(usePathname).mockReturnValue('/deposit');
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams('type=withdraw'));

    renderHook(() => useRouteParamType());

    // Expect dispatch not to be called
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});

describe('useRouteSearchString', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return valid search string with single param', () => {
    // Mock URL with single parameter
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams('type=deposit'));

    const { result } = renderHook(() => useRouteSearchString());

    // Expect the result to be the same as the mocked URL
    expect(result.current).toBe('type=deposit');
  });

  test('should handle multiple parameters', () => {
    // Mock URL with multiple parameters
    vi.mocked(useSearchParams).mockReturnValue(
      mockSearchParams('type=withdraw&status=success&chainId=1'),
    );

    // Render the hook and check the result
    const { result } = renderHook(() => useRouteSearchString());

    // Expect the result to be the same as the mocked URL
    expect(result.current).toBe('type=withdraw&status=success&chainId=1');
  });

  test('should handle special characters', () => {
    // Mock URL with special characters
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams('query=a%26b%3Dc&flag=true'));

    // Render the hook and check the result
    const { result } = renderHook(() => useRouteSearchString());

    // Expect the result to be the same as the mocked URL
    expect(result.current).toBe('query=a%26b%3Dc&flag=true');
  });
});

describe('useRouterPush', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = (pathname = '/', params = '') => {
    vi.mocked(usePathname).mockReturnValue(pathname);
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams(params) as unknown as ReadonlyURLSearchParams,
    );
    return renderHook(() => useRouterPush());
  };

  test('should generate correct href for root path', () => {
    const { result } = setup();
    result.current('/', true);

    expect(mockPush).toHaveBeenCalledWith(`/?type=${SideMenuKey.Deposit}`);
  });

  test('should preserve existing query parameters', () => {
    const { result } = setup('/', 'chainId=123');
    result.current('/', true);

    expect(mockPush).toHaveBeenCalledWith(`/?chainId=123&type=${SideMenuKey.Deposit}`);
  });

  test('should handle different path cases', () => {
    const { result } = setup('/deposit');
    result.current('/deposit');

    expect(mockPush).toHaveBeenCalledWith('/deposit');
  });

  test('should handle different path cases for deposit', () => {
    const { result } = setup('/deposit', 'chainId=123');
    result.current('/deposit', true);

    expect(mockPush).toHaveBeenCalledWith('/deposit?chainId=123');
  });

  test('should determine currentActiveMenuKey from pathname', () => {
    const paths = [
      ['/deposit', SideMenuKey.Deposit],
      ['/withdraw', SideMenuKey.Withdraw],
      ['/history', SideMenuKey.History],
      ['/info', SideMenuKey.Info],
      ['/cross-chain-transfer', SideMenuKey.CrossChainTransfer],
    ];

    paths.forEach(([path, expectedKey]) => {
      const { result } = setup(path as string);
      result.current('/', true);
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining(`type=${expectedKey}`));
    });
  });

  test('should not add type when isAddType=false', () => {
    const { result } = setup();
    result.current('/', false);

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('should use activeMenuKey when pathname not matched', () => {
    vi.mocked(useCommonState).mockReturnValue({
      activeMenuKey: SideMenuKey.History,
    } as any);
    const { result } = setup('/unknown-path');
    result.current('/', true);

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('type=History'));
  });
});

describe('useCheckAllowSearch', () => {
  const _mockSearchParams = (params: string) => {
    const searchParams = new URLSearchParams(params);
    return {
      get: (key: string) => searchParams.get(key),
      toString: () => searchParams.toString(),
    } as unknown as URLSearchParams;
  };

  const testCases = [
    {
      path: '/',
      params:
        'type=Deposit&status=1&start=1234567&end=1234523423&chainId=AELF&tokenSymbol=ETH&depositFromNetwork=AELF&depositToToken=USDT&calculatePay=100&fromNetwork=AELF&toNetwork=tDVV',
      expected: {
        type: 'Deposit',
        status: '1',
        chainId: 'AELF',
        tokenSymbol: 'ETH',
        depositFromNetwork: 'AELF',
        depositToToken: 'USDT',
        calculatePay: '100',
        fromNetwork: 'AELF',
        toNetwork: 'tDVV',
        end: '1234523423',
        start: '1234567',
      },
    },
    {
      path: '/deposit',
      params:
        'chainId=AELF&tokenSymbol=ETH&depositFromNetwork=AELF&depositToToken=USDT&calculatePay=100&invalidParam=test',
      expected: {
        chainId: 'AELF',
        tokenSymbol: 'ETH',
        depositFromNetwork: 'AELF',
        depositToToken: 'USDT',
        calculatePay: '100',
      },
    },
    {
      path: '/withdraw',
      params: 'chainId=56&fromNetwork=bsc&toNetwork=avax&withdrawAddress=1234&tokenSymbol=USDT',
      expected: {
        fromNetwork: 'bsc', // New parameter
        toNetwork: 'avax',
        withdrawAddress: '1234',
        tokenSymbol: 'USDT',
      },
    },
    {
      path: '/cross-chain-transfer',
      params: 'fromNetwork=optimism&toNetwork=polygon&tokenSymbol=MATIC',
      expected: {
        chainId: 'optimism',
        withdrawAddress: 'polygon',
        tokenSymbol: 'MATIC',
      },
    },
    {
      path: '/history',
      params: 'type=completed&start=2023-01-01&end=2023-12-31&status=1',
      expected: {
        type: 'completed',
        start: '2023-01-01',
        end: '2023-12-31',
        status: '1',
      },
    },
    {
      path: '/unknown',
      params: 'anyParam=value',
      expected: {},
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test.each(testCases)('should filter $path parameters correctly', ({ path, params, expected }) => {
    vi.mocked(useSearchParams).mockReturnValue(_mockSearchParams(params) as any);
    const { result } = renderHook(() => useCheckAllowSearch());

    expect(result.current(path)).toEqual(expected);
  });

  test('should handle empty parameters', () => {
    vi.mocked(useSearchParams).mockReturnValue(_mockSearchParams('') as any);
    const { result } = renderHook(() => useCheckAllowSearch());

    expect(result.current('/')).toEqual({});
  });

  test('should handle special characters', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      _mockSearchParams('tokenSymbol=USDT%2FUSD&withdrawAddress=0x123...') as any,
    );
    const { result } = renderHook(() => useCheckAllowSearch());

    expect(result.current('/')).toEqual({
      tokenSymbol: 'USDT/USD',
      withdrawAddress: '0x123...',
    });
  });

  // test('should preserve parameter casing', () => {
  //   vi.mocked(useSearchParams).mockReturnValue(
  //     _mockSearchParams('TokenSymbol=ETH&FromNetwork=Mainnet'),
  //   );
  //   const { result } = renderHook(() => useCheckAllowSearch());

  //   expect(result.current('/withdraw')).toEqual({
  //     fromNetwork: 'Mainnet',
  //     tokenSymbol: 'ETH',
  //   });
  // });
});

describe('useChangeSideMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch);
  });

  test('should dispatch action and navigate when called', () => {
    const { result } = renderHook(() => useChangeSideMenu());
    const testKey = SideMenuKey.Deposit;
    const testPath = '/deposit';

    result.current(testKey, testPath);

    expect(mockDispatch).toHaveBeenCalledWith(setActiveMenuKey(testKey));
    expect(mockPush).toHaveBeenCalledWith(testPath);
  });

  test('should handle multiple calls correctly', () => {
    const { result } = renderHook(() => useChangeSideMenu());
    const testCases = [
      { key: SideMenuKey.Withdraw, path: '/withdraw' },
      { key: SideMenuKey.History, path: '/history' },
      { key: SideMenuKey.Info, path: '/info' },
    ];

    testCases.forEach(({ key, path }) => {
      result.current(key, path);
      expect(mockDispatch).toHaveBeenCalledWith(setActiveMenuKey(key));
      expect(mockPush).toHaveBeenCalledWith(path);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(testCases.length);
    expect(mockPush).toHaveBeenCalledTimes(testCases.length);
  });

  test('should maintain router reference stability', () => {
    const originalPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: originalPush } as any);

    const { result } = renderHook(() => useChangeSideMenu());
    result.current(SideMenuKey.Deposit, '/deposit');

    expect(originalPush).toHaveBeenCalled();
  });

  //   test('should handle empty path gracefully', () => {
  //     const { result } = renderHook(() => useChangeSideMenu());
  //     result.current(SideMenuKey.Info, '');

  //     expect(mockPush).toHaveBeenCalledWith('');
  //   });
});

describe('useWithdrawRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
  });

  test('should generate correct withdraw URL with parameters', () => {
    const { result } = renderHook(() => useWithdrawRouter());
    const testParams: any = {
      chainId: '1',
      tokenSymbol: 'ETH',
      fromNetwork: 'mainnet',
      toNetwork: 'arbitrum',
    };

    result.current(testParams);

    expect(mockPush).toHaveBeenCalledWith(
      stringifyUrl({
        url: '/withdraw',
        query: testParams,
      }),
    );
  });

  test('should handle empty search parameters', () => {
    const { result } = renderHook(() => useWithdrawRouter());
    result.current({});

    expect(mockPush).toHaveBeenCalledWith('/withdraw');
  });

  test('should handle various parameter combinations', () => {
    const { result } = renderHook(() => useWithdrawRouter());
    const testCases = [
      { params: { chainId: '56' }, expected: '/withdraw?chainId=56' },
      { params: { tokenSymbol: 'USDT' }, expected: '/withdraw?tokenSymbol=USDT' },
      { params: { fromNetwork: 'bsc' }, expected: '/withdraw?fromNetwork=bsc' },
      {
        params: { toNetwork: 'optimism', amount: '100' },
        expected: '/withdraw?amount=100&toNetwork=optimism',
      },
    ];

    testCases.forEach(({ params, expected }) => {
      result.current(params as any);
      expect(mockPush).toHaveBeenCalledWith(expected);
    });
  });

  test('should maintain parameter types', () => {
    const { result } = renderHook(() => useWithdrawRouter());
    const numericParams = { chainId: 123, amount: 500 };

    result.current(numericParams as unknown as TWithdrawEntryConfig);

    expect(mockPush).toHaveBeenCalledWith('/withdraw?amount=500&chainId=123');
  });
});
