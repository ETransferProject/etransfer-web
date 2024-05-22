import styles from './styles.module.scss';
import clsx from 'clsx';
import { LargeNumberDisplay } from 'utils/calculate';
import { useCommonState } from 'store/Provider/hooks';
import { TRecordsStatus } from 'types/records';
import { defaultNullValue } from 'constants/index';
import { formatSymbolDisplay } from 'utils/format';
import { useFindToken } from 'hooks/common';
import { useMemo } from 'react';

type TAmountBoxProps = {
  amount: string;
  token: string;
  fromToken?: string;
  status?: string;
};

export default function AmountBox({ amount, token, fromToken, status }: TAmountBoxProps) {
  const { isMobilePX } = useCommonState();
  const findToken = useFindToken();

  const amountDisplay = useMemo(() => {
    const currentToken = findToken(token);
    return LargeNumberDisplay(amount, Number(currentToken?.decimals) || 6);
  }, [amount, findToken, token]);

  return (
    <div
      className={clsx(
        styles['amount-box'],
        isMobilePX ? styles['mobile-amount-box'] : styles['web-amount-box'],
      )}>
      {status !== TRecordsStatus.Failed &&
        (fromToken && fromToken !== token && status === TRecordsStatus.Processing ? (
          <span className={styles['second']}>Swapping</span>
        ) : (
          <span>{`${amountDisplay} ${formatSymbolDisplay(token)}`}</span>
        ))}
      {status === TRecordsStatus.Failed && <span>{defaultNullValue}</span>}
    </div>
  );
}
