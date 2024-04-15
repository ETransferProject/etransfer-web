import React, { useCallback, useEffect, useMemo } from 'react';
import DepositContent from 'pageComponents/DepositContent';
import WithdrawContent from 'pageComponents/WithdrawContent';
import RecordsContent from 'pageComponents/RecordsContent';
import { useAppDispatch, useCommonState } from 'store/Provider/hooks';
import { SideMenuKey } from 'constants/home';
import styles from './styles.module.scss';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  setActiveMenuKey,
  setCurrentChainItem,
  setIsShowRedDot,
  setRecordCreateTime,
} from 'store/reducers/common/slice';
import { CHAIN_LIST } from 'constants/index';
import clsx from 'clsx';
import { getTokenList } from 'utils/api/deposit';
import { getRecordStatus } from 'utils/api/records';
import { BusinessType } from 'types/api';
import { setCurrentSymbol, setTokenList } from 'store/reducers/token/slice';
import { useWithdraw } from 'hooks/withdraw';
import { compareTwoStringNumbers } from 'utils/calculate';

export default function Content() {
  const dispatch = useAppDispatch();
  const { activeMenuKey, currentChainItem, recordCreateTime } = useCommonState();
  const { currentSymbol: withdrawCurrentSymbol } = useWithdraw();
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
      // Records page not need token
      if (currentActiveMenuKey === SideMenuKey.Records) {
        return;
      }

      const res = await getTokenList({
        type: activeMenuKey as unknown as BusinessType,
        chainId: currentChainItem.key,
      });

      dispatch(
        setTokenList({
          key: activeMenuKey as unknown as BusinessType,
          data: res.tokenList,
        }),
      );

      if (isInitCurrentSymbol && activeMenuKey === SideMenuKey.Withdraw && !withdrawCurrentSymbol) {
        dispatch(
          setCurrentSymbol({
            key: activeMenuKey as unknown as BusinessType,
            symbol: res.tokenList[0].symbol,
          }),
        );
        return;
      }
    },
    [activeMenuKey, currentChainItem.key, dispatch, withdrawCurrentSymbol, currentActiveMenuKey],
  );

  useEffect(() => {
    if (routeQuery.type) {
      dispatch(setActiveMenuKey(routeQuery.type));
    }
    if (routeQuery.chainId) {
      const ChainItemKey = CHAIN_LIST.filter((item) => item.key === routeQuery.chainId);
      dispatch(setCurrentChainItem(ChainItemKey[0]));
    }
    if (routeQuery.tokenSymbol) {
      dispatch(
        setCurrentSymbol({
          key: activeMenuKey as unknown as BusinessType,
          symbol: routeQuery.tokenSymbol,
        }),
      );
      getToken(false);
    } else {
      getToken(true);
    }
    router.push('/');
  }, [activeMenuKey, dispatch, getToken, routeQuery, router]);

  useEffect(() => {
    const fetchRecordStatus = async () => {
      const res = await getRecordStatus();
      if (!res.status || currentActiveMenuKey === SideMenuKey.Records) {
        dispatch(setIsShowRedDot(false));
        return;
      }

      if (compareTwoStringNumbers(res.createTime, recordCreateTime)) {
        dispatch(setIsShowRedDot(true));
        dispatch(setRecordCreateTime(res.createTime));
      }
    };

    fetchRecordStatus();
  }, [dispatch, recordCreateTime, currentActiveMenuKey]);

  const content = useMemo(() => {
    switch (currentActiveMenuKey) {
      case SideMenuKey.Deposit:
        return <DepositContent />;
      case SideMenuKey.Withdraw:
        return <WithdrawContent />;
      case SideMenuKey.Records:
        return <RecordsContent />;
      default:
        return null;
    }
  }, [currentActiveMenuKey]);

  // wide-screen content
  if (currentActiveMenuKey === SideMenuKey.Records) {
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
