import clsx from 'clsx';
import CheckFilledIcon from 'assets/images/checkFilled.svg';
import CommonModalSwitchDrawer, {
  CommonModalSwitchDrawerProps,
} from 'components/CommonModalSwitchDrawer';
import styles from './styles.module.scss';
import { WithdrawInfoSuccess } from 'types/deposit';

interface SuccessModalProps {
  withdrawInfo: WithdrawInfoSuccess;
  modalProps: CommonModalSwitchDrawerProps;
}

export default function SuccessModal({ withdrawInfo, modalProps }: SuccessModalProps) {
  return (
    <CommonModalSwitchDrawer {...modalProps} hideCancelButton okText="Yes, I know">
      <div className={clsx('flex-column', styles['container'])}>
        <div className={clsx('flex-column-center', styles['title-wrapper'])}>
          <div className={clsx('flex-center', styles['title-icon'])}>
            <CheckFilledIcon />
          </div>
          <div className={styles['title']}>Withdrawal Request Submitted</div>
        </div>
        <div className={clsx('flex-column-center', styles['main-info-wrapper'])}>
          <div className={styles['value']}>
            {withdrawInfo.amount} {withdrawInfo.symbol}
          </div>
          <div className={styles['label']}>
            from {withdrawInfo.chainItem.label} to {withdrawInfo.network.name}
          </div>
        </div>
        <div className={styles['divider']} />
        <div className={clsx('flex-column', styles['detail-wrapper'])}>
          <div className={styles['detail-row']}>
            <div className={styles['label']}>Amount to Be Received</div>
            <div className={styles['value']}>
              {withdrawInfo.receiveAmount} {withdrawInfo.symbol}
            </div>
          </div>
          <div className={styles['detail-row']}>
            <div className={styles['label']}>Arrival Time</div>
            <div className={styles['value']}>≈ {withdrawInfo.arriveTime}</div>
          </div>
        </div>
      </div>
    </CommonModalSwitchDrawer>
  );
}
