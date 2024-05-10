import { TokenType } from 'constants/index';
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
      fromTokenSymbol: fromTokenSymbol || TokenType.USDT,
      fromTokenList: fromTokenList || [],
      fromNetwork: fromNetwork,
      fromNetworkList: fromNetworkList || [],
      // to
      toTokenSymbol: toTokenSymbol || TokenType.USDT,
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
