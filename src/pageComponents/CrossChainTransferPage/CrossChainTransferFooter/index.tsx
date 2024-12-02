import CommonButton from 'components/CommonButton';
import styles from './styles.module.scss';
import { useCallback, useMemo, useRef, useState } from 'react';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import {
  BUTTON_TEXT_INSUFFICIENT_FUNDS,
  BUTTON_TEXT_TRANSFER,
  DEFAULT_SEND_TRANSFER_ERROR,
  DefaultTransferOrderResponse,
  ErrorNameType,
  SEND_TRANSFER_ERROR_CODE_LIST,
} from 'constants/crossChainTransfer';
import { handleErrorMessage, sleep, ZERO } from '@etransfer/utils';
import { Form } from 'antd';
import clsx from 'clsx';
import { useCrossChainTransfer, useLoading } from 'store/Provider/hooks';
import { useWallet } from 'context/Wallet';
import { updateTransferOrder as updateTransferOrderApi } from 'utils/api/transfer';
import { WalletTypeEnum } from 'context/Wallet/types';
import DoubleCheckModal from './DoubleCheckModal';
import SuccessModal from './SuccessModal';
import FailModal from './FailModal';
import {
  TCreateTransferOrderResult,
  TCrossChainTransferInfo,
  UpdateTransferOrderStatus,
} from 'types/api';
import myEvents from 'utils/myEvent';
import { useSendTxnFromAelfChain, useSendTxnFromOtherChains } from 'hooks/crossChainTransfer';
import ConnectWalletModal from 'components/Header/LoginAndProfile/ConnectWalletModal';
import { computeWalletType, getConnectWalletText } from 'utils/wallet';
import { TransferFormKeys, TransferValidateStatus, TTransferFormValidateData } from '../types';
import { formatSymbolDisplay } from 'utils/format';

export interface CrossChainTransferFooterProps {
  className?: string;
  isUseRecipientAddress?: boolean;
  recipientAddress?: string;
  comment?: string;
  amount?: string;
  fromBalance?: string;
  decimalsFromWallet?: string | number;
  transferInfo: TCrossChainTransferInfo;
  estimateReceive?: string;
  estimateReceiveUnit?: string;
  transactionFee?: string;
  transactionFeeUnit?: string;
  tokenContractAddress?: string;
  isSubmitDisabled: boolean;
  isTransactionFeeLoading: boolean;
  formValidateData: TTransferFormValidateData;
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
  decimalsFromWallet,
  transferInfo,
  estimateReceive = DEFAULT_NULL_VALUE,
  estimateReceiveUnit = '',
  transactionFee = DEFAULT_NULL_VALUE,
  transactionFeeUnit = '',
  tokenContractAddress,
  isSubmitDisabled,
  isTransactionFeeLoading,
  formValidateData,
  clickFailedOk,
  clickSuccessOk,
}: CrossChainTransferFooterProps) {
  const { setLoading } = useLoading();
  const { fromNetwork, tokenSymbol, toNetwork, toWalletType } = useCrossChainTransfer();
  const [{ fromWallet, toWallet }] = useWallet();
  const [firstTxnHash, setFirstTxnHash] = useState('');
  const firstTxnHashRef = useRef('');

  const [connectWalletModalProps, setConnectWalletModalProps] = useState<
    Omit<Parameters<typeof ConnectWalletModal>[0], 'onCancel'>
  >({
    open: false,
  });

  // DoubleCheckModal
  const [isDoubleCheckModalOpen, setIsDoubleCheckModalOpen] = useState(false);

  // FailModal
  const [isFailModalOpen, setIsFailModalOpen] = useState(false);
  const [failModalReason, setFailModalReason] = useState('');

  // SuccessModal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<ISuccessData>({
    amount: amount || '',
    symbol: tokenSymbol,
    receiveAmount: estimateReceive,
    receiveAmountUsd: transferInfo.receiveAmountUsd,
  });

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

  const isFromWalletConnected = useMemo(
    () => !!(fromWallet?.isConnected && fromWallet?.account),
    [fromWallet?.isConnected, fromWallet?.account],
  );

  const isToWalletConnected = useMemo(
    () =>
      !!(toWallet?.isConnected && toWallet?.account) ||
      (isUseRecipientAddress &&
        recipientAddress &&
        formValidateData[TransferFormKeys.RECIPIENT].validateStatus !==
          TransferValidateStatus.Error),
    [
      toWallet?.isConnected,
      toWallet?.account,
      isUseRecipientAddress,
      recipientAddress,
      formValidateData,
    ],
  );

  const onConnectWallet = useCallback(() => {
    if (!isFromWalletConnected && !isToWalletConnected) {
      setConnectWalletModalProps({
        open: true,
        title: getConnectWalletText(),
      });
      return;
    }

    const network = !isFromWalletConnected ? fromNetwork?.network : toNetwork?.network;

    const walletType = computeWalletType(network || '');
    if (!walletType) {
      setConnectWalletModalProps({
        open: true,
        title: getConnectWalletText(),
      });
      return;
    }

    setConnectWalletModalProps({
      open: true,
      title: getConnectWalletText(network),
      allowList: [walletType],
    });
    return;
  }, [isFromWalletConnected, isToWalletConnected, fromNetwork?.network, toNetwork?.network]);

  const handleSuccessCallback = useCallback((res: TCreateTransferOrderResult) => {
    if (res?.transactionId) {
      setFirstTxnHash(res.transactionId);
      firstTxnHashRef.current = res.transactionId;
    }

    setIsSuccessModalOpen(true);
  }, []);

  const handleFailCallback = useCallback(() => {
    orderResultRef.current = DefaultTransferOrderResponse;
    setFirstTxnHash('');
    firstTxnHashRef.current = '';
    setFailModalReason(DEFAULT_SEND_TRANSFER_ERROR);
    setIsFailModalOpen(true);
  }, []);

  const orderResultRef = useRef(DefaultTransferOrderResponse);
  const updateTransferOrder = useCallback(
    async (status?: UpdateTransferOrderStatus) => {
      if (
        !fromWallet ||
        !fromWallet?.isConnected ||
        !fromWallet?.account ||
        !toAddress ||
        !fromNetwork?.network ||
        !toNetwork?.network ||
        !amount ||
        !orderResultRef.current?.address
      )
        return;
      const updateOrderResult = await updateTransferOrderApi(
        {
          amount: amount,
          fromNetwork: fromNetwork?.network,
          toNetwork: toNetwork?.network,
          fromSymbol: tokenSymbol,
          toSymbol: tokenSymbol,
          fromAddress: fromWallet?.account,
          toAddress,
          address: orderResultRef.current?.address,
          txId: firstTxnHashRef.current,
          status,
          memo: fromWallet.walletType === WalletTypeEnum.TON ? orderResultRef.current.orderId : '',
        },
        orderResultRef.current.orderId,
        authTokenRef.current,
      );
      console.log('>>>>>> sendTransferResult updateOrderResult', updateOrderResult);
    },
    [amount, fromNetwork?.network, fromWallet, toAddress, toNetwork?.network, tokenSymbol],
  );

  const updateTransferOrderRejected = useCallback(
    async (error: any) => {
      // TON Transaction was not sent || [TON_CONNECT_SDK_ERROR]
      if (
        (fromWallet?.walletType === WalletTypeEnum.EVM &&
          error?.details &&
          (error?.details?.includes('User denied') || error?.details?.includes('rejected'))) ||
        (fromWallet?.walletType === WalletTypeEnum.TON &&
          handleErrorMessage(error).includes('TON_CONNECT_SDK_ERROR')) ||
        (fromWallet?.walletType === WalletTypeEnum.SOL &&
          handleErrorMessage(error).includes('rejected')) ||
        (fromWallet?.walletType === WalletTypeEnum.TRON &&
          handleErrorMessage(error).includes('declined'))
      ) {
        await updateTransferOrder(UpdateTransferOrderStatus.Rejected);
      }
    },
    [fromWallet?.walletType, updateTransferOrder],
  );

  const authTokenRef = useRef('');
  const { sendTransferTokenTransaction } = useSendTxnFromAelfChain();
  const { sendTransferTransaction } = useSendTxnFromOtherChains();
  const onTransfer = useCallback(async () => {
    try {
      if (
        !fromWallet ||
        !fromWallet?.isConnected ||
        !fromWallet?.account ||
        !toAddress ||
        !fromNetwork?.network ||
        !toNetwork?.network ||
        !amount
      )
        return;

      setLoading(true);
      orderResultRef.current = DefaultTransferOrderResponse;
      firstTxnHashRef.current = '';
      if (fromWallet.walletType === WalletTypeEnum.AELF) {
        // aelf logic
        await sendTransferTokenTransaction({
          amount,
          address: toAddress,
          memo: comment,
          successCallback: handleSuccessCallback,
          failCallback: handleFailCallback,
        });
        setSuccessData({
          amount: amount,
          symbol: transferInfo.limitCurrency,
          receiveAmount: transferInfo.receiveAmount,
          receiveAmountUsd: transferInfo.receiveAmountUsd,
        });
      } else {
        sendTransferTransaction({
          tokenContractAddress,
          decimalsFromWallet,
          amount,
          toAddress,
          updateAuthToken: (authToken: string) => {
            authTokenRef.current = authToken;
          },
          updateOrderResult: (orderResult: TCreateTransferOrderResult) => {
            orderResultRef.current = orderResult;
          },
          updateSuccessData: () => {
            setSuccessData({
              amount: amount || '',
              symbol: transferInfo.limitCurrency,
              receiveAmount: transferInfo.receiveAmount,
              receiveAmountUsd: transferInfo.receiveAmountUsd,
            });
          },
          handleOrderResultValid: () => {
            if (!orderResultRef.current.orderId || !orderResultRef.current.address) {
              setFailModalReason(DEFAULT_SEND_TRANSFER_ERROR);
              setLoading(false);
              setIsFailModalOpen(true);
              return;
            }
          },
          updateFirstTxnHash: (txnHash: string) => {
            setFirstTxnHash(txnHash);
            firstTxnHashRef.current = txnHash;
          },
          handleSuccessCallback: async () => {
            setIsSuccessModalOpen(true);
            await updateTransferOrder();
          },
          handleFailCallback,
        });
      }
    } catch (error: any) {
      console.log('>>>>>> onTransfer error', error);
      if (SEND_TRANSFER_ERROR_CODE_LIST.includes(error?.code)) {
        setFailModalReason(error?.message);
      } else if (error?.code == 4001) {
        setFailModalReason('The request is rejected. ETransfer needs your permission to proceed.');
      } else if (error.name === ErrorNameType.FAIL_MODAL_REASON) {
        setFailModalReason(error.message);
      } else {
        setFailModalReason(DEFAULT_SEND_TRANSFER_ERROR);
      }

      setLoading(false);
      setIsFailModalOpen(true);

      if (orderResultRef.current.orderId && orderResultRef.current.address) {
        await updateTransferOrderRejected(error);
      }
    } finally {
      setLoading(false);
      setIsDoubleCheckModalOpen(false);

      await sleep(1000);
      myEvents.UpdateNewRecordStatus.emit();
    }
  }, [
    amount,
    comment,
    decimalsFromWallet,
    fromNetwork?.network,
    fromWallet,
    handleFailCallback,
    handleSuccessCallback,
    sendTransferTokenTransaction,
    sendTransferTransaction,
    setLoading,
    toAddress,
    toNetwork?.network,
    tokenContractAddress,
    transferInfo.limitCurrency,
    transferInfo.receiveAmount,
    transferInfo.receiveAmountUsd,
    updateTransferOrder,
    updateTransferOrderRejected,
  ]);

  const onClickSuccess = useCallback(() => {
    setIsSuccessModalOpen(false);
    clickSuccessOk();

    orderResultRef.current = DefaultTransferOrderResponse;
    setFirstTxnHash('');
    firstTxnHashRef.current = '';
  }, [clickSuccessOk]);

  const onClickFailed = useCallback(() => {
    setIsFailModalOpen(false);
    clickFailedOk();

    orderResultRef.current = DefaultTransferOrderResponse;
    setFirstTxnHash('');
    firstTxnHashRef.current = '';
  }, [clickFailedOk]);

  const btnProps = useMemo(() => {
    const disabled = true,
      loading = false;

    if (!isFromWalletConnected || !isToWalletConnected) {
      let children = '';
      if (!isFromWalletConnected && !isToWalletConnected) {
        children = getConnectWalletText();
      } else if (!isFromWalletConnected) {
        children = getConnectWalletText(fromNetwork?.network);
      } else {
        children = getConnectWalletText(toNetwork?.network);
      }
      return {
        children,
        onClick: onConnectWallet,
        disabled: false,
        loading,
      };
    }

    if (amount && (!fromBalance || ZERO.plus(fromBalance).lt(amount))) {
      return {
        children: BUTTON_TEXT_INSUFFICIENT_FUNDS,
        onClick: undefined,
        disabled,
        loading,
      };
    }

    return {
      children: BUTTON_TEXT_TRANSFER,
      onClick: () => setIsDoubleCheckModalOpen(true),
      disabled: isSubmitDisabled,
      loading,
    };
  }, [
    isFromWalletConnected,
    isToWalletConnected,
    amount,
    fromBalance,
    isSubmitDisabled,
    onConnectWallet,
    fromNetwork?.network,
    toNetwork?.network,
  ]);

  return (
    <>
      <div className={clsx(styles['cross-chain-transfer-footer'], className)}>
        <div className={styles['cross-chain-transfer-footer-info']}>
          <div className={clsx('flex-row-center', styles['you-will-receive'])}>
            <span>{`You'll receive:`}&nbsp;</span>
            <span className={styles['you-will-receive-value']}>
              {estimateReceive
                ? `${estimateReceive} ${formatSymbolDisplay(estimateReceiveUnit)}`
                : DEFAULT_NULL_VALUE}
            </span>
          </div>
          <div className={clsx('flex-row-center', styles['transaction-fee'])}>
            <span>{`Transaction fee:`}&nbsp;</span>
            <span className={styles['transaction-fee-value']}>
              {transactionFee
                ? `${transactionFee} ${formatSymbolDisplay(transactionFeeUnit)}`
                : DEFAULT_NULL_VALUE}
            </span>
          </div>
        </div>

        <Form.Item
          shouldUpdate
          className={clsx('flex-none', styles['transfer-submit-button-wrapper'])}>
          <CommonButton className={styles['transfer-submit-button']} {...btnProps}>
            {btnProps.children}
          </CommonButton>
        </Form.Item>
      </div>

      <ConnectWalletModal
        {...connectWalletModalProps}
        onCancel={() => setConnectWalletModalProps({ ...connectWalletModalProps, open: false })}
      />

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
