import CommonImage from 'components/CommonImage';
import styles from './styles.module.scss';
import clsx from 'clsx';

export default function TokenAmount({
  icon,
  amount,
  amountUsd,
  symbol,
}: {
  icon: string;
  amount: string;
  amountUsd: string;
  symbol: string;
}) {
  return (
    <div className={clsx('flex-row-center', styles['token-amount'])}>
      <div className="flex-row-center">
        <CommonImage src={icon} alt={`token-${symbol}`} />
        <span className={styles['token-amount-value']}>{amount}</span>
        <span className={styles['token-amount-symbol']}>{` ${symbol}`}</span>
      </div>
      <div className={styles['token-amount-usd']}>{`$${amountUsd}`}</div>
    </div>
  );
}
