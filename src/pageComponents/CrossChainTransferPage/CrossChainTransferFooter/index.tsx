import CommonButton from 'components/CommonButton';
import styles from './styles.module.scss';
import { useCallback, useMemo } from 'react';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import {
  BUTTON_TEXT_CONNECT_WALLET,
  BUTTON_TEXT_INSUFFICIENT_FUNDS,
  BUTTON_TEXT_TRANSFER,
} from 'constants/crossChainTransfer';
import { handleErrorMessage, ZERO } from '@etransfer/utils';
import { Form } from 'antd';
import clsx from 'clsx';
import { useCrossChainTransfer } from 'store/Provider/hooks';
import { useWallet } from 'context/Wallet';
import { useAuthToken } from 'hooks/wallet/authToken';
import { createTransferOrder, updateTransferOrder } from 'utils/api/transfer';
import { SingleMessage } from '@etransfer/ui-react';
import { WalletTypeEnum } from 'context/Wallet/types';
import {
  SendEVMTransactionParams,
  SendSolanaTransactionParams,
  SendTONTransactionParams,
  SendTRONTransactionParams,
} from 'types/wallet';
import { EVM_USDT_ABI } from 'constants/wallet/EVM';

export interface CrossChainTransferFooterProps {
  className?: string;
  recipientAddress?: string;
  amount?: string;
  fromBalance?: string;
  estimateReceive?: string;
  estimateReceiveUnit?: string;
  transactionFee?: string;
  transactionFeeUnit?: string;
  tokenContractAddress?: string;
  isSubmitDisabled: boolean;
}

export default function CrossChainTransferFooter({
  className,
  recipientAddress,
  amount,
  fromBalance,
  estimateReceive = DEFAULT_NULL_VALUE,
  estimateReceiveUnit = '',
  transactionFee = DEFAULT_NULL_VALUE,
  transactionFeeUnit = '',
  tokenContractAddress,
  isSubmitDisabled,
}: CrossChainTransferFooterProps) {
  const { fromNetwork, fromWalletType, tokenSymbol, toNetwork, toWalletType } =
    useCrossChainTransfer();
  const [{ fromWallet, toWallet }] = useWallet();
  const { getAuthToken } = useAuthToken();

  const onConnectWallet = useCallback(() => {
    console.log('onConnectWallet');
  }, []);

  const onTransfer = useCallback(async () => {
    try {
      const toAddress =
        toWalletType && toWallet?.isConnected && toWallet?.account
          ? toWallet?.account
          : recipientAddress;

      if (
        !fromWallet?.isConnected ||
        (!toWallet?.isConnected && !!recipientAddress) ||
        !amount ||
        !fromWallet?.account ||
        !toAddress
      )
        return;

      if (fromWallet.walletType === WalletTypeEnum.AELF) {
        // aelf logic
      } else {
        // get etransfer jwt
        const authToken = await getAuthToken();

        // create order id
        const orderResult = await createTransferOrder(
          {
            amount: amount,
            fromNetwork: fromNetwork?.network,
            toNetwork: toNetwork?.network,
            fromSymbol: tokenSymbol,
            toSymbol: tokenSymbol,
            fromAddress: fromWallet?.account,
            toAddress,
          },
          authToken,
        );
        console.log('>>>>>> orderResult', orderResult);

        let params:
          | SendEVMTransactionParams
          | SendSolanaTransactionParams
          | SendTONTransactionParams
          | SendTRONTransactionParams;
        if (fromWallet.walletType === WalletTypeEnum.EVM) {
          params = {
            network: fromNetwork?.network,
            tokenContractAddress: tokenContractAddress,
            toAddress: orderResult.address,
            tokenAbi: EVM_USDT_ABI, // TODO
            amount: amount, // TODO
            decimals: 6, // TODO
          } as SendEVMTransactionParams;
        } else if (fromWallet.walletType === WalletTypeEnum.SOL) {
          params = {
            tokenContractAddress: tokenContractAddress,
            toAddress: orderResult.address,
            amount: amount, // TODO
            decimals: 6, // TODO
          } as SendSolanaTransactionParams;
        } else if (fromWallet.walletType === WalletTypeEnum.TON) {
          params = {
            tokenContractAddress: tokenContractAddress,
            toAddress: orderResult.address,
            amount: Number(amount), // TODO
            forwardTonAmount: '', // TODO
          } as SendTONTransactionParams;
        } else {
          params = {
            tokenContractAddress: tokenContractAddress,
            toAddress: orderResult.address,
            amount: Number(amount), // TODO
          } as SendTRONTransactionParams;
        }

        const sendTransferResult = await fromWallet?.sendTransaction(params);
        console.log('>>>>>> sendTransferResult', sendTransferResult);

        const updateOrderResult = await updateTransferOrder(
          {
            amount: amount,
            fromNetwork: fromNetwork?.network,
            toNetwork: toNetwork?.network,
            fromSymbol: tokenSymbol,
            toSymbol: tokenSymbol,
            fromAddress: fromWallet?.account,
            toAddress,
            address: orderResult.address,
            txId: sendTransferResult, // TODO sol ton tron
          },
          orderResult.orderId,
          authToken,
        );
        console.log('>>>>>> sendTransferResult updateOrderResult', updateOrderResult);
      }
    } catch (error) {
      SingleMessage.error(handleErrorMessage(error));
    }
  }, [
    amount,
    fromNetwork?.network,
    fromWallet,
    getAuthToken,
    recipientAddress,
    toNetwork?.network,
    toWallet?.account,
    toWallet?.isConnected,
    toWalletType,
    tokenContractAddress,
    tokenSymbol,
  ]);

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
    if (amount) {
      if (!fromBalance || ZERO.plus(fromBalance).lt(amount)) {
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
      disabled: recipientAddress ? isSubmitDisabled : false,
      loading,
    };
  }, [
    amount,
    fromBalance,
    fromWalletType,
    isSubmitDisabled,
    onConnectWallet,
    onTransfer,
    recipientAddress,
    toWalletType,
  ]);

  return (
    <div className={clsx(styles['cross-chain-transfer-footer'], className)}>
      {amount && (
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
