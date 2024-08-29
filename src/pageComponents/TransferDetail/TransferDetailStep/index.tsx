import { BusinessType, TransactionRecordStep } from 'types/api';
import styles from './styles.module.scss';
import { Steps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { useCommonState } from 'store/Provider/hooks';
import { formatSymbolDisplay } from 'utils/format';

export interface TransferDetailStepProps {
  orderType: BusinessType;
  currentStep: TransactionRecordStep;
  fromTransfer: {
    confirmingThreshold: number;
    confirmedNum: number;
    amount: string;
    symbol: string;
    chainId: string;
  };
  toTransfer: {
    amount: string;
    symbol: string;
    chainId: string;
  };
}

export default function TransferDetailStep(props: TransferDetailStepProps) {
  const { isPadPX } = useCommonState();
  const stepItems = useMemo(() => {
    const items = [
      {
        title: `${props.orderType} submitted`,
        description: `${props.fromTransfer.amount} ${formatSymbolDisplay(
          props.fromTransfer.symbol,
        )}`,
      },
      {
        title: `${props.fromTransfer.chainId} Chain in progress(${props.fromTransfer.confirmedNum}/${props.fromTransfer.confirmingThreshold})`,
        description: `Requires ${props.fromTransfer.confirmedNum} confirmations`,
      },
      {
        title: `${props.toTransfer.chainId} Chain in progress`,
      },
      {
        title: 'Received',
        description: `${props.toTransfer.amount} ${formatSymbolDisplay(props.toTransfer.symbol)}`,
      },
    ];
    items.forEach((item: any, index) => {
      if (index === props.currentStep) {
        item.icon = <LoadingOutlined />;
      }
    });
    return items;
  }, [
    props.currentStep,
    props.fromTransfer.amount,
    props.fromTransfer.chainId,
    props.fromTransfer.confirmedNum,
    props.fromTransfer.confirmingThreshold,
    props.fromTransfer.symbol,
    props.orderType,
    props.toTransfer.amount,
    props.toTransfer.chainId,
    props.toTransfer.symbol,
  ]);

  return (
    <div className={styles['transfer-detail-step']}>
      <Steps
        className={
          isPadPX
            ? styles['transfer-detail-step-vertical']
            : styles['transfer-detail-step-horizontal']
        }
        direction={isPadPX ? 'vertical' : 'horizontal'}
        labelPlacement={isPadPX ? 'horizontal' : 'vertical'}
        items={stepItems}
        current={props.currentStep}
        size="small"
      />
    </div>
  );
}
