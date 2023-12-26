import clsx from 'clsx';
import CommonModalSwitchDrawer, {
  CommonModalSwitchDrawerProps,
} from 'components/CommonModalSwitchDrawer';
import SimpleLoading from 'components/SimpleLoading';
import { useCommonState } from 'store/Provider/hooks';
import { FeeItem, NetworkItem } from 'types/api';
import styles from './styles.module.scss';

export interface DoubleCheckModalProps {
  withdrawInfo: {
    receiveAmount: string;
    address: string;
    network: NetworkItem;
    amount: string;
    transactionFee: FeeItem;
    aelfTransactionFee: FeeItem;
    symbol: string;
  };
  modalProps: CommonModalSwitchDrawerProps;
  isTransactionFeeLoading: boolean;
}

export default function DoubleCheckModal({
  withdrawInfo,
  modalProps,
  isTransactionFeeLoading,
}: DoubleCheckModalProps) {
  const { isMobilePX } = useCommonState();

  const renderAmountToBeReceived = () => {
    if (!withdrawInfo.receiveAmount) {
      return '-';
    } else {
      return (
        <>
          {isTransactionFeeLoading && <SimpleLoading />}
          <span>
            {!isTransactionFeeLoading && `${withdrawInfo.receiveAmount} `}
            {withdrawInfo.symbol}
          </span>
        </>
      );
    }
  };

  const renderTransactionFeeValue = () => {
    if (!withdrawInfo.transactionFee?.amount || !withdrawInfo.aelfTransactionFee?.amount) {
      return '-';
    } else {
      return (
        <>
          {isTransactionFeeLoading && <SimpleLoading />}
          <span>
            {!isTransactionFeeLoading && `${withdrawInfo.transactionFee.amount} `}
            {withdrawInfo.transactionFee.currency} + {withdrawInfo.aelfTransactionFee.amount}{' '}
            {withdrawInfo.aelfTransactionFee.currency}
          </span>
        </>
      );
    }
  };

  return (
    <CommonModalSwitchDrawer
      {...modalProps}
      title="Withdrawal Information"
      isOkButtonDisabled={isTransactionFeeLoading}>
      <div>
        <div className={clsx('flex-column-center', styles['receive-amount-wrapper'])}>
          <span className={styles['label']}>Amount to Be Received</span>
          <span className={clsx('flex-row-center', styles['value'])}>
            {renderAmountToBeReceived()}
          </span>
        </div>
        <div className={styles['divider']} />
        <div className={clsx('flex-column', styles['detail-wrapper'])}>
          <div className={styles['detail-row']}>
            <div className={styles['label']}>Withdrawal Address</div>
            <div className={styles['value']}>{withdrawInfo.address}</div>
          </div>
          <div className={clsx(styles['detail-row'], styles['withdrawal-network-wrapper'])}>
            <div className={styles['label']}>Withdrawal Network</div>
            <div className={clsx('flex-row-center', styles['value'])}>
              {isMobilePX ? (
                withdrawInfo.network?.name
              ) : (
                <>
                  <span>{withdrawInfo.network?.network}</span>
                  <span className={styles['secondary-value']}>{withdrawInfo.network?.name}</span>
                </>
              )}
            </div>
          </div>
          <div className={styles['detail-row']}>
            <div className={styles['label']}>Withdraw Amount</div>
            <div className={styles['value']}>{`${withdrawInfo.amount} ${withdrawInfo.symbol}`}</div>
          </div>
          <div className={clsx(styles['detail-row'], styles['transaction-fee-wrapper'])}>
            <div className={styles['label']}>Transaction Fee</div>
            <div className={clsx('flex-row-center', styles['value'])}>
              {renderTransactionFeeValue()}
            </div>
          </div>
        </div>
      </div>
    </CommonModalSwitchDrawer>
  );
}
