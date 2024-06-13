import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import { SideMenuKey } from 'constants/home';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { setActiveMenuKey } from 'store/reducers/common/slice';
import { stringifyUrl } from 'query-string';

export function useRouteParamType(): { type: SideMenuKey } {
  const router = useRouter();
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
    if (routeType && pathname === '/') {
      dispatch(setActiveMenuKey(routeType));
    }
  }, [activeMenuKey, dispatch, pathname, routeType, router]);

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

      default:
        break;
    }

    return result || activeMenuKey;
  }, [activeMenuKey, pathname]);

  return useCallback(
    (path: string) => {
      let href = path.toLocaleLowerCase();
      const search = checkAllowSearch(path.toLocaleLowerCase());
      if (path === '/' && !routeType) {
        href = stringifyUrl({
          url: path.toLocaleLowerCase(),
          query: {
            ...search,
            type: currentActiveMenuKey,
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

        case '/history':
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
  const routerPush = useRouterPush();
  const routerRef = useRef(routerPush);

  return useCallback(
    (key: SideMenuKey) => {
      console.log('>>>useChangeSideMenu', key);
      dispatch(setActiveMenuKey(key));
      routerRef.current(`/${key.toLocaleLowerCase()}`);
    },
    [dispatch],
  );
}
