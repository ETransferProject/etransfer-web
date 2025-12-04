import clsx from 'clsx';
import styles from './styles.module.scss';
import { ZERO } from 'constants/calculate';
import { useMemo } from 'react';

interface AmountProps {
  amount: string;
  amountUsd: string;
}

export default function Amount({ amount, amountUsd }: AmountProps) {
  const formatAmount = useMemo(() => {
    if (ZERO.plus(amount).isLessThan(ZERO.plus('0.0001'))) {
      return '<0.0001';
    }
    return amount;
  }, [amount]);

  const formatUsd = useMemo(() => {
    if (ZERO.plus(amountUsd).isLessThan(ZERO.plus('0.01'))) {
      return '<$0.01';
    }
    return `$${amountUsd}`;
  }, [amountUsd]);

  return (
    <div className={clsx('flex-column', styles['amount-container'])}>
      <span className={styles['amount']}>{formatAmount}</span>
      <span className={styles['amount-usd']}>{formatUsd}</span>
    </div>
  );
}
