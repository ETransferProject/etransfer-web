import CommonButton from 'components/CommonButton';
import styles from './styles.module.scss';
import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import { useWallet } from 'context/Wallet';
import {
  BUTTON_TEXT_CONNECT_WALLET,
  BUTTON_TEXT_INSUFFICIENT_FUNDS,
  BUTTON_TEXT_NOT_ENOUGH_NATIVE_FOR_GAS,
  BUTTON_TEXT_TRANSFER,
} from 'constants/crossChainTransfer';
import { ZERO } from '@etransfer/utils';
import { Form } from 'antd';
import clsx from 'clsx';

export interface CrossChainTransferFooterProps {
  recipientAddress: string;
  fromInput?: string;
  fromBalance?: string;
}

export default function CrossChainTransferFooter({
  recipientAddress,
  fromInput,
  fromBalance,
}: CrossChainTransferFooterProps) {
  const [{ fromWalletType, toWalletType }, { dispatch }] = useWallet();
  const [estimateReceive, setEstimateReceive] = useState<string>(DEFAULT_NULL_VALUE);
  const [transactionFee, setTransactionFee] = useState<string>(DEFAULT_NULL_VALUE);
  const [isShowTxnFeeEnoughTip, setIsShowTxnFeeEnoughTip] = useState<boolean>(false);

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
    if (!toWalletType || !recipientAddress) {
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
      if (isShowTxnFeeEnoughTip) {
        return {
          children: BUTTON_TEXT_NOT_ENOUGH_NATIVE_FOR_GAS,
          onClick: undefined,
          disabled,
          loading,
        };
      }
    }
    return {
      children: BUTTON_TEXT_TRANSFER,
      onClick: onTransfer,
      disabled: false,
      loading,
    };
  }, [
    fromBalance,
    fromInput,
    fromWalletType,
    isShowTxnFeeEnoughTip,
    onConnectWallet,
    onTransfer,
    recipientAddress,
    toWalletType,
  ]);

  return (
    <div className={styles['cross-chain-transfer-footer']}>
      <div className="flex-row-center-between">
        <span>{`You'll receive`}</span>
        <span>{estimateReceive}</span>
      </div>
      <div className="flex-row-center-between">
        <span>{`transaction fee`}</span>
        <span>{transactionFee}</span>
      </div>

      <Form.Item shouldUpdate className={clsx('flex-none', styles['form-submit-button-wrapper'])}>
        <CommonButton className={styles['form-submit-button']} {...btnProps}>
          {btnProps.children}
        </CommonButton>
      </Form.Item>
    </div>
  );
}
