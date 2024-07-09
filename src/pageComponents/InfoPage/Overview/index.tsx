import clsx from 'clsx';
import TransactionOverview from './TransactionOverview';
import styles from './styles.module.scss';
import VolumeOverview from './VolumeOverview';

export default function Overview() {
  return (
    <div className={clsx('flex', styles['info-overview'])}>
      <TransactionOverview />

      <VolumeOverview />
    </div>
  );
}
