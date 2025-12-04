import { TTransferDashboardData } from 'types/infoDashboard';
import TransferDetailBody from '../TransferDetailBody';
import styles from './styles.module.scss';

export default function MobileTransferDetail(props: TTransferDashboardData) {
  return (
    <div className={styles['mobile-transfer-detail']}>
      <TransferDetailBody {...props} />
    </div>
  );
}
