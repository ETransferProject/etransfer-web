import { useMemo } from 'react';
import { useDepositState } from 'store/Provider/hooks';

export function useDeposit() {
  const {
    fromTokenSymbol,
    toTokenSymbol,
    fromTokenList,
    fromNetwork,
    fromNetworkList,
    toTokenList,
    toChainItem,
    toChainList,
  } = useDepositState();

  return useMemo(
    () => ({
      // from
      fromTokenSymbol: fromTokenSymbol || 'USDT',
      fromTokenList: fromTokenList || [],
      fromNetwork: fromNetwork,
      fromNetworkList: fromNetworkList || [],
      // to
      toTokenSymbol: toTokenSymbol || 'USDT',
      toTokenList: toTokenList || [],
      toChainItem: toChainItem,
      toChainList: toChainList || [],
    }),
    [
      fromNetwork,
      fromNetworkList,
      fromTokenList,
      fromTokenSymbol,
      toChainItem,
      toChainList,
      toTokenList,
      toTokenSymbol,
    ],
  );
}
