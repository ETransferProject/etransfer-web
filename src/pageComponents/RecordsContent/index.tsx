import { useCommonState, useAppDispatch, useRecordsState } from 'store/Provider/hooks';
import WebRecordsContent from './WebRecordsContent';
import MobileRecordsContent from './MobileDepositContent';
import { getRecordsList } from 'utils/api/records';
import {
  setRecordsList,
  setAddRecordsList,
  setTotalCount,
  setHasMore,
} from 'store/reducers/records/slice';
import { useDebounceCallback } from 'hooks';
import { useEffect } from 'react';

export default function Content() {
  const { isMobilePX } = useCommonState();
  const dispatch = useAppDispatch();
  const { type, status, timestamp, skipCount, maxResultCount } = useRecordsState();

  const requestRecordsList = useDebounceCallback(async () => {
    try {
      const { items: recordsList, totalCount } = await getRecordsList({
        type,
        status,
        startTimestamp: (timestamp && timestamp[0] && timestamp[0].valueOf()) || null,
        endTimestamp: (timestamp && timestamp[1] && timestamp[1].valueOf()) || null,
        skipCount,
        maxResultCount,
      });

      if (isMobilePX) {
        dispatch(setAddRecordsList(recordsList));
      } else {
        dispatch(setRecordsList(recordsList));
      }
      dispatch(setTotalCount(totalCount));
      // recordsList is load all and hasMore set false
      if (recordsList.length < maxResultCount) {
        setHasMore(false);
      }
    } catch (error) {
      console.log('records', error);
    }
  }, [type, status, skipCount, maxResultCount]);

  useEffect(() => {
    requestRecordsList();
  }, [requestRecordsList]);

  return isMobilePX ? (
    <MobileRecordsContent requestRecordsList={requestRecordsList} />
  ) : (
    <WebRecordsContent requestRecordsList={requestRecordsList} />
  );
}
