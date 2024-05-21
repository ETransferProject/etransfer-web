import { useCommonState, useAppDispatch, useRecordsState, useLoading } from 'store/Provider/hooks';
import WebHistoryContent from './WebHistoryContent';
import MobileHistoryContent from './MobileHistoryContent';
import { getRecordsList } from 'utils/api/records';
import { setRecordsList, setTotalCount, setHasMore } from 'store/reducers/records/slice';
import { useDebounceCallback } from 'hooks';
import { useEffect } from 'react';
import { TRecordsRequestType, TRecordsRequestStatus } from 'types/records';
import { TRecordsListItem } from 'types/api';
import moment from 'moment';
import myEvents from 'utils/myEvent';

export default function Content() {
  const { isMobilePX } = useCommonState();
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

      myEvents.UpdateNewRecordStatus.emit();
    }
  }, []);

  useEffect(() => {
    requestRecordsList(true);
  }, [requestRecordsList]);

  return isMobilePX ? (
    <MobileHistoryContent requestRecordsList={requestRecordsList} />
  ) : (
    <WebHistoryContent requestRecordsList={() => requestRecordsList(true)} />
  );
}
