import clsx from 'clsx';
import CommonModalSwitchDrawer, {
  CommonModalSwitchDrawerProps,
} from 'components/CommonModalSwitchDrawer';
import PartialLoading from 'components/PartialLoading';
import { useCommonState } from 'store/Provider/hooks';
import { TFeeItem, TNetworkItem } from 'types/api';
import styles from './styles.module.scss';
import { valueFixed2LessThanMin } from 'utils/calculate';
import { defaultNullValue } from 'constants/index';
import { formatSymbolDisplay } from 'utils/format';

export interface DoubleCheckModalProps {
  withdrawInfo: {
    receiveAmount: string;
    address?: string;
    network?: TNetworkItem;
    amount: string;
    transactionFee: TFeeItem;
    aelfTransactionFee: TFeeItem;
    symbol: string;
    amountUsd: string;
    receiveAmountUsd: string;
    feeUsd: string;
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
    return (
      <>
        {isTransactionFeeLoading && <PartialLoading />}
        <span className={clsx(styles['receive-amount-center'])}>
          {!isTransactionFeeLoading && `${withdrawInfo.receiveAmount || defaultNullValue} `}
          {formatSymbolDisplay(withdrawInfo.symbol)}
        </span>
      </>
    );
  };

  const renderTransactionFeeValue = () => {
    if (!withdrawInfo.transactionFee?.amount || !withdrawInfo.aelfTransactionFee?.amount) {
      return isTransactionFeeLoading ? <PartialLoading /> : defaultNullValue;
    } else {
      return (
        <>
          {isTransactionFeeLoading && <PartialLoading />}
          <div className={clsx('flex')}>
            {!isTransactionFeeLoading && `${withdrawInfo.transactionFee.amount} `}
            <span className={styles['fee-currency']}>
              {withdrawInfo.transactionFee.currency}
            </span> + {withdrawInfo.aelfTransactionFee.amount}{' '}
            {withdrawInfo.aelfTransactionFee.currency}
          </div>
        </>
      );
    }
  };

  return (
    <CommonModalSwitchDrawer
      {...modalProps}
      title="Withdrawal Information"
      isOkButtonDisabled={isTransactionFeeLoading || !withdrawInfo.receiveAmount}>
      <div>
        <div className={clsx('flex-column-center', styles['receive-amount-wrapper'])}>
          <span className={styles['label']}>Amount to Be Received</span>
          <span className={clsx('flex-row-center', styles['value'])}>
            {renderAmountToBeReceived()}
          </span>
          <div className={clsx(styles['receive-amount-usd'])}>
            {valueFixed2LessThanMin(withdrawInfo.receiveAmountUsd, '$ ')}
          </div>
        </div>
        <div className={styles['divider']} />
        <div className={clsx('flex-column', styles['detail-wrapper'])}>
          <div className={styles['detail-row']}>
            <div className={styles['label']}>Withdrawal Address</div>
            <div className={styles['value']}>{withdrawInfo.address || defaultNullValue}</div>
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
            <div className={styles['value']}>
              <div className={styles['value-content']}>
                {`${withdrawInfo.amount || defaultNullValue}`}
                <span className={styles['value-symbol']}>
                  {formatSymbolDisplay(withdrawInfo.symbol)}
                </span>
              </div>

              <div className={clsx(styles['amount-usd'])}>
                {valueFixed2LessThanMin(withdrawInfo.amountUsd, '$ ')}
              </div>
            </div>
          </div>
          <div className={clsx(styles['detail-row'], styles['transaction-fee-wrapper'])}>
            <div className={styles['label']}>Transaction Fee</div>
            <div className={clsx('flex-column-center', styles['value'], styles['fee-usd-box'])}>
              {renderTransactionFeeValue()}
              <div className={clsx(styles['fee-usd'])}>
                {valueFixed2LessThanMin(withdrawInfo.feeUsd, '$ ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommonModalSwitchDrawer>
  );
}
