import styles from './styles.module.scss';
import clsx from 'clsx';
import { useCommonState } from 'store/Provider/hooks';
import { TOrderStatus } from 'types/records';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import { formatSymbolDisplay } from 'utils/format';

type TAmountBoxProps = {
  amount: string;
  token: string;
  fromToken?: string;
  status?: string;
};

export default function AmountBox({ amount, token, fromToken, status }: TAmountBoxProps) {
  const { isPadPX } = useCommonState();

  return (
    <div
      className={clsx(
        styles['amount-box'],
        isPadPX ? styles['mobile-amount-box'] : styles['web-amount-box'],
      )}>
      {status !== TOrderStatus.Failed &&
        (fromToken && fromToken !== token && status === TOrderStatus.Processing ? (
          <span className={styles['second']}>Swapping</span>
        ) : (
          <span>{`${amount} ${formatSymbolDisplay(token)}`}</span>
        ))}
      {status === TOrderStatus.Failed && <span>{DEFAULT_NULL_VALUE}</span>}
    </div>
  );
}
