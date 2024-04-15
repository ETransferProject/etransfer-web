import styles from './styles.module.scss';
import clsx from 'clsx';
import { LargeNumberDisplay } from 'utils/calculate';
import { useCommonState } from 'store/Provider/hooks';

type AmountBoxProps = {
  amount: string;
  token: string;
};

export default function AmountBox({ amount, token }: AmountBoxProps) {
  const { isMobilePX } = useCommonState();

  return (
    <div
      className={clsx(
        styles['AmountBox'],
        isMobilePX ? styles['mobile-amount-box'] : styles['web-amount-box'],
      )}>
      {LargeNumberDisplay(amount, token)}
    </div>
  );
}
