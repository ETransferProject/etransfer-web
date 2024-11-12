import { useMemo } from 'react';
import styles from './styles.module.scss';
import CrossChainTransferForm, { CrossChainTransferFormProps } from '../CrossChainTransferForm';
import CrossChainTransferFooter from '../CrossChainTransferFooter';
import clsx from 'clsx';
import FAQ from 'components/FAQ';
import { FAQ_CROSS_CHAIN_TRANSFER } from 'constants/footer';
import { useCommonState, useRecordsState } from 'store/Provider/hooks';
import useAelf from 'hooks/wallet/useAelf';
import { ProcessingTip } from 'components/Tips/ProcessingTip';
import { TCrossChainTransferInfo } from 'types/api';

export interface MobileCrossChainTransferProps extends CrossChainTransferFormProps {
  receiveAmount: string;
  transferInfo: TCrossChainTransferInfo;
  isSubmitDisabled: boolean;
  onClickProcessingTip: () => void;
}

export default function MobileCrossChainTransfer({
  form,
  formValidateData,
  receiveAmount,
  minAmount,
  transferInfo,
  isSubmitDisabled,
  getTransferData,
  onAmountChange,
  onRecipientAddressChange,
  onRecipientAddressBlur,
  onClickProcessingTip,
}: MobileCrossChainTransferProps) {
  const { isPadPX, isMobilePX } = useCommonState();
  const { isConnected } = useAelf(); // TODO
  const { depositProcessingCount, transferProcessingCount } = useRecordsState();

  const renderDepositMainContent = useMemo(() => {
    return (
      <div className={clsx(styles['main-section'], styles['section'])}>
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
    form,
    formValidateData,
    getTransferData,
    isSubmitDisabled,
    minAmount,
    onAmountChange,
    onRecipientAddressBlur,
    onRecipientAddressChange,
    receiveAmount,
    transferInfo.transactionFee,
  ]);

  return (
    <div className="main-content-container main-content-container-safe-area">
      {isConnected && (
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
