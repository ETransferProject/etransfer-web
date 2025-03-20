import { BusinessType, TransactionRecordStep } from 'types/api';
import styles from './styles.module.scss';
import { useMemo } from 'react';
import { formatSymbolDisplay } from 'utils/format';
import { BlockchainNetworkType } from 'constants/network';
import CommonSteps, { ICommonStepsProps } from 'components/CommonSteps';

export interface TransferDetailStepProps {
  orderType: BusinessType;
  secondOrderType: BusinessType;
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
  secondOrderType,
  currentStep,
  fromTransfer,
  toTransfer,
}: TransferDetailStepProps) {
  const stepItems = useMemo(() => {
    const items: ICommonStepsProps['stepItems'] = [
      {
        title: `${secondOrderType || orderType} submitted`,
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
        title: (secondOrderType || orderType) === BusinessType.Transfer ? 'Success' : 'Received',
        description:
          fromTransfer.symbol !== toTransfer.symbol
            ? `You will receive ${formatSymbolDisplay(toTransfer.symbol)}`
            : `${toTransfer.amount} ${formatSymbolDisplay(toTransfer.symbol)}`,
      },
    ];
    items.forEach((item, index) => {
      if (index === currentStep) {
        item.isLoading = true;
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
    secondOrderType,
    toTransfer.amount,
    toTransfer.network,
    toTransfer.symbol,
  ]);

  return (
    <div className={styles['transfer-detail-step']}>
      <CommonSteps stepItems={stepItems} current={currentStep} />
    </div>
  );
}
