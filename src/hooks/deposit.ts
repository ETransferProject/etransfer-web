import { useCallback } from 'react';
import { useDepositState } from 'store/Provider/hooks';
import { addAelfNetwork } from 'utils/deposit';

export function useDepositNetworkList() {
  const { fromNetworkList, toChainItem } = useDepositState();

  return useCallback(
    (fromTokenSelectedSymbol: string, toTokenSelectedSymbol: string) => {
      if (!fromNetworkList || fromNetworkList.length === 0) return [];
      return addAelfNetwork(
        fromNetworkList,
        fromTokenSelectedSymbol,
        toTokenSelectedSymbol,
        toChainItem.key,
      );
    },
    [fromNetworkList, toChainItem],
  );
}
