import { ZERO } from 'constants/calculate';
import { TRANSACTION_APPROVE_LOADING } from 'constants/crossChainTransfer';
import { EVM_TOKEN_ABI } from 'constants/wallet/EVM';
import { IWallet, WalletTypeEnum } from 'context/Wallet/types';
import { useAuthToken } from 'hooks/wallet/authToken';
import { getAelfMaxBalance } from 'pageComponents/CrossChainTransferPage/utils';
import { useCallback, useRef, useState } from 'react';
import { useLoading } from 'store/Provider/hooks';
import { TCreateTransferOrderResult } from 'types/api';
import {
  SendEVMTransactionParams,
  SendSolanaTransactionParams,
  SendTONTransactionParams,
  SendTRONTransactionParams,
} from 'types/wallet';
import { isDIDAddressSuffix, removeELFAddressSuffix } from 'utils/aelf/aelfBase';
import { isAuthTokenError } from 'utils/api/error';
import { createTransferOrder } from 'utils/api/transfer';
import { isAelfChain } from 'utils/wallet';

export function useCheckMaxBalance() {
  const [isBalanceNotEnoughTip, setIsBalanceNotEnoughTip] = useState(false);

  const checkMaxBalance = useCallback(
    async ({
      tokenSymbol,
      amount,
      fromBalance,
      fromNetwork,
      aelfTransactionFee,
      fromAccount,
    }: {
      tokenSymbol: string;
      amount?: string;
      fromBalance?: string;
      fromNetwork?: string;
      aelfTransactionFee?: string;
      fromAccount?: string | null;
    }) => {
      let _maxBalance = fromBalance;
      if (isAelfChain(fromNetwork || '') && tokenSymbol === 'ELF') {
        _maxBalance = await getAelfMaxBalance({
          balance: fromBalance || '',
          aelfFee: aelfTransactionFee,
          fromNetwork,
          tokenSymbol,
          account: fromAccount || '',
        });
      }
      const res = !!amount && (!_maxBalance || ZERO.plus(_maxBalance).lt(amount));
      setIsBalanceNotEnoughTip(res);
    },
    [],
  );

  return { isBalanceNotEnoughTip, checkMaxBalance };
}

export const DefaultWithdrawOrderResponse: TCreateTransferOrderResult = { orderId: '' };

export function useCreateOrderOtherNetwork(fromWallet?: IWallet, fromWalletType?: WalletTypeEnum) {
  const { setLoading } = useLoading();
  const { getAuthToken, queryAuthToken } = useAuthToken(fromWallet, fromWalletType);

  const authTokenRef = useRef('');
  const orderResultRef = useRef(DefaultWithdrawOrderResponse);

  const createOtherNetworkOrder = useCallback(
    async ({
      amount,
      fromNetwork,
      toNetwork,
      tokenSymbol,
      fromAddress,
      toAddress,
    }: {
      amount: string;
      fromNetwork: string;
      toNetwork: string;
      tokenSymbol: string;
      fromAddress: string;
      toAddress: string;
    }) => {
      // get etransfer jwt
      const authToken = await getAuthToken(true);
      authTokenRef.current = authToken;

      setLoading(true, { text: TRANSACTION_APPROVE_LOADING });

      // create order id
      const createTransferOrderParams = {
        amount: amount,
        fromNetwork: fromNetwork,
        toNetwork: toNetwork,
        fromSymbol: tokenSymbol,
        toSymbol: tokenSymbol,
        fromAddress: isDIDAddressSuffix(fromAddress)
          ? removeELFAddressSuffix(fromAddress)
          : fromAddress,
        toAddress: isDIDAddressSuffix(toAddress) ? removeELFAddressSuffix(toAddress) : toAddress,
      };

      try {
        orderResultRef.current = await createTransferOrder(createTransferOrderParams, authToken);
      } catch (error) {
        orderResultRef.current = DefaultWithdrawOrderResponse;
        if (isAuthTokenError(error)) {
          const _authToken = await queryAuthToken(true);
          authTokenRef.current = _authToken;
          orderResultRef.current = await createTransferOrder(createTransferOrderParams, _authToken);
        } else {
          throw error;
        }
      }
    },
    [getAuthToken, queryAuthToken, setLoading],
  );

  const sendOtherNetworkTransfer = useCallback(
    async ({
      amount,
      fromNetwork,
      fromWallet,
      decimalsFromWallet,
      tokenContractAddress,
    }: {
      amount: string;
      fromNetwork: string;
      fromWallet: IWallet;
      decimalsFromWallet?: string | number;
      tokenContractAddress?: string;
    }) => {
      let params: any;
      if (fromWallet.walletType === WalletTypeEnum.EVM) {
        params = {
          network: fromNetwork,
          tokenContractAddress: tokenContractAddress,
          toAddress: orderResultRef.current.address,
          tokenAbi: EVM_TOKEN_ABI,
          amount: amount,
          decimals: Number(decimalsFromWallet),
        } as SendEVMTransactionParams;
      } else if (fromWallet.walletType === WalletTypeEnum.SOL) {
        params = {
          tokenContractAddress: tokenContractAddress,
          toAddress: orderResultRef.current.address,
          amount: amount,
          decimals: decimalsFromWallet,
        } as SendSolanaTransactionParams;
      } else if (fromWallet.walletType === WalletTypeEnum.TON) {
        params = {
          tokenContractAddress: tokenContractAddress,
          toAddress: orderResultRef.current.address,
          amount: Number(amount),
          decimals: decimalsFromWallet,
          orderId: orderResultRef.current.orderId,
        } as SendTONTransactionParams;
      } else {
        // TRON
        params = {
          tokenContractAddress: tokenContractAddress,
          toAddress: orderResultRef.current.address,
          amount: Number(amount),
        } as SendTRONTransactionParams;
      }
      if (!fromWallet?.sendTransaction) return;

      const sendTransferResult = await fromWallet?.sendTransaction(params);

      return sendTransferResult;
    },
    [],
  );

  return { authTokenRef, orderResultRef, createOtherNetworkOrder, sendOtherNetworkTransfer };
}
