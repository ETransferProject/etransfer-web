import { GetCAHolderByManagerParams } from '@portkey/services';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import { PortkeyDid } from '@aelf-web-login/wallet-adapter-bridge';
import { SupportedChainId } from 'constants/index';
import { pubKeyToAddress } from '../aelf/aelfBase';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { ExtraInfoForDiscover, ExtraInfoForPortkeyAA, WalletInfo } from 'types/wallet';

export const getManagerAddressByWallet = async (
  walletInfo: WalletInfo,
  walletType: WalletTypeEnum,
  pubkey?: string,
): Promise<string> => {
  if (walletType === WalletTypeEnum.unknown) return '';

  let managerAddress;
  if (walletType === WalletTypeEnum.discover) {
    const discoverInfo = walletInfo?.extraInfo as ExtraInfoForDiscover;
    managerAddress = await discoverInfo?.provider?.request({
      method: 'wallet_getCurrentManagerAddress',
    });
  } else if (walletType === WalletTypeEnum.aa) {
    const portkeyAAInfo = walletInfo?.extraInfo as ExtraInfoForPortkeyAA;
    managerAddress = portkeyAAInfo.portkeyInfo.walletInfo.address;
  } else {
    // WalletTypeEnum.elf
    managerAddress = walletInfo.address;
  }

  if (!managerAddress && pubkey) {
    managerAddress = pubKeyToAddress(pubkey);
  }

  return managerAddress || '';
};

export const getCaHashAndOriginChainIdByWallet = async (
  walletInfo: WalletInfo,
  walletType: WalletTypeEnum,
): Promise<{ caHash: string; originChainId: TChainId }> => {
  if (walletType === WalletTypeEnum.unknown)
    return {
      caHash: '',
      originChainId: SupportedChainId.sideChain,
    };

  let caHash, originChainId;
  if (walletType === WalletTypeEnum.discover) {
    const res = await PortkeyDid.did.services.getHolderInfoByManager({
      caAddresses: [walletInfo?.address],
    } as unknown as GetCAHolderByManagerParams);
    const caInfo = res[0];
    caHash = caInfo?.caHash;
    originChainId = caInfo?.chainId as TChainId;
  } else if (walletType === WalletTypeEnum.aa) {
    const portkeyAAInfo = walletInfo?.extraInfo as ExtraInfoForPortkeyAA;
    caHash = portkeyAAInfo.portkeyInfo.caInfo.caHash;
    originChainId = portkeyAAInfo.portkeyInfo.chainId;
  }

  return {
    caHash: caHash || '',
    originChainId: originChainId || SupportedChainId.sideChain,
  };
};
