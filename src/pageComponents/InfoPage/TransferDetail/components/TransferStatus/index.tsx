import { TransferStatusType } from 'constants/infoDashboard';
import styles from './styles.module.scss';

export function TransferStatus({ status }: { status: TransferStatusType }) {
  if (status === TransferStatusType.Pending) {
    return <div className={styles['transfer-status-pending']}>{status}</div>;
  }

  if (status === TransferStatusType.Success) {
    return <div className={styles['transfer-status-success']}>{status}</div>;
  }

  return null;
}
