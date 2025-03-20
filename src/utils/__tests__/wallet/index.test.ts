import { describe, expect, it, vi, Mock } from 'vitest';
import { WalletTypeEnum as AelfWalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { PortkeyDid } from '@aelf-web-login/wallet-adapter-bridge';
import { BlockchainNetworkType } from 'constants/network';
import { WalletTypeEnum } from 'context/Wallet/types';
import {
  computeWalletSourceType,
  computeWalletType,
  getCaHashAndOriginChainIdByWallet,
  getConnectWalletText,
  getManagerAddressByWallet,
  getWalletLogo,
  getWalletSourceType,
  isAelfChain,
  isEVMChain,
  isSolanaChain,
  isTONChain,
  isTRONChain,
} from 'utils/wallet';
import { WalletSourceType } from 'types/api';
import { CONNECT_WALLET } from 'constants/wallet';
import {
  Coinbase_16,
  Metamask_16,
  NightElf_16,
  Phantom_16,
  PortkeyV2_16,
  Tonkeeper_16,
  TronLink_16,
  WalletConnect_16,
} from 'assets/images';
import { COINBASE_WALLET_ID, WALLET_CONNECT_ID } from 'constants/wallet/EVM';
import { pubKeyToAddress } from '../../aelf/aelfBase';
import { WalletInfo } from 'types/wallet';
import { SupportedChainId } from 'constants/index';

// Mock pubKeyToAddress function
vi.mock('../../aelf/aelfBase', () => ({
  pubKeyToAddress: vi.fn(),
}));

// Mock dependencies
vi.mock('@aelf-web-login/wallet-adapter-bridge', () => ({
  PortkeyDid: {
    did: {
      services: {
        getHolderInfoByManager: vi.fn(),
      },
    },
  },
}));

describe('getManagerAddressByWallet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return an empty string for AelfWalletTypeEnum.unknown', async () => {
    const result = await getManagerAddressByWallet({} as any, AelfWalletTypeEnum.unknown);
    expect(result).toBe('');
  });

  it('should call provider.request for AelfWalletTypeEnum.discover and return the manager address', async () => {
    const mockProvider = {
      request: vi.fn().mockResolvedValue('mockManagerAddress'),
    };
    const walletInfo = {
      extraInfo: {
        provider: mockProvider,
      },
    } as unknown as WalletInfo;

    const result = await getManagerAddressByWallet(walletInfo, AelfWalletTypeEnum.discover);

    // Assertions
    expect(mockProvider.request).toHaveBeenCalledWith({
      method: 'wallet_getCurrentManagerAddress',
    });
    expect(result).toBe('mockManagerAddress');
  });

  it('should return an empty string if provider.request fails for AelfWalletTypeEnum.discover', async () => {
    const mockProvider = {
      request: vi.fn().mockResolvedValue(undefined),
    };
    const walletInfo = {
      extraInfo: {
        provider: mockProvider,
      },
    } as unknown as WalletInfo;

    const result = await getManagerAddressByWallet(walletInfo, AelfWalletTypeEnum.discover);

    // Assertions
    expect(mockProvider.request).toHaveBeenCalledWith({
      method: 'wallet_getCurrentManagerAddress',
    });
    expect(result).toBe('');
  });

  it('should return the address from walletInfo.extraInfo for AelfWalletTypeEnum.aa', async () => {
    const walletInfo = {
      extraInfo: {
        portkeyInfo: {
          walletInfo: {
            address: 'aaManagerAddress',
          },
        },
      },
    } as unknown as WalletInfo;

    const result = await getManagerAddressByWallet(walletInfo, AelfWalletTypeEnum.aa);

    // Assertions
    expect(result).toBe('aaManagerAddress');
  });

  it('should return the address from walletInfo.address for AelfWalletTypeEnum.elf', async () => {
    const walletInfo = {
      address: 'elfManagerAddress',
    } as unknown as WalletInfo;

    const result = await getManagerAddressByWallet(walletInfo, AelfWalletTypeEnum.elf);

    // Assertions
    expect(result).toBe('elfManagerAddress');
  });

  it('should call pubKeyToAddress if managerAddress is not present and pubkey is provided', async () => {
    (pubKeyToAddress as Mock).mockReturnValue('pubKeyDerivedAddress');
    const walletInfo = {
      extraInfo: {
        portkeyInfo: {
          walletInfo: {
            address: null,
          },
        },
      },
    } as unknown as WalletInfo;
    const pubkey = 'mockPubKey';

    const result = await getManagerAddressByWallet(walletInfo, AelfWalletTypeEnum.aa, pubkey);

    // Assertions
    expect(pubKeyToAddress).toHaveBeenCalledWith(pubkey);
    expect(result).toBe('pubKeyDerivedAddress');
  });
});

describe('getCaHashAndOriginChainIdByWallet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default values when walletType is unknown', async () => {
    const walletInfo = { address: 'mockAddress' } as unknown as WalletInfo;

    const result = await getCaHashAndOriginChainIdByWallet(walletInfo, AelfWalletTypeEnum.unknown);

    // Assert defaults
    expect(result).toEqual({
      caHash: '',
      originChainId: SupportedChainId.sideChain,
    });
  });

  it('should fetch caHash and originChainId using PortkeyDid for walletType discover', async () => {
    const walletInfo = { address: 'mockWalletAddress' } as unknown as WalletInfo;

    // Mock getHolderInfoByManager response
    (PortkeyDid.did.services.getHolderInfoByManager as Mock).mockResolvedValue([
      { caHash: 'mockCaHash', chainId: 'mockChainId' },
    ]);

    const result = await getCaHashAndOriginChainIdByWallet(walletInfo, AelfWalletTypeEnum.discover);

    // Assert service is called with correct parameters
    expect(PortkeyDid.did.services.getHolderInfoByManager).toHaveBeenCalledWith({
      caAddresses: [walletInfo.address],
    });

    // Assert correct result
    expect(result).toEqual({
      caHash: 'mockCaHash',
      originChainId: 'mockChainId',
    });
  });

  it('should return defaults when PortkeyDid response is empty for walletType discover', async () => {
    const walletInfo = { address: 'mockWalletAddress' } as unknown as WalletInfo;

    // Mock getHolderInfoByManager to return an empty array
    (PortkeyDid.did.services.getHolderInfoByManager as Mock).mockResolvedValue([]);

    const result = await getCaHashAndOriginChainIdByWallet(walletInfo, AelfWalletTypeEnum.discover);

    // Assert service is called as expected
    expect(PortkeyDid.did.services.getHolderInfoByManager).toHaveBeenCalledWith({
      caAddresses: [walletInfo.address],
    });

    // Assert returned default values
    expect(result).toEqual({
      caHash: '',
      originChainId: SupportedChainId.sideChain,
    });
  });

  it('should return caHash and originChainId from walletInfo for walletType aa', async () => {
    const walletInfo = {
      extraInfo: {
        portkeyInfo: {
          caInfo: {
            caHash: 'mockCaHashAA',
          },
          chainId: 'mockChainIdAA',
        },
      },
    } as unknown as WalletInfo;

    const result = await getCaHashAndOriginChainIdByWallet(walletInfo, AelfWalletTypeEnum.aa);

    // Assert correct result
    expect(result).toEqual({
      caHash: 'mockCaHashAA',
      originChainId: 'mockChainIdAA',
    });
  });

  it('should return default originChainId if walletInfo or chainId is invalid for walletType aa', async () => {
    const walletInfo = {
      extraInfo: {
        portkeyInfo: {
          caInfo: { caHash: null },
          chainId: null,
        },
      },
    } as unknown as WalletInfo;

    const result = await getCaHashAndOriginChainIdByWallet(walletInfo, AelfWalletTypeEnum.aa);

    // Assert defaults
    expect(result).toEqual({
      caHash: '',
      originChainId: SupportedChainId.sideChain,
    });
  });
});

describe('getWalletLogo', () => {
  it('should return NightElf_16 for WalletTypeEnum.AELF when connector is AelfWalletTypeEnum.elf', () => {
    const result = getWalletLogo(WalletTypeEnum.AELF, AelfWalletTypeEnum.elf);
    expect(result).toBe(NightElf_16);
  });

  it('should return PortkeyV2_16 for WalletTypeEnum.AELF when connector is not AelfWalletTypeEnum.elf', () => {
    const result = getWalletLogo(WalletTypeEnum.AELF, 'otherConnector');
    expect(result).toBe(PortkeyV2_16);
  });

  it('should return Coinbase_16 for WalletTypeEnum.EVM when connector.id is COINBASE_WALLET_ID', () => {
    const result = getWalletLogo(WalletTypeEnum.EVM, { id: COINBASE_WALLET_ID });
    expect(result).toBe(Coinbase_16);
  });

  it('should return WalletConnect_16 for WalletTypeEnum.EVM when connector.id is WALLET_CONNECT_ID', () => {
    const result = getWalletLogo(WalletTypeEnum.EVM, { id: WALLET_CONNECT_ID });
    expect(result).toBe(WalletConnect_16);
  });

  it('should return Metamask_16 for WalletTypeEnum.EVM for any other connector', () => {
    const result = getWalletLogo(WalletTypeEnum.EVM, { id: 'otherConnector' });
    expect(result).toBe(Metamask_16);
  });

  it('should return Phantom_16 for WalletTypeEnum.SOL', () => {
    const result = getWalletLogo(WalletTypeEnum.SOL);
    expect(result).toBe(Phantom_16);
  });

  it('should return Tonkeeper_16 for WalletTypeEnum.TON', () => {
    const result = getWalletLogo(WalletTypeEnum.TON);
    expect(result).toBe(Tonkeeper_16);
  });

  it('should return TronLink_16 for WalletTypeEnum.TRON', () => {
    const result = getWalletLogo(WalletTypeEnum.TRON);
    expect(result).toBe(TronLink_16);
  });

  it('should return undefined if walletType is not recognized', () => {
    const result = getWalletLogo('UnsupportedWalletType' as WalletTypeEnum);
    expect(result).toBeUndefined();
  });

  it('should return undefined if walletType is null or undefined', () => {
    expect(getWalletLogo(null as unknown as WalletTypeEnum)).toBeUndefined();
    expect(getWalletLogo(undefined as unknown as WalletTypeEnum)).toBeUndefined();
  });
});

describe('isAelfChain', () => {
  it('should return true for Aelf networks', () => {
    expect(isAelfChain(BlockchainNetworkType.tDVV)).toBe(true);
    expect(isAelfChain(BlockchainNetworkType.tDVW)).toBe(true);
    expect(isAelfChain(BlockchainNetworkType.AELF)).toBe(true);
  });

  it('should return false for non-Aelf networks', () => {
    expect(isAelfChain(BlockchainNetworkType.Arbitrum)).toBe(false);
    expect(isAelfChain('UnknownNetwork')).toBe(false); // Invalid network
  });
});

describe('isEVMChain', () => {
  it('should return true for EVM-compatible networks', () => {
    expect(isEVMChain(BlockchainNetworkType.Arbitrum)).toBe(true);
    expect(isEVMChain(BlockchainNetworkType.Avax)).toBe(true);
    expect(isEVMChain(BlockchainNetworkType.Ethereum)).toBe(true);
    expect(isEVMChain(BlockchainNetworkType.Polygon)).toBe(true);
  });

  it('should return false for non-EVM networks', () => {
    expect(isEVMChain(BlockchainNetworkType.Solana)).toBe(false);
    expect(isEVMChain('UnknownNetwork')).toBe(false); // Invalid network
  });
});

describe('isSolanaChain', () => {
  it('should return true for Solana network', () => {
    expect(isSolanaChain(BlockchainNetworkType.Solana)).toBe(true);
  });

  it('should return false for non-Solana networks', () => {
    expect(isSolanaChain(BlockchainNetworkType.TON)).toBe(false);
    expect(isSolanaChain('UnknownNetwork')).toBe(false); // Invalid network
  });
});

describe('isTONChain', () => {
  it('should return true for TON network', () => {
    expect(isTONChain(BlockchainNetworkType.TON)).toBe(true);
  });

  it('should return false for non-TON networks', () => {
    expect(isTONChain(BlockchainNetworkType.Solana)).toBe(false);
    expect(isTONChain('UnknownNetwork')).toBe(false); // Invalid network
  });
});

describe('isTRONChain', () => {
  it('should return true for TRON network', () => {
    expect(isTRONChain(BlockchainNetworkType.Tron)).toBe(true);
  });

  it('should return false for non-TRON networks', () => {
    expect(isTRONChain(BlockchainNetworkType.Solana)).toBe(false);
    expect(isTRONChain('UnknownNetwork')).toBe(false); // Invalid network
  });
});

describe('computeWalletType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return AELF wallet type for Aelf networks', () => {
    expect(computeWalletType('AELF')).toBe(WalletTypeEnum.AELF);
  });

  it('should return EVM wallet type for EVM-compatible networks', () => {
    expect(computeWalletType('ETH')).toBe(WalletTypeEnum.EVM);
  });

  it('should return Solana wallet type for Solana networks', () => {
    expect(computeWalletType('Solana')).toBe(WalletTypeEnum.SOL);
  });

  it('should return TON wallet type for TON networks', () => {
    expect(computeWalletType('TON')).toBe(WalletTypeEnum.TON);
  });

  it('should return TRON wallet type for Tron networks', () => {
    expect(computeWalletType('TRX')).toBe(WalletTypeEnum.TRON);
  });

  it('should return an empty string for unsupported networks', () => {
    expect(computeWalletType('UnknownNetwork')).toBe('');
  });
});

describe('getWalletSourceType', () => {
  it('should return correct wallet source type for EVM, Solana, TON, and TRON', () => {
    expect(getWalletSourceType(WalletTypeEnum.EVM)).toBe(WalletSourceType.EVM);
    expect(getWalletSourceType(WalletTypeEnum.SOL)).toBe(WalletSourceType.Solana);
    expect(getWalletSourceType(WalletTypeEnum.TON)).toBe(WalletSourceType.Ton);
    expect(getWalletSourceType(WalletTypeEnum.TRON)).toBe(WalletSourceType.TRX);
  });

  it('should return Portkey as default wallet source type', () => {
    expect(getWalletSourceType('UnknownType' as WalletTypeEnum)).toBe(WalletSourceType.Portkey);
  });
});

describe('computeWalletSourceType', () => {
  it('should compute wallet source type from network', () => {
    expect(computeWalletSourceType('ETH')).toBe(WalletSourceType.EVM);
  });

  it('should return empty string if network is falsy', () => {
    expect(computeWalletSourceType('')).toBe('');
    expect(computeWalletSourceType(null as unknown as string)).toBe('');
  });
});

describe('getConnectWalletText', () => {
  it('should return formatted "Connect {walletTypeText} Wallet" text', () => {
    expect(getConnectWalletText('ETH')).toBe('Connect EVM Wallet');
  });

  it('should return default CONNECT_WALLET text for unsupported networks', () => {
    expect(getConnectWalletText('UnknownNetwork')).toBe(CONNECT_WALLET);
  });

  it('should handle undefined network input', () => {
    expect(getConnectWalletText(undefined)).toBe(CONNECT_WALLET);
  });
});
