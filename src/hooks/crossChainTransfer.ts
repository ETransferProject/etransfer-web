import { sleep } from '@portkey/utils';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useAppDispatch } from 'store/Provider/hooks';
import {
  setFromNetwork,
  setToNetwork,
  setTokenSymbol,
} from 'store/reducers/crossChainTransfer/slice';
import { TNetworkItem } from 'types/api';
import { isAelfChain } from 'utils/wallet';

export function useGoTransfer() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useCallback(
    async (symbol: string, fromNetwork?: string, toNetwork?: string) => {
      dispatch(setTokenSymbol(symbol));

      // TODO
      if (fromNetwork && isAelfChain(fromNetwork)) {
        dispatch(setFromNetwork({ network: fromNetwork } as unknown as TNetworkItem));
      }
      if (toNetwork && isAelfChain(toNetwork)) {
        dispatch(setToNetwork({ network: toNetwork } as unknown as TNetworkItem));
      }

      await sleep(200);
      router.push('/cross-chain-transfer');
    },
    [dispatch, router],
  );
}
