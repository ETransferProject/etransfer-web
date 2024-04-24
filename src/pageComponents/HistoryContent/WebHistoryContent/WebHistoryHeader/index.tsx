import styles from './styles.module.scss';
import clsx from 'clsx';
import { Select, DatePicker, Button } from 'antd';
import { useRecordsState, useAppDispatch } from 'store/Provider/hooks';
import { setType, setStatus, setTimestamp, setSkipCount } from 'store/reducers/records/slice';
import { RecordsRequestType, RecordsRequestStatus, RecordsStatusI18n } from 'types/records';
import { useCallback } from 'react';
import { RangeValue, TRecordsContentParams, BusinessType } from 'types/api';
import { Reset } from 'assets/images';
import { SwapRightDefault, SwapRightSelected } from 'assets/images';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

export default function WebRecordsHeader({ requestRecordsList }: TRecordsContentParams) {
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
      <div className={clsx(styles['web-records-title'])}>History</div>
      <div className={clsx(styles['web-records-search-wrapper'])}>
        <Select
          size={'large'}
          value={type}
          className={clsx(styles['web-records-select-type'])}
          onChange={handleTypeChange}
          popupClassName={'drop-wrap'}
          options={[
            { value: RecordsRequestType.ALL, label: 'ALL' },
            { value: RecordsRequestType.Deposits, label: BusinessType.Deposit },
            { value: RecordsRequestType.Withdraws, label: BusinessType.Withdraw },
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
            { value: RecordsRequestStatus.Processing, label: RecordsStatusI18n.Processing },
            { value: RecordsRequestStatus.Succeed, label: RecordsStatusI18n.Succeed },
            { value: RecordsRequestStatus.Failed, label: RecordsStatusI18n.Failed },
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
