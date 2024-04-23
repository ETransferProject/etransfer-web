import styles from './styles.module.scss';
import clsx from 'clsx';
import { LargeNumberDisplay } from 'utils/calculate';
import { useCommonState } from 'store/Provider/hooks';
import { RecordsStatus } from 'types/records';
import { defaultNullValue } from 'constants/index';

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
      {status === RecordsStatus.Failed ? defaultNullValue : LargeNumberDisplay(amount, token)}
    </div>
  );
}
