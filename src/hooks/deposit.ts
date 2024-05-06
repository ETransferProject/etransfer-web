import { CHAIN_LIST } from 'constants/index';
import { useMemo } from 'react';
import { useTokenState, useUserActionState } from 'store/Provider/hooks';
import { BusinessType } from 'types/api';

export function useDeposit() {
  const tokenState = useTokenState();
  const { deposit } = useUserActionState();

  return useMemo(
    () => ({
      tokenList: tokenState[BusinessType.Deposit]?.tokenList || [],
      currentSymbol: tokenState[BusinessType.Deposit]?.currentSymbol || '',
      currentChainItem: deposit.currentChainItem || CHAIN_LIST[0],
    }),
    [deposit.currentChainItem, tokenState],
  );
}
