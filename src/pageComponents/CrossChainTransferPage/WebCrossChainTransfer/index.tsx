import { useMemo } from 'react';
import styles from './styles.module.scss';
import CrossChainTransferForm, { CrossChainTransferFormProps } from '../CrossChainTransferForm';
import CrossChainTransferFooter from '../CrossChainTransferFooter';
import clsx from 'clsx';
import FAQ from 'components/FAQ';
import { FAQ_CROSS_CHAIN_TRANSFER } from 'constants/footer';
import { ProcessingTip } from 'components/Tips/ProcessingTip';
import useAelf from 'hooks/wallet/useAelf';
import { useRecordsState } from 'store/Provider/hooks';
import { TCrossChainTransferInfo } from 'types/api';
export interface WebCrossChainTransferProps extends CrossChainTransferFormProps {
  receiveAmount?: string;
  transferInfo: TCrossChainTransferInfo;
  isSubmitDisabled: boolean;
  onClickProcessingTip: () => void;
}

export default function WebCrossChainTransfer({
  form,
  formValidateData,
  receiveAmount,
  transferInfo,
  minAmount,
  isSubmitDisabled,
  getTransferData,
  onAmountChange,
  onRecipientAddressChange,
  onRecipientAddressBlur,
  onClickProcessingTip,
}: WebCrossChainTransferProps) {
  const { isConnected } = useAelf(); // TODO
  const { depositProcessingCount, transferProcessingCount } = useRecordsState();

  const renderDepositMainContent = useMemo(() => {
    return (
      <div
        className={clsx(
          'main-content-container',
          'main-content-container-safe-area',
          styles['main-content'],
        )}>
        {isConnected && (
          <ProcessingTip
            depositProcessingCount={depositProcessingCount}
            transferProcessingCount={transferProcessingCount}
            onClick={onClickProcessingTip}
          />
        )}

        <div className={styles['transfer-title']}>Cross-chain Transfer</div>

        <CrossChainTransferForm
          form={form}
          formValidateData={formValidateData}
          minAmount={minAmount}
          getTransferData={getTransferData}
          onAmountChange={onAmountChange}
          onRecipientAddressChange={onRecipientAddressChange}
          onRecipientAddressBlur={onRecipientAddressBlur}
        />
        <CrossChainTransferFooter
          recipientAddress={''}
          estimateReceive={receiveAmount}
          transactionFee={transferInfo.transactionFee}
          isSubmitDisabled={isSubmitDisabled}
        />
      </div>
    );
  }, [
    depositProcessingCount,
    form,
    formValidateData,
    getTransferData,
    isConnected,
    isSubmitDisabled,
    minAmount,
    onAmountChange,
    onClickProcessingTip,
    onRecipientAddressBlur,
    onRecipientAddressChange,
    receiveAmount,
    transferInfo.transactionFee,
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
