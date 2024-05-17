import { useMemo } from 'react';
import { useTokenState, useWithdrawState } from 'store/Provider/hooks';
import { BusinessType } from 'types/api';
import { InitWithdrawTokenState } from 'store/reducers/token/slice';
import { CHAIN_LIST } from 'constants/index';

export function useWithdraw() {
  const tokenState = useTokenState();
  const { currentChainItem } = useWithdrawState();

  return useMemo(
    () => ({
      tokenList: tokenState[BusinessType.Withdraw]?.tokenList || InitWithdrawTokenState.tokenList,
      currentSymbol:
        tokenState[BusinessType.Withdraw]?.currentSymbol || InitWithdrawTokenState.currentSymbol,
      currentChainItem: currentChainItem || CHAIN_LIST[0],
    }),
    [tokenState, currentChainItem],
  );
}
