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

export default function TransferDetailBody(props: Omit<TTransferDashboardData, 'status'>) {
  const { isMobilePX } = useCommonState();

  return (
    <div className={styles['transfer-detail-body']}>
      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Type</div>
        <div className={clsx(styles['detail-value'], styles['detail-value-type'])}>
          {props.orderType}
        </div>
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>CreateTime</div>
        <div className={clsx(styles['detail-value'], styles['detail-value-time'])}>
          {formatTime(props.createTime)}
        </div>
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Transaction Fee</div>
        <div className={clsx(styles['detail-value'], styles['detail-value-fee'])}>
          {props.orderType === BusinessType.Withdraw
            ? `${props.toFeeInfo[0].amount} ${props.toFeeInfo[0].symbol}`
            : 'Free'}
        </div>
      </div>

      <div className={styles['detail-divider']} />

      {/* ======== Source Info ======== */}
      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Source Tx Hash</div>
        <div
          className={clsx(styles['detail-value'], styles['detail-value-from-tx-hash'])}
          onClick={() =>
            viewTxDetailInExplore(props.fromNetwork, props.fromTxId, props.fromChainId)
          }>
          {isMobilePX ? getOmittedStr(props.fromTxId, 8, 9) : props.fromTxId}
        </div>
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Source Chain</div>
        <FromOrToChain network={props.fromNetwork} chainId={props.fromChainId} />
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>{`${props.orderType} Amount`}</div>
        <TokenAmount
          amount={props.fromAmount}
          amountUsd={props.fromAmountUsd}
          symbol={props.fromSymbol}
        />
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>{`${props.orderType} Address`}</div>
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
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Status</div>
        <TransferStatus status={props.fromStatus} />
      </div>

      <div className={styles['detail-divider']} />

      {/* ======== Destination Info ======== */}
      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Destination Tx Hash</div>
        <div
          className={clsx(styles['detail-value'], styles['detail-value-to-tx-hash'])}
          onClick={() => viewTxDetailInExplore(props.toNetwork, props.toTxId, props.toChainId)}>
          {isMobilePX ? getOmittedStr(props.toTxId, 8, 9) : props.toTxId}
        </div>
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Destination Chain</div>
        <FromOrToChain network={props.toNetwork} chainId={props.toChainId} />
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Receive</div>
        <TokenAmount
          amount={props.toAmount}
          amountUsd={props.toAmountUsd}
          symbol={props.toSymbol}
        />
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Receive From</div>
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
      </div>

      <div className={styles['detail-item']}>
        <div className={styles['detail-label']}>Status</div>
        <TransferStatus status={props.toStatus} />
      </div>
    </div>
  );
}
