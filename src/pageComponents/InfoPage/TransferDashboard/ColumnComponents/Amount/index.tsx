import clsx from 'clsx';
import styles from './styles.module.scss';

interface AmountProps {
  amount: string;
  amountUsd: string;
}

export default function Amount({ amount, amountUsd }: AmountProps) {
  return (
    <div className={clsx('flex-row-start', styles['amount-container'])}>
      <span className={styles['amount']}>{amount}</span>
      <span className={styles['amount-usd']}>{amountUsd}</span>
    </div>
  );
}
