import { TTransferDashboardData } from 'types/infoDashboard';
import TransferDetailBody from '../TransferDetailBody';
import styles from './styles.module.scss';
import { Breadcrumb } from 'antd';
import myEvents from 'utils/myEvent';

export default function WebTransferDetail(props: TTransferDashboardData) {
  return (
    <div className={styles['web-transfer-detail']}>
      <Breadcrumb>
        <Breadcrumb.Item
          className={styles['web-transfer-detail-breadcrumb-info']}
          onClick={() => myEvents.HideWebTransferDashboardDetailPage.emit()}>
          Info
        </Breadcrumb.Item>
        <Breadcrumb.Item>Transfer Detail</Breadcrumb.Item>
      </Breadcrumb>
      <div className={styles['detail-title']}>Transfer Detail</div>

      <TransferDetailBody {...props} />
    </div>
  );
}
