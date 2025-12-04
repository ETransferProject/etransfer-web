import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addAelfNetwork, deleteAelfNetwork } from '../deposit';
import { SupportedELFChainId, TokenType } from 'constants/index';
import { NetworkStatus, TNetworkItem } from 'types/api';

describe('addAelfNetwork', () => {
  const mainChainItem = {
    network: 'AELF',
    name: 'aelf MainChain',
    multiConfirm: '32 confirmations',
    multiConfirmTime: '2 mins',
    contractAddress: 'mockMainChainContractAddress',
    explorerUrl: 'https://xxx.com',
    status: NetworkStatus.Health,
  };

  const fromNetworkListMockMainChain = [mainChainItem];

  const sideChainItem = {
    network: 'tDVW',
    name: 'aelf dappChain',
    status: NetworkStatus.Health,
    multiConfirm: '64 confirmations',
    multiConfirmTime: '4 mins',
    contractAddress: 'mockDappChainContractAddress',
    explorerUrl: 'https://xxx.com',
  };

  const fromNetworkListMockSideChain = [sideChainItem];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add the sideChain if fromTokenSelectedSymbol matches toTokenSelectedSymbol and chainId is mainChain', () => {
    const result = addAelfNetwork(
      fromNetworkListMockMainChain,
      TokenType.USDT,
      TokenType.USDT,
      SupportedELFChainId.AELF,
    );

    expect(result).toHaveLength(2);
    expect(result).toEqual([
      {
        network: 'AELF',
        name: 'aelf MainChain',
        multiConfirm: '32 confirmations',
        multiConfirmTime: '2 mins',
        contractAddress: 'mockMainChainContractAddress',
        explorerUrl: 'https://xxx.com',
        status: 'Health',
      },
      {
        network: 'tDVW',
        name: 'aelf dAppChain',
        multiConfirm: '480 confirmations',
        multiConfirmTime: '4 mins',
        contractAddress: '2AgU8BfyKyrxUrmskVCUukw63Wk96MVfVoJzDDbwKszafioCN1',
        explorerUrl: 'https://testnet.aelfscan.io/tDVW/',
        status: 'Health',
        withdrawFee: '',
        withdrawFeeUnit: '',
      },
    ]);
  });

  it('should not add a new network if chainId already exists in the list', () => {
    const result = addAelfNetwork(
      fromNetworkListMockSideChain,
      TokenType.USDT,
      TokenType.USDT,
      SupportedELFChainId.tDVW,
    );

    expect(result).toHaveLength(2);
    expect(result).toEqual([
      {
        network: 'tDVW',
        name: 'aelf dappChain',
        status: 'Health',
        multiConfirm: '64 confirmations',
        multiConfirmTime: '4 mins',
        contractAddress: 'mockDappChainContractAddress',
        explorerUrl: 'https://xxx.com',
      },
      {
        network: 'AELF',
        name: 'aelf MainChain',
        multiConfirm: '480 confirmations',
        multiConfirmTime: '4 mins',
        contractAddress: '4xWFvoLvi5anZERDuJvzfMoZsb6WZLATEzqzCVe8sQnCp2XGS',
        explorerUrl: 'https://testnet.aelfscan.io/AELF/',
        status: 'Health',
        withdrawFee: '',
        withdrawFeeUnit: '',
      },
    ]);
  });

  it('should return one network if chainId is MainChain and SideChain exists in the list', () => {
    const result = addAelfNetwork(
      fromNetworkListMockSideChain,
      TokenType.USDT,
      TokenType.USDT,
      SupportedELFChainId.AELF,
    );

    expect(result).toEqual([
      {
        network: 'tDVW',
        name: 'aelf dappChain',
        status: 'Health',
        multiConfirm: '64 confirmations',
        multiConfirmTime: '4 mins',
        contractAddress: 'mockDappChainContractAddress',
        explorerUrl: 'https://xxx.com',
      },
    ]);
  });

  it('should not add a network if fromTokenSelectedSymbol is not supported', () => {
    const result = addAelfNetwork(
      fromNetworkListMockMainChain,
      'UNSUPPORTED_TOKEN',
      'UNSUPPORTED_TOKEN',
      SupportedELFChainId.AELF,
    );

    // Input list remains unchanged
    expect(result).toEqual(fromNetworkListMockMainChain);
  });

  it('should handle empty input gracefully', () => {
    const result = addAelfNetwork(
      [],
      'UNSUPPORTED_TOKEN',
      'UNSUPPORTED_TOKEN',
      SupportedELFChainId.AELF,
    );

    // Empty list remains empty
    expect(result).toEqual([]);
  });
});

describe('deleteAelfNetwork', () => {
  const AELFNetwork = { network: 'AELF', name: 'aelf MainChain' } as TNetworkItem;
  const tDVWNetwork = { network: 'tDVW', name: 'aelf dappChain' } as TNetworkItem;
  const ETHNetwork = { name: 'Ethereum', network: 'ETH' } as TNetworkItem;
  const fromNetworkListMock: TNetworkItem[] = [
    { ...AELFNetwork },
    { ...tDVWNetwork },
    { ...ETHNetwork },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the original list if fromTokenSelectedSymbol matches toTokenSelectedSymbol and is supported', () => {
    const result = deleteAelfNetwork(fromNetworkListMock, TokenType.USDT, TokenType.USDT);

    // No deletions
    expect(result).toEqual(fromNetworkListMock);
  });

  it('should filter out Aelf chains if fromTokenSelectedSymbol is not supported', () => {
    const result = deleteAelfNetwork(fromNetworkListMock, 'UNSUPPORTED_TOKEN', 'UNSUPPORTED_TOKEN');

    // Aelf chains removed
    expect(result).toEqual([{ ...ETHNetwork }]);
  });

  it('should filter out Aelf chains if fromTokenSelectedSymbol does not match toTokenSelectedSymbol', () => {
    const result = deleteAelfNetwork(fromNetworkListMock, TokenType.USDT, TokenType.SGR);

    expect(result).toEqual([{ ...ETHNetwork }]);
  });

  it('should handle an empty fromNetworkList gracefully', () => {
    const result = deleteAelfNetwork([], TokenType.USDT, TokenType.USDT);

    // Empty input list remains unchanged
    expect(result).toEqual([]);
  });

  it('should handle missing or empty token symbols gracefully', () => {
    // Case 1: Empty `fromTokenSelectedSymbol` and `toTokenSelectedSymbol`
    const result1 = deleteAelfNetwork(fromNetworkListMock, '', '');

    // Aelf chains removed
    expect(result1).toEqual([{ ...ETHNetwork }]);

    // Case 2: Unknown token symbols
    const result2 = deleteAelfNetwork(fromNetworkListMock, 'UNKNOWN', 'UNKNOWN');

    expect(result2).toEqual([{ ...ETHNetwork }]);
  });
});
