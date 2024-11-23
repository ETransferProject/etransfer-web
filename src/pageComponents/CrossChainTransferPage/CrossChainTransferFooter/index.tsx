import CommonButton from 'components/CommonButton';
import styles from './styles.module.scss';
import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import {
  BUTTON_TEXT_CONNECT_WALLET,
  BUTTON_TEXT_INSUFFICIENT_FUNDS,
  BUTTON_TEXT_TRANSFER,
  DEFAULT_SEND_TRANSFER_ERROR,
  ErrorNameType,
  SEND_TRANSFER_ERROR_CODE_LIST,
} from 'constants/crossChainTransfer';
import { sleep, ZERO } from '@etransfer/utils';
import { Form } from 'antd';
import clsx from 'clsx';
import { useCrossChainTransfer, useLoading } from 'store/Provider/hooks';
import { useWallet } from 'context/Wallet';
import { useAuthToken } from 'hooks/wallet/authToken';
import { createTransferOrder, updateTransferOrder } from 'utils/api/transfer';
import { WalletTypeEnum } from 'context/Wallet/types';
import {
  SendEVMTransactionParams,
  SendSolanaTransactionParams,
  SendTONTransactionParams,
  SendTRONTransactionParams,
} from 'types/wallet';
import { EVM_USDT_ABI } from 'constants/wallet/EVM';
import DoubleCheckModal from './DoubleCheckModal';
import SuccessModal from './SuccessModal';
import FailModal from './FailModal';
import { TCrossChainTransferInfo } from 'types/api';
import myEvents from 'utils/myEvent';
import { useSendTxnFromAelfChain } from 'hooks/crossChainTransfer';

export interface CrossChainTransferFooterProps {
  className?: string;
  isUseRecipientAddress?: boolean;
  recipientAddress?: string;
  comment?: string;
  amount?: string;
  fromBalance?: string;
  transferInfo: TCrossChainTransferInfo;
  estimateReceive?: string;
  estimateReceiveUnit?: string;
  transactionFee?: string;
  transactionFeeUnit?: string;
  tokenContractAddress?: string;
  isSubmitDisabled: boolean;
  isTransactionFeeLoading: boolean;
  clickFailedOk: () => void;
  clickSuccessOk: () => void;
}

interface ISuccessData {
  amount: string;
  symbol: string;
  receiveAmount: string;
  receiveAmountUsd: string;
}

export default function CrossChainTransferFooter({
  className,
  isUseRecipientAddress = false,
  recipientAddress = '',
  comment,
  amount,
  fromBalance,
  transferInfo,
  estimateReceive = DEFAULT_NULL_VALUE,
  estimateReceiveUnit = '',
  transactionFee = DEFAULT_NULL_VALUE,
  transactionFeeUnit = '',
  tokenContractAddress,
  isSubmitDisabled,
  isTransactionFeeLoading,
  clickFailedOk,
  clickSuccessOk,
}: CrossChainTransferFooterProps) {
  const { setLoading } = useLoading();
  const { fromNetwork, fromWalletType, tokenSymbol, toNetwork, toWalletType } =
    useCrossChainTransfer();
  const [{ fromWallet, toWallet }] = useWallet();
  const { getAuthToken } = useAuthToken();
  const [firstTxnHash, setFirstTxnHash] = useState('');
  const [successData, setSuccessData] = useState<ISuccessData>({
    amount: amount || '',
    symbol: tokenSymbol,
    receiveAmount: estimateReceive,
    receiveAmountUsd: estimateReceiveUnit,
  });

  // DoubleCheckModal
  const [isDoubleCheckModalOpen, setIsDoubleCheckModalOpen] = useState(false);

  // FailModal
  const [isFailModalOpen, setIsFailModalOpen] = useState(false);
  const [failModalReason, setFailModalReason] = useState('');

  // SuccessModal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const toAddress = useMemo(() => {
    const toWalletAccount =
      toWalletType && toWallet?.isConnected && toWallet?.account ? toWallet?.account : '';
    return isUseRecipientAddress ? recipientAddress : toWalletAccount;
  }, [
    isUseRecipientAddress,
    recipientAddress,
    toWallet?.account,
    toWallet?.isConnected,
    toWalletType,
  ]);

  const onConnectWallet = useCallback(() => {
    console.log('onConnectWallet');
  }, []);

  const handleSuccessCallback = useCallback(() => {
    setIsSuccessModalOpen(true);
  }, []);

  const handleFailCallback = useCallback(() => {
    setFailModalReason(DEFAULT_SEND_TRANSFER_ERROR);
    setIsFailModalOpen(true);
  }, []);

  const { sendTransferTokenTransaction } = useSendTxnFromAelfChain();
  const onTransfer = useCallback(async () => {
    try {
      if (
        !fromWallet ||
        !fromWallet?.isConnected ||
        (!toWallet?.isConnected && !!recipientAddress) ||
        !amount ||
        !fromWallet?.account ||
        !toAddress
      )
        return;

      setLoading(true);
      if (fromWallet.walletType === WalletTypeEnum.AELF) {
        // aelf logic
        await sendTransferTokenTransaction({
          amount,
          address: toAddress,
          memo: comment,
          successCallback: handleSuccessCallback,
          failCallback: handleFailCallback,
        });
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
        setSuccessData({
          amount: amount,
          symbol: transferInfo.limitCurrency,
          receiveAmount: estimateReceive,
          receiveAmountUsd: estimateReceiveUnit,
        });

        if (!orderResult.orderId || !orderResult.address) {
          setFailModalReason(DEFAULT_SEND_TRANSFER_ERROR);
          setIsFailModalOpen(true);
          return;
        }
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
        setFirstTxnHash(sendTransferResult);
        console.log('>>>>>> sendTransferResult', sendTransferResult);

        // TODO reject update
        if (sendTransferResult) {
          setIsSuccessModalOpen(true);
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
        } else {
          handleFailCallback();
        }
      }
    } catch (error: any) {
      if (SEND_TRANSFER_ERROR_CODE_LIST.includes(error?.code)) {
        setFailModalReason(error?.message);
      } else if (error?.code == 4001) {
        setFailModalReason('The request is rejected. ETransfer needs your permission to proceed.');
      } else if (error.name === ErrorNameType.FAIL_MODAL_REASON) {
        setFailModalReason(error.message);
      } else {
        setFailModalReason(DEFAULT_SEND_TRANSFER_ERROR);
      }

      setIsFailModalOpen(true);
    } finally {
      setLoading(false);
      setIsDoubleCheckModalOpen(false);

      await sleep(1000);
      myEvents.UpdateNewRecordStatus.emit();
    }
  }, [
    amount,
    comment,
    estimateReceive,
    estimateReceiveUnit,
    fromNetwork?.network,
    fromWallet,
    getAuthToken,
    handleFailCallback,
    handleSuccessCallback,
    recipientAddress,
    sendTransferTokenTransaction,
    setLoading,
    toAddress,
    toNetwork?.network,
    toWallet?.isConnected,
    tokenContractAddress,
    tokenSymbol,
    transferInfo.limitCurrency,
  ]);

  const onClickSuccess = useCallback(() => {
    setIsSuccessModalOpen(false);
    clickSuccessOk();
  }, [clickSuccessOk]);

  const onClickFailed = useCallback(() => {
    setIsFailModalOpen(false);
    clickFailedOk();
  }, [clickFailedOk]);

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
      onClick: () => setIsDoubleCheckModalOpen(true),
      disabled: recipientAddress ? isSubmitDisabled : false,
      loading,
    };
  }, [
    amount,
    fromBalance,
    fromWalletType,
    isSubmitDisabled,
    onConnectWallet,
    recipientAddress,
    toWalletType,
  ]);

  return (
    <>
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

      <DoubleCheckModal
        transferInfo={transferInfo}
        amount={amount || ''}
        toAddress={toAddress}
        memo={comment}
        modalProps={{
          open: isDoubleCheckModalOpen,
          onClose: () => setIsDoubleCheckModalOpen(false),
          onOk: () => {
            setIsDoubleCheckModalOpen(false);
            onTransfer();
          },
        }}
        isTransactionFeeLoading={isTransactionFeeLoading}
      />
      <SuccessModal
        amount={successData.amount}
        symbol={successData.symbol}
        receiveAmount={successData.receiveAmount}
        receiveAmountUsd={successData.receiveAmountUsd}
        txHash={firstTxnHash}
        modalProps={{
          open: isSuccessModalOpen,
          onClose: onClickSuccess,
          onOk: onClickSuccess,
        }}
      />
      <FailModal
        failReason={failModalReason}
        modalProps={{
          open: isFailModalOpen,
          onClose: onClickFailed,
          onOk: onClickFailed,
        }}
      />
    </>
  );
}
