import React, { useCallback, useEffect, useMemo } from 'react';
import DepositContent from 'pageComponents/DepositContent';
import WithdrawContent from 'pageComponents/WithdrawContent';
import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import { SideMenuKey } from 'constants/home';
import styles from './styles.module.scss';
import { useRouter, useSearchParams } from 'next/navigation';
import { setActiveMenuKey, setCurrentChainItem } from 'store/reducers/common/slice';
import { CHAIN_LIST } from 'constants/index';
import clsx from 'clsx';
import { getTokenList } from 'utils/api/deposit';
import { BusinessType } from 'types/api';
import { setCurrentSymbol, setTokenList } from 'store/reducers/token/slice';
import { setHash } from 'utils/useLocation';

export default function Content() {
  const dispatch = useAppDispatch();
  const { activeMenuKey, currentChainItem } = useCommonState();
  const router = useRouter();
  const searchParams = useSearchParams(); // TODO
  // const params: EntryConfig = useParams();
  const routeQuery = useMemo(
    () => ({
      type: searchParams.get('type') as SideMenuKey,
      chainId: searchParams.get('chainId'),
      tokenSymbol: searchParams.get('tokenSymbol'),
      depositFromNetwork: searchParams.get('depositFromNetwork'),
      withDrawAddress: searchParams.get('withDrawAddress'),
      withDrawNetwork: searchParams.get('withDrawNetwork'),
      withDrawAmount: searchParams.get('withDrawAmount'),
    }),
    [searchParams],
  );

  const currentActiveMenuKey = useMemo(() => {
    return searchParams.get('type') || activeMenuKey;
  }, [activeMenuKey, searchParams]);

  const getToken = useCallback(
    async (isInitCurrentSymbol?: boolean) => {
      const res = await getTokenList({
        type: activeMenuKey as unknown as BusinessType,
        chainId: currentChainItem.key,
      });
      dispatch(setTokenList(res.tokenList));

      if (isInitCurrentSymbol) {
        dispatch(setCurrentSymbol(res.tokenList[0].symbol));
        return;
      }
    },
    [activeMenuKey, currentChainItem.key, dispatch],
  );

  useEffect(() => {
    if (routeQuery.type) {
      dispatch(setActiveMenuKey(routeQuery.type));

      setHash(routeQuery.type);
    }
    if (routeQuery.chainId) {
      const ChainItemKey = CHAIN_LIST.filter((item) => item.key === routeQuery.chainId);
      dispatch(setCurrentChainItem(ChainItemKey[0]));
    }
    if (routeQuery.tokenSymbol) {
      dispatch(setCurrentSymbol(routeQuery.tokenSymbol));
      getToken(false);
    } else {
      getToken(true);
    }
    router.push('/');
  }, [dispatch, getToken, routeQuery, router]);

  const content = useMemo(
    () =>
      currentActiveMenuKey === SideMenuKey.Withdraw ? <WithdrawContent /> : <DepositContent />,
    [currentActiveMenuKey],
  );
  return (
    <div
      className={clsx(styles['content-container'], styles['content-container-safe-area'], {
        [styles['deposit-content-container']]: currentActiveMenuKey === SideMenuKey.Deposit,
        [styles['withdraw-content-container']]: currentActiveMenuKey === SideMenuKey.Withdraw,
      })}>
      {content}
    </div>
  );
}
