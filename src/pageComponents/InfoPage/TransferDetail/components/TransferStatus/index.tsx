import { TransferStatusType } from 'constants/infoDashboard';
import styles from './styles.module.scss';
import { TOrderStatus } from 'types/records';

export function TransferStatus({ status }: { status: TransferStatusType | TOrderStatus }) {
  if (status === TransferStatusType.Pending || status === TOrderStatus.Processing) {
    return <div className={styles['transfer-status-pending']}>{TransferStatusType.Pending}</div>;
  }

  if (status === TransferStatusType.Success || status === TOrderStatus.Succeed) {
    return <div className={styles['transfer-status-success']}>{TransferStatusType.Success}</div>;
  }

  if (status === TransferStatusType.Failed || status === TOrderStatus.Failed) {
    return <div className={styles['transfer-status-failed']}>{TransferStatusType.Failed}</div>;
  }

  return null;
}
