import {
  SUPPORT_DEPOSIT_ISOMORPHIC_CHAIN_GUIDE,
  TokenType,
  SupportedELFChainId,
  SupportedChainId,
  CHAIN_NAME_ENUM,
  ADDRESS_MAP,
  EXPLORE_CONFIG,
} from 'constants/index';
import { ContractType } from 'constants/chain';
import { NetworkStatus, TNetworkItem } from 'types/api';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';

export const addAelfNetwork = (
  fromNetworkList: TNetworkItem[],
  fromTokenSelectedSymbol: string,
  toTokenSelectedSymbol: string,
  toChainId: TChainId,
): TNetworkItem[] => {
  const list = JSON.parse(JSON.stringify(fromNetworkList));

  if (
    SUPPORT_DEPOSIT_ISOMORPHIC_CHAIN_GUIDE.includes(fromTokenSelectedSymbol as TokenType) &&
    fromTokenSelectedSymbol === toTokenSelectedSymbol
  ) {
    const chainId =
      toChainId === SupportedELFChainId.AELF
        ? SupportedChainId.sideChain
        : SupportedChainId.mainChain;

    const isExitNetwork = fromNetworkList.find((item) => item.network === chainId);

    if (!isExitNetwork?.network) {
      list?.push({
        network: chainId,
        name:
          chainId === SupportedELFChainId.AELF
            ? CHAIN_NAME_ENUM.MainChain
            : CHAIN_NAME_ENUM.SideChain,
        multiConfirm: '480 confirmations',
        multiConfirmTime: '4 mins',
        contractAddress: ADDRESS_MAP[chainId][ContractType.ETRANSFER],
        explorerUrl: EXPLORE_CONFIG[chainId],
        status: NetworkStatus.Health,
        withdrawFee: '',
        withdrawFeeUnit: '',
      });
    }
  }

  return list;
};
