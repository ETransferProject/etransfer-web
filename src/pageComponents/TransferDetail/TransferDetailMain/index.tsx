import TransferDetailBody from 'pageComponents/InfoPage/TransferDetail/TransferDetailBody';
import TransferDetailStep from '../TransferDetailStep';
import styles from './styles.module.scss';
import { BusinessType, TGetRecordDetailResult } from 'types/api';
import { TOrderStatus } from 'types/records';
import { CheckNoticeIcon, ErrorIcon } from 'assets/images';
import clsx from 'clsx';
import { formatSymbolDisplay } from 'utils/format';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import { useMemo } from 'react';
import CommonTip from 'components/CommonTip';
import { RECEIVED_0_TIP } from 'constants/deposit';
import { NOTICE } from 'constants/misc';

export default function TransferDetailMain({
  id,
  orderType,
  secondOrderType,
  status,
  createTime,
  fromTransfer,
  toTransfer,
  step,
}: TGetRecordDetailResult) {
  const renderTransferDetailStep = useMemo(() => {
    if (status === TOrderStatus.Processing) {
      return (
        <TransferDetailStep
          orderType={orderType}
          secondOrderType={secondOrderType}
          currentStep={step.currentStep}
          fromTransfer={{
            confirmingThreshold: step.fromTransfer.confirmingThreshold,
            confirmedNum: step.fromTransfer.confirmedNum,
            amount: fromTransfer.amount,
            symbol: fromTransfer.symbol,
            network: fromTransfer.network,
          }}
          toTransfer={{
            amount: toTransfer.amount,
            symbol: toTransfer.symbol,
            network: toTransfer.network,
          }}
        />
      );
    } else {
      return null;
    }
  }, [
    fromTransfer.amount,
    fromTransfer.network,
    fromTransfer.symbol,
    orderType,
    secondOrderType,
    status,
    step.currentStep,
    step.fromTransfer.confirmedNum,
    step.fromTransfer.confirmingThreshold,
    toTransfer.amount,
    toTransfer.network,
    toTransfer.symbol,
  ]);

  const renderTopSucceed = useMemo(() => {
    if (status === TOrderStatus.Succeed) {
      return (
        <div className={clsx('flex-row-center', styles['transfer-detail-received'])}>
          <div className={clsx('flex-row-center', styles['detail-label'])}>
            <CheckNoticeIcon />
            <span>Received</span>
          </div>
          {toTransfer.amount && toTransfer.symbol ? (
            <div className={clsx('flex-row-center gap-4', styles['detail-value-amount'])}>
              {`${toTransfer.amount} ${formatSymbolDisplay(toTransfer.symbol)}`}
              {orderType === BusinessType.Deposit && toTransfer.amount === '0' && (
                <CommonTip
                  tip={RECEIVED_0_TIP}
                  className={styles['received-tip']}
                  modalTitle={NOTICE}
                />
              )}
            </div>
          ) : (
            <div>{DEFAULT_NULL_VALUE}</div>
          )}
        </div>
      );
    } else {
      return null;
    }
  }, [orderType, status, toTransfer.amount, toTransfer.symbol]);

  const renderTopFailed = useMemo(() => {
    const value = () => {
      if (fromTransfer.status === TOrderStatus.Failed) {
        return <div>{DEFAULT_NULL_VALUE}</div>;
      } else if (
        toTransfer.status === TOrderStatus.Failed &&
        fromTransfer.amount &&
        fromTransfer.symbol
      ) {
        return (
          <div className={styles['detail-value-amount']}>{`${
            fromTransfer.amount
          } ${formatSymbolDisplay(fromTransfer.symbol)}`}</div>
        );
      } else {
        return <div>{DEFAULT_NULL_VALUE}</div>;
      }
    };
    if (status === TOrderStatus.Failed) {
      return (
        <div className={clsx('flex-row-center', styles['transfer-detail-failed'])}>
          <div className={clsx('flex-row-center', styles['detail-label'])}>
            <ErrorIcon />
            <span>Failed</span>
          </div>
          {value()}
        </div>
      );
    } else {
      return null;
    }
  }, [fromTransfer.amount, fromTransfer.status, fromTransfer.symbol, status, toTransfer.status]);

  return (
    <div className={styles['transfer-detail-main']}>
      {renderTransferDetailStep}
      {renderTopSucceed}
      {renderTopFailed}

      <div className={styles['detail-divider']} />
      <TransferDetailBody
        id={id}
        status={status}
        orderType={orderType}
        secondOrderType={secondOrderType}
        createTime={createTime}
        fromNetwork={fromTransfer.network}
        fromChainId={fromTransfer.chainId}
        fromSymbol={fromTransfer.symbol}
        fromIcon={fromTransfer?.icon}
        fromAddress={fromTransfer.fromAddress}
        fromToAddress={fromTransfer.toAddress}
        fromAmount={fromTransfer.amount}
        fromAmountUsd={fromTransfer?.amountUsd || ''}
        fromTxId={fromTransfer.txId}
        fromStatus={fromTransfer.status}
        toNetwork={toTransfer.network}
        toChainId={toTransfer.chainId}
        toSymbol={toTransfer.symbol}
        toIcon={toTransfer?.icon}
        toAddress={toTransfer.toAddress}
        toFromAddress={toTransfer.fromAddress}
        toAmount={toTransfer.amount}
        toAmountUsd={toTransfer.amountUsd || ''}
        toTxId={toTransfer.txId}
        toStatus={toTransfer.status}
        toFeeInfo={toTransfer.feeInfo}
      />
    </div>
  );
}
