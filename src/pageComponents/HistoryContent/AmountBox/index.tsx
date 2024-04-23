import styles from './styles.module.scss';
import clsx from 'clsx';
import { LargeNumberDisplay } from 'utils/calculate';
import { useCommonState } from 'store/Provider/hooks';
import { RecordsStatus } from 'types/records';

type AmountBoxProps = {
  amount: string;
  token: string;
  status?: string;
};

export default function AmountBox({ amount, token, status }: AmountBoxProps) {
  const { isMobilePX } = useCommonState();

  return (
    <div
      className={clsx(
        styles['AmountBox'],
        isMobilePX ? styles['mobile-amount-box'] : styles['web-amount-box'],
      )}>
      {status === RecordsStatus.Failed ? '--' : LargeNumberDisplay(amount, token)}
    </div>
  );
}
