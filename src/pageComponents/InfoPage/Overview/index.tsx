import clsx from 'clsx';
import TransactionOverview from './TransactionOverview';
import styles from './styles.module.scss';
import VolumeOverview from './VolumeOverview';
import Space from 'components/Space';
import { useCommonState } from 'store/Provider/hooks';

export default function Overview() {
  return (
    <div className={clsx('flex', styles['info-overview'])}>
      <TransactionOverview />

      <VolumeOverview />
    </div>
  );
}
