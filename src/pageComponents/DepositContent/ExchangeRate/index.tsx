import { TimeIcon } from 'assets/images';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { defaultNullValue } from 'constants/index';
import { getDepositCalculate } from 'utils/api/deposit';
import { handleErrorMessage, singleMessage } from '@portkey/did-ui-react';
import { ChainId } from '@portkey/provider-types';
import { useEffectOnce } from 'react-use';
import { formatSymbolDisplay } from 'utils/format';
import { MAX_UPDATE_TIME } from 'constants/calculate';

type TExchangeRate = {
  fromSymbol: string;
  toSymbol: string;
  toChainId: ChainId;
  slippage?: string;
};

const EXCHANGE_FROM_AMOUNT = '1';

export default function ExchangeRate({ fromSymbol, toSymbol, toChainId, slippage }: TExchangeRate) {
  // const { fromTokenSymbol, toChainItem, toTokenSymbol } = useDepositState();
  const [exchange, setExchange] = useState(defaultNullValue);
  const [updateTime, setUpdateTime] = useState(MAX_UPDATE_TIME);
  const updateTimeRef = useRef(MAX_UPDATE_TIME);
  const updateTimerRef = useRef<NodeJS.Timer | number>();

  const slippageFormat = useMemo(() => {
    if (!slippage) return '';
    return Number(slippage) * 100;
  }, [slippage]);

  const getCalculate = useCallback(async () => {
    try {
      const { conversionRate } = await getDepositCalculate({
        toChainId,
        fromSymbol,
        toSymbol,
        fromAmount: EXCHANGE_FROM_AMOUNT,
      });
      setExchange(conversionRate?.toAmount || defaultNullValue);
    } catch (error) {
      singleMessage.error(handleErrorMessage(error));
    }
  }, [fromSymbol, toChainId, toSymbol]);

  const handleSetTimer = useCallback(async () => {
    updateTimerRef.current = setInterval(() => {
      --updateTimeRef.current;

      if (updateTimeRef.current === 0) {
        getCalculate();
        updateTimeRef.current = MAX_UPDATE_TIME;
      }

      setUpdateTime(updateTimeRef.current);
    }, 1000);
  }, [getCalculate]);

  const stopInterval = useCallback(() => {
    clearInterval(updateTimerRef.current);
    updateTimerRef.current = undefined;
    setExchange(defaultNullValue);
  }, []);

  const resetTimer = useCallback(() => {
    clearInterval(updateTimerRef.current);
    updateTimerRef.current = undefined;
    updateTimeRef.current = MAX_UPDATE_TIME;
    setUpdateTime(MAX_UPDATE_TIME);
    handleSetTimer();
  }, [handleSetTimer]);

  useEffectOnce(() => {
    getCalculate();
  });

  useEffect(() => {
    resetTimer();
    return () => {
      stopInterval();
    };
  }, [getCalculate, resetTimer, stopInterval]);

  return (
    <div className={clsx('flex-row-between', 'exchange-rate')}>
      <div className="flex-row-center">
        <span className={styles['value']}>{`1 ${fromSymbol} ≈ ${exchange} ${formatSymbolDisplay(
          toSymbol,
        )}`}</span>
        <TimeIcon />
        <span className={styles['count-time']}>{`${updateTime}s`}</span>
      </div>
      {slippage && <div>{`Slippage: ${slippageFormat}%`}</div>}
    </div>
  );
}
