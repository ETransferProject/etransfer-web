import { BusinessType, TransactionRecordStep } from 'types/api';
import styles from './styles.module.scss';
import { Steps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { useCommonState } from 'store/Provider/hooks';

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
  const { isPadPX } = useCommonState();
  const stepItems = useMemo(() => {
    const items = [
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
    items.forEach((item: any, index) => {
      if (index + 1 === props.currentStep) {
        item.icon = <LoadingOutlined />;
      }
    });
    return items;
  }, [
    props.currentStep,
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
      <Steps
        className={
          isPadPX
            ? styles['history-detail-step-vertical']
            : styles['history-detail-step-horizontal']
        }
        direction={isPadPX ? 'vertical' : 'horizontal'}
        labelPlacement={isPadPX ? 'horizontal' : 'vertical'}
        items={stepItems}
        current={props.currentStep - 1}
        size="small"
      />
    </div>
  );
}
