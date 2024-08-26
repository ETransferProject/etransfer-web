import { CHECK_TXN_DURATION } from 'constants/deposit';
import { useCallback, useRef, useState } from 'react';
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

export function useCheckTxn() {
  const [isCheckTxnLoading, setIsCheckTxnLoading] = useState(false);

  const timerRef = useRef<NodeJS.Timer | number>();

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = undefined;
    setIsCheckTxnLoading(false);
  }, []);

  const resetTimer = useCallback(() => {
    timerRef.current = setTimeout(() => {
      stopTimer();
    }, CHECK_TXN_DURATION);
  }, [stopTimer]);

  const handleCheckTxnClick = useCallback(() => {
    setIsCheckTxnLoading(true);
    resetTimer();
  }, [resetTimer]);

  return { isCheckTxnLoading, resetTimer, stopTimer, handleCheckTxnClick };
}
