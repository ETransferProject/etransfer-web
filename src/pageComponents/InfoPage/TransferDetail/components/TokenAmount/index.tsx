import styles from './styles.module.scss';
import clsx from 'clsx';
import useGetTokenIcon from 'hooks/infoDashboard';
import DisplayImage from 'components/DisplayImage';
import { ZERO, formatSymbolDisplay } from 'utils/format';
import { useMemo } from 'react';

export default function TokenAmount({
  icon,
  amount,
  amountUsd,
  symbol,
}: {
  icon?: string;
  amount: string;
  amountUsd: string;
  symbol: string;
}) {
  const getTokenIcon = useGetTokenIcon();
  const iconBackup = getTokenIcon(symbol)?.icon || '';
  const formatSymbol = useMemo(() => formatSymbolDisplay(symbol), [symbol]);

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
    <div className={clsx('flex-row-center', styles['token-amount'])}>
      <div className="flex-row-center">
        <DisplayImage
          name={symbol}
          className={styles['token-icon']}
          src={icon || iconBackup}
          alt={`token-${symbol}`}
          isCircle={true}
          width={16}
          height={16}
        />
        <span className={styles['token-amount-value']}>{formatAmount}</span>
        <span className={styles['token-amount-symbol']}>{` ${formatSymbol}`}</span>
      </div>
      <div className={styles['token-amount-usd']}>{formatUsd}</div>
    </div>
  );
}
