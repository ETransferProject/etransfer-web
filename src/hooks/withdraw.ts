import { useMemo } from 'react';
import { useWithdrawState } from 'store/Provider/hooks';
import { InitialWithdrawState } from 'store/reducers/withdraw/slice';
import { CHAIN_LIST } from 'constants/index';

export function useWithdraw() {
  const { currentChainItem, tokenList, currentSymbol } = useWithdrawState();

  return useMemo(
    () => ({
      tokenList: tokenList || InitialWithdrawState.tokenList,
      currentSymbol: currentSymbol || InitialWithdrawState.currentSymbol,
      currentChainItem: currentChainItem || CHAIN_LIST[0],
    }),
    [tokenList, currentSymbol, currentChainItem],
  );
}
