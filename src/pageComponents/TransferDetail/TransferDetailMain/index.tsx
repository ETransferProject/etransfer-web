import TransferDetailBody from 'pageComponents/InfoPage/TransferDetail/TransferDetailBody';
import TransferDetailStep from '../TransferDetailStep';
import styles from './styles.module.scss';
import { TGetRecordDetailResult } from 'types/api';
import { TOrderStatus } from 'types/records';
import { CheckNoticeIcon, ErrorIcon } from 'assets/images';
import clsx from 'clsx';
import { formatSymbolDisplay } from 'utils/format';
import { DEFAULT_NULL_VALUE } from 'constants/index';

export default function TransferDetailMain(props: TGetRecordDetailResult) {
  return (
    <div className={styles['transfer-detail-main']}>
      {props.status === TOrderStatus.Processing && (
        <TransferDetailStep
          orderType={props.orderType}
          currentStep={props.step.currentStep}
          fromTransfer={{
            confirmingThreshold: props.step.fromTransfer.confirmingThreshold,
            confirmedNum: props.step.fromTransfer.confirmedNum,
            amount: props.fromTransfer.amount,
            symbol: props.fromTransfer.symbol,
            network: props.fromTransfer.network,
          }}
          toTransfer={{
            amount: props.toTransfer.amount,
            symbol: props.toTransfer.symbol,
            network: props.toTransfer.network,
          }}
        />
      )}

      {props.status === TOrderStatus.Succeed && (
        <div className={clsx('flex-row-center', styles['transfer-detail-received'])}>
          <div className={clsx('flex-row-center', styles['detail-label'])}>
            <CheckNoticeIcon />
            <span>Received</span>
          </div>
          {props.toTransfer.amount && props.toTransfer.symbol ? (
            <div className={styles['detail-value-amount']}>{`${
              props.toTransfer.amount
            } ${formatSymbolDisplay(props.toTransfer.symbol)}`}</div>
          ) : (
            <div>{DEFAULT_NULL_VALUE}</div>
          )}
        </div>
      )}

      {props.status === TOrderStatus.Failed && (
        <div className={clsx('flex-row-center', styles['transfer-detail-failed'])}>
          <div className={clsx('flex-row-center', styles['detail-label'])}>
            <ErrorIcon />
            <span>Failed</span>
          </div>
          {props.fromTransfer.amount && props.fromTransfer.symbol ? (
            <div className={styles['detail-value-amount']}>{`${
              props.fromTransfer.amount
            } ${formatSymbolDisplay(props.fromTransfer.symbol)}`}</div>
          ) : (
            <div>{DEFAULT_NULL_VALUE}</div>
          )}
        </div>
      )}

      <div className={styles['detail-divider']} />
      <TransferDetailBody
        id={props.id}
        status={props.status}
        orderType={props.orderType}
        createTime={props.createTime}
        fromNetwork={props.fromTransfer.network}
        fromChainId={props.fromTransfer.chainId}
        fromSymbol={props.fromTransfer.symbol}
        fromIcon={props.fromTransfer?.icon}
        fromAddress={props.fromTransfer.fromAddress}
        fromAmount={props.fromTransfer.amount}
        fromAmountUsd={props.fromTransfer?.amountUsd || ''}
        fromTxId={props.fromTransfer.txId}
        fromStatus={props.fromTransfer.status}
        toNetwork={props.toTransfer.network}
        toChainId={props.toTransfer.chainId}
        toSymbol={props.toTransfer.symbol}
        toIcon={props.toTransfer?.icon}
        toAddress={props.toTransfer.toAddress}
        toAmount={props.toTransfer.amount}
        toAmountUsd={props.toTransfer.amountUsd || ''}
        toTxId={props.toTransfer.txId}
        toStatus={props.toTransfer.status}
        toFeeInfo={props.toTransfer.feeInfo}
      />
    </div>
  );
}
