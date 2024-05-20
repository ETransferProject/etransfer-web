import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import DepositContent from 'pageComponents/DepositContent';
import WithdrawContent from 'pageComponents/WithdrawContent';
import HistoryContent from 'pageComponents/HistoryContent';
import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import { SideMenuKey } from 'constants/home';
import styles from './styles.module.scss';
import { useRouter, useSearchParams } from 'next/navigation';
import { setActiveMenuKey, setIsShowRedDot } from 'store/reducers/common/slice';
import { useSetCurrentChainItem } from 'hooks/common';
import clsx from 'clsx';
import { getTokenList } from 'utils/api/deposit';
import { BusinessType } from 'types/api';
import { setCurrentSymbol, setTokenList } from 'store/reducers/token/slice';
import { useWithdraw } from 'hooks/withdraw';
import myEvents from 'utils/myEvent';
import { getRecordStatus } from 'utils/api/records';

export const MAX_UPDATE_TIME = 6;

export default function Content() {
  const dispatch = useAppDispatch();
  const { activeMenuKey } = useCommonState();
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

  const updateRecordStatus = useCallback(async () => {
    try {
      const res = await getRecordStatus();
      dispatch(setIsShowRedDot(res.status));
    } catch (error) {
      console.log('update new records error', error);
    }
  }, [dispatch]);

  const updateTimeRef = useRef(MAX_UPDATE_TIME);
  const updateTimerRef = useRef<NodeJS.Timer | number>();
  const handleSetTimer = useCallback(async () => {
    updateTimerRef.current = setInterval(() => {
      --updateTimeRef.current;

      if (updateTimeRef.current === 0) {
        updateRecordStatus();
        updateTimeRef.current = MAX_UPDATE_TIME;
      }
    }, 1000);
  }, [updateRecordStatus]);

  const resetTimer = useCallback(() => {
    clearInterval(updateTimerRef.current);
    updateTimerRef.current = undefined;
    updateTimeRef.current = MAX_UPDATE_TIME;
    handleSetTimer();
  }, [handleSetTimer]);

  useEffect(() => {
    // start 6s countdown
    resetTimer();
    // then, get one-time new record
    updateRecordStatus();

    const { remove } = myEvents.UpdateNewRecordStatus.addListener(() => {
      updateRecordStatus();
    });
    return () => {
      remove();
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = undefined;
    };
  }, [resetTimer, updateRecordStatus]);

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
