import styles from './styles.module.scss';
import clsx from 'clsx';
import { Select, DatePicker, Button } from 'antd';
import { useRecordsState, useAppDispatch } from 'store/Provider/hooks';
import { setType, setStatus, setTimestamp, setSkipCount } from 'store/reducers/records/slice';
import { RecordsRequestType, RecordsRequestStatus } from 'types/records';
import { useCallback } from 'react';
import { RangeValue, RecordsContentParams } from 'types/api';
import { Reset } from 'assets/images';
import { SwapRightDefault, SwapRightSelected } from 'assets/images';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

export default function WebRecordsHeader({ requestRecordsList }: RecordsContentParams) {
  const dispatch = useAppDispatch();
  const { type, status, timestamp } = useRecordsState();

  const handleTypeChange = useCallback(
    (type: RecordsRequestType) => {
      dispatch(setType(type));
      dispatch(setSkipCount(1));
      requestRecordsList();
    },
    [dispatch, requestRecordsList],
  );

  const handleStatusChange = useCallback(
    (status: RecordsRequestStatus) => {
      dispatch(setStatus(status));
      dispatch(setSkipCount(1));
      requestRecordsList();
    },
    [dispatch, requestRecordsList],
  );

  const handleDateRangeChange = useCallback(
    (timestamp: RangeValue) => {
      if (timestamp && timestamp[0] && timestamp[1]) {
        dispatch(setTimestamp(timestamp));
        dispatch(setSkipCount(1));
        requestRecordsList();
      }
    },
    [dispatch, requestRecordsList],
  );

  const isShowReset = useCallback(() => {
    let isShow = false;
    if (type !== 0 || status !== 0 || timestamp) {
      isShow = true;
    }
    return isShow;
  }, [type, status, timestamp]);

  const handleReset = useCallback(() => {
    dispatch(setType(RecordsRequestType.ALL));
    dispatch(setStatus(RecordsRequestStatus.ALL));
    dispatch(setTimestamp(null));
    dispatch(setSkipCount(1));
    requestRecordsList();
  }, [dispatch, requestRecordsList]);

  return (
    <div className={clsx(styles['web-records-header-wrapper'])}>
      <div className={clsx(styles['web-records-title'])}>Records</div>
      <div className={clsx(styles['web-records-search-wrapper'])}>
        <Select
          size={'large'}
          value={type}
          className={clsx(styles['web-records-select-type'])}
          onChange={handleTypeChange}
          popupClassName={'drop-wrap'}
          options={[
            { value: RecordsRequestType.ALL, label: 'ALL' },
            { value: RecordsRequestType.Deposits, label: 'Deposits' },
            { value: RecordsRequestType.Withdraws, label: 'Withdraws' },
          ]}
        />
        <Select
          size={'large'}
          value={status}
          className={clsx(styles['web-records-select-status'])}
          onChange={handleStatusChange}
          popupClassName={'drop-wrap'}
          options={[
            { value: RecordsRequestStatus.ALL, label: 'ALL' },
            { value: RecordsRequestStatus.Processing, label: 'Pending' },
            { value: RecordsRequestStatus.Succeed, label: 'Completed' },
            { value: RecordsRequestStatus.Failed, label: 'Failed' },
          ]}
        />
        <RangePicker
          size={'large'}
          allowClear={false}
          value={timestamp}
          className={clsx(styles['web-records-range-picker'])}
          format={dateFormat}
          allowEmpty={[true, true]}
          separator={timestamp ? <SwapRightSelected /> : <SwapRightDefault />}
          onCalendarChange={(dates) => handleDateRangeChange(dates)}
        />
        {isShowReset() && (
          <Button
            className={clsx(styles['web-records-reset-button'])}
            size={'large'}
            onClick={handleReset}>
            <Reset className={clsx(styles['web-records-reset-icon'])} />
            <span className={clsx(styles['web-records-reset-word'])}>Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
}
