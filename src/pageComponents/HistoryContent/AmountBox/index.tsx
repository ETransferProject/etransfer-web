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
  status?: string;
};

export default function AmountBox({ amount, token, status }: TAmountBoxProps) {
  const { isMobilePX } = useCommonState();

  return (
    <div
      className={clsx(
        styles['amount-box'],
        isMobilePX ? styles['mobile-amount-box'] : styles['web-amount-box'],
      )}>
      {status !== TRecordsStatus.Failed && (
        <span>{`${LargeNumberDisplay(amount, token)} ${formatSymbolDisplay(token)}`}</span>
      )}
      {status === TRecordsStatus.Failed && <span>{defaultNullValue}</span>}
    </div>
  );
}
