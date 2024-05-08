import { TimeIcon } from 'assets/images';
import { useState } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';

type TExchangeRate = {
  payUnit: string;
  receiveUnit: string;
  slippage: string;
};
export default function ExchangeRate({ payUnit, receiveUnit, slippage }: TExchangeRate) {
  const [receiveAmount, setReceiveAmount] = useState();
  const [countdown, setCountdown] = useState(0);
  return (
    <div className={clsx('flex-row-between', 'exchange-rate')}>
      <div className="flex-row-center">
        <span className={styles['value']}>{`1 ${payUnit} ≈ ${receiveAmount} ${receiveUnit}`}</span>
        <TimeIcon />
        <span className={styles['count-time']}>{`${countdown}s`}</span>
      </div>
      <div>{`Slippage: ${slippage}`}</div>
    </div>
  );
}
