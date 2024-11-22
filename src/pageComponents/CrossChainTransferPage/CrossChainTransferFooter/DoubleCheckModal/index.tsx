import clsx from 'clsx';
import CommonModalSwitchDrawer, {
  CommonModalSwitchDrawerProps,
} from 'components/CommonModalSwitchDrawer';
import PartialLoading from 'components/PartialLoading';
import { useCommonState } from 'store/Provider/hooks';
import { TCrossChainTransferInfo, TNetworkItem } from 'types/api';
import styles from './styles.module.scss';
import { valueFixed2LessThanMin } from 'utils/calculate';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import { formatSymbolDisplay } from 'utils/format';

export interface DoubleCheckModalProps {
  transferInfo: TCrossChainTransferInfo;
  amount: string;
  toNetwork: TNetworkItem;
  toAddress: string;
  memo?: string;
  modalProps: CommonModalSwitchDrawerProps;
  isTransactionFeeLoading: boolean;
}

export default function DoubleCheckModal({
  transferInfo,
  amount,
  toNetwork,
  toAddress,
  memo,
  modalProps,
  isTransactionFeeLoading,
}: DoubleCheckModalProps) {
  const { isPadPX } = useCommonState();

  const renderAmountToBeReceived = () => {
    return (
      <>
        {isTransactionFeeLoading && <PartialLoading />}
        <span className={clsx(styles['receive-amount-center'])}>
          {!isTransactionFeeLoading && `${transferInfo.receiveAmount || DEFAULT_NULL_VALUE} `}
          {formatSymbolDisplay(transferInfo.limitCurrency)}
        </span>
      </>
    );
  };

  return (
    <CommonModalSwitchDrawer
      {...modalProps}
      title="Transfer Information"
      isOkButtonDisabled={isTransactionFeeLoading || !transferInfo.receiveAmount}>
      <div>
        <div className={clsx('flex-column-center', styles['receive-amount-wrapper'])}>
          <span className={styles['label']}>Amount to Be Received</span>
          <span className={clsx('flex-row-center', styles['value'])}>
            {renderAmountToBeReceived()}
          </span>
          <div className={clsx(styles['receive-amount-usd'])}>
            {valueFixed2LessThanMin(transferInfo.receiveAmountUsd, '$ ')}
          </div>
        </div>
        <div className={styles['divider']} />
        <div className={clsx('flex-column', styles['detail-wrapper'])}>
          <div className={styles['detail-row']}>
            <div className={styles['label']}>Transfer Address</div>
            <div className={styles['value']}>{toAddress || DEFAULT_NULL_VALUE}</div>
          </div>
          {memo && (
            <div className={styles['detail-row']}>
              <div className={styles['label']}>Comment</div>
              <div className={styles['value']}>{memo}</div>
            </div>
          )}
          <div className={clsx(styles['detail-row'], styles['transfer-network-wrapper'])}>
            <div className={styles['label']}>Transfer to Network</div>
            <div className={clsx('flex-row-center', styles['value'])}>
              {isPadPX ? (
                toNetwork?.name
              ) : (
                <>
                  <span>{toNetwork?.network}</span>
                  <span className={styles['secondary-value']}>{toNetwork?.name}</span>
                </>
              )}
            </div>
          </div>
          <div className={styles['detail-row']}>
            <div className={styles['label']}>Transfer Amount</div>
            <div className={styles['value']}>
              <div className={styles['value-content']}>
                {`${amount || DEFAULT_NULL_VALUE}`}
                <span className={styles['value-symbol']}>
                  {formatSymbolDisplay(transferInfo.limitCurrency)}
                </span>
              </div>

              <div className={clsx(styles['amount-usd'])}>
                {valueFixed2LessThanMin(transferInfo.amountUsd, '$ ')}
              </div>
            </div>
          </div>
          <div className={clsx(styles['detail-row'], styles['transaction-fee-wrapper'])}>
            <div className={styles['label']}>Estimated Gas Fee</div>
            <div className={clsx('flex-row', styles['value'], styles['fee-usd-box'])}>
              <span className={clsx('flex-1', styles['fee-value'])}>
                {transferInfo.aelfTransactionFee}
              </span>
              &nbsp;{transferInfo.aelfTransactionUnit}
            </div>
          </div>
          <div className={clsx(styles['detail-row'], styles['transaction-fee-wrapper'])}>
            <div className={styles['label']}>Transaction Fee</div>
            <div className={clsx('flex-column', styles['value'], styles['fee-usd-box'])}>
              <div className="flex-row-center">
                <span className={clsx('flex-1', styles['fee-value'])}>
                  {transferInfo.transactionFee}
                </span>
                &nbsp;{transferInfo.transactionUnit}
              </div>

              <div className={clsx(styles['fee-usd'])}>
                {valueFixed2LessThanMin(transferInfo.feeUsd, '$ ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommonModalSwitchDrawer>
  );
}
