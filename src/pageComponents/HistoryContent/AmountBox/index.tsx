import styles from './styles.module.scss';
import clsx from 'clsx';
import { LargeNumberDisplay } from 'utils/calculate';
import { useCommonState } from 'store/Provider/hooks';
import { TRecordsStatus } from 'types/records';
import { defaultNullValue } from 'constants/index';
import { formatSymbolDisplay } from 'utils/format';

type TAmountBoxProps = {
  amount: string;
  token: string;
  fromToken?: string;
  status?: string;
};

export default function AmountBox({ amount, token, fromToken, status }: TAmountBoxProps) {
  const { isMobilePX } = useCommonState();

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
          <span>{`${LargeNumberDisplay(amount, token)} ${formatSymbolDisplay(token)}`}</span>
        ))}
      {status === TRecordsStatus.Failed && <span>{defaultNullValue}</span>}
    </div>
  );
}
