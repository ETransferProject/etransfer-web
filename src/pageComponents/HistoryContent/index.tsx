import { useCommonState, useAppDispatch, useRecordsState, useLoading } from 'store/Provider/hooks';
import WebHistoryContent from './WebHistoryContent';
import MobileHistoryContent from './MobileHistoryContent';
import { getRecordsList } from 'utils/api/records';
import {
  setRecordsList,
  setTotalCount,
  setHasMore,
  setType,
  setStatus,
  setTimestamp,
  setSkipCount,
} from 'store/reducers/records/slice';
import { useDebounceCallback } from 'hooks/debounce';
import { useCallback } from 'react';
import { TRecordsRequestType, TRecordsRequestStatus } from 'types/records';
import { TRecordsListItem } from 'types/api';
import moment from 'moment';
import myEvents from 'utils/myEvent';
import { sleep } from '@portkey/utils';
import { useEffectOnce } from 'react-use';

export type TRecordsContentProps = TRecordsBodyProps & {
  onReset: () => void;
};

export type TRecordsBodyProps = {
  requestRecordsList: () => void;
};

export default function Content() {
  const { isMobilePX, isUnreadHistory } = useCommonState();
  const dispatch = useAppDispatch();
  const { setLoading } = useLoading();

  const {
    type = TRecordsRequestType.ALL,
    status = TRecordsRequestStatus.ALL,
    timestamp,
    skipCount,
    maxResultCount,
    recordsList,
  } = useRecordsState();

  const requestRecordsList = useDebounceCallback(async (isLoading = false) => {
    try {
      isLoading && setLoading(true);

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
      setLoading(false);
      if (isMobilePX) {
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

  const handleReset = useCallback(() => {
    dispatch(setType(TRecordsRequestType.ALL));
    dispatch(setStatus(TRecordsRequestStatus.ALL));
    dispatch(setTimestamp(null));
    dispatch(setSkipCount(1));
    if (isMobilePX) {
      dispatch(setRecordsList([]));
    }
    requestRecordsList(true);
  }, [dispatch, isMobilePX, requestRecordsList]);

  useEffectOnce(() => {
    const { remove } = myEvents.HistoryActive.addListener(handleReset);

    return () => {
      remove();
    };
  });

  useEffectOnce(() => {
    if (isUnreadHistory) {
      handleReset();
    } else {
      requestRecordsList(true);
    }
  });

  return isMobilePX ? (
    <MobileHistoryContent requestRecordsList={requestRecordsList} onReset={handleReset} />
  ) : (
    <WebHistoryContent requestRecordsList={() => requestRecordsList(true)} onReset={handleReset} />
  );
}
