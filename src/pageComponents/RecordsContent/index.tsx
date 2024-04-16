import { useCommonState, useAppDispatch, useRecordsState, useLoading } from 'store/Provider/hooks';
import WebRecordsContent from './WebRecordsContent';
import MobileRecordsContent from './MobileDepositContent';
import { getRecordsList } from 'utils/api/records';
import { setRecordsList, setTotalCount, setHasMore } from 'store/reducers/records/slice';
import { useDebounceCallback } from 'hooks';
import { useEffect } from 'react';
import { RecordsRequestType, RecordsRequestStatus } from 'types/records';
import { RecordsListItem } from 'types/api';

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
      const { items: recordsListRes, totalCount } = await getRecordsList({
        type,
        status,
        startTimestamp: (timestamp && timestamp[0] && timestamp[0].valueOf()) || null,
        endTimestamp: (timestamp && timestamp[1] && timestamp[1].valueOf()) || null,
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
    <MobileRecordsContent requestRecordsList={requestRecordsList} />
  ) : (
    <WebRecordsContent requestRecordsList={requestRecordsList} />
  );
}
