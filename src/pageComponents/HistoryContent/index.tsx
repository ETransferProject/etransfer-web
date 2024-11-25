import { useCommonState, useAppDispatch, useRecordsState, useLoading } from 'store/Provider/hooks';
import WebHistoryContent from './WebHistoryContent';
import MobileHistoryContent from './MobileHistoryContent';
import { getRecordsList } from 'utils/api/records';
import {
  setRecordsList,
  setTotalCount,
  setHasMore,
  setSkipCount,
  setStatus,
  setTimestamp,
  setType,
  resetRecordsStateNotNotice,
} from 'store/reducers/records/slice';
import { useDebounceCallback } from 'hooks/debounce';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { TRecordsRequestType, TRecordsRequestStatus } from 'types/records';
import { TRecordsListItem } from 'types/api';
import moment from 'moment';
import myEvents from 'utils/myEvent';
import { sleep } from '@portkey/utils';
import { useEffectOnce } from 'react-use';
import { useHistoryFilter } from 'hooks/history';
import { useRouter, useSearchParams } from 'next/navigation';
import queryString from 'query-string';
import { SideMenuKey } from 'constants/home';
import { setActiveMenuKey } from 'store/reducers/common/slice';
import { END_TIME_FORMAT, START_TIME_FORMAT } from 'constants/records';
import { useCheckHasConnectedWallet } from 'hooks/wallet';
import { useGetAllConnectedWalletAccount } from 'hooks/wallet/authToken';

export type TRecordsContentProps = TRecordsBodyProps & {
  onReset: () => void;
};

export type TRecordsBodyProps = {
  requestRecordsList: () => void;
};

export default function Content() {
  const { isPadPX, isUnreadHistory } = useCommonState();
  const dispatch = useAppDispatch();
  const { setFilter } = useHistoryFilter();
  const { setLoading } = useLoading();
  const { hasConnected } = useCheckHasConnectedWallet();
  const hasConnectedRef = useRef(hasConnected);
  hasConnectedRef.current = hasConnected;

  const {
    type = TRecordsRequestType.Transfer,
    status = TRecordsRequestStatus.ALL,
    timestamp,
    skipCount,
    maxResultCount,
    recordsList,
  } = useRecordsState();
  const getAllConnectedWalletAccount = useGetAllConnectedWalletAccount();
  const requestRecordsList = useDebounceCallback(async (isLoading = false) => {
    try {
      if (!hasConnectedRef.current) return;

      isLoading && setLoading(true);

      const startTimestampFormat =
        timestamp?.[0] && moment(timestamp?.[0]).format(START_TIME_FORMAT);
      const endTimestampFormat = timestamp?.[1] && moment(timestamp?.[1]).format(END_TIME_FORMAT);
      const startTimestamp = startTimestampFormat ? moment(startTimestampFormat).valueOf() : null;
      const endTimestamp = endTimestampFormat ? moment(endTimestampFormat).valueOf() : null;

      const connectedAccountList = getAllConnectedWalletAccount();
      const { items: recordsListRes, totalCount } = await getRecordsList({
        type,
        status,
        startTimestamp: startTimestamp,
        endTimestamp: endTimestamp,
        skipCount: (skipCount - 1) * maxResultCount,
        maxResultCount,
        addressList: connectedAccountList.accountList,
      });
      if (isPadPX) {
        let mobileRecordsList = [...recordsList, ...recordsListRes];
        mobileRecordsList = mobileRecordsList.reduce((result: TRecordsListItem[], item) => {
          if (!result.some((it: TRecordsListItem) => it.id === item.id)) {
            result.push(item);
          }
          return result;
        }, []);
        dispatch(setRecordsList(mobileRecordsList));
      } else {
        dispatch(setRecordsList(recordsListRes));
      }
      dispatch(setTotalCount(totalCount));
      // recordsList is load all and hasMore set false
      if (recordsListRes.length < maxResultCount) {
        dispatch(setHasMore(false));
      }
    } catch (error) {
      console.log('records', error);
    } finally {
      setLoading(false);

      await sleep(1000);
      myEvents.UpdateNewRecordStatus.emit();
    }
  }, []);

  const handleReset = useCallback(async () => {
    setFilter({
      status: TRecordsRequestStatus.ALL,
      timeArray: null,
    });
    dispatch(setSkipCount(1));
    if (isPadPX) {
      dispatch(setRecordsList([]));
    }
    await requestRecordsList(true);
  }, [dispatch, isPadPX, requestRecordsList, setFilter]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const routeQuery = useMemo(
    () => ({
      type: searchParams.get('type'),
      status: searchParams.get('status'),
      start: searchParams.get('start'),
      end: searchParams.get('end'),
    }),
    [searchParams],
  );

  useEffectOnce(() => {
    dispatch(setActiveMenuKey(SideMenuKey.History));

    const search: any = {
      type: routeQuery.type != null ? routeQuery.type : undefined,
      status: routeQuery.status != null ? routeQuery.status : undefined,
      start: routeQuery.start != null ? routeQuery.start : undefined,
      end: routeQuery.end != null ? routeQuery.end : undefined,
    };

    if (routeQuery.type != null) {
      dispatch(setType(Number(routeQuery.type)));
    } else {
      search.type = type;
    }

    if (routeQuery.status != null) {
      dispatch(setStatus(Number(routeQuery.status)));
    } else {
      search.status = status;
    }

    const start = timestamp?.[0];
    const end = timestamp?.[1];
    const timeIsAllow = start && !isNaN(start) && end && !isNaN(end);
    if (routeQuery.start != null && routeQuery.end != null) {
      dispatch(setTimestamp([Number(routeQuery.start), Number(routeQuery.end)]));
    } else if (timeIsAllow) {
      search.start = start;
      search.end = end;
    }

    const searchStr = queryString.stringify(search);
    router.replace(`/history${searchStr ? '?' + searchStr : ''}`);

    return () => {
      dispatch(resetRecordsStateNotNotice());
    };
  });

  const init = useCallback(() => {
    if (isUnreadHistory) {
      handleReset();
    } else {
      requestRecordsList(true);
    }
  }, [handleReset, isUnreadHistory, requestRecordsList]);

  const initRef = useRef(init);
  initRef.current = init;

  useEffect(() => {
    if (hasConnected) {
      initRef.current();
    } else {
      dispatch(setSkipCount(1));

      dispatch(setRecordsList([]));
    }
  }, [dispatch, hasConnected, setFilter]);

  // Listener login
  const refreshData = useCallback(() => {
    requestRecordsList(true);
  }, [requestRecordsList]);
  useEffectOnce(() => {
    const { remove } = myEvents.LoginSuccess.addListener(() => refreshData());

    return () => {
      remove();
    };
  });

  // Listener unread records
  useEffectOnce(() => {
    const { remove } = myEvents.HistoryActive.addListener(() => handleReset());

    return () => {
      remove();
    };
  });

  return (
    <div className="wide-screen-content-container">
      {isPadPX ? (
        <MobileHistoryContent requestRecordsList={requestRecordsList} onReset={handleReset} />
      ) : (
        <WebHistoryContent
          requestRecordsList={() => requestRecordsList(true)}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
