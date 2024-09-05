import clsx from 'clsx';
import CommonModalSwitchDrawer, {
  CommonModalSwitchDrawerProps,
} from 'components/CommonModalSwitchDrawer';
import PartialLoading from 'components/PartialLoading';
import { useCommonState } from 'store/Provider/hooks';
import { TFeeItem, TNetworkItem } from 'types/api';
import styles from './styles.module.scss';
import { valueFixed2LessThanMin } from 'utils/calculate';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import { formatSymbolDisplay } from 'utils/format';

export interface DoubleCheckModalProps {
  withdrawInfo: {
    receiveAmount: string;
    address?: string;
    network?: TNetworkItem;
    amount: string;
    memo?: string;
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
  const { isPadPX } = useCommonState();

  const renderAmountToBeReceived = () => {
    return (
      <>
        {isTransactionFeeLoading && <PartialLoading />}
        <span className={clsx(styles['receive-amount-center'])}>
          {!isTransactionFeeLoading && `${withdrawInfo.receiveAmount || DEFAULT_NULL_VALUE} `}
          {formatSymbolDisplay(withdrawInfo.symbol)}
        </span>
      </>
    );
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
            <div className={styles['value']}>{withdrawInfo.address || DEFAULT_NULL_VALUE}</div>
          </div>
          {withdrawInfo.memo && (
            <div className={styles['detail-row']}>
              <div className={styles['label']}>Comment</div>
              <div className={styles['value']}>{withdrawInfo.memo}</div>
            </div>
          )}
          <div className={clsx(styles['detail-row'], styles['withdrawal-network-wrapper'])}>
            <div className={styles['label']}>Withdrawal Network</div>
            <div className={clsx('flex-row-center', styles['value'])}>
              {isPadPX ? (
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
                {`${withdrawInfo.amount || DEFAULT_NULL_VALUE}`}
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
            <div className={styles['label']}>Estimated Gas Fee</div>
            <div className={clsx('flex-row', styles['value'], styles['fee-usd-box'])}>
              <span className={clsx('flex-1', styles['fee-value'])}>
                {withdrawInfo.aelfTransactionFee?.amount}
              </span>
              &nbsp;{withdrawInfo.aelfTransactionFee?.currency}
            </div>
          </div>
          <div className={clsx(styles['detail-row'], styles['transaction-fee-wrapper'])}>
            <div className={styles['label']}>Transaction Fee</div>
            <div className={clsx('flex-column', styles['value'], styles['fee-usd-box'])}>
              <div className="flex-row-center">
                <span className={clsx('flex-1', styles['fee-value'])}>
                  {withdrawInfo.transactionFee?.amount}
                </span>
                &nbsp;{withdrawInfo.transactionFee?.currency}
              </div>

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
