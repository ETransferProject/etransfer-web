import { formatSymbolDisplay } from 'utils/format';
import styles from './styles.module.scss';

export interface VolumeProps {
  amount: string;
  unit: string;
  amountUsd?: string;
}

export default function Volume({ amount, unit, amountUsd }: VolumeProps) {
  return (
    <div className={styles['volume-container']}>
      <div className={styles['volume-amount']}>{`${amount} ${formatSymbolDisplay(unit)}`}</div>
      {amountUsd && <div className={styles['volume-usd']}>{`$${amountUsd}`}</div>}
    </div>
  );
}
