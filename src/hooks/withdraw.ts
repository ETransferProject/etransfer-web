import { useMemo } from 'react';
import { useTokenState } from 'store/Provider/hooks';
import { BusinessType } from 'types/api';
import { InitWithdrawTokenState } from 'store/reducers/token/slice';

export function useWithdraw() {
  const tokenState = useTokenState();

  return useMemo(
    () => ({
      tokenList: tokenState[BusinessType.Withdraw]?.tokenList || InitWithdrawTokenState.tokenList,
      currentSymbol:
        tokenState[BusinessType.Withdraw]?.currentSymbol || InitWithdrawTokenState.currentSymbol,
    }),
    [tokenState],
  );
}
