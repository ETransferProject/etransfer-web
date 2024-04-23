import { useCommonState, useAppDispatch, useRecordsState, useLoading } from 'store/Provider/hooks';
import WebHistoryContent from './WebHistoryContent';
import MobileHistoryContent from './MobileHistoryContent';
import { getRecordsList } from 'utils/api/records';
import { setRecordsList, setTotalCount, setHasMore } from 'store/reducers/records/slice';
import { useDebounceCallback } from 'hooks';
import { useEffect } from 'react';
import { RecordsRequestType, RecordsRequestStatus } from 'types/records';
import { RecordsListItem } from 'types/api';
import moment from 'moment';

export default function Content() {
  const { isMobilePX } = useCommonState();
  const dispatch = useAppDispatch();
  const { setLoading } = useLoading();

  const {
    type = RecordsRequestType.ALL,
    status = RecordsRequestStatus.ALL,
    timestamp,
    skipCount,
    maxResultCount,
    recordsList,
  } = useRecordsState();

  const requestRecordsList = useDebounceCallback(async () => {
    try {
      setLoading(true);
      const startTimestamp = timestamp && timestamp[0];
      const startTimestampFromat = moment(startTimestamp).format('YYYY-MM-DD 00:00:00');
      const endTimestamp = timestamp && timestamp[1];
      const endTimestampFromat = moment(endTimestamp).format('YYYY-MM-DD 23:59:59');
      const { items: recordsListRes, totalCount } = await getRecordsList({
        type,
        status,
        startTimestamp: moment(startTimestampFromat).valueOf() || null,
        endTimestamp: moment(endTimestampFromat).valueOf() || null,
        skipCount: (skipCount - 1) * maxResultCount,
        maxResultCount,
      });
      setLoading(false);
      if (isMobilePX) {
        let mobilRecordsList = [...recordsList, ...recordsListRes];
        mobilRecordsList = mobilRecordsList.reduce((result: RecordsListItem[], item) => {
          if (!result.some((it: RecordsListItem) => it.id === item.id)) {
            result.push(item);
          }
          return result;
        }, []);
        dispatch(setRecordsList(mobilRecordsList));
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
    }
  }, []);

  useEffect(() => {
    requestRecordsList();
  }, [requestRecordsList]);

  return isMobilePX ? (
    <MobileHistoryContent requestRecordsList={requestRecordsList} />
  ) : (
    <WebHistoryContent requestRecordsList={requestRecordsList} />
  );
}
