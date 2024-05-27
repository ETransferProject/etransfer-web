import { GetCAHolderByManagerParams } from '@portkey/services';
import { ChainId, MethodsWallet } from '@portkey/provider-types';
import { WalletType, PortkeyDid, WalletInfo } from 'aelf-web-login';
import { SupportedChainId } from 'constants/index';
import { pubKeyToAddress } from './aelfBase';

export const getManagerAddressByWallet = async (
  wallet: WalletInfo,
  walletType: WalletType,
  pubkey?: string,
): Promise<string> => {
  let managerAddress;
  if (walletType === WalletType.discover) {
    managerAddress = await wallet.discoverInfo?.provider?.request({
      method: MethodsWallet.GET_WALLET_CURRENT_MANAGER_ADDRESS,
    });
  } else {
    managerAddress = wallet.portkeyInfo?.walletInfo.address;
  }

  if (!managerAddress && pubkey) {
    managerAddress = pubKeyToAddress(pubkey);
  }

  return managerAddress || '';
};

export const getCaHashAndOriginChainIdByWallet = async (
  wallet: WalletInfo,
  walletType: WalletType,
): Promise<{ caHash: string; originChainId: ChainId }> => {
  let caHash, originChainId;
  if (walletType === WalletType.discover) {
    const res = await PortkeyDid.did.services.getHolderInfoByManager({
      caAddresses: [wallet.address],
    } as unknown as GetCAHolderByManagerParams);
    const caInfo = res[0];
    caHash = caInfo?.caHash;
    originChainId = caInfo?.chainId as ChainId;
  } else {
    caHash = wallet.portkeyInfo?.caInfo?.caHash;
    originChainId = wallet.portkeyInfo?.chainId;
  }
  return {
    caHash: caHash || '',
    originChainId: originChainId || SupportedChainId.sideChain,
  };
};
