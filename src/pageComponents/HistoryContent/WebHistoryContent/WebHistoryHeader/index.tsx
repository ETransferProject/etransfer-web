import styles from './styles.module.scss';
import clsx from 'clsx';
import { Select, DatePicker, Button } from 'antd';
import { useRecordsState, useAppDispatch } from 'store/Provider/hooks';
import { setSkipCount } from 'store/reducers/records/slice';
import { TRecordsRequestStatus, TRecordsStatusI18n } from 'types/records';
import { useCallback, useMemo } from 'react';
import { TRangeValue } from 'types/api';
import { TRecordsContentProps } from 'pageComponents/HistoryContent';
import { Reset } from 'assets/images';
import { SwapRightDefault, SwapRightSelected } from 'assets/images';
import moment from 'moment';
import { useHistoryFilter } from 'hooks/history';
import { END_TIME_FORMAT, START_TIME_FORMAT } from 'constants/records';
import { DATE_FORMATE } from 'constants/misc';
import HeaderTab, { EHeaderTab } from 'pageComponents/HistoryContent/HeaderTab';

const { RangePicker } = DatePicker;

export default function WebRecordsHeader({ requestRecordsList, onReset }: TRecordsContentProps) {
  const dispatch = useAppDispatch();
  const { status, timestamp } = useRecordsState();
  const { setStatusFilter, setTimestampFilter } = useHistoryFilter();

  const handleStatusChange = useCallback(
    (status: TRecordsRequestStatus) => {
      setStatusFilter(status);
      dispatch(setSkipCount(1));
      requestRecordsList();
    },
    [dispatch, requestRecordsList, setStatusFilter],
  );

  const handleDateRangeChange = useCallback(
    (timestamp: TRangeValue) => {
      if (timestamp && timestamp[0] && timestamp[1]) {
        const startTimestampFormat = moment(timestamp[0]).format(START_TIME_FORMAT);
        const endTimestampFormat = moment(timestamp[1]).format(END_TIME_FORMAT);
        setTimestampFilter([
          moment(startTimestampFormat).valueOf(),
          moment(endTimestampFormat).valueOf(),
        ]);
        dispatch(setSkipCount(1));
        requestRecordsList();
      }
    },
    [dispatch, requestRecordsList, setTimestampFilter],
  );

  const isShowReset = useCallback(() => {
    let isShow = false;
    if (status !== 0 || timestamp) {
      isShow = true;
    }
    return isShow;
  }, [status, timestamp]);

  const valueDate: TRangeValue = useMemo(
    () => [
      timestamp?.[0] ? moment(timestamp?.[0]) : null,
      timestamp?.[1] ? moment(timestamp?.[1]) : null,
    ],
    [timestamp],
  );

  return (
    <div className={clsx(styles['web-records-header-wrapper'])}>
      <HeaderTab activeTab={EHeaderTab.TRANSFER} onChange={() => void 0} />
      <div className={clsx(styles['web-records-search-wrapper'])}>
        <Select
          size={'large'}
          value={status}
          className={clsx(styles['web-records-select-status'])}
          onChange={handleStatusChange}
          popupClassName={'drop-wrap'}
          options={[
            { value: TRecordsRequestStatus.ALL, label: 'All Status' },
            { value: TRecordsRequestStatus.Processing, label: TRecordsStatusI18n.Processing },
            { value: TRecordsRequestStatus.Succeed, label: TRecordsStatusI18n.Succeed },
            { value: TRecordsRequestStatus.Failed, label: TRecordsStatusI18n.Failed },
          ]}
        />
        <RangePicker
          size={'large'}
          allowClear={false}
          value={valueDate}
          className={clsx(styles['web-records-range-picker'])}
          format={DATE_FORMATE}
          allowEmpty={[true, true]}
          separator={timestamp ? <SwapRightSelected /> : <SwapRightDefault />}
          onCalendarChange={(dates) => handleDateRangeChange(dates)}
        />
        {isShowReset() && (
          <Button
            className={clsx(styles['web-records-reset-button'])}
            size={'large'}
            onClick={onReset}>
            <Reset className={clsx(styles['web-records-reset-icon'])} />
            <span className={clsx(styles['web-records-reset-word'])}>Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
}
