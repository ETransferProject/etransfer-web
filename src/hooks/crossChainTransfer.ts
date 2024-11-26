import { sleep } from '@portkey/utils';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useAppDispatch, useCrossChainTransfer, useLoading } from 'store/Provider/hooks';
import {
  InitialCrossChainTransferState,
  setFromNetwork,
  setToNetwork,
  setTokenSymbol,
} from 'store/reducers/crossChainTransfer/slice';
import { TCreateWithdrawOrderResult, TNetworkItem } from 'types/api';
import { getCaHashAndOriginChainIdByWallet, getManagerAddressByWallet } from 'utils/wallet';
import { useGetBalanceDivDecimals } from './contract';
import { ZERO } from '@etransfer/utils';
import { ErrorNameType } from 'constants/crossChainTransfer';
import { checkTokenAllowanceAndApprove, createTransferTokenTransaction } from 'utils/contract';
import { createWithdrawOrder } from 'utils/api/withdraw';
import { isDIDAddressSuffix, removeELFAddressSuffix } from 'utils/aelf/aelfBase';
import { useDebounceCallback } from './debounce';
import { InsufficientAllowanceMessage } from 'constants/withdraw';
import { WalletInfo } from 'types/wallet';
import { timesDecimals } from 'utils/calculate';
import useAelf, { useGetAccount } from './wallet/useAelf';
import { ADDRESS_MAP, SupportedELFChainId } from 'constants/index';
import { WalletTypeEnum as AelfWalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { ContractType } from 'constants/chain';
import { useAelfAuthToken } from './wallet/aelfAuthToken';
import { isAuthTokenError } from 'utils/api/error';

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
      successCallback: () => void;
      failCallback: () => void;
    }) => {
      if (!toNetwork?.network) throw new Error('Please selected network');

      const params = {
        network: toNetwork?.network,
        symbol: tokenSymbol,
        amount,
        memo,
        fromChainId: chainId,
        toAddress: isDIDAddressSuffix(address) ? removeELFAddressSuffix(address) : address,
        rawTransaction: rawTransaction,
      };
      let createWithdrawOrderRes: TCreateWithdrawOrderResult = { orderId: '', transactionId: '' };
      try {
        createWithdrawOrderRes = await createWithdrawOrder(params);
      } catch (error) {
        if (isAuthTokenError(error)) {
          const _authToken = await queryAelfAuthToken();
          createWithdrawOrderRes = await createWithdrawOrder(params, _authToken);
        }
      }
      console.log(
        '>>>>>> handleCreateWithdrawOrder createWithdrawOrderRes',
        createWithdrawOrderRes,
      );
      if (createWithdrawOrderRes.orderId) {
        successCallback();
      } else {
        failCallback();
      }
    },
    [chainId, queryAelfAuthToken, toNetwork?.network, tokenSymbol],
  );

  const sendTransferTokenTransaction = useDebounceCallback(
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
      successCallback: () => void;
      failCallback: () => void;
    }) => {
      setLoading(true, { text: 'Please approve the transaction in the wallet...' });
      if (!address) throw new Error('Please enter a correct address.');

      // get etransfer jwt
      await getAelfAuthToken();

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
    [currentEtransferContractAddress, handleApproveToken, setLoading],
  );

  return { sendTransferTokenTransaction };
}
