import { useMemo } from 'react';
import { useTokenState, useUserActionState } from 'store/Provider/hooks';
import { BusinessType } from 'types/api';
import { InitWithdrawTokenState } from 'store/reducers/token/slice';
import { CHAIN_LIST } from 'constants/index';

export function useWithdraw() {
  const tokenState = useTokenState();
  const { withdraw } = useUserActionState();

  return useMemo(
    () => ({
      tokenList: tokenState[BusinessType.Withdraw]?.tokenList || InitWithdrawTokenState.tokenList,
      currentSymbol:
        tokenState[BusinessType.Withdraw]?.currentSymbol || InitWithdrawTokenState.currentSymbol,
      currentChainItem: withdraw.currentChainItem || CHAIN_LIST[0],
    }),
    [tokenState, withdraw.currentChainItem],
  );
}
