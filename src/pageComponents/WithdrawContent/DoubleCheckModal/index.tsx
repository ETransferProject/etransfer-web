import clsx from 'clsx';
import CommonModalSwitchDrawer, {
  CommonModalSwitchDrawerProps,
} from 'components/CommonModalSwitchDrawer';
import { FeeItem, NetworkItem } from 'types/api';
import styles from './styles.module.scss';

interface DoubleCheckModalProps {
  withdrawInfo: {
    receiveAmount: string;
    address: string;
    network: NetworkItem;
    amount: string;
    transactionFee: FeeItem;
    symbol: string;
  };
  modalProps: CommonModalSwitchDrawerProps;
}

export default function DoubleCheckModal({ withdrawInfo, modalProps }: DoubleCheckModalProps) {
  return (
    <CommonModalSwitchDrawer {...modalProps} title="Withdrawal Information">
      <div>
        <div className={clsx('flex-column-center', styles['receive-amount-wrapper'])}>
          <span className={styles['label']}>Amount to Be Received</span>
          <span
            className={
              styles['value']
            }>{`${withdrawInfo.receiveAmount} ${withdrawInfo.symbol}`}</span>
        </div>
        <div className={styles['divider']} />
        <div className={clsx('flex-column', styles['detail-wrapper'])}>
          <div className={styles['detail-row']}>
            <div className={styles['label']}>Withdrawal Address</div>
            <div className={styles['value']}>{withdrawInfo.address}</div>
          </div>
          <div className={styles['detail-row']}>
            <div className={styles['label']}>Withdrawal Network</div>
            <div className={styles['value']}>{withdrawInfo.network.name}</div>
          </div>
          <div className={styles['detail-row']}>
            <div className={styles['label']}>Withdraw Amount</div>
            <div className={styles['value']}>{`${withdrawInfo.amount} ${withdrawInfo.symbol}`}</div>
          </div>
          <div className={styles['detail-row']}>
            <div className={styles['label']}>Transaction Fee</div>
            <div className={styles['value']}>
              {`${withdrawInfo.transactionFee.amount} ${withdrawInfo.transactionFee.currency}`}
            </div>
          </div>
        </div>
      </div>
    </CommonModalSwitchDrawer>
  );
}
