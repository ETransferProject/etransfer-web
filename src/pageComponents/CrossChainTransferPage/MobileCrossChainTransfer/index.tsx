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
  amount?: string;
  receiveAmount: string;
  transferInfo: TCrossChainTransferInfo;
  isSubmitDisabled: boolean;
  recipientAddress?: string;
  onClickProcessingTip: () => void;
}

export default function MobileCrossChainTransfer({
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
          amountUSD={amountUSD}
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
        <CrossChainTransferFooter
          amount={amount}
          fromBalance={balance}
          recipientAddress={recipientAddress}
          estimateReceive={receiveAmount}
          estimateReceiveUnit={tokenSymbol}
          transactionFee={transferInfo.transactionFee}
          transactionFeeUnit={transferInfo.transactionUnit}
          tokenContractAddress={transferInfo.contractAddress}
          isSubmitDisabled={isSubmitDisabled}
        />
      </div>
    );
  }, [
    amount,
    amountUSD,
    balance,
    form,
    formValidateData,
    isSubmitDisabled,
    minAmount,
    onAmountBlur,
    onAmountChange,
    onClickMax,
    onFromNetworkChanged,
    onRecipientAddressBlur,
    onRecipientAddressChange,
    onTokenChanged,
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
