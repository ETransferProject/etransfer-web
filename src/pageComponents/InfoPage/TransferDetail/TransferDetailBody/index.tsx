import clsx from 'clsx';
import styles from './styles.module.scss';
import { BusinessType } from 'types/api';
import { TransferStatus } from '../components/TransferStatus';
import { TTransferDashboardData } from 'types/infoDashboard';
import WalletAddress from 'pageComponents/InfoPage/TransferDashboard/ColumnComponents/WalletAddress';
import FromOrToChain from '../components/FromOrToChain';
import TokenAmount from '../components/TokenAmount';
import { useCommonState } from 'store/Provider/hooks';
import { getOmittedStr } from 'utils/calculate';
import { formatTime } from 'pageComponents/InfoPage/TransferDashboard/utils';
import { viewTxDetailInExplore } from 'utils/common';
import { InfoBusinessTypeLabel, TransferStatusType } from 'constants/infoDashboard';
import { TOrderStatus } from 'types/records';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import { useMemo } from 'react';
import { COBO_CUSTODY } from 'constants/misc';
import FeeInfo from 'pageComponents/HistoryContent/FeeInfo';

export type TTransferDetailBody = Omit<TTransferDashboardData, 'fromStatus' | 'toStatus'> & {
  fromStatus: TransferStatusType | TOrderStatus;
  toStatus: TransferStatusType | TOrderStatus;
};

export default function TransferDetailBody(props: TTransferDetailBody) {
  const { isMobilePX } = useCommonState();
  const orderType = useMemo(() => {
    return props?.secondOrderType
      ? props?.secondOrderType
      : props.orderType === BusinessType.Withdraw
      ? InfoBusinessTypeLabel.Withdraw
      : props.orderType;
  }, [props.orderType, props?.secondOrderType]);

  return (
    <div className={styles['transfer-detail-body']}>
      {isMobilePX ? (
        <>
          <div className={styles['detail-item']}>
            <div className={clsx(styles['detail-label'], styles['detail-value-type'])}>
              {orderType}
            </div>
            <div className={clsx(styles['detail-value'], styles['detail-value-time'])}>
              {formatTime(props.createTime)}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={styles['detail-item']}>
            <div className={styles['detail-label']}>Type</div>
            <div className={clsx(styles['detail-value'], styles['detail-value-type'])}>
              {orderType}
            </div>
          </div>

          <div className={styles['detail-item']}>
            <div className={styles['detail-label']}>CreateTime</div>
            <div className={clsx(styles['detail-value'], styles['detail-value-time'])}>
              {formatTime(props.createTime)}
            </div>
          </div>
        </>
      )}

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Fee</div>
        <div className={clsx(styles['detail-value'], styles['detail-value-fee'])}>
          <FeeInfo feeInfo={props.toFeeInfo} status={props.status} orderType={props.orderType} />
        </div>
      </div>

      <div className={styles['detail-divider']} />

      {/* ======== Source Info ======== */}
      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Source Tx Hash</div>
        {props.fromTxId ? (
          <div
            className={clsx(styles['detail-value'], styles['detail-value-from-tx-hash'])}
            onClick={() =>
              viewTxDetailInExplore(
                props.fromNetwork,
                props.fromTxId,
                props.fromAddress === COBO_CUSTODY || props.fromToAddress === COBO_CUSTODY,
                props.fromChainId,
              )
            }>
            {isMobilePX ? getOmittedStr(props.fromTxId, 8, 9) : props.fromTxId}
          </div>
        ) : (
          DEFAULT_NULL_VALUE
        )}
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Source Chain</div>
        <FromOrToChain network={props.fromNetwork} chainId={props.fromChainId} />
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>{`${orderType} Amount`}</div>
        <TokenAmount
          status={props.fromStatus}
          amount={props.fromAmount}
          amountUsd={props.fromAmountUsd}
          symbol={props.fromSymbol}
          icon={props?.fromIcon}
        />
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>{`${orderType} Address`}</div>
        {props.fromAddress === COBO_CUSTODY ? (
          <span
            className={clsx(
              styles['cobo-address-text'],
              isMobilePX ? styles['cobo-address-text-mobile'] : styles['cobo-address-text-web'],
            )}>
            {props.fromAddress}
          </span>
        ) : (
          <WalletAddress
            address={props.fromAddress}
            chainId={props.fromChainId}
            network={props.fromNetwork}
            isOmitAddress={isMobilePX ? true : false}
            className={
              isMobilePX
                ? styles['detail-value-wallet-address']
                : styles['detail-value-wallet-address-web']
            }
          />
        )}
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Status</div>
        <TransferStatus status={props.fromStatus} />
      </div>

      <div className={styles['detail-divider']} />

      {/* ======== Destination Info ======== */}
      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Destination Tx Hash</div>
        {props.toTxId ? (
          <div
            className={clsx(styles['detail-value'], styles['detail-value-to-tx-hash'])}
            onClick={() =>
              viewTxDetailInExplore(
                props.toNetwork,
                props.toTxId,
                props.toFromAddress === COBO_CUSTODY || props.toAddress === COBO_CUSTODY,
                props.toChainId,
              )
            }>
            {isMobilePX ? getOmittedStr(props.toTxId, 8, 9) : props.toTxId}
          </div>
        ) : (
          DEFAULT_NULL_VALUE
        )}
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Destination Chain</div>
        <FromOrToChain network={props.toNetwork} chainId={props.toChainId} />
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Receive Amount</div>
        <TokenAmount
          status={props.toStatus}
          amount={props.toAmount}
          amountUsd={props.toAmountUsd}
          symbol={props.toSymbol}
          fromSymbol={props.fromSymbol}
          icon={props?.toIcon}
        />
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Receive Address</div>
        {props.toAddress === COBO_CUSTODY ? (
          <span
            className={clsx(
              styles['cobo-address-text'],
              isMobilePX ? styles['cobo-address-text-mobile'] : styles['cobo-address-text-web'],
            )}>
            {props.toAddress}
          </span>
        ) : (
          <WalletAddress
            address={props.toAddress}
            chainId={props.toChainId}
            network={props.toNetwork}
            isOmitAddress={isMobilePX ? true : false}
            className={
              isMobilePX
                ? styles['detail-value-wallet-address']
                : styles['detail-value-wallet-address-web']
            }
          />
        )}
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Status</div>
        <TransferStatus status={props.toStatus} />
      </div>
    </div>
  );
}
