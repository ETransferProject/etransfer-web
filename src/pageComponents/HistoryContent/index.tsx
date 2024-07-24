import { useCommonState, useAppDispatch, useRecordsState, useLoading } from 'store/Provider/hooks';
import WebHistoryContent from './WebHistoryContent';
import MobileHistoryContent from './MobileHistoryContent';
import { getRecordsList } from 'utils/api/records';
import {
  setRecordsList,
  setTotalCount,
  setHasMore,
  setSkipCount,
  setType,
  setStatus,
  setTimestamp,
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
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useSetAuthFromStorage } from 'hooks/authToken';

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
  const { isConnected } = useConnectWallet();

  const {
    type = TRecordsRequestType.ALL,
    status = TRecordsRequestStatus.ALL,
    timestamp,
    skipCount,
    maxResultCount,
    recordsList,
  } = useRecordsState();

  const setAuthFromStorage = useSetAuthFromStorage();
  const requestRecordsList = useDebounceCallback(async (isLoading = false, isSetAuth = false) => {
    try {
      isLoading && setLoading(true);
      if (isSetAuth) {
        const serResult = await setAuthFromStorage();
        if (!serResult) return;
        await sleep(500);
      }

      const startTimestampFormat =
        timestamp?.[0] && moment(timestamp?.[0]).format('YYYY-MM-DD 00:00:00');
      const endTimestampFormat =
        timestamp?.[1] && moment(timestamp?.[1]).format('YYYY-MM-DD 23:59:59');
      const startTimestamp = startTimestampFormat ? moment(startTimestampFormat).valueOf() : null;
      const endTimestamp = endTimestampFormat ? moment(endTimestampFormat).valueOf() : null;

      const { items: recordsListRes, totalCount } = await getRecordsList({
        type,
        status,
        startTimestamp: startTimestamp,
        endTimestamp: endTimestamp,
        skipCount: (skipCount - 1) * maxResultCount,
        maxResultCount,
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

  const handleReset = useCallback(
    async (isSetAuth = false) => {
      setFilter({
        method: TRecordsRequestType.ALL,
        status: TRecordsRequestStatus.ALL,
        timeArray: null,
      });
      dispatch(setSkipCount(1));
      if (isPadPX) {
        dispatch(setRecordsList([]));
      }
      await requestRecordsList(true, isSetAuth);
    },
    [dispatch, isPadPX, requestRecordsList, setFilter],
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const routeQuery = useMemo(
    () => ({
      method: searchParams.get('method'),
      status: searchParams.get('status'),
      start: searchParams.get('start'),
      end: searchParams.get('end'),
    }),
    [searchParams],
  );

  useEffectOnce(() => {
    dispatch(setActiveMenuKey(SideMenuKey.History));

    const search: any = {
      method: routeQuery.method != null ? routeQuery.method : undefined,
      status: routeQuery.status != null ? routeQuery.status : undefined,
      start: routeQuery.start != null ? routeQuery.start : undefined,
      end: routeQuery.end != null ? routeQuery.end : undefined,
    };
    if (routeQuery.method != null) {
      dispatch(setType(Number(routeQuery.method)));
    } else {
      search.method = type;
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
  });

  const init = useCallback(() => {
    if (isUnreadHistory) {
      handleReset(true);
    } else {
      requestRecordsList(true, true);
    }
  }, [handleReset, isUnreadHistory, requestRecordsList]);

  const initRef = useRef(init);
  initRef.current = init;

  useEffect(() => {
    if (isConnected) {
      initRef.current();
    } else {
      setFilter({
        method: TRecordsRequestType.ALL,
        status: TRecordsRequestStatus.ALL,
        timeArray: null,
      });
      dispatch(setSkipCount(1));

      dispatch(setRecordsList([]));
    }
  }, [dispatch, isConnected, setFilter]);

  // Listener login
  const refreshData = useCallback(() => {
    requestRecordsList(true, true);
  }, [requestRecordsList]);
  useEffectOnce(() => {
    const { remove } = myEvents.LoginSuccess.addListener(refreshData);

    return () => {
      remove();
    };
  });

  // Listener unread records
  useEffectOnce(() => {
    const { remove } = myEvents.HistoryActive.addListener(handleReset);

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
