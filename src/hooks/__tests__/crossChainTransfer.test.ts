import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, expect, beforeEach, Mock } from 'vitest';
import { useGoTransfer, useSendTxnFromAelfChain, useSetWalletType } from '../crossChainTransfer';
import {
  setTokenSymbol,
  setFromNetwork,
  setToNetwork,
  setFromWalletType,
  setToWalletType,
} from 'store/reducers/crossChainTransfer/slice';
import { WalletTypeEnum } from 'context/Wallet/types';
import {
  isAelfChain,
  isEVMChain,
  isSolanaChain,
  isTRONChain,
  isTONChain,
  getCaHashAndOriginChainIdByWallet,
} from 'utils/wallet';
import { SupportedELFChainId } from 'constants/index';
import { checkTokenAllowanceAndApprove, createTransferTokenTransaction } from 'utils/contract';
import { createTransferOrder } from 'utils/api/transfer';
import { useGetBalanceDivDecimals } from 'hooks/contract';
import { isDIDAddressSuffix, removeELFAddressSuffix } from 'utils/aelf/aelfBase';
import { isAuthTokenError } from 'utils/api/error';
import { WalletTypeEnum as AelfWalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import useAelf from '../wallet/useAelf';

// Mock dependencies
vi.mock('utils/myEvent', () => ({
  eventBus: {
    emit: vi.fn(),
  },
}));

vi.mock('utils/etransferInstance', () => ({
  eTransferInstance: {
    processingIds: [],
    showNoticeIds: [],
    setProcessingIds: vi.fn(),
    setShowNoticeIds: vi.fn(),
  },
}));

vi.mock('constants/crossChainTransfer', () => {
  return {
    ErrorNameType: 'ErrorNameType',
    ADDRESS_NOT_CORRECT: 'Address is not correct',
    TRANSACTION_APPROVE_LOADING: 'TRANSACTION_APPROVE_LOADING',
  };
});

vi.mock(import('@portkey/utils'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    sleep: vi.fn(),
  };
});

vi.mock('store/reducers/crossChainTransfer/slice', () => ({
  setFromNetwork: vi.fn(),
  setToNetwork: vi.fn(),
  setTokenSymbol: vi.fn(),
  setFromWalletType: vi.fn(),
  setToWalletType: vi.fn(),
}));

vi.mock('@aelf-web-login/wallet-adapter-react', () => ({
  useConnectWallet: () => ({
    walletInfo: {},
    walletType: 'PortkeyDiscover',
    isConnected: false,
    connecting: false,
    connectWallet: vi.fn(),
    disConnectWallet: vi.fn(),
    getSignature: vi.fn(),
  }),
  useWallet: () => ({
    store: {
      getState: vi.fn().mockReturnValue({}),
      subscribe: vi.fn(),
    },
  }),
}));

vi.mock('store/Provider/hooks', () => ({
  useAppDispatch: vi.fn(() => mockDispatch),
  useCrossChainTransfer: vi.fn(() => mockCrossChainTransfer),
  useLoading: vi.fn(() => ({ setLoading: mockSetLoading })),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

vi.mock('utils/api/error', () => {
  return {
    isAuthTokenError: vi.fn().mockReturnValue(false),
  };
});

vi.mock('utils/wallet', () => ({
  isAelfChain: vi.fn(),
  isEVMChain: vi.fn(),
  isSolanaChain: vi.fn(),
  isTRONChain: vi.fn(),
  isTONChain: vi.fn(),
  getCaHashAndOriginChainIdByWallet: vi.fn(),
  getManagerAddressByWallet: vi.fn(),
}));

vi.mock('utils/contract', () => ({
  checkTokenAllowanceAndApprove: vi.fn(),
  createTransferTokenTransaction: vi.fn(),
}));

vi.mock('utils/api/transfer', () => ({
  createTransferOrder: vi.fn(),
}));

vi.mock('utils/aelf/aelfBase', () => ({
  isDIDAddressSuffix: vi.fn(),
  removeELFAddressSuffix: vi.fn(),
}));

vi.mock('../contract', () => ({
  useGetBalanceDivDecimals: vi.fn().mockReturnValue(() => {
    return '100000';
  }),
}));

vi.mock('../wallet/useAelf', async (importOriginal) => {
  const actual: any = await importOriginal();
  // Mock default function
  const mockFn = vi.fn(() => mockAelfHook);

  return {
    ...actual,
    default: mockFn,
    useAelf: mockFn,
    useGetAelfAccount: vi.fn(() => mockAccounts),
  };
});

vi.mock('../wallet/aelfAuthToken', () => ({
  useAelfAuthToken: vi.fn(() => ({
    getAuth: mockGetAelfAuthToken,
    queryAuth: mockQueryAelfAuthToken,
  })),
}));

const mockGetAelfAuthToken = vi.fn();
const mockQueryAelfAuthToken = vi.fn();
const mockDispatch = vi.fn();
const mockPush = vi.fn();

describe('useGoTransfer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should dispatch actions and navigate', async () => {
    const { result } = renderHook(() => useGoTransfer());
    const goTransfer = result.current;

    await goTransfer('ETH', 'Mainnet', 'Arbitrum');

    // Verify dispatched actions
    expect(mockDispatch).toHaveBeenCalledWith(setTokenSymbol('ETH'));
    expect(mockDispatch).toHaveBeenCalledWith(setFromNetwork({ network: 'Mainnet' } as any));
    expect(mockDispatch).toHaveBeenCalledWith(setToNetwork({ network: 'Arbitrum' } as any));
    expect(mockPush).toHaveBeenCalledWith('/cross-chain-transfer');
  });

  test('should handle partial parameters', async () => {
    const { result } = renderHook(() => useGoTransfer());
    const goTransfer = result.current;

    // Test with only symbol
    await goTransfer('BTC');
    expect(mockDispatch).toHaveBeenCalledWith(setTokenSymbol('BTC'));

    // Test with only networks
    await goTransfer(undefined, 'Optimism', 'Polygon');
    expect(mockDispatch).toHaveBeenCalledWith(setFromNetwork({ network: 'Optimism' } as any));
    expect(mockDispatch).toHaveBeenCalledWith(setToNetwork({ network: 'Polygon' } as any));
  });

  test('should always navigate after dispatch', async () => {
    const { result } = renderHook(() => useGoTransfer());
    const goTransfer = result.current;

    await goTransfer();

    // Verify always navigating
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});

const mockSetLoading = vi.fn();
const mockAelfHook = {
  walletInfo: { type: 'AELF' },
  connector: AelfWalletTypeEnum.elf, //'wallet-connector',
  callSendMethod: vi.fn(),
  signMessage: vi.fn(),
};

const mockDiscoverHook = {
  walletInfo: { type: 'AELF' },
  connector: AelfWalletTypeEnum.discover,
  callSendMethod: vi.fn(),
  signMessage: vi.fn(),
};
const mockAccounts = { [SupportedELFChainId.AELF]: '0x123' };
const mockCheckTokenAllowance = vi.mocked(checkTokenAllowanceAndApprove);
const mockCreateTransaction = vi.mocked(createTransferTokenTransaction);
const mockCreateOrder = vi.mocked(createTransferOrder);

describe('useSendTxnFromAelfChain', () => {
  const initialProps: any = {
    fromNetwork: { network: SupportedELFChainId.AELF },
    toNetwork: { network: 'Ethereum' },
    tokenSymbol: 'ELF',
    totalTokenList: [{ symbol: 'ELF', decimals: 8 }],
    InitialTransferState: { tokenList: [{ symbol: 'ELF', decimals: 8 }] },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useGetBalanceDivDecimals as Mock).mockReturnValue(() => {
      return '10000';
    });

    (getCaHashAndOriginChainIdByWallet as Mock).mockResolvedValue({
      caHash: 'mock-ca-hash',
      originChainId: SupportedELFChainId.AELF,
    });

    mockCheckTokenAllowance.mockResolvedValue(true);
    mockCreateTransaction.mockResolvedValue('mock-tx-hash');
    mockCreateOrder.mockResolvedValue({ orderId: '123', transactionId: 'tx123' });
  });

  test('should complete transfer flow successfully', async () => {
    const { result } = renderHook(() => useSendTxnFromAelfChain(initialProps));
    const successCallback = vi.fn();
    const failCallback = vi.fn();

    await result.current.sendTransferTokenTransaction({
      amount: '100',
      address: '0xAddress',
      memo: 'test',
      successCallback,
      failCallback,
    });

    // Expect the loading state to be set twice
    expect(mockSetLoading).toHaveBeenCalledTimes(2);
    expect(mockCheckTokenAllowance).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: '100',
        symbol: 'ELF',
      }),
    );
    expect(mockCreateOrder).toHaveBeenCalled();
    expect(successCallback).toHaveBeenCalledWith({ orderId: '123', transactionId: 'tx123' });
  });
  test('should complete transfer flow successfully', async () => {
    //  Mock useAelf
    (useAelf as Mock).mockImplementation(() => mockDiscoverHook);

    const { result } = renderHook(() => useSendTxnFromAelfChain(initialProps));
    const successCallback = vi.fn();
    const failCallback = vi.fn();

    await result.current.sendTransferTokenTransaction({
      amount: '100',
      address: '0xAddress',
      memo: 'test',
      successCallback,
      failCallback,
    });

    // Expect the loading state to be set twice
    expect(mockSetLoading).toHaveBeenCalledTimes(2);
    expect(mockCheckTokenAllowance).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: '100',
        symbol: 'ELF',
      }),
    );
    expect(mockCreateOrder).toHaveBeenCalled();
    expect(successCallback).toHaveBeenCalledWith({ orderId: '123', transactionId: 'tx123' });
  });

  test('should complete transfer flow successfully with aelf chain address', async () => {
    // Mock isDIDAddressSuffix and removeELFAddressSuffix
    (isDIDAddressSuffix as Mock).mockReturnValue(true);
    (removeELFAddressSuffix as Mock).mockReturnValue('0xAddress');

    const { result } = renderHook(() => useSendTxnFromAelfChain(initialProps));
    const successCallback = vi.fn();
    const failCallback = vi.fn();

    await result.current.sendTransferTokenTransaction({
      amount: '100',
      address: 'ELF_0xAddress_AELF',
      memo: 'test',
      successCallback,
      failCallback,
    });

    // Expect the loading state to be set twice
    expect(mockSetLoading).toHaveBeenCalledTimes(2);
    expect(mockCheckTokenAllowance).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: '100',
        symbol: 'ELF',
      }),
    );
    expect(mockCreateOrder).toHaveBeenCalled();
    expect(successCallback).toHaveBeenCalledWith({ orderId: '123', transactionId: 'tx123' });
  });

  test('should complete transfer flow successfully with totalTokenList empty', async () => {
    const { result } = renderHook(() =>
      useSendTxnFromAelfChain({ ...initialProps, totalTokenList: [] }),
    );
    const successCallback = vi.fn();
    const failCallback = vi.fn();

    await result.current.sendTransferTokenTransaction({
      amount: '100',
      address: '0xAddress',
      memo: 'test',
      successCallback,
      failCallback,
    });

    // Expect the loading state to be set twice
    expect(mockSetLoading).toHaveBeenCalledTimes(2);
    expect(mockCheckTokenAllowance).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: '100',
        symbol: 'ELF',
      }),
    );
    expect(mockCreateOrder).toHaveBeenCalled();
    expect(successCallback).toHaveBeenCalledWith({ orderId: '123', transactionId: 'tx123' });
  });

  test('should handle invalid toNetwork.network', async () => {
    const { result } = renderHook(() =>
      useSendTxnFromAelfChain({ ...initialProps, toNetwork: { network: '' } }),
    );

    // Trigger the invalid toNetwork.network error
    await expect(
      result.current.sendTransferTokenTransaction({
        amount: '100',
        address: '0xAddress',
        successCallback: vi.fn(),
        failCallback: vi.fn(),
      }),
    ).rejects.toThrow('Please selected network');
  });

  test('should handle invalid address', async () => {
    const { result } = renderHook(() => useSendTxnFromAelfChain(initialProps));

    // Trigger the invalid address error
    await expect(
      result.current.sendTransferTokenTransaction({
        amount: '100',
        address: '',
        successCallback: vi.fn(),
        failCallback: vi.fn(),
      }),
    ).rejects.toThrow('Address is not correct');
  });

  test('should handle insufficient balance', async () => {
    // Mock getBalanceDivDecimals to return a balance less than the amount
    (useGetBalanceDivDecimals as Mock).mockReturnValue(() => {
      return '10';
    });

    const { result } = renderHook(() => useSendTxnFromAelfChain(initialProps));

    // Trigger the insufficient balance error
    await expect(
      result.current.sendTransferTokenTransaction({
        amount: '100',
        address: '0xAddress',
        successCallback: vi.fn(),
        failCallback: vi.fn(),
      }),
    ).rejects.toThrow(
      'Insufficient ELF balance in your account. Please consider transferring a smaller amount or topping up before you try again.',
    );
  });

  test('should handle insufficient balance when CheckTokenAllowance error', async () => {
    // Mock checkTokenAllowance to reject with insufficient balance error
    mockCheckTokenAllowance.mockRejectedValueOnce(new Error('Insufficient ELF balance'));

    const { result } = renderHook(() => useSendTxnFromAelfChain(initialProps));

    // Trigger the insufficient balance error
    await expect(
      result.current.sendTransferTokenTransaction({
        amount: '1000',
        address: '0xAddress',
        successCallback: vi.fn(),
        failCallback: vi.fn(),
      }),
    ).rejects.toThrow('Insufficient ELF balance');
  });

  test('should handle approval failure', async () => {
    // Mock checkTokenAllowance to return false
    mockCheckTokenAllowance.mockResolvedValue(false);

    const { result } = renderHook(() => useSendTxnFromAelfChain(initialProps));

    // Trigger the approval failure
    await expect(
      result.current.sendTransferTokenTransaction({
        amount: '100',
        address: '0xAddress',
        successCallback: vi.fn(),
        failCallback: vi.fn(),
      }),
    ).rejects.toThrow('Insufficient allowance');
  });

  test('should clean up loading state on failure', async () => {
    // Mock createOrder to reject
    mockCreateOrder.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useSendTxnFromAelfChain(initialProps));

    // Trigger the failure
    await expect(
      result.current.sendTransferTokenTransaction({
        amount: '100',
        address: '0xAddress',
        successCallback: vi.fn(),
        failCallback: vi.fn(),
      }),
    ).rejects.toThrow();

    // Wait for the loading state to be cleaned up
    await waitFor(() =>
      expect(mockSetLoading).toHaveBeenLastCalledWith(true, {
        text: 'TRANSACTION_APPROVE_LOADING',
      }),
    );
  });

  test('should handle auth token retry', async () => {
    mockCreateOrder
      .mockRejectedValueOnce({ message: '401', code: 401 }) // First call fails
      .mockResolvedValueOnce({ orderId: '123' }); // Retry succeeds

    (isAuthTokenError as Mock).mockReturnValue(true);

    const { result } = renderHook(() => useSendTxnFromAelfChain(initialProps));

    await result.current.sendTransferTokenTransaction({
      amount: '100',
      address: '0xAddress',
      successCallback: vi.fn(),
      failCallback: vi.fn(),
    });

    // Expect the createOrder to be called twice
    expect(mockCreateOrder).toHaveBeenCalledTimes(2);
  });

  test('should complete transfer flow successfully without getting orderId', async () => {
    // Mock createOrder to return an empty orderId
    mockCreateOrder.mockResolvedValue({ orderId: '', transactionId: 'tx123' });

    const { result } = renderHook(() => useSendTxnFromAelfChain(initialProps));
    const successCallback = vi.fn();
    const failCallback = vi.fn();

    await result.current.sendTransferTokenTransaction({
      amount: '100',
      address: '0xAddress',
      memo: 'test',
      successCallback,
      failCallback,
    });

    // Expect the loading state to be set twice
    expect(mockSetLoading).toHaveBeenCalledTimes(2);
    expect(mockCheckTokenAllowance).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: '100',
        symbol: 'ELF',
      }),
    );
    expect(mockCreateOrder).toHaveBeenCalled();
    expect(failCallback).toHaveBeenCalled();
  });
});

const mockFromNetwork: any | null = { network: 'aelf-mainnet' };
const mockToNetwork: any | null = { network: 'ethereum-mainnet' };
const mockCrossChainTransfer = {
  fromNetwork: mockFromNetwork,
  toNetwork: mockToNetwork,
};

describe('useSetWalletType', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock isAelfChain and isEVMChain to return true
    vi.mocked(isAelfChain).mockReturnValue(true);
    vi.mocked(isEVMChain).mockReturnValue(true);
  });

  test('should dispatch wallet type for supported chains', () => {
    const { result } = renderHook(() => useSetWalletType());
    const setWalletType = result.current;

    // Test AELF type
    setWalletType(WalletTypeEnum.AELF);
    expect(mockDispatch).toHaveBeenCalledWith(setFromWalletType(WalletTypeEnum.AELF));
    expect(mockDispatch).toHaveBeenCalledWith(setToWalletType(WalletTypeEnum.AELF));

    // Test EVM type
    vi.mocked(isEVMChain).mockReturnValue(true);
    setWalletType(WalletTypeEnum.EVM);
    expect(mockDispatch).toHaveBeenCalledWith(setFromWalletType(WalletTypeEnum.EVM));
    expect(mockDispatch).toHaveBeenCalledWith(setToWalletType(WalletTypeEnum.EVM));
  });

  test('should not dispatch for non-matching networks', () => {
    const { result } = renderHook(() => useSetWalletType());
    const setWalletType = result.current;

    // Setup non-matching networks
    setWalletType('Other' as any);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test('should handle all wallet type cases', () => {
    const { result } = renderHook(() => useSetWalletType());
    const setWalletType = result.current;

    const testCases = [
      { type: WalletTypeEnum.SOL, checkFn: isSolanaChain },
      { type: WalletTypeEnum.TRON, checkFn: isTRONChain },
      { type: WalletTypeEnum.TON, checkFn: isTONChain },
    ];

    // Test each wallet type
    testCases.forEach(({ type, checkFn }) => {
      vi.mocked(checkFn).mockReturnValueOnce(true);
      setWalletType(type);
      expect(checkFn).toHaveBeenCalledWith(mockFromNetwork?.network);
      expect(mockDispatch).toHaveBeenCalledWith(setFromWalletType(type));
    });
  });
});
