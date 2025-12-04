import { useMemo } from 'react';
import styles from './styles.module.scss';
import WithdrawForm, { WithdrawFormProps } from '../WithdrawForm';
import WithdrawFooter from '../WithdrawFooter';
import clsx from 'clsx';
import FAQ from 'components/FAQ';
import { FAQ_WITHDRAW } from 'constants/footer';
import { ProcessingTip } from 'components/Tips/ProcessingTip';
import { useWithdrawNewState, useRecordsState } from 'store/Provider/hooks';
import { TCrossChainTransferInfo } from 'types/api';
import { WITHDRAW_PAGE_TITLE } from 'constants/withdraw';

export interface WebWithdrawProps extends WithdrawFormProps {
  withdrawAddress?: string;
  amount?: string;
  receiveAmount: string;
  transferInfo: TCrossChainTransferInfo;
  isSubmitDisabled: boolean;
  isTransactionFeeLoading: boolean;
  comment?: string;
  decimalsFromWallet?: string | number;
  onClickProcessingTip: () => void;
  clickFailedOk: () => void;
  clickSuccessOk: () => void;
}

export default function WebWithdraw({
  form,
  formValidateData,
  withdrawAddress,
  amount,
  balance,
  minAmount,
  receiveAmount,
  transferInfo,
  isSubmitDisabled,
  isTransactionFeeLoading,
  comment,
  decimalsFromWallet,
  onFromNetworkChanged,
  onToNetworkChanged,
  onTokenChanged,
  onAmountChange,
  onAmountBlur,
  onClickMax,
  onClickProcessingTip,
  clickSuccessOk,
  clickFailedOk,
  onWithdrawAddressChange,
  onWithdrawAddressBlur,
}: WebWithdrawProps) {
  const { depositProcessingCount, transferProcessingCount } = useRecordsState();
  const { tokenSymbol } = useWithdrawNewState();

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
        <div className="main-section-header">{WITHDRAW_PAGE_TITLE}</div>

        <WithdrawForm
          form={form}
          formValidateData={formValidateData}
          minAmount={minAmount}
          balance={balance}
          transferInfo={transferInfo}
          onFromNetworkChanged={onFromNetworkChanged}
          onToNetworkChanged={onToNetworkChanged}
          onTokenChanged={onTokenChanged}
          onAmountChange={onAmountChange}
          onAmountBlur={onAmountBlur}
          onClickMax={onClickMax}
          onWithdrawAddressChange={onWithdrawAddressChange}
          onWithdrawAddressBlur={onWithdrawAddressBlur}
        />

        <WithdrawFooter
          formValidateData={formValidateData}
          withdrawAddress={withdrawAddress}
          amount={amount}
          fromBalance={balance}
          decimalsFromWallet={decimalsFromWallet}
          tokenContractAddress={transferInfo.contractAddress}
          comment={comment}
          transferInfo={transferInfo}
          estimateReceive={receiveAmount}
          estimateReceiveUnit={tokenSymbol}
          transactionFee={transferInfo.transactionFee}
          transactionFeeUnit={transferInfo.transactionUnit}
          isSubmitDisabled={isSubmitDisabled}
          isTransactionFeeLoading={isTransactionFeeLoading}
          clickFailedOk={clickFailedOk}
          clickSuccessOk={clickSuccessOk}
        />
      </div>
    );
  }, [
    amount,
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
    minAmount,
    onAmountBlur,
    onAmountChange,
    onClickMax,
    onClickProcessingTip,
    onFromNetworkChanged,
    onToNetworkChanged,
    onTokenChanged,
    onWithdrawAddressBlur,
    onWithdrawAddressChange,
    receiveAmount,
    tokenSymbol,
    transferInfo,
    transferProcessingCount,
    withdrawAddress,
  ]);

  return (
    <div className="content-container flex-row">
      <div className={styles['main-container']}>
        <div className={styles['main-wrapper']}>{renderDepositMainContent}</div>
      </div>
      <div className={clsx('flex-row', styles['faq-wrapper'])}>
        <FAQ className={styles['faq']} title={FAQ_WITHDRAW.title} list={FAQ_WITHDRAW.list} />
      </div>
    </div>
  );
}
