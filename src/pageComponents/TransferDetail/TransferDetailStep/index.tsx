import { BusinessType, TransactionRecordStep } from 'types/api';
import styles from './styles.module.scss';
import { Steps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { useCommonState } from 'store/Provider/hooks';
import { formatSymbolDisplay } from 'utils/format';
import { BlockchainNetworkType } from 'constants/network';

export interface TransferDetailStepProps {
  orderType: BusinessType;
  currentStep: TransactionRecordStep;
  fromTransfer: {
    confirmingThreshold: number;
    confirmedNum: number;
    amount: string;
    symbol: string;
    network: string;
  };
  toTransfer: {
    amount: string;
    symbol: string;
    network: string;
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
        title: `${
          fromTransfer.network === BlockchainNetworkType.AELF ? 'aelf' : fromTransfer.network
        } Chain in progress(${fromTransfer.confirmedNum}/${fromTransfer.confirmingThreshold})`,
        description: `Requires ${fromTransfer.confirmedNum} confirmations`,
      },
      {
        title: `${
          toTransfer.network === BlockchainNetworkType.AELF ? 'aelf' : toTransfer.network
        } Chain in progress`,
      },
      {
        title: 'Received',
        description:
          fromTransfer.symbol !== toTransfer.symbol
            ? `You will receive ${formatSymbolDisplay(toTransfer.symbol)}`
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
    fromTransfer.confirmedNum,
    fromTransfer.confirmingThreshold,
    fromTransfer.network,
    fromTransfer.symbol,
    orderType,
    toTransfer.amount,
    toTransfer.network,
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
