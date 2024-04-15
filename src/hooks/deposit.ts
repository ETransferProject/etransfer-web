import { useMemo } from 'react';
import { useTokenState } from 'store/Provider/hooks';
import { BusinessType } from 'types/api';

export function useDeposit() {
  const tokenState = useTokenState();

  return useMemo(
    () => ({
      tokenList: tokenState[BusinessType.Deposit]?.tokenList || [],
      currentSymbol: tokenState[BusinessType.Deposit]?.currentSymbol || '',
    }),
    [tokenState],
  );
}
