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
import { CROSS_CHAIN_TRANSFER_PAGE_TITLE } from 'constants/crossChainTransfer';
import CommonSpace from 'components/CommonSpace';

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
        <div className="main-section-header">{CROSS_CHAIN_TRANSFER_PAGE_TITLE}</div>
        <CrossChainTransferForm
          form={form}
          formValidateData={formValidateData}
          minAmount={minAmount}
          amountUSD={amountUSD}
          balance={balance}
          transferInfo={transferInfo}
          onFromNetworkChanged={onFromNetworkChanged}
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
    receiveAmount,
    recipientAddress,
    tokenSymbol,
    transferInfo,
  ]);

  return (
    <>
      {fromWallet?.isConnected && (
        <ProcessingTip
          depositProcessingCount={depositProcessingCount}
          transferProcessingCount={transferProcessingCount}
          marginBottom={0}
          borderRadius={0}
          onClick={onClickProcessingTip}
        />
      )}
      <div className="main-content-container main-content-container-safe-area">
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
    </>
  );
}
