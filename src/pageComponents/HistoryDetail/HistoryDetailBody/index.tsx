import TransferDetailBody from 'pageComponents/InfoPage/TransferDetail/TransferDetailBody';
import HistoryDetailStep from '../HistoryDetailStep';
import styles from './styles.module.scss';
import { TGetRecordDetailResult } from 'types/api';
import { TransferStatusType } from 'constants/infoDashboard';

export default function HistoryDetailBody(props: TGetRecordDetailResult) {
  return (
    <div className={styles['history-detail-body']}>
      <HistoryDetailStep {...props.step} />
      <TransferDetailBody
        orderType={props.orderType}
        createTime={props.createTime}
        fromNetwork={props.fromTransfer.network}
        fromChainId={props.fromTransfer.chainId}
        fromSymbol={props.fromTransfer.symbol}
        fromAddress={props.fromTransfer.fromAddress}
        fromAmount={props.fromTransfer.amount}
        fromAmountUsd={props.fromTransfer?.amountUsd || ''}
        fromTxId={props.fromTransfer.txId}
        fromStatus={props.fromTransfer.status as TransferStatusType} // TODO
        toNetwork={props.toTransfer.network}
        toChainId={props.toTransfer.chainId}
        toSymbol={props.toTransfer.symbol}
        toAddress={props.toTransfer.toAddress}
        toAmount={props.toTransfer.amount}
        toAmountUsd={props.toTransfer.amountUsd || ''}
        toTxId={props.toTransfer.txId}
        toStatus={props.toTransfer.status as TransferStatusType} // TODO
        toFeeInfo={props.toTransfer.feeInfo}
      />
    </div>
  );
}
