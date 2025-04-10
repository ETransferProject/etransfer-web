import { GetCAHolderByManagerParams } from '@portkey/services';
import {
  TChainId,
  WalletTypeEnum as AelfWalletTypeEnum,
} from '@aelf-web-login/wallet-adapter-base';
import { did } from '@portkey/did';
import { SupportedChainId } from 'constants/index';
import { pubKeyToAddress, recoverPubKey } from '../aelf/aelfBase';
import { ExtraInfoForDiscoverAndWeb, WalletInfo } from 'types/wallet';
import { WalletTypeEnum } from 'context/Wallet/types';
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
import { BlockchainNetworkType } from 'constants/network';
import { WalletSourceType } from 'types/api';
import { CONNECT_WALLET, WALLET_TYPE_TEXT } from 'constants/wallet';

export const getManagerAddressByWallet = async (
  walletInfo: WalletInfo,
  walletType: AelfWalletTypeEnum,
  pubkey?: string,
): Promise<string> => {
  if (walletType === AelfWalletTypeEnum.unknown) return '';

  let managerAddress;
  if (walletType === AelfWalletTypeEnum.discover) {
    const discoverInfo = walletInfo?.extraInfo as ExtraInfoForDiscoverAndWeb;
    managerAddress = await discoverInfo?.provider?.request({
      method: 'wallet_getCurrentManagerAddress',
    });
  } else if (walletType === AelfWalletTypeEnum.web) {
    const _sdkWalletInfoString = localStorage.getItem('PortkeyWebWalletWalletInfo');
    if (_sdkWalletInfoString) {
      const _sdkWalletInfo = JSON.parse(_sdkWalletInfoString);
      managerAddress = _sdkWalletInfo.managerAddress;
    }
  } else {
    // AelfWalletTypeEnum.elf
    managerAddress = walletInfo.address;
  }

  if (!managerAddress && pubkey) {
    managerAddress = pubKeyToAddress(pubkey);
  }

  return managerAddress || '';
};

export const getCaHashAndOriginChainIdByWallet = async (
  walletInfo: WalletInfo,
  walletType: AelfWalletTypeEnum,
): Promise<{ caHash: string; originChainId: TChainId }> => {
  if (walletType === AelfWalletTypeEnum.unknown)
    return {
      caHash: '',
      originChainId: SupportedChainId.sideChain,
    };

  let caHash, originChainId;
  // TODO new eoa
  if (walletType === AelfWalletTypeEnum.discover) {
    const res = await did.services.getHolderInfoByManager({
      caAddresses: [walletInfo?.address],
    } as unknown as GetCAHolderByManagerParams);
    const caInfo = res[0];
    caHash = caInfo?.caHash;
    originChainId = caInfo?.chainId as TChainId;
  } else if (walletType === AelfWalletTypeEnum.web) {
    const _sdkWalletInfoString = localStorage.getItem('PortkeyWebWalletWalletInfo');
    if (_sdkWalletInfoString) {
      const _sdkWalletInfo = JSON.parse(_sdkWalletInfoString);
      caHash = _sdkWalletInfo.caHash;
      originChainId = _sdkWalletInfo.originChainId;
    }
  }

  return {
    caHash: caHash || '',
    originChainId: originChainId || SupportedChainId.sideChain,
  };
};

export const getManagerAddressAndPubkeyByWallet = async (
  walletInfo: WalletInfo,
  walletType: AelfWalletTypeEnum,
  plainText: string,
  signature: string,
): Promise<{ managerAddress: string; pubkey: string }> => {
  let managerAddress, pubkey;

  if (walletType === AelfWalletTypeEnum.web) {
    // TODO info error
    const _sdkWalletInfoString = localStorage.getItem('PortkeyWebWalletWalletInfo');
    if (_sdkWalletInfoString) {
      const _sdkWalletInfo = JSON.parse(_sdkWalletInfoString);
      managerAddress = _sdkWalletInfo.managerAddress;
      pubkey = _sdkWalletInfo.managerPubkey;
    }
  } else {
    pubkey = recoverPubKey(plainText, signature) + '';
    managerAddress = await getManagerAddressByWallet(walletInfo, walletType, pubkey);
  }

  return {
    managerAddress,
    pubkey,
  };
};

export const getWalletLogo = (walletType: WalletTypeEnum, connector?: any) => {
  switch (walletType) {
    case WalletTypeEnum.AELF:
      // TODO FairyVaultDiscover icon
      if (connector === AelfWalletTypeEnum.elf) {
        return NightElf_16;
      } else {
        return PortkeyV2_16;
      }

    case WalletTypeEnum.EVM:
      if (connector?.id === COINBASE_WALLET_ID) {
        return Coinbase_16;
      } else if (connector?.id === WALLET_CONNECT_ID) {
        return WalletConnect_16;
      } else {
        return Metamask_16;
      }

    case WalletTypeEnum.SOL:
      return Phantom_16;

    case WalletTypeEnum.TON:
      return Tonkeeper_16;

    case WalletTypeEnum.TRON:
      return TronLink_16;
  }
};

export const isAelfChain = (network: string) => {
  if (
    network === BlockchainNetworkType.tDVV ||
    network === BlockchainNetworkType.tDVW ||
    network === BlockchainNetworkType.AELF
  ) {
    return true;
  }
  return false;
};

export const isEVMChain = (network: string) => {
  if (
    network === BlockchainNetworkType.Arbitrum ||
    network === BlockchainNetworkType.Avax ||
    network === BlockchainNetworkType.BASE ||
    network === BlockchainNetworkType.Binance ||
    network === BlockchainNetworkType.Ethereum ||
    network === BlockchainNetworkType.Optimism ||
    network === BlockchainNetworkType.Polygon ||
    network === BlockchainNetworkType.SETH ||
    network === BlockchainNetworkType.TBinance
  ) {
    return true;
  }
  return false;
};

export const isSolanaChain = (network: string) => {
  if (network === BlockchainNetworkType.Solana) {
    return true;
  }
  return false;
};

export const isTONChain = (network: string) => {
  if (network === BlockchainNetworkType.TON) {
    return true;
  }
  return false;
};

export const isTRONChain = (network: string) => {
  if (network === BlockchainNetworkType.Tron) {
    return true;
  }
  return false;
};

export const computeWalletType = (network: string) => {
  if (isAelfChain(network)) return WalletTypeEnum.AELF;
  if (isEVMChain(network)) return WalletTypeEnum.EVM;
  if (isSolanaChain(network)) return WalletTypeEnum.SOL;
  if (isTONChain(network)) return WalletTypeEnum.TON;
  if (isTRONChain(network)) return WalletTypeEnum.TRON;
  return '';
};

export function getWalletSourceType(walletType: WalletTypeEnum) {
  switch (walletType) {
    case WalletTypeEnum.EVM:
      return WalletSourceType.EVM;
    case WalletTypeEnum.SOL:
      return WalletSourceType.Solana;
    case WalletTypeEnum.TON:
      return WalletSourceType.Ton;
    case WalletTypeEnum.TRON:
      return WalletSourceType.TRX;

    default:
      return WalletSourceType.Portkey;
  }
}

export function computeWalletSourceType(network: string) {
  if (network) {
    const walletType = computeWalletType(network);
    if (walletType) {
      return getWalletSourceType(walletType);
    }
  }
  return '';
}

export const getConnectWalletText = (network?: string) => {
  const walletType = computeWalletType(network || '');
  const walletTypeText = WALLET_TYPE_TEXT[walletType as WalletTypeEnum];
  if (walletTypeText) {
    return `Connect ${walletTypeText} Wallet`;
  }
  return CONNECT_WALLET;
};
