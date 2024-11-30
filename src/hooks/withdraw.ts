import { useCallback, useMemo } from 'react';
import { useAppDispatch, useWithdrawState } from 'store/Provider/hooks';
import {
  InitialWithdrawState,
  setCurrentSymbol,
  setWithdrawAddress,
  setWithdrawChainItem,
  setWithdrawCurrentNetwork,
} from 'store/reducers/withdraw/slice';
import { CHAIN_LIST, IChainNameItem } from 'constants/index';
import { sleep } from '@etransfer/utils';
import { TNetworkItem } from 'types/api';
import { useRouter } from 'next/navigation';
import { BlockchainNetworkType } from 'constants/network';
import { useGetAccount } from './wallet/useAelf';
import { removeELFAddressSuffix } from 'utils/aelf/aelfBase';

export function useWithdraw() {
  const { currentChainItem, tokenList, currentSymbol } = useWithdrawState();

  return useMemo(
    () => ({
      tokenList: tokenList || InitialWithdrawState.tokenList,
      currentSymbol: currentSymbol || InitialWithdrawState.currentSymbol,
      currentChainItem: currentChainItem || CHAIN_LIST[0],
    }),
    [tokenList, currentSymbol, currentChainItem],
  );
}

export function useGoWithdraw() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const accounts = useGetAccount();

  return useCallback(
    async (chainItem: IChainNameItem, symbol: string, network?: TNetworkItem) => {
      if (network?.network === BlockchainNetworkType.AELF) {
        dispatch(setWithdrawChainItem(CHAIN_LIST[1]));
      }
      if (network?.network === BlockchainNetworkType.tDVV) {
        dispatch(setWithdrawChainItem(CHAIN_LIST[0]));
      }
      if (network?.network === BlockchainNetworkType.tDVW) {
        dispatch(setWithdrawChainItem(CHAIN_LIST[0]));
      }
      const caAddress = accounts?.[chainItem.key];
      if (caAddress) {
        dispatch(setWithdrawAddress(removeELFAddressSuffix(caAddress)));
      }

      dispatch(setWithdrawCurrentNetwork({ network: chainItem.key } as TNetworkItem));
      dispatch(setCurrentSymbol(symbol));
      await sleep(200);
      router.push('/withdraw');
    },
    [accounts, dispatch, router],
  );
}
