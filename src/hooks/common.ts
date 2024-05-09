import { SideMenuKey } from 'constants/home';
import { IChainNameItem } from 'constants/index';
import { PortkeyVersion } from 'constants/wallet';
import { useCallback } from 'react';
import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import { setToChainItem } from 'store/reducers/deposit/slice';
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
