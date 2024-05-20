import React, { useCallback, useEffect, useMemo } from 'react';
import DepositContent from 'pageComponents/DepositContent';
import WithdrawContent from 'pageComponents/WithdrawContent';
import HistoryContent from 'pageComponents/HistoryContent';
import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import { SideMenuKey } from 'constants/home';
import styles from './styles.module.scss';
import { useRouter, useSearchParams } from 'next/navigation';
import { setActiveMenuKey, setIsShowRedDot } from 'store/reducers/common/slice';
import { useClearStore, useSetCurrentChainItem } from 'hooks/common';
import clsx from 'clsx';
import { getTokenList } from 'utils/api/deposit';
import { BusinessType } from 'types/api';
import { setCurrentSymbol, setTokenList } from 'store/reducers/token/slice';
import { useWithdraw } from 'hooks/withdraw';
import { resetRecordsState } from 'store/reducers/records/slice';
import { useWebLoginEvent, WebLoginEvents } from 'aelf-web-login';

export default function Content() {
  const dispatch = useAppDispatch();
  const clearStore = useClearStore();
  const { activeMenuKey, isMobilePX } = useCommonState();
  const { currentSymbol: withdrawCurrentSymbol, currentChainItem: withdrawCurrentChainItem } =
    useWithdraw();
  const router = useRouter();
  const searchParams = useSearchParams(); // TODO
  // const params: EntryConfig = useParams();
  const routeQuery = useMemo(
    () => ({
      type: searchParams.get('type') as SideMenuKey,
    }),
    [searchParams],
  );

  const currentActiveMenuKey = useMemo(() => {
    return searchParams.get('type') || activeMenuKey;
  }, [activeMenuKey, searchParams]);

  const getToken = useCallback(
    async (isInitCurrentSymbol?: boolean) => {
      // Records page not need token
      if (currentActiveMenuKey !== SideMenuKey.Withdraw) {
        return;
      }

      const res = await getTokenList({
        type: BusinessType.Withdraw,
        chainId: withdrawCurrentChainItem.key,
      });

      dispatch(
        setTokenList({
          key: BusinessType.Withdraw,
          data: res.tokenList,
        }),
      );

      if (isInitCurrentSymbol && !withdrawCurrentSymbol) {
        dispatch(
          setCurrentSymbol({
            key: BusinessType.Withdraw,
            symbol: res.tokenList[0].symbol,
          }),
        );
        return;
      }
    },
    [currentActiveMenuKey, withdrawCurrentChainItem.key, dispatch, withdrawCurrentSymbol],
  );

  const setCurrentChainItem = useSetCurrentChainItem();
  useEffect(() => {
    if (routeQuery.type) {
      dispatch(setActiveMenuKey(routeQuery.type));
    }

    getToken(true);

    router.push('/');
  }, [dispatch, getToken, routeQuery.type, router, setCurrentChainItem]);

  const fetchRecordStatus = useCallback(async () => {
    if (currentActiveMenuKey === SideMenuKey.History) {
      dispatch(setIsShowRedDot(false));
      // update red dot status: had reded
      // await postRecordRead();
      return;
    }
    // const res = await getRecordStatus();
    // dispatch(setIsShowRedDot(res.status));
  }, [dispatch, currentActiveMenuKey]);

  useEffect(() => {
    fetchRecordStatus();
    isMobilePX && dispatch(resetRecordsState());
    // Ignore the impact of the change in fetchRecordStatus, just watch currentActiveMenuKey change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentActiveMenuKey]);

  const logoutAsync = useCallback(async () => {
    console.warn('Emit WebLoginEvents.LOGOUT');
    clearStore();
  }, [clearStore]);

  // addeventListener LOGOUT and init value
  useWebLoginEvent(WebLoginEvents.LOGOUT, logoutAsync);

  const content = useMemo(() => {
    switch (currentActiveMenuKey) {
      case SideMenuKey.Deposit:
        return <DepositContent />;
      case SideMenuKey.Withdraw:
        return <WithdrawContent />;
      case SideMenuKey.History:
        return <HistoryContent />;
      default:
        return null;
    }
  }, [currentActiveMenuKey]);

  // wide-screen content
  if (currentActiveMenuKey === SideMenuKey.History) {
    return <div className={clsx(styles['wide-screen-content-container'])}>{content}</div>;
  }

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
