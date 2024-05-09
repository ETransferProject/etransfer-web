import { TimeIcon } from 'assets/images';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';

type TExchangeRate = {
  payUnit: string;
  receiveUnit: string;
  slippage: string;
};

const MAX_UPDATE_TIME = 15;

export default function ExchangeRate({ payUnit, receiveUnit, slippage }: TExchangeRate) {
  const [exchange, setExchange] = useState('');
  const [updateTime, setUpdateTime] = useState(MAX_UPDATE_TIME);
  const updateTimeRef = useRef(MAX_UPDATE_TIME);
  const updateTimerRef = useRef<NodeJS.Timer | number>();

  const handleSetTimer = useCallback(() => {
    updateTimerRef.current = setInterval(() => {
      --updateTimeRef.current;

      if (updateTimeRef.current === 0) {
        // TODO api
        updateTimeRef.current = MAX_UPDATE_TIME;
      }

      setUpdateTime(updateTimeRef.current);
    }, 1000);
  }, []);

  const stopInterval = useCallback(() => {
    clearInterval(updateTimerRef.current);
    updateTimerRef.current = undefined;
    setExchange('');
  }, []);

  const resetTimer = useCallback(() => {
    clearInterval(updateTimerRef.current);
    updateTimerRef.current = undefined;
    updateTimeRef.current = MAX_UPDATE_TIME;
    setUpdateTime(MAX_UPDATE_TIME);
    handleSetTimer();
  }, [handleSetTimer]);

  useEffect(() => {
    resetTimer();
    return () => {
      stopInterval();
    };
  }, [resetTimer, stopInterval]);

  return (
    <div className={clsx('flex-row-between', 'exchange-rate')}>
      <div className="flex-row-center">
        <span className={styles['value']}>{`1 ${payUnit} ≈ ${exchange} ${receiveUnit}`}</span>
        <TimeIcon />
        <span className={styles['count-time']}>{`${updateTime}s`}</span>
      </div>
      <div>{`Slippage: ${slippage}`}</div>
    </div>
  );
}
