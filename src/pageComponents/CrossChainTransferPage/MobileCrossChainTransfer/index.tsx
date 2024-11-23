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
  isTransactionFeeLoading: boolean;
  isUseRecipientAddress?: boolean;
  recipientAddress?: string;
  comment?: string;
  decimalsFromWallet?: string | number;
  onClickProcessingTip: () => void;
  clickFailedOk: () => void;
  clickSuccessOk: () => void;
}

export default function MobileCrossChainTransfer({
  form,
  formValidateData,
  amount,
  amountUSD,
  balance,
  decimalsFromWallet,
  minAmount,
  receiveAmount,
  transferInfo,
  isSubmitDisabled,
  isTransactionFeeLoading,
  isUseRecipientAddress,
  comment,
  recipientAddress,
  onFromNetworkChanged,
  onToNetworkChanged,
  onTokenChanged,
  onAmountChange,
  onAmountBlur,
  onClickMax,
  onUseRecipientChanged,
  onRecipientAddressChange,
  onRecipientAddressBlur,
  onClickProcessingTip,
  clickFailedOk,
  clickSuccessOk,
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
          onToNetworkChanged={onToNetworkChanged}
          onTokenChanged={onTokenChanged}
          onAmountChange={onAmountChange}
          onAmountBlur={onAmountBlur}
          onClickMax={onClickMax}
          onUseRecipientChanged={onUseRecipientChanged}
          onRecipientAddressChange={onRecipientAddressChange}
          onRecipientAddressBlur={onRecipientAddressBlur}
        />
        <CommonSpace direction={'vertical'} size={40} />
        <CrossChainTransferFooter
          amount={amount}
          fromBalance={balance}
          decimalsFromWallet={decimalsFromWallet}
          isUseRecipientAddress={isUseRecipientAddress}
          recipientAddress={recipientAddress}
          comment={comment}
          transferInfo={transferInfo}
          estimateReceive={receiveAmount}
          estimateReceiveUnit={tokenSymbol}
          transactionFee={transferInfo.transactionFee}
          transactionFeeUnit={transferInfo.transactionUnit}
          tokenContractAddress={transferInfo.contractAddress}
          isSubmitDisabled={isSubmitDisabled}
          isTransactionFeeLoading={isTransactionFeeLoading}
          clickFailedOk={clickFailedOk}
          clickSuccessOk={clickSuccessOk}
        />
      </div>
    );
  }, [
    amount,
    amountUSD,
    balance,
    clickFailedOk,
    clickSuccessOk,
    comment,
    decimalsFromWallet,
    form,
    formValidateData,
    isSubmitDisabled,
    isTransactionFeeLoading,
    isUseRecipientAddress,
    minAmount,
    onAmountBlur,
    onAmountChange,
    onClickMax,
    onFromNetworkChanged,
    onRecipientAddressBlur,
    onRecipientAddressChange,
    onToNetworkChanged,
    onTokenChanged,
    onUseRecipientChanged,
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
