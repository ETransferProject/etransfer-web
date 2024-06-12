import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import { SideMenuKey } from 'constants/home';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { setActiveMenuKey } from 'store/reducers/common/slice';

export function useRouteParamType(): { type: SideMenuKey } {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeType = useMemo(() => searchParams.get('type') as SideMenuKey, [searchParams]);
  const dispatch = useAppDispatch();
  const { activeMenuKey } = useCommonState();

  const currentActiveMenuKey = useMemo(
    () => routeType || activeMenuKey,
    [activeMenuKey, routeType],
  );

  useEffect(() => {
    if (routeType) {
      dispatch(setActiveMenuKey(routeType));
    }
  }, [activeMenuKey, dispatch, routeType, router]);

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
  const search = useRouteSearchString();
  const searchParams = useSearchParams();
  const routeType = useMemo(() => searchParams.get('type') as SideMenuKey, [searchParams]);
  const { activeMenuKey } = useCommonState();

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

      if (path === '/' && !routeType) {
        href += `?type=${currentActiveMenuKey}${search ? '&' + search : ''}`;
      } else {
        href += `${search ? '?' + search : ''}`;
      }
      router.push(href);
    },
    [currentActiveMenuKey, routeType, router, search],
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
      routerRef.current(`/${key.toLocaleLowerCase()}}`);
    },
    [dispatch],
  );
}
