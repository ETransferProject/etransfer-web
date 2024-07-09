import { TTransferDashboardData } from 'types/infoDashboard';
import TransferDetailBody from '../TransferDetailBody';
import styles from './styles.module.scss';

export default function WebTransferDetail(props: TTransferDashboardData) {
  return (
    <div className={styles['web-transfer-detail']}>
      <div className=""></div>
      <div className={styles['detail-title']}>Transfer Detail</div>

      <TransferDetailBody {...props} />
    </div>
  );
}
