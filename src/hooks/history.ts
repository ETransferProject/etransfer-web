import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { useAppDispatch } from 'store/Provider/hooks';
import { setType, setStatus, setTimestamp } from 'store/reducers/records/slice';
import { TRecordsRequestType, TRecordsRequestStatus } from 'types/records';
import queryString from 'query-string';

type THistoryFilter = {
  method?: TRecordsRequestType;
  status?: TRecordsRequestStatus;
  timeArray?: number[] | null;
};

export function useHistoryFilter() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const replaceUrl = useCallback(
    (
      key: 'method' | 'status' | 'timeArray' | 'all',
      { method, status, timeArray }: THistoryFilter,
    ) => {
      let search;
      switch (key) {
        case 'method':
          search = queryString.stringify({
            method: String(method),
            status: searchParams.get('status') || undefined,
            start: searchParams.get('start') || undefined,
            end: searchParams.get('end') || undefined,
          });
          break;
        case 'status':
          search = queryString.stringify({
            status,
            method: searchParams.get('method') || undefined,
            start: searchParams.get('start') || undefined,
            end: searchParams.get('end') || undefined,
          });
          break;
        case 'timeArray':
          search = queryString.stringify({
            method: searchParams.get('method') || undefined,
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
            method,
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

  const setMethodFilter = useCallback(
    (method: TRecordsRequestType) => {
      dispatch(setType(method));
      replaceUrlRef.current('method', { method });
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
    ({ method, status, timeArray }: Required<THistoryFilter>) => {
      dispatch(setType(method));
      dispatch(setStatus(status));
      dispatch(setTimestamp(timeArray));
      replaceUrlRef.current('all', { method, status, timeArray });
    },
    [dispatch],
  );

  return {
    setMethodFilter,
    setStatusFilter,
    setTimestampFilter,
    setFilter,
  };
}
