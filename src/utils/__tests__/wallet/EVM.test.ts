import { BlockchainNetworkType } from 'constants/network';
import { getEVMChainInfo, getTransactionReceiptAutoRetry } from 'utils/wallet/EVM';
import { describe, it, expect, Mock } from 'vitest';
import {
  arbitrum,
  avalanche,
  base,
  bsc,
  bscTestnet,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';
import * as WagmiCore from '@wagmi/core';

vi.mock('@etransfer/utils');
vi.mock('wagmi');
vi.mock('@wagmi/connectors');
vi.mock('@tanstack/react-query');
vi.mock('@wagmi/core', async (importOriginal) => {
  const original = await importOriginal<typeof WagmiCore>();
  return {
    ...original,
    getTransactionReceipt: vi.fn().mockImplementation(() => ({
      status: 'success',
      transactionHash: '0x123456789',
      blockNumber: 123456n,
    })),
  };
});

vi.mock('wagmi/chains', async (importOriginal) => {
  const actual: any = await importOriginal();

  return {
    ...actual,

    arbitrum: { chainName: 'Arbitrum', id: 1 },
    avalanche: { chainName: 'Avalanche', id: 2 },
    base: { chainName: 'Base', id: 3 },
    bsc: { chainName: 'Binance Smart Chain', id: 4 },
    mainnet: { chainName: 'Ethereum Mainnet', id: 5 },
    optimism: { chainName: 'Optimism', id: 6 },
    polygon: { chainName: 'Polygon', id: 7 },
    sepolia: { chainName: 'Sepolia Testnet', id: 8 },
    bscTestnet: { chainName: 'Binance Smart Chain Testnet', id: 9 },
    // sepolia: {
    //   id: 11155111,
    //   name: 'Sepolia',
    //   network: 'sepolia',
    //   nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    //   rpcUrls: {
    //     default: { http: ['https://rpc.sepolia.org'] },
    //     public: { http: ['https://rpc.sepolia.org'] },
    //   },
    // },
  };
});

describe('getTransactionReceiptAutoRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct transaction receipt info', async () => {
    const mockResult = {
      status: 'success',
      transactionHash: '0x123456789',
      blockNumber: 123456n,
    };

    // Mock getTransactionReceipt method
    (WagmiCore.getTransactionReceipt as Mock).mockResolvedValue(mockResult);

    const result = await getTransactionReceiptAutoRetry({
      hash: '0x123456789',
      chainId: sepolia.id,
    });

    expect(result).toBe(mockResult);
  });

  it('should retry to get correct transaction receipt info if status is pending', async () => {
    const mockResultPending = {
      status: 'pending',
    };

    const mockResultSuccess = {
      status: 'success',
    };

    // Mock getTransactionReceipt method
    (WagmiCore.getTransactionReceipt as Mock).mockResolvedValueOnce(mockResultPending);

    (WagmiCore.getTransactionReceipt as Mock).mockResolvedValueOnce(mockResultSuccess);

    const result = await getTransactionReceiptAutoRetry({
      hash: '0x123456789',
      chainId: sepolia.id,
    });

    expect(result).toBe(mockResultSuccess);
  });

  it('should throw an error if status is reverted', async () => {
    const mockResult = {
      status: 'reverted',
      transactionHash: '0x123456789',
      blockNumber: 123456n,
    };

    // Mock getTransactionReceipt method
    (WagmiCore.getTransactionReceipt as Mock).mockResolvedValue(mockResult);

    await expect(
      getTransactionReceiptAutoRetry({
        hash: '0x123456789',
        chainId: sepolia.id,
      }),
    ).rejects.toThrow('Transaction is reverted');
  });

  it('should throw an error if getTransactionReceipt reject', async () => {
    const mockErrorResult = 'Error';

    // Mock getTransactionReceipt method
    (WagmiCore.getTransactionReceipt as Mock).mockRejectedValue(mockErrorResult);

    await expect(
      getTransactionReceiptAutoRetry({
        hash: '0x123456789',
        chainId: sepolia.id,
      }),
    ).rejects.toThrow(mockErrorResult);
  });

  it('should throw an error if the Transaction may not be processed on a block yet.', async () => {
    const mockErrorResult = 'The Transaction may not be processed on a block yet.';

    // Mock getTransactionReceipt method
    (WagmiCore.getTransactionReceipt as Mock).mockRejectedValue(mockErrorResult);

    await expect(
      getTransactionReceiptAutoRetry({
        hash: '0x123456789',
        chainId: sepolia.id,
      }),
    ).rejects.toThrow(mockErrorResult);
  });
});

describe('getEVMChainInfo', () => {
  it('should return chain information for Arbitrum', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.Arbitrum);
    expect(result).toEqual(arbitrum);
  });

  it('should return chain information for Avalanche', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.Avax);
    expect(result).toEqual(avalanche);
  });

  it('should return chain information for BASE', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.BASE);
    expect(result).toEqual(base);
  });

  it('should return chain information for Binance Smart Chain', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.Binance);
    expect(result).toEqual(bsc);
  });

  it('should return chain information for Ethereum Mainnet', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.Ethereum);
    expect(result).toEqual(mainnet);
  });

  it('should return chain information for Optimism', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.Optimism);
    expect(result).toEqual(optimism);
  });

  it('should return chain information for Polygon', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.Polygon);
    expect(result).toEqual(polygon);
  });

  it('should return chain information for Sepolia Testnet (SETH)', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.SETH);
    expect(result).toEqual(sepolia);
  });

  it('should return chain information for Binance Smart Chain Testnet', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.TBinance);
    expect(result).toEqual(bscTestnet);
  });

  it('should return undefined for unknown network', () => {
    const result = getEVMChainInfo('UnknownNetwork');
    expect(result).toBeUndefined();
  });

  it('should return undefined for null, undefined, or empty string', () => {
    expect(getEVMChainInfo(null as unknown as string)).toBeUndefined();
    expect(getEVMChainInfo(undefined as unknown as string)).toBeUndefined();
    expect(getEVMChainInfo('')).toBeUndefined();
  });
});
