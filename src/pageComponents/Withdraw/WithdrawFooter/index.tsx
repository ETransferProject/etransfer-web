import CommonButton from 'components/CommonButton';
import styles from './styles.module.scss';
import { useCallback, useMemo, useRef, useState } from 'react';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import {
  BUTTON_TEXT_CONNECT,
  BUTTON_TEXT_INSUFFICIENT_FUNDS,
  DEFAULT_SEND_TRANSFER_ERROR,
  ErrorNameType,
  SEND_TRANSFER_ERROR_CODE_LIST,
} from 'constants/crossChainTransfer';
import { BUTTON_TEXT_WITHDRAW } from 'constants/withdraw';
import { handleErrorMessage, sleep } from '@etransfer/utils';
import { Form } from 'antd';
import clsx from 'clsx';
import { useWithdrawNewState, useLoading, useCommonState } from 'store/Provider/hooks';
import { useGetOneWallet } from 'hooks/wallet';
import { updateTransferOrder as updateTransferOrderApi } from 'utils/api/transfer';
import { WalletTypeEnum } from 'context/Wallet/types';

import DoubleCheckModal from 'pageComponents/CrossChainTransferPage/CrossChainTransferFooter/DoubleCheckModal';
import SuccessModal from 'pageComponents/CrossChainTransferPage/CrossChainTransferFooter/SuccessModal';
import FailModal from 'pageComponents/CrossChainTransferPage/CrossChainTransferFooter/FailModal';
import {
  TCreateTransferOrderResult,
  TCrossChainTransferInfo,
  UpdateTransferOrderStatus,
} from 'types/api';
import myEvents from 'utils/myEvent';
import { useSendTxnFromAelfChain } from 'hooks/crossChainTransfer';
import ConnectWalletModal from 'components/Header/LoginAndProfile/ConnectWalletModal';
import { computeWalletType, getConnectWalletText } from 'utils/wallet';
import { WithdrawFormKeys, TWithdrawFormValidateData } from '../types';
import { formatSymbolDisplay } from 'utils/format';
import FeeInfo from './FeeInfo';
import PartialLoading from 'components/PartialLoading';
import {
  DefaultWithdrawOrderResponse,
  useCheckMaxBalance,
  useCreateOrderOtherNetwork,
} from '../hooks';
import { InitialWithdrawNewState } from 'store/reducers/withdrawNew/slice';

export interface WithdrawFooterProps {
  className?: string;
  withdrawAddress?: string;
  comment?: string;
  amount?: string;
  fromBalance?: string;
  decimalsFromWallet?: string | number;
  tokenContractAddress?: string;
  transferInfo: TCrossChainTransferInfo;
  estimateReceive?: string;
  estimateReceiveUnit?: string;
  transactionFee?: string;
  transactionFeeUnit?: string;
  isSubmitDisabled: boolean;
  isTransactionFeeLoading: boolean;
  formValidateData: TWithdrawFormValidateData;
  clickFailedOk: () => void;
  clickSuccessOk: () => void;
}

interface ISuccessData {
  amount: string;
  symbol: string;
  receiveAmount: string;
  receiveAmountUsd: string;
}

export default function WithdrawFooter({
  className,
  withdrawAddress = '',
  comment,
  amount,
  fromBalance,
  decimalsFromWallet,
  tokenContractAddress,
  transferInfo,
  estimateReceive = DEFAULT_NULL_VALUE,
  estimateReceiveUnit = '',
  transactionFee = DEFAULT_NULL_VALUE,
  transactionFeeUnit = '',
  isSubmitDisabled,
  isTransactionFeeLoading,
  formValidateData,
  clickFailedOk,
  clickSuccessOk,
}: WithdrawFooterProps) {
  const { isPadPX } = useCommonState();
  const { setLoading } = useLoading();
  const { fromNetwork, tokenSymbol, toNetwork, tokenList } = useWithdrawNewState();
  const fromWallet = useGetOneWallet(fromNetwork?.network || '');
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

  const isFromWalletConnected = useMemo(
    () => !!(fromWallet?.isConnected && fromWallet?.account),
    [fromWallet?.isConnected, fromWallet?.account],
  );

  const onConnectWallet = useCallback(() => {
    const walletType = computeWalletType(fromNetwork?.network || '');

    if (!walletType) {
      setConnectWalletModalProps({
        open: true,
        title: getConnectWalletText(),
      });
      return;
    }

    setConnectWalletModalProps({
      open: true,
      title: getConnectWalletText(fromNetwork?.network),
      allowList: [walletType],
    });

    return;
  }, [fromNetwork?.network]);

  const handleSuccessCallback = useCallback((res: TCreateTransferOrderResult) => {
    if (res?.transactionId) {
      setFirstTxnHash(res.transactionId);
      firstTxnHashRef.current = res.transactionId;
    }

    setIsSuccessModalOpen(true);
  }, []);

  const { authTokenRef, orderResultRef, createOtherNetworkOrder, sendOtherNetworkTransfer } =
    useCreateOrderOtherNetwork(fromWallet, fromWallet?.walletType);

  const handleFailCallback = useCallback(() => {
    orderResultRef.current = DefaultWithdrawOrderResponse;
    setFirstTxnHash('');
    firstTxnHashRef.current = '';
    setFailModalReason(DEFAULT_SEND_TRANSFER_ERROR);
    setIsFailModalOpen(true);
  }, [orderResultRef]);

  const updateTransferOrder = useCallback(
    async (status?: UpdateTransferOrderStatus) => {
      if (
        !fromWallet ||
        !fromWallet?.isConnected ||
        !fromWallet?.account ||
        !withdrawAddress ||
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
          toAddress: withdrawAddress,
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
    [
      amount,
      authTokenRef,
      fromNetwork?.network,
      fromWallet,
      orderResultRef,
      toNetwork?.network,
      tokenSymbol,
      withdrawAddress,
    ],
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

  const { sendTransferTokenTransaction } = useSendTxnFromAelfChain({
    fromNetwork,
    toNetwork,
    tokenSymbol,
    totalTokenList: tokenList,
    InitialTransferState: InitialWithdrawNewState,
  });
  const onTransfer = useCallback(async () => {
    try {
      if (
        !fromWallet ||
        !fromWallet?.isConnected ||
        !fromWallet?.account ||
        !withdrawAddress ||
        !fromNetwork?.network ||
        !toNetwork?.network ||
        !amount
      )
        return;

      setLoading(true);
      orderResultRef.current = DefaultWithdrawOrderResponse;
      firstTxnHashRef.current = '';
      if (fromWallet.walletType === WalletTypeEnum.AELF) {
        // aelf logic
        await sendTransferTokenTransaction({
          amount,
          address: withdrawAddress,
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
        // other network logic
        await createOtherNetworkOrder({
          amount,
          fromNetwork: fromNetwork?.network,
          toNetwork: toNetwork?.network,
          tokenSymbol,
          fromAddress: fromWallet?.account,
          toAddress: withdrawAddress,
        });

        setSuccessData({
          amount: amount,
          symbol: transferInfo.limitCurrency,
          receiveAmount: transferInfo.receiveAmount,
          receiveAmountUsd: transferInfo.receiveAmountUsd,
        });

        if (!orderResultRef.current.orderId || !orderResultRef.current.address) {
          setFailModalReason(DEFAULT_SEND_TRANSFER_ERROR);
          setLoading(false);
          setIsFailModalOpen(true);
          return;
        }
        console.log('>>>>>> orderResult', orderResultRef.current);

        const sendTransferResult = await sendOtherNetworkTransfer({
          amount,
          fromNetwork: fromNetwork?.network,
          fromWallet,
          decimalsFromWallet,
          tokenContractAddress,
        });
        setFirstTxnHash(sendTransferResult);
        firstTxnHashRef.current = sendTransferResult;
        console.log('>>>>>> sendTransferResult', sendTransferResult);

        if (sendTransferResult) {
          setIsSuccessModalOpen(true);
          await updateTransferOrder();
        } else {
          handleFailCallback();
        }
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
    createOtherNetworkOrder,
    decimalsFromWallet,
    fromNetwork?.network,
    fromWallet,
    handleFailCallback,
    handleSuccessCallback,
    orderResultRef,
    sendOtherNetworkTransfer,
    sendTransferTokenTransaction,
    setLoading,
    toNetwork?.network,
    tokenContractAddress,
    tokenSymbol,
    transferInfo.limitCurrency,
    transferInfo.receiveAmount,
    transferInfo.receiveAmountUsd,
    updateTransferOrder,
    updateTransferOrderRejected,
    withdrawAddress,
  ]);

  const onClickSuccess = useCallback(() => {
    setIsSuccessModalOpen(false);
    clickSuccessOk();

    orderResultRef.current = DefaultWithdrawOrderResponse;
    setFirstTxnHash('');
    firstTxnHashRef.current = '';
  }, [clickSuccessOk, orderResultRef]);

  const onClickFailed = useCallback(() => {
    setIsFailModalOpen(false);
    clickFailedOk();

    orderResultRef.current = DefaultWithdrawOrderResponse;
    setFirstTxnHash('');
    firstTxnHashRef.current = '';
  }, [clickFailedOk, orderResultRef]);

  const { isBalanceNotEnoughTip, checkMaxBalance } = useCheckMaxBalance();

  const btnProps = useMemo(() => {
    const disabled = true,
      loading = false;

    if (!isFromWalletConnected) {
      return {
        children: isPadPX ? BUTTON_TEXT_CONNECT : getConnectWalletText(fromNetwork?.network),
        onClick: onConnectWallet,
        disabled: false,
        loading,
      };
    }

    checkMaxBalance({
      tokenSymbol,
      amount,
      fromBalance,
      fromNetwork: fromNetwork?.network,
      aelfTransactionFee: transferInfo.aelfTransactionFee,
      fromAccount: fromWallet?.account,
    });
    if (isBalanceNotEnoughTip || formValidateData[WithdrawFormKeys.AMOUNT].errorMessage) {
      return {
        children: BUTTON_TEXT_INSUFFICIENT_FUNDS,
        onClick: undefined,
        disabled,
        loading,
      };
    }

    return {
      children: BUTTON_TEXT_WITHDRAW,
      onClick: () => setIsDoubleCheckModalOpen(true),
      disabled: isSubmitDisabled,
      loading,
    };
  }, [
    isFromWalletConnected,
    checkMaxBalance,
    tokenSymbol,
    amount,
    fromBalance,
    fromNetwork?.network,
    transferInfo.aelfTransactionFee,
    fromWallet?.account,
    isBalanceNotEnoughTip,
    formValidateData,
    isSubmitDisabled,
    isPadPX,
    onConnectWallet,
  ]);

  return (
    <>
      <div
        className={clsx(styles['withdraw-footer'], styles['withdraw-footer-safe-area'], className)}>
        <div className={clsx('flex-1', 'flex-column', styles['withdraw-footer-info-wrapper'])}>
          <div className={clsx('flex-column', styles['receive-amount-wrapper'])}>
            <div className={styles['info-label']}>Receive Amount</div>
            <div className={clsx('flex-row-center', styles['info-value-big-font'])}>
              {isTransactionFeeLoading && <PartialLoading />}
              {!isTransactionFeeLoading &&
                `${(!isSuccessModalOpen && estimateReceive) || DEFAULT_NULL_VALUE} `}
              <span className={clsx(styles['info-unit'])}>
                &nbsp;{formatSymbolDisplay(estimateReceiveUnit)}
              </span>
            </div>
          </div>
          <FeeInfo
            isTransactionFeeLoading={isTransactionFeeLoading}
            isSuccessModalOpen={isSuccessModalOpen}
            transactionFee={transactionFee}
            transactionUnit={formatSymbolDisplay(transactionFeeUnit)}
          />
        </div>

        <Form.Item
          shouldUpdate
          className={clsx('flex-none', styles['withdraw-submit-button-wrapper'])}>
          <CommonButton className={styles['withdraw-submit-button']} {...btnProps}>
            {btnProps.children}
          </CommonButton>
        </Form.Item>
      </div>

      <ConnectWalletModal
        {...connectWalletModalProps}
        onCancel={() => setConnectWalletModalProps({ ...connectWalletModalProps, open: false })}
      />

      <DoubleCheckModal
        title="Withdrawal Information"
        toNetworkLabel="Withdrawal to Network"
        amountLabel="Withdrawal Amount"
        transferInfo={transferInfo}
        amount={amount || ''}
        toAddress={withdrawAddress}
        toNetwork={toNetwork}
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
        title="Withdrawal Submitted"
        amountLabel="Withdrawal Amount"
        amount={successData.amount}
        symbol={successData.symbol}
        receiveAmount={successData.receiveAmount}
        receiveAmountUsd={successData.receiveAmountUsd}
        txHash={firstTxnHash}
        fromNetwork={fromNetwork}
        toNetwork={toNetwork}
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
