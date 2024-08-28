import { SingleMessage } from '@etransfer/ui-react';
import { CHECK_TXN_DURATION, NO_TXN_FOUND } from 'constants/deposit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDepositState, useRecordsState } from 'store/Provider/hooks';
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
  const { depositProcessingCount, withdrawProcessingCount } = useRecordsState();

  const timerRef = useRef<NodeJS.Timer | number>();

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = undefined;
    setIsCheckTxnLoading(false);
  }, []);

  const resetTimer = useCallback(() => {
    timerRef.current = setTimeout(() => {
      stopTimer();
      if (!depositProcessingCount && !withdrawProcessingCount) {
        SingleMessage.info(NO_TXN_FOUND);
      }
    }, CHECK_TXN_DURATION);
  }, [depositProcessingCount, stopTimer, withdrawProcessingCount]);

  const handleCheckTxnClick = useCallback(() => {
    setIsCheckTxnLoading(true);
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    return () => {
      stopTimer;
    };
  });

  return { isCheckTxnLoading, resetTimer, stopTimer, handleCheckTxnClick };
}
