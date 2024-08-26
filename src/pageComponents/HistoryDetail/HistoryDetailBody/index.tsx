import TransferDetailBody from 'pageComponents/InfoPage/TransferDetail/TransferDetailBody';
import HistoryDetailStep from '../HistoryDetailStep';
import styles from './styles.module.scss';
import { TGetRecordDetailResult } from 'types/api';

export default function HistoryDetailBody(props: TGetRecordDetailResult) {
  return (
    <div className={styles['history-detail-body']}>
      <HistoryDetailStep
        orderType={props.orderType}
        currentStep={props.step.currentStep}
        fromTransfer={{
          thirdPartConfirmingThreshold: props.step.fromTransfer.thirdPartConfirmingThreshold,
          thirdPartConfirmedNum: props.step.fromTransfer.thirdPartConfirmedNum,
          amount: props.fromTransfer.amount,
          symbol: props.fromTransfer.symbol,
          chainId: props.fromTransfer.chainId || props.fromTransfer.network,
        }}
        toTransfer={{
          thirdPartConfirmingThreshold: props.step.toTransfer.thirdPartConfirmingThreshold,
          thirdPartConfirmedNum: props.step.toTransfer.thirdPartConfirmedNum,
          amount: props.toTransfer.amount,
          symbol: props.toTransfer.symbol,
          chainId: props.toTransfer.chainId || props.toTransfer.network,
        }}
      />
      <TransferDetailBody
        id={props.id}
        orderType={props.orderType}
        createTime={props.createTime}
        fromNetwork={props.fromTransfer.network}
        fromChainId={props.fromTransfer.chainId}
        fromSymbol={props.fromTransfer.symbol}
        fromAddress={props.fromTransfer.fromAddress}
        fromAmount={props.fromTransfer.amount}
        fromAmountUsd={props.fromTransfer?.amountUsd || ''}
        fromTxId={props.fromTransfer.txId}
        fromStatus={props.fromTransfer.status}
        toNetwork={props.toTransfer.network}
        toChainId={props.toTransfer.chainId}
        toSymbol={props.toTransfer.symbol}
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
