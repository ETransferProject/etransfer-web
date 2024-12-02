import { sleep } from '@portkey/utils';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';
import { useAppDispatch, useCrossChainTransfer, useLoading } from 'store/Provider/hooks';
import {
  InitialCrossChainTransferState,
  setFromNetwork,
  setToNetwork,
  setTokenSymbol,
} from 'store/reducers/crossChainTransfer/slice';
import { TCreateTransferOrderRequest, TCreateTransferOrderResult, TNetworkItem } from 'types/api';
import {
  getCaHashAndOriginChainIdByWallet,
  getManagerAddressByWallet,
  isAelfChain,
  isEVMChain,
  isSolanaChain,
  isTRONChain,
  isTONChain,
} from 'utils/wallet';
import { useGetBalanceDivDecimals } from './contract';
import { ZERO } from '@etransfer/utils';
import {
  ErrorNameType,
  TRANSACTION_APPROVE_LOADING,
  DefaultTransferOrderResponse,
} from 'constants/crossChainTransfer';
import { checkTokenAllowanceAndApprove, createTransferTokenTransaction } from 'utils/contract';
import { createTransferOrder } from 'utils/api/transfer';
import { isDIDAddressSuffix, removeELFAddressSuffix } from 'utils/aelf/aelfBase';
import { InsufficientAllowanceMessage } from 'constants/withdraw';
import { WalletInfo } from 'types/wallet';
import { timesDecimals } from 'utils/calculate';
import useAelf, { useGetAccount } from './wallet/useAelf';
import { ADDRESS_MAP, SupportedELFChainId } from 'constants/index';
import { WalletTypeEnum as AelfWalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { ContractType } from 'constants/chain';
import { useAelfAuthToken } from './wallet/aelfAuthToken';
import { isAuthTokenError } from 'utils/api/error';
import { WalletTypeEnum } from 'context/Wallet/types';
import { setFromWalletType, setToWalletType } from 'store/reducers/crossChainTransfer/slice';
import {
  SendEVMTransactionParams,
  SendSolanaTransactionParams,
  SendTONTransactionParams,
  SendTRONTransactionParams,
} from 'types/wallet';
import { useAuthToken } from './wallet/authToken';
import { useWallet } from 'context/Wallet';
import { EVM_TOKEN_ABI } from 'constants/wallet/EVM';

export function useGoTransfer() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useCallback(
    async (symbol?: string, fromNetwork?: string, toNetwork?: string) => {
      if (symbol) {
        dispatch(setTokenSymbol(symbol));
      }
      if (fromNetwork) {
        dispatch(setFromNetwork({ network: fromNetwork } as unknown as TNetworkItem));
      }
      if (toNetwork) {
        dispatch(setToNetwork({ network: toNetwork } as unknown as TNetworkItem));
      }

      await sleep(200);
      router.push('/cross-chain-transfer');
    },
    [dispatch, router],
  );
}

export function useSendTxnFromAelfChain() {
  const getBalanceDivDecimals = useGetBalanceDivDecimals();
  const { setLoading } = useLoading();
  const { walletInfo, connector, callSendMethod, signMessage } = useAelf();
  const accounts = useGetAccount();
  const { fromNetwork, toNetwork, tokenSymbol, totalTokenList } = useCrossChainTransfer();
  const chainId = useMemo(() => {
    return fromNetwork?.network as SupportedELFChainId;
  }, [fromNetwork?.network]);
  const currentToken = useMemo(() => {
    const item = totalTokenList?.find((item) => item.symbol === tokenSymbol);
    return item?.symbol ? item : InitialCrossChainTransferState.tokenList[0];
  }, [tokenSymbol, totalTokenList]);
  const currentTokenDecimal = useMemo(() => currentToken.decimals, [currentToken.decimals]);
  const currentEtransferContractAddress = useMemo(
    () => ADDRESS_MAP[chainId]?.[ContractType.ETRANSFER] || '',
    [chainId],
  );

  const handleApproveToken = useCallback(
    async ({ amount, memo }: { amount: string; memo?: string }) => {
      const newMaxBalance = await getBalanceDivDecimals(tokenSymbol, currentTokenDecimal, chainId);
      if (ZERO.plus(newMaxBalance).isLessThan(ZERO.plus(amount))) {
        const error = new Error(
          `Insufficient ${tokenSymbol} balance in your account. Please consider transferring a smaller amount or topping up before you try again.`,
        );
        error.name = ErrorNameType.FAIL_MODAL_REASON;
        throw error;
      }

      const checkRes = await checkTokenAllowanceAndApprove({
        callSendMethod,
        chainId: chainId,
        symbol: tokenSymbol,
        address: accounts?.[chainId] || '',
        approveTargetAddress: currentEtransferContractAddress,
        amount,
        memo,
      });

      return checkRes;
    },
    [
      accounts,
      callSendMethod,
      chainId,
      currentEtransferContractAddress,
      currentTokenDecimal,
      getBalanceDivDecimals,
      tokenSymbol,
    ],
  );

  const { getAuth: getAelfAuthToken, queryAuth: queryAelfAuthToken } = useAelfAuthToken();
  const handleCreateWithdrawOrder = useCallback(
    async ({
      amount,
      address,
      memo,
      rawTransaction,
      successCallback,
      failCallback,
    }: {
      amount: string;
      address: string;
      memo?: string;
      rawTransaction: string;
      successCallback: (item: TCreateTransferOrderResult) => void;
      failCallback: () => void;
    }) => {
      if (!toNetwork?.network) throw new Error('Please selected network');
      if (!accounts?.[chainId]) throw new Error('Please connect from wallet');

      const params: TCreateTransferOrderRequest = {
        amount,
        fromNetwork: chainId,
        toNetwork: toNetwork?.network,
        fromSymbol: tokenSymbol,
        toSymbol: tokenSymbol,
        fromAddress: isDIDAddressSuffix(accounts?.[chainId])
          ? removeELFAddressSuffix(accounts?.[chainId])
          : address,
        toAddress: isDIDAddressSuffix(address) ? removeELFAddressSuffix(address) : address,
        memo,
        rawTransaction: rawTransaction,
      };
      let createWithdrawOrderRes: TCreateTransferOrderResult = { orderId: '', transactionId: '' };
      try {
        createWithdrawOrderRes = await createTransferOrder(params);
      } catch (error) {
        if (isAuthTokenError(error)) {
          const _authToken = await queryAelfAuthToken(true, false);
          createWithdrawOrderRes = await createTransferOrder(params, _authToken);
        } else {
          throw error;
        }
      }
      console.log(
        '>>>>>> handleCreateWithdrawOrder createWithdrawOrderRes',
        createWithdrawOrderRes,
      );
      if (createWithdrawOrderRes.orderId) {
        successCallback(createWithdrawOrderRes);
      } else {
        failCallback();
      }
    },
    [accounts, chainId, queryAelfAuthToken, toNetwork?.network, tokenSymbol],
  );

  const sendTransferTokenTransaction = useCallback(
    async ({
      amount,
      address,
      memo,
      successCallback,
      failCallback,
    }: {
      amount: string;
      address: string;
      memo?: string;
      successCallback: (item: TCreateTransferOrderResult) => void;
      failCallback: () => void;
    }) => {
      setLoading(true, { text: TRANSACTION_APPROVE_LOADING });
      if (!address) throw new Error('Please enter a correct address.');

      // get etransfer jwt
      await getAelfAuthToken(true, false);

      const approveRes = await handleApproveToken({ amount, memo });
      if (!approveRes) throw new Error(InsufficientAllowanceMessage);
      console.log('>>>>>> sendTransferTokenTransaction approveRes', approveRes);

      if (approveRes) {
        const { caHash } = await getCaHashAndOriginChainIdByWallet(
          walletInfo as WalletInfo,
          connector,
        );
        const managerAddress = await getManagerAddressByWallet(walletInfo as WalletInfo, connector);
        const ownerAddress = accounts?.[chainId] || '';
        const transaction = await createTransferTokenTransaction({
          walletType: connector,
          caContractAddress: ADDRESS_MAP[chainId][ContractType.CA],
          eTransferContractAddress: currentEtransferContractAddress,
          caHash: caHash,
          symbol: tokenSymbol,
          amount: timesDecimals(amount, currentTokenDecimal).toFixed(),
          memo,
          chainId: chainId,
          fromManagerAddress: connector === AelfWalletTypeEnum.elf ? ownerAddress : managerAddress,
          caAddress: ownerAddress,
          getSignature: signMessage,
        });
        console.log(transaction, '=====transaction');

        await handleCreateWithdrawOrder({
          amount,
          address,
          memo,
          rawTransaction: transaction,
          successCallback,
          failCallback,
        });
      } else {
        throw new Error('Approve Failed');
      }
      setLoading(false);
    },
    [
      accounts,
      chainId,
      connector,
      currentEtransferContractAddress,
      currentTokenDecimal,
      getAelfAuthToken,
      handleApproveToken,
      handleCreateWithdrawOrder,
      setLoading,
      signMessage,
      tokenSymbol,
      walletInfo,
    ],
  );

  return { sendTransferTokenTransaction };
}

export function useSendTxnFromOtherChains() {
  const { setLoading } = useLoading();
  const { fromNetwork, toNetwork, tokenSymbol } = useCrossChainTransfer();
  const [{ fromWallet }] = useWallet();
  const { getAuthToken, queryAuthToken } = useAuthToken();
  const orderResultRef = useRef<TCreateTransferOrderResult>(DefaultTransferOrderResponse);

  const createOrderWithRetry = useCallback(
    async ({
      params,
      authToken,
      updateAuthToken,
      updateOrderResult,
    }: {
      params: TCreateTransferOrderRequest;
      authToken: string;
      updateAuthToken: (authToken: string) => void;
      updateOrderResult: (orderResult: TCreateTransferOrderResult) => void;
    }) => {
      try {
        const orderResult = await createTransferOrder(params, authToken);
        updateOrderResult(orderResult);
      } catch (error) {
        updateOrderResult(DefaultTransferOrderResponse);
        if (isAuthTokenError(error)) {
          const newAuthToken = await queryAuthToken(true);
          updateAuthToken(newAuthToken);
          const orderResult = await createTransferOrder(params, newAuthToken);
          updateOrderResult(orderResult);
        } else {
          throw error;
        }
      }
    },
    [queryAuthToken],
  );

  const formatAddress = useCallback((address: string) => {
    return isDIDAddressSuffix(address) ? removeELFAddressSuffix(address) : address;
  }, []);

  const createTransactionParams = useCallback(
    ({
      walletType,
      tokenContractAddress,
      toAddress,
      amount,
      decimalsFromWallet,
      orderId,
    }: {
      walletType?: WalletTypeEnum;
      tokenContractAddress?: string;
      toAddress?: string;
      amount: string;
      decimalsFromWallet?: string | number;
      orderId?: string;
    }):
      | SendEVMTransactionParams
      | SendSolanaTransactionParams
      | SendTONTransactionParams
      | SendTRONTransactionParams => {
      switch (walletType) {
        case WalletTypeEnum.EVM:
          return {
            network: fromNetwork?.network,
            tokenContractAddress,
            toAddress,
            tokenAbi: EVM_TOKEN_ABI,
            amount,
            decimals: Number(decimalsFromWallet),
          } as SendEVMTransactionParams;
        case WalletTypeEnum.SOL:
          return {
            tokenContractAddress,
            toAddress,
            amount,
            decimals: decimalsFromWallet,
          } as SendSolanaTransactionParams;
        case WalletTypeEnum.TON:
          return {
            tokenContractAddress,
            toAddress,
            amount: Number(amount),
            decimals: decimalsFromWallet,
            orderId,
          } as SendTONTransactionParams;
        default:
          // TRON
          return {
            tokenContractAddress,
            toAddress,
            amount: Number(amount),
          } as SendTRONTransactionParams;
      }
    },
    [fromNetwork?.network],
  );

  const sendTransferTransaction = useCallback(
    async ({
      tokenContractAddress,
      decimalsFromWallet,
      amount,
      toAddress,
      updateAuthToken,
      updateOrderResult,
      updateSuccessData,
      handleOrderResultValid,
      updateFirstTxnHash,
      handleSuccessCallback,
      handleFailCallback,
    }: {
      tokenContractAddress?: string;
      decimalsFromWallet?: string | number;
      amount: string;
      toAddress: string;
      updateAuthToken: (authToken: string) => void;
      updateOrderResult: (orderResult: TCreateTransferOrderResult) => void;
      updateSuccessData: () => void;
      handleOrderResultValid: () => void;
      updateFirstTxnHash: (txnHash: string) => void;
      handleSuccessCallback: () => Promise<void>;
      handleFailCallback: () => void;
    }) => {
      if (
        !fromWallet ||
        !fromWallet?.isConnected ||
        !fromWallet?.account ||
        !toAddress ||
        !fromNetwork?.network ||
        !toNetwork?.network ||
        !amount
      ) {
        return;
      }

      // get etransfer jwt
      const authToken = await getAuthToken(true);
      updateAuthToken(authToken);

      setLoading(true, { text: TRANSACTION_APPROVE_LOADING });

      // create order id
      await createOrderWithRetry({
        params: {
          amount,
          fromNetwork: fromNetwork.network,
          toNetwork: toNetwork.network,
          fromSymbol: tokenSymbol,
          toSymbol: tokenSymbol,
          fromAddress: formatAddress(fromWallet.account),
          toAddress: formatAddress(toAddress),
        },
        authToken,
        updateAuthToken,
        updateOrderResult: (orderResult) => {
          orderResultRef.current = orderResult;
          updateOrderResult(orderResult);
        },
      });

      updateSuccessData();

      handleOrderResultValid();

      const params = createTransactionParams({
        walletType: fromWallet.walletType,
        tokenContractAddress,
        toAddress: orderResultRef.current?.address,
        amount,
        decimalsFromWallet,
        orderId: orderResultRef.current?.orderId,
      });

      const sendTransferResult = await fromWallet?.sendTransaction(params);
      updateFirstTxnHash(sendTransferResult);

      if (sendTransferResult) {
        await handleSuccessCallback();
      } else {
        handleFailCallback();
      }

      setLoading(false);
    },
    [
      createOrderWithRetry,
      createTransactionParams,
      formatAddress,
      fromNetwork?.network,
      fromWallet,
      getAuthToken,
      setLoading,
      toNetwork?.network,
      tokenSymbol,
    ],
  );

  return { sendTransferTransaction };
}

export function useSetWalletType() {
  const dispatch = useAppDispatch();
  const { fromNetwork, toNetwork } = useCrossChainTransfer();
  return useCallback(
    (walletType: WalletTypeEnum) => {
      let judgeNetworkFn: (network: string) => boolean = () => false;
      switch (walletType) {
        case WalletTypeEnum.AELF:
          judgeNetworkFn = isAelfChain;
          break;
        case WalletTypeEnum.EVM:
          judgeNetworkFn = isEVMChain;
          break;
        case WalletTypeEnum.SOL:
          judgeNetworkFn = isSolanaChain;
          break;
        case WalletTypeEnum.TRON:
          judgeNetworkFn = isTRONChain;
          break;
        case WalletTypeEnum.TON:
          judgeNetworkFn = isTONChain;
          break;
      }

      if (fromNetwork?.network && judgeNetworkFn(fromNetwork?.network)) {
        dispatch(setFromWalletType(walletType));
      }
      if (toNetwork?.network && judgeNetworkFn(toNetwork?.network)) {
        dispatch(setToWalletType(walletType));
      }
    },
    [dispatch, fromNetwork?.network, toNetwork?.network],
  );
}
