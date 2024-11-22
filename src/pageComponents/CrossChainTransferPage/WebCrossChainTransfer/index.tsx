import { useMemo } from 'react';
import styles from './styles.module.scss';
import CrossChainTransferForm, { CrossChainTransferFormProps } from '../CrossChainTransferForm';
import CrossChainTransferFooter from '../CrossChainTransferFooter';
import clsx from 'clsx';
import FAQ from 'components/FAQ';
import { FAQ_CROSS_CHAIN_TRANSFER } from 'constants/footer';
import { ProcessingTip } from 'components/Tips/ProcessingTip';
import { useWallet } from 'context/Wallet';
import { useCrossChainTransfer, useRecordsState } from 'store/Provider/hooks';
import { TCrossChainTransferInfo } from 'types/api';
import { CROSS_CHAIN_TRANSFER_PAGE_TITLE } from 'constants/crossChainTransfer';
import CommonSpace from 'components/CommonSpace';

export interface WebCrossChainTransferProps extends CrossChainTransferFormProps {
  amount?: string;
  receiveAmount?: string;
  transferInfo: TCrossChainTransferInfo;
  isSubmitDisabled: boolean;
  recipientAddress?: string;
  onClickProcessingTip: () => void;
}

export default function WebCrossChainTransfer({
  form,
  formValidateData,
  amount,
  amountUSD,
  balance,
  minAmount,
  receiveAmount,
  transferInfo,
  isSubmitDisabled,
  recipientAddress,
  onFromNetworkChanged,
  onTokenChanged,
  onAmountChange,
  onAmountBlur,
  onClickMax,
  onRecipientAddressChange,
  onRecipientAddressBlur,
  onClickProcessingTip,
}: WebCrossChainTransferProps) {
  const [{ fromWallet }] = useWallet();
  const { depositProcessingCount, transferProcessingCount } = useRecordsState();
  const { tokenSymbol } = useCrossChainTransfer();

  const renderDepositMainContent = useMemo(() => {
    return (
      <div
        className={clsx(
          'main-content-container',
          'main-content-container-safe-area',
          styles['main-content'],
        )}>
        {fromWallet?.isConnected && (
          <ProcessingTip
            depositProcessingCount={depositProcessingCount}
            transferProcessingCount={transferProcessingCount}
            onClick={onClickProcessingTip}
          />
        )}

        <div className={styles['transfer-title']}>{CROSS_CHAIN_TRANSFER_PAGE_TITLE}</div>

        <CrossChainTransferForm
          form={form}
          formValidateData={formValidateData}
          amountUSD={amountUSD}
          minAmount={minAmount}
          balance={balance}
          transferInfo={transferInfo}
          onFromNetworkChanged={onFromNetworkChanged}
          onTokenChanged={onTokenChanged}
          onAmountChange={onAmountChange}
          onAmountBlur={onAmountBlur}
          onClickMax={onClickMax}
          onRecipientAddressChange={onRecipientAddressChange}
          onRecipientAddressBlur={onRecipientAddressBlur}
        />
        <CommonSpace direction={'vertical'} size={40} />
        <CrossChainTransferFooter
          amount={amount}
          fromBalance={balance}
          recipientAddress={recipientAddress}
          estimateReceive={receiveAmount}
          estimateReceiveUnit={tokenSymbol}
          transactionFee={transferInfo.transactionFee}
          transactionFeeUnit={transferInfo.transactionUnit}
          isSubmitDisabled={isSubmitDisabled}
        />
      </div>
    );
  }, [
    amount,
    amountUSD,
    balance,
    depositProcessingCount,
    form,
    formValidateData,
    fromWallet?.isConnected,
    isSubmitDisabled,
    minAmount,
    onAmountBlur,
    onAmountChange,
    onClickMax,
    onClickProcessingTip,
    onFromNetworkChanged,
    onRecipientAddressBlur,
    onRecipientAddressChange,
    onTokenChanged,
    receiveAmount,
    recipientAddress,
    tokenSymbol,
    transferInfo,
    transferProcessingCount,
  ]);

  return (
    <div className="content-container flex-row">
      <div className={styles['main-container']}>
        <div className={styles['main-wrapper']}>{renderDepositMainContent}</div>
      </div>
      <div className={clsx('flex-row', styles['faq-wrapper'])}>
        <div className={styles['faq-left']}></div>
        <FAQ
          className={styles['faq']}
          title={FAQ_CROSS_CHAIN_TRANSFER.title}
          list={FAQ_CROSS_CHAIN_TRANSFER.list}
        />
      </div>
    </div>
  );
}
