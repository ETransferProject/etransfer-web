import styles from './styles.module.scss';
import clsx from 'clsx';
import useGetTokenIcon from 'hooks/infoDashboard';
import DisplayImage from 'components/DisplayImage';
import { formatSymbolDisplay } from 'utils/format';
import { ZERO } from 'constants/calculate';
import { useMemo } from 'react';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import { TOrderStatus } from 'types/records';
import { TransferStatusType } from 'constants/infoDashboard';

export default function TokenAmount({
  status,
  symbol,
  fromSymbol,
  icon,
  amount,
  amountUsd,
}: {
  status: TransferStatusType | TOrderStatus;
  symbol: string;
  fromSymbol?: string;
  icon?: string;
  amount?: string;
  amountUsd?: string;
}) {
  const getTokenIcon = useGetTokenIcon();
  const iconBackup = getTokenIcon(symbol)?.icon || '';
  const formatSymbol = useMemo(() => formatSymbolDisplay(symbol), [symbol]);

  const formatAmount = useMemo(() => {
    if (!amount) return '';
    if (amount === '0') return '0';
    if (ZERO.plus(amount).isLessThan(ZERO.plus('0.0001'))) {
      return '<0.0001';
    }
    return amount;
  }, [amount]);

  const formatUsd = useMemo(() => {
    if (!amountUsd) return '';
    if (amountUsd === '0') return '$0';
    if (ZERO.plus(amountUsd).isLessThan(ZERO.plus('0.01'))) {
      return '<$0.01';
    }
    return `$${amountUsd}`;
  }, [amountUsd]);

  const renderFinished = useMemo(() => {
    if (formatAmount && formatSymbol) {
      return (
        <>
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
          {formatUsd && <div className={styles['token-amount-usd']}>{formatUsd}</div>}
        </>
      );
    }
    return DEFAULT_NULL_VALUE;
  }, [formatAmount, formatSymbol, formatUsd, icon, iconBackup, symbol]);

  const renderProcessing = useMemo(() => {
    if (fromSymbol && fromSymbol !== symbol) {
      return <span className={styles['second']}>Swapping</span>;
    } else {
      return renderFinished;
    }
  }, [fromSymbol, renderFinished, symbol]);

  return (
    <div className={clsx('flex-row-center', styles['token-amount'])}>
      {(!status || status === TOrderStatus.Processing || status === TransferStatusType.Pending) &&
        renderProcessing}
      {(status === TOrderStatus.Failed || status === TransferStatusType.Failed) &&
        DEFAULT_NULL_VALUE}
      {(status === TOrderStatus.Succeed || status === TransferStatusType.Success) && renderFinished}
    </div>
  );
}
