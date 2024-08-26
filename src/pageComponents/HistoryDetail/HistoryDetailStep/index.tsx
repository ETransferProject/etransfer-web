import { BusinessType, TransactionRecordStep } from 'types/api';
import styles from './styles.module.scss';
import { Steps } from 'antd';
import { useMemo } from 'react';

export interface HistoryDetailStepProps {
  orderType: BusinessType;
  currentStep: TransactionRecordStep;
  fromTransfer: {
    thirdPartConfirmingThreshold: number;
    thirdPartConfirmedNum: number;
    amount: string;
    symbol: string;
    chainId: string;
  };
  toTransfer: {
    thirdPartConfirmingThreshold: number;
    thirdPartConfirmedNum: number;
    amount: string;
    symbol: string;
    chainId: string;
  };
}

export default function HistoryDetailStep(props: HistoryDetailStepProps) {
  const items = useMemo(() => {
    return [
      {
        title: `${props.orderType} submitted`,
        description: `${props.fromTransfer.amount} ${props.fromTransfer.symbol}`,
      },
      {
        title: `${props.fromTransfer.chainId} Chain in progress(${props.fromTransfer.thirdPartConfirmingThreshold}/${props.fromTransfer.thirdPartConfirmedNum})`,
        description: `Requires ${props.fromTransfer.thirdPartConfirmedNum} confirmations`,
      },
      {
        title: `${props.toTransfer.chainId} Chain in progress`,
      },
      {
        title: 'Received',
        description: `${props.toTransfer.amount} ${props.toTransfer.symbol}`,
      },
    ];
  }, [
    props.fromTransfer.amount,
    props.fromTransfer.chainId,
    props.fromTransfer.symbol,
    props.fromTransfer.thirdPartConfirmedNum,
    props.fromTransfer.thirdPartConfirmingThreshold,
    props.orderType,
    props.toTransfer.amount,
    props.toTransfer.chainId,
    props.toTransfer.symbol,
  ]);

  return (
    <div className={styles['history-detail-step']}>
      <Steps current={props.currentStep} size="small" labelPlacement="vertical" items={items} />
    </div>
  );
}
