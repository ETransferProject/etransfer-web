import { ZERO } from 'constants/calculate';
import { getAelfMaxBalance } from 'pageComponents/CrossChainTransferPage/utils';
import { useCallback, useState } from 'react';
import { isAelfChain } from 'utils/wallet';

export function useCheckMaxBalance() {
  const [isBalanceNotEnoughTip, setIsBalanceNotEnoughTip] = useState(false);

  const checkMaxBalance = useCallback(
    async ({
      tokenSymbol,
      amount,
      fromBalance,
      fromNetwork,
      aelfTransactionFee,
      fromAccount,
    }: {
      tokenSymbol: string;
      amount?: string;
      fromBalance?: string;
      fromNetwork?: string;
      aelfTransactionFee?: string;
      fromAccount?: string | null;
    }) => {
      let _maxBalance = fromBalance;
      if (isAelfChain(fromNetwork || '') && tokenSymbol === 'ELF') {
        _maxBalance = await getAelfMaxBalance({
          balance: fromBalance || '',
          aelfFee: aelfTransactionFee,
          fromNetwork,
          tokenSymbol,
          account: fromAccount || '',
        });
      }
      const res = !!amount && (!_maxBalance || ZERO.plus(_maxBalance).lt(amount));
      setIsBalanceNotEnoughTip(res);
    },
    [],
  );

  return { isBalanceNotEnoughTip, checkMaxBalance };
}
