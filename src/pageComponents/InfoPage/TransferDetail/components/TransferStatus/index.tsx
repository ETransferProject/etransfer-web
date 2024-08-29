import { TransferStatusType } from 'constants/infoDashboard';
import styles from './styles.module.scss';
import { TOrderStatus } from 'types/records';

export function TransferStatus({ status }: { status: TransferStatusType | TOrderStatus }) {
  if (status === TransferStatusType.Pending || status === TOrderStatus.Processing) {
    return <div className={styles['transfer-status-pending']}>{status}</div>;
  }

  if (status === TransferStatusType.Success || status === TOrderStatus.Succeed) {
    return <div className={styles['transfer-status-success']}>{status}</div>;
  }

  if (status === TOrderStatus.Failed) {
    return <div className={styles['transfer-status-failed']}>{status}</div>;
  }

  return null;
}
