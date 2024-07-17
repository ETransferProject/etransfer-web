import styles from './styles.module.scss';
import clsx from 'clsx';
import useGetTokenIcon from 'hooks/infoDashboard';
import DisplayImage from 'components/DisplayImage';
import { formatSymbolDisplay } from 'utils/format';
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
        <span className={styles['token-amount-value']}>{amount}</span>
        <span className={styles['token-amount-symbol']}>{` ${formatSymbol}`}</span>
      </div>
      <div className={styles['token-amount-usd']}>{`$${amountUsd}`}</div>
    </div>
  );
}
