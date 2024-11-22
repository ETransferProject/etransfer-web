import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { useAppDispatch } from 'store/Provider/hooks';
import { setType, setStatus, setTimestamp } from 'store/reducers/records/slice';
import { TRecordsRequestType, TRecordsRequestStatus } from 'types/records';
import queryString from 'query-string';

type THistoryFilter = {
  type?: TRecordsRequestType;
  status?: TRecordsRequestStatus;
  timeArray?: number[] | null;
};

export function useHistoryFilter() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const replaceUrl = useCallback(
    (key: 'type' | 'status' | 'timeArray' | 'all', { type, status, timeArray }: THistoryFilter) => {
      let search;
      switch (key) {
        case 'type':
          search = queryString.stringify({
            type,
            status: TRecordsRequestStatus.ALL,
          });
          break;
        case 'status':
          search = queryString.stringify({
            type: searchParams.get('type') || undefined,
            status,
            start: searchParams.get('start') || undefined,
            end: searchParams.get('end') || undefined,
          });
          break;
        case 'timeArray':
          search = queryString.stringify({
            type: searchParams.get('type') || undefined,
            status: searchParams.get('status') || undefined,
            start:
              typeof timeArray?.[0] === 'number' && !isNaN(timeArray?.[0])
                ? timeArray?.[0]
                : undefined,
            end:
              typeof timeArray?.[1] === 'number' && !isNaN(timeArray?.[0])
                ? timeArray?.[1]
                : undefined,
          });
          break;
        case 'all':
          search = queryString.stringify({
            type: searchParams.get('type') || undefined,
            status,
            start: timeArray?.[0],
            end: timeArray?.[1],
          });
          break;

        default:
          break;
      }
      router.replace(`/history${search ? '?' + search : ''}`);
    },
    [router, searchParams],
  );
  const replaceUrlRef = useRef(replaceUrl);
  replaceUrlRef.current = replaceUrl;

  const setTypeFilter = useCallback(
    (type: TRecordsRequestType) => {
      dispatch(setType(type));
      dispatch(setStatus(TRecordsRequestStatus.ALL));
      dispatch(setTimestamp(null));
      replaceUrlRef.current('type', { type });
    },
    [dispatch],
  );

  const setStatusFilter = useCallback(
    (status: TRecordsRequestStatus) => {
      dispatch(setStatus(status));
      replaceUrlRef.current('status', { status });
    },
    [dispatch],
  );

  const setTimestampFilter = useCallback(
    (timeArray: number[] | null) => {
      dispatch(setTimestamp(timeArray));
      replaceUrlRef.current('timeArray', { timeArray });
    },
    [dispatch],
  );

  const setFilter = useCallback(
    ({ status, timeArray }: Required<Pick<THistoryFilter, 'status' | 'timeArray'>>) => {
      dispatch(setStatus(status));
      dispatch(setTimestamp(timeArray));
      replaceUrlRef.current('all', { status, timeArray });
    },
    [dispatch],
  );

  return {
    setTypeFilter,
    setStatusFilter,
    setTimestampFilter,
    setFilter,
  };
}
