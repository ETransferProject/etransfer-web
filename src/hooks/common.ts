import { resetLocalJWT } from 'api/utils';
import { SideMenuKey } from 'constants/home';
import { IChainNameItem } from 'constants/index';
import { PortkeyVersion } from 'constants/wallet';
import { useCallback, useEffect, useRef } from 'react';
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
import { useIsActive } from './portkeyWallet';
import { useChangeSideMenu, useRouterPush } from './route';
import { usePathname } from 'next/navigation';

export function useActivePage() {
  const pathname = usePathname();
  const isActive = useIsActive();
  const { activeMenuKey } = useCommonState();
  const changeSideMenu = useChangeSideMenu();
  const routerPush = useRouterPush();
  const routerRef = useRef(routerPush);

  useEffect(() => {
    console.log('>>>>>> useActivePage', isActive);
    if (isActive) {
      switch (activeMenuKey) {
        case SideMenuKey.Deposit:
          if (pathname !== '/deposit') routerRef.current('/deposit');
          break;
        case SideMenuKey.Withdraw:
          if (pathname !== '/withdraw') routerRef.current('/withdraw');
          break;
        case SideMenuKey.History:
          if (pathname !== '/history') routerRef.current('/history');
          break;

        default:
          if (!activeMenuKey) {
            changeSideMenu(SideMenuKey.Deposit);
          }
          break;
      }
    } else {
      routerRef.current('/');
    }
  }, [activeMenuKey, changeSideMenu, isActive, pathname]);
}

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
  const routerPush = useRouterPush();

  return useCallback(() => {
    dispatch(setDisconnectedAction());
    dispatch(setSwitchVersionAction(undefined));
    resetStore();
    resetLocalJWT();
    routerPush('/');
  }, [dispatch, resetStore, routerPush]);
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
