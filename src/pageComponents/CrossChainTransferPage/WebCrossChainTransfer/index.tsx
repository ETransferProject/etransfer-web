import { useMemo } from 'react';
import styles from './styles.module.scss';
import CrossChainTransferForm, { CrossChainTransferFormProps } from '../CrossChainTransferForm';
import CrossChainTransferFooter from '../CrossChainTransferFooter';
import clsx from 'clsx';
import FAQ from 'components/FAQ';
import { FAQ_CROSS_CHAIN_TRANSFER } from 'constants/footer';
import { ProcessingTip } from 'components/Tips/ProcessingTip';
import { useCrossChainTransfer, useRecordsState } from 'store/Provider/hooks';
import { TCrossChainTransferInfo } from 'types/api';
import { CROSS_CHAIN_TRANSFER_PAGE_TITLE } from 'constants/crossChainTransfer';
import CommonSpace from 'components/CommonSpace';

export interface WebCrossChainTransferProps extends CrossChainTransferFormProps {
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

export default function WebCrossChainTransfer({
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
  recipientAddress,
  comment,
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
  clickSuccessOk,
  clickFailedOk,
}: WebCrossChainTransferProps) {
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
        <ProcessingTip
          depositProcessingCount={depositProcessingCount}
          transferProcessingCount={transferProcessingCount}
          onClick={onClickProcessingTip}
        />
        <div className="main-section-header">{CROSS_CHAIN_TRANSFER_PAGE_TITLE}</div>

        <CrossChainTransferForm
          form={form}
          formValidateData={formValidateData}
          amountUSD={amountUSD}
          minAmount={minAmount}
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
          formValidateData={formValidateData}
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
    depositProcessingCount,
    form,
    formValidateData,
    isSubmitDisabled,
    isTransactionFeeLoading,
    isUseRecipientAddress,
    minAmount,
    onAmountBlur,
    onAmountChange,
    onClickMax,
    onClickProcessingTip,
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
    transferProcessingCount,
  ]);

  return (
    <div className="content-container flex-row">
      <div className={styles['main-container']}>
        <div className={styles['main-wrapper']}>{renderDepositMainContent}</div>
      </div>
      <div className={clsx('flex-row', styles['faq-wrapper'])}>
        <FAQ
          className={styles['faq']}
          title={FAQ_CROSS_CHAIN_TRANSFER.title}
          list={FAQ_CROSS_CHAIN_TRANSFER.list}
        />
      </div>
    </div>
  );
}
