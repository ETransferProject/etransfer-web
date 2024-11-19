import CommonButton from 'components/CommonButton';
import styles from './styles.module.scss';
import { useCallback, useMemo } from 'react';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import {
  BUTTON_TEXT_CONNECT_WALLET,
  BUTTON_TEXT_INSUFFICIENT_FUNDS,
  BUTTON_TEXT_TRANSFER,
} from 'constants/crossChainTransfer';
import { ZERO } from '@etransfer/utils';
import { Form } from 'antd';
import clsx from 'clsx';
import { useCrossChainTransfer } from 'store/Provider/hooks';

export interface CrossChainTransferFooterProps {
  className?: string;
  recipientAddress?: string;
  fromInput?: string;
  fromBalance?: string;
  estimateReceive?: string;
  estimateReceiveUnit?: string;
  transactionFee?: string;
  transactionFeeUnit?: string;
  isSubmitDisabled: boolean;
}

export default function CrossChainTransferFooter({
  className,
  recipientAddress,
  fromInput,
  fromBalance,
  estimateReceive = DEFAULT_NULL_VALUE,
  estimateReceiveUnit = '',
  transactionFee = DEFAULT_NULL_VALUE,
  transactionFeeUnit = '',
  isSubmitDisabled,
}: CrossChainTransferFooterProps) {
  const { fromWalletType, toWalletType } = useCrossChainTransfer();

  const onConnectWallet = useCallback(() => {
    console.log('onConnectWallet');
  }, []);

  const onTransfer = useCallback(() => {
    console.log('onTransfer');
  }, []);

  const btnProps = useMemo(() => {
    const disabled = true,
      loading = false;
    if (!fromWalletType) {
      return {
        children: BUTTON_TEXT_CONNECT_WALLET,
        onClick: onConnectWallet,
        disabled: false,
        loading,
      };
    }
    if (!toWalletType && !recipientAddress) {
      return {
        children: BUTTON_TEXT_CONNECT_WALLET,
        onClick: onConnectWallet,
        disabled: false,
        loading,
      };
    }
    if (fromInput) {
      if (!fromBalance || ZERO.plus(fromBalance).lt(fromInput)) {
        return {
          children: BUTTON_TEXT_INSUFFICIENT_FUNDS,
          onClick: undefined,
          disabled,
          loading,
        };
      }
    }
    return {
      children: BUTTON_TEXT_TRANSFER,
      onClick: onTransfer,
      disabled: isSubmitDisabled,
      loading,
    };
  }, [
    fromBalance,
    fromInput,
    fromWalletType,
    isSubmitDisabled,
    onConnectWallet,
    onTransfer,
    recipientAddress,
    toWalletType,
  ]);

  return (
    <div className={clsx(styles['cross-chain-transfer-footer'], className)}>
      {fromInput && (
        <div className={styles['cross-chain-transfer-footer-info']}>
          <div className={clsx('flex-row-center', styles['you-will-receive'])}>
            <span>{`You'll receive:`}&nbsp;</span>
            <span className={styles['you-will-receive-value']}>
              {estimateReceive ? `${estimateReceive} ${estimateReceiveUnit}` : DEFAULT_NULL_VALUE}
            </span>
          </div>
          <div className={clsx('flex-row-center', styles['transaction-fee'])}>
            <span>{`transaction fee:`}&nbsp;</span>
            <span className={styles['transaction-fee-value']}>
              {transactionFee ? `${transactionFee} ${transactionFeeUnit}` : DEFAULT_NULL_VALUE}
            </span>
          </div>
        </div>
      )}

      <Form.Item
        shouldUpdate
        className={clsx('flex-none', styles['transfer-submit-button-wrapper'])}>
        <CommonButton className={styles['transfer-submit-button']} {...btnProps}>
          {btnProps.children}
        </CommonButton>
      </Form.Item>
    </div>
  );
}
