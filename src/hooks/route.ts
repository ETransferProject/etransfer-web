import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import { SideMenuKey } from 'constants/home';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { setActiveMenuKey } from 'store/reducers/common/slice';
import { stringifyUrl } from 'query-string';
import { TWithdrawEntryConfig } from 'types';

export function useRouteParamType(): { type: SideMenuKey } {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeType = useMemo(() => searchParams.get('type') as SideMenuKey, [searchParams]);
  const dispatch = useAppDispatch();
  const { activeMenuKey } = useCommonState();

  const currentActiveMenuKey = useMemo(
    () => routeType || activeMenuKey,
    [activeMenuKey, routeType],
  );

  useEffect(() => {
    if (pathname === '/withdraw') {
      // TODO
    }
    if (routeType && pathname === '/') {
      dispatch(setActiveMenuKey(routeType));
    }
  }, [activeMenuKey, dispatch, pathname, routeType]);

  return { type: currentActiveMenuKey };
}

export function useRouteSearchString() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  return params.toString();
}

export function useRouterPush() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeType = useMemo(() => searchParams.get('type') as SideMenuKey, [searchParams]);
  const { activeMenuKey } = useCommonState();
  const checkAllowSearch = useCheckAllowSearch();

  const currentActiveMenuKey = useMemo(() => {
    let result = '';
    switch (pathname) {
      case `/${SideMenuKey.Deposit.toLocaleLowerCase()}`:
        result = SideMenuKey.Deposit;
        break;
      case `/${SideMenuKey.Withdraw.toLocaleLowerCase()}`:
        result = SideMenuKey.Withdraw;
        break;
      case `/${SideMenuKey.History.toLocaleLowerCase()}`:
        result = SideMenuKey.History;
        break;
      case `/${SideMenuKey.Info.toLocaleLowerCase()}`:
        result = SideMenuKey.Info;
        break;
      case `/cross-chain-transfer`:
        result = SideMenuKey.CrossChainTransfer;
        break;

      default:
        break;
    }

    return result || activeMenuKey;
  }, [activeMenuKey, pathname]);

  return useCallback(
    (path: string, isAddType = true) => {
      let href = path.toLocaleLowerCase();
      const search = checkAllowSearch(path.toLocaleLowerCase());
      if (path === '/' && !routeType) {
        href = stringifyUrl({
          url: path.toLocaleLowerCase(),
          query: {
            ...search,
            type: isAddType ? currentActiveMenuKey : undefined,
          },
        });
      } else {
        href = stringifyUrl({
          url: path.toLocaleLowerCase(),
          query: Object.keys(search).length > 0 ? search : undefined,
        });
      }
      router.push(href);
    },
    [checkAllowSearch, currentActiveMenuKey, routeType, router],
  );
}

export function useCheckAllowSearch() {
  const searchParams = useSearchParams();

  return useCallback(
    (path: string) => {
      const searchObject: Record<string, string | null> = {};
      switch (path) {
        case '/':
          if (searchParams.get('chainId')) searchObject.chainId = searchParams.get('chainId');
          if (searchParams.get('tokenSymbol'))
            searchObject.tokenSymbol = searchParams.get('tokenSymbol');
          if (searchParams.get('depositToToken'))
            searchObject.depositToToken = searchParams.get('depositToToken');
          if (searchParams.get('depositFromNetwork'))
            searchObject.depositFromNetwork = searchParams.get('depositFromNetwork');
          if (searchParams.get('calculatePay'))
            searchObject.calculatePay = searchParams.get('calculatePay');
          if (searchParams.get('withdrawAddress'))
            searchObject.withdrawAddress = searchParams.get('withdrawAddress');
          if (searchParams.get('method')) searchObject.method = searchParams.get('method');
          if (searchParams.get('status')) searchObject.status = searchParams.get('status');
          if (searchParams.get('start')) searchObject.start = searchParams.get('start');
          if (searchParams.get('end')) searchObject.end = searchParams.get('end');
          break;

        case '/deposit':
          if (searchParams.get('chainId')) searchObject.chainId = searchParams.get('chainId');
          if (searchParams.get('tokenSymbol'))
            searchObject.tokenSymbol = searchParams.get('tokenSymbol');
          if (searchParams.get('depositToToken'))
            searchObject.depositToToken = searchParams.get('depositToToken');
          if (searchParams.get('depositFromNetwork'))
            searchObject.depositFromNetwork = searchParams.get('depositFromNetwork');
          if (searchParams.get('calculatePay'))
            searchObject.calculatePay = searchParams.get('calculatePay');
          break;

        case '/withdraw':
          if (searchParams.get('chainId')) searchObject.chainId = searchParams.get('chainId');
          if (searchParams.get('tokenSymbol'))
            searchObject.tokenSymbol = searchParams.get('tokenSymbol');
          if (searchParams.get('withdrawAddress'))
            searchObject.withdrawAddress = searchParams.get('withdrawAddress');
          break;

        case '/transfer':
          if (searchParams.get('fromNetwork'))
            searchObject.chainId = searchParams.get('fromNetwork');
          if (searchParams.get('toNetwork'))
            searchObject.withdrawAddress = searchParams.get('toNetwork');
          if (searchParams.get('tokenSymbol'))
            searchObject.tokenSymbol = searchParams.get('tokenSymbol');
          break;

        case '/history':
          if (searchParams.get('method')) searchObject.method = searchParams.get('method');
          if (searchParams.get('status')) searchObject.status = searchParams.get('status');
          if (searchParams.get('start')) searchObject.start = searchParams.get('start');
          if (searchParams.get('end')) searchObject.end = searchParams.get('end');
          break;

        default:
          break;
      }
      return searchObject;
    },
    [searchParams],
  );
}

export function useChangeSideMenu() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const routerRef = useRef(router.push);
  routerRef.current = router.push;

  return useCallback(
    (key: SideMenuKey, pathname: string) => {
      console.log('>>>useChangeSideMenu', key);
      dispatch(setActiveMenuKey(key));
      routerRef.current(pathname);
    },
    [dispatch],
  );
}

export function useWithdrawRouter() {
  const router = useRouter();
  const routerRef = useRef(router.push);
  routerRef.current = router.push;

  return useCallback((search: TWithdrawEntryConfig) => {
    const href = stringifyUrl({
      url: '/withdraw',
      query: Object.keys(search).length > 0 ? search : undefined,
    });
    routerRef.current(href);
  }, []);
}
