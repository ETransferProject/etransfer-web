import { resetLocalJWT } from 'api/utils';
import { SideMenuKey } from 'constants/home';
import { IChainNameItem } from 'constants/index';
import { PortkeyVersion } from 'constants/wallet';
import { useCallback } from 'react';
import {
  useAppDispatch,
  useCommonState,
  useDepositState,
  useResetStore,
  useWithdrawState,
} from 'store/Provider/hooks';
import { setSwitchVersionAction } from 'store/reducers/common/slice';
import { setToChainItem } from 'store/reducers/deposit/slice';
import { setDisconnectedAction } from 'store/reducers/portkeyWallet/actions';
import { setWithdrawChainItem } from 'store/reducers/withdraw/slice';

export function useCurrentVersion() {
  const { currentVersion } = useCommonState();

  return currentVersion || PortkeyVersion.v2;
}

export function useSetCurrentChainItem() {
  const dispatch = useAppDispatch();

  return useCallback(
    (chainItem: IChainNameItem, key?: SideMenuKey) => {
      switch (key) {
        case SideMenuKey.Deposit:
          dispatch(setToChainItem(chainItem));
          break;
        case SideMenuKey.Withdraw:
          dispatch(setWithdrawChainItem(chainItem));
          break;
        default:
          dispatch(setToChainItem(chainItem));
          dispatch(setWithdrawChainItem(chainItem));
          break;
      }
    },
    [dispatch],
  );
}

export function useClearStore() {
  const dispatch = useAppDispatch();
  const resetStore = useResetStore();

  return useCallback(() => {
    dispatch(setDisconnectedAction());
    dispatch(setSwitchVersionAction(undefined));
    resetStore();
    resetLocalJWT();
  }, [dispatch, resetStore]);
}

export function useMixAllTokenList() {
  const { fromTokenList } = useDepositState();
  const { tokenList } = useWithdrawState();

  const depositTokenList = Array.isArray(fromTokenList) ? fromTokenList : [];
  const withdrawTokenList = Array.isArray(tokenList) ? tokenList : [];

  return depositTokenList?.concat(withdrawTokenList);
}

export function useFindToken() {
  const tokenList = useMixAllTokenList();

  return useCallback(
    (symbol?: string) => {
      if (!symbol) return undefined;
      return tokenList?.find((item) => item.symbol === symbol);
    },
    [tokenList],
  );
}
