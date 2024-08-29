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

export default function TransferDetailStep({
  orderType,
  currentStep,
  fromTransfer,
  toTransfer,
}: TransferDetailStepProps) {
  const { isPadPX } = useCommonState();
  const stepItems = useMemo(() => {
    const items = [
      {
        title: `${orderType} submitted`,
        description: `${fromTransfer.amount} ${formatSymbolDisplay(fromTransfer.symbol)}`,
      },
      {
        title: `${fromTransfer.chainId} Chain in progress(${fromTransfer.confirmedNum}/${fromTransfer.confirmingThreshold})`,
        description: `Requires ${fromTransfer.confirmedNum} confirmations`,
      },
      {
        title: `${toTransfer.chainId} Chain in progress`,
      },
      {
        title: 'Received',
        description:
          fromTransfer.symbol !== toTransfer.symbol
            ? `You will receive ${toTransfer.symbol}`
            : `${toTransfer.amount} ${formatSymbolDisplay(toTransfer.symbol)}`,
      },
    ];
    items.forEach((item: any, index) => {
      if (index === currentStep) {
        item.icon = <LoadingOutlined />;
      }
    });
    return items;
  }, [
    currentStep,
    fromTransfer.amount,
    fromTransfer.chainId,
    fromTransfer.confirmedNum,
    fromTransfer.confirmingThreshold,
    fromTransfer.symbol,
    orderType,
    toTransfer.amount,
    toTransfer.chainId,
    toTransfer.symbol,
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
        current={currentStep}
        size="small"
      />
    </div>
  );
}
