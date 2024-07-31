import { useCallback } from 'react';
import { useDepositState } from 'store/Provider/hooks';
import { NetworkStatus } from 'types/api';
import {
  ADDRESS_MAP,
  CHAIN_NAME_ENUM,
  EXPLORE_CONFIG,
  SUPPORT_DEPOSIT_ISOMORPHIC_CHAIN_GUIDE,
  SupportedChainId,
  SupportedELFChainId,
  TokenType,
} from 'constants/index';
import { ContractType } from 'constants/chain';

export function useDepositNetworkList() {
  const { fromNetworkList, toChainItem } = useDepositState();

  return useCallback(
    (fromTokenSelectedSymbol: string, toTokenSelectedSymbol: string) => {
      const list = JSON.parse(JSON.stringify(fromNetworkList));

      if (
        SUPPORT_DEPOSIT_ISOMORPHIC_CHAIN_GUIDE.includes(fromTokenSelectedSymbol as TokenType) &&
        fromTokenSelectedSymbol === toTokenSelectedSymbol
      ) {
        const chainId =
          toChainItem.key === SupportedELFChainId.AELF
            ? SupportedChainId.sideChain
            : SupportedChainId.mainChain;

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

      return list;
    },
    [fromNetworkList, toChainItem.key],
  );
}
