import { useMemo } from 'react';
import styles from './styles.module.scss';
import CrossChainTransferForm, { CrossChainTransferFormProps } from '../CrossChainTransferForm';
import CrossChainTransferFooter from '../CrossChainTransferFooter';
import clsx from 'clsx';
import FAQ from 'components/FAQ';
import { FAQ_CROSS_CHAIN_TRANSFER } from 'constants/footer';
import { useCommonState, useCrossChainTransfer, useRecordsState } from 'store/Provider/hooks';
import { useWallet } from 'context/Wallet';
import { ProcessingTip } from 'components/Tips/ProcessingTip';
import { TCrossChainTransferInfo } from 'types/api';

export interface MobileCrossChainTransferProps extends CrossChainTransferFormProps {
  receiveAmount: string;
  transferInfo: TCrossChainTransferInfo;
  isSubmitDisabled: boolean;
  recipientAddress?: string;
  onClickProcessingTip: () => void;
}

export default function MobileCrossChainTransfer({
  form,
  formValidateData,
  receiveAmount,
  minAmount,
  balance,
  transferInfo,
  isSubmitDisabled,
  recipientAddress,
  getTransferData,
  onAmountChange,
  onRecipientAddressChange,
  onRecipientAddressBlur,
  onClickProcessingTip,
}: MobileCrossChainTransferProps) {
  const { isPadPX, isMobilePX } = useCommonState();
  const [{ fromWallet }] = useWallet();
  const { depositProcessingCount, transferProcessingCount } = useRecordsState();
  const { tokenSymbol } = useCrossChainTransfer();

  const renderDepositMainContent = useMemo(() => {
    return (
      <div className={clsx(styles['main-section'], styles['section'])}>
        <CrossChainTransferForm
          form={form}
          formValidateData={formValidateData}
          minAmount={minAmount}
          balance={balance}
          transferInfo={transferInfo}
          getTransferData={getTransferData}
          onAmountChange={onAmountChange}
          onRecipientAddressChange={onRecipientAddressChange}
          onRecipientAddressBlur={onRecipientAddressBlur}
        />
        <CrossChainTransferFooter
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
    balance,
    form,
    formValidateData,
    getTransferData,
    isSubmitDisabled,
    minAmount,
    onAmountChange,
    onRecipientAddressBlur,
    onRecipientAddressChange,
    receiveAmount,
    recipientAddress,
    tokenSymbol,
    transferInfo,
  ]);

  return (
    <div className="main-content-container main-content-container-safe-area">
      {fromWallet?.isConnected && (
        <ProcessingTip
          depositProcessingCount={depositProcessingCount}
          transferProcessingCount={transferProcessingCount}
          marginBottom={isPadPX && !isMobilePX ? 24 : 0}
          borderRadius={0}
          onClick={onClickProcessingTip}
        />
      )}

      {renderDepositMainContent}

      {isPadPX && !isMobilePX && (
        <>
          <div className={styles['divider']} />
          <FAQ
            className={clsx(styles['section'], styles['faq'])}
            title={FAQ_CROSS_CHAIN_TRANSFER.title}
            list={FAQ_CROSS_CHAIN_TRANSFER.list}
          />
        </>
      )}
    </div>
  );
}
