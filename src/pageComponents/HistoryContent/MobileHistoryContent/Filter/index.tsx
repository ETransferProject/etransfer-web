import { useState, useCallback, useMemo } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { FilterIcon, CloseSmall } from 'assets/images';
import { useRecordsState, useAppDispatch } from 'store/Provider/hooks';
import { setSkipCount, setRecordsList } from 'store/reducers/records/slice';
import { TRecordsRequestStatus, TRecordsStatusI18n } from 'types/records';
import CommonDrawer from 'components/CommonDrawer';
import CommonButton, { CommonButtonType } from 'components/CommonButton';
import { Select, DatePicker } from 'antd';
import type { Moment } from 'moment';
import { TRecordsContentProps } from 'pageComponents/HistoryContent';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import moment from 'moment';
import { useHistoryFilter } from 'hooks/history';
import SimpleTipModal from 'pageComponents/Modal/SimpleTipModal';
import { END_TIME_FORMAT, START_TIME_FORMAT } from 'constants/records';
import { DATE_FORMATE } from 'constants/misc';

export default function Filter({ requestRecordsList, onReset }: TRecordsContentProps) {
  const dispatch = useAppDispatch();
  const { status, timestamp } = useRecordsState();
  const [isShowFilterDrawer, setIsShowFilterDrawer] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TRecordsRequestStatus>(status);
  const [filterTimestampStart, setFilterTimestampStart] = useState<Moment | null>(
    timestamp?.[0] ? moment(timestamp?.[0]) : null,
  );
  const [filterTimestampEnd, setFilterTimestampEnd] = useState<Moment | null>(
    timestamp?.[1] ? moment(timestamp?.[1]) : null,
  );

  const isShowReset = useMemo(() => {
    if (status !== 0 || timestamp?.[0] || timestamp?.[1]) {
      return true;
    }
    return false;
  }, [status, timestamp]);

  const isShowTimestamp = useCallback(() => {
    let isShow = false;
    if (timestamp?.[0]?.valueOf()) {
      isShow = true;
    }
    if (timestamp?.[1]?.valueOf()) {
      isShow = true;
    }
    return isShow;
  }, [timestamp]);

  const [openTipModal, setOpenTipModal] = useState(false);

  const { setFilter, setStatusFilter, setTimestampFilter } = useHistoryFilter();
  const closeItem = useCallback(
    (clickType: string) => {
      switch (clickType) {
        case 'status':
          setStatusFilter(TRecordsRequestStatus.ALL);
          break;
        case 'timestamp':
          setTimestampFilter(null);
          break;
        default:
          break;
      }
      dispatch(setSkipCount(1));
      dispatch(setRecordsList([]));
      requestRecordsList();
    },
    [dispatch, requestRecordsList, setStatusFilter, setTimestampFilter],
  );

  const handleResetFilter = useCallback(() => {
    setFilterStatus(TRecordsRequestStatus.ALL);
    setFilterTimestampStart(null);
    setFilterTimestampEnd(null);
    dispatch(setSkipCount(1));
  }, [dispatch]);

  const handleApplyFilter = useCallback(() => {
    const start = moment(filterTimestampStart).valueOf();
    const end = moment(filterTimestampEnd).valueOf();
    const timeIsNaN = isNaN(start) || isNaN(end);
    const oneTimeIsNaN = (isNaN(start) && !isNaN(end)) || (!isNaN(start) && isNaN(end));

    if (oneTimeIsNaN) {
      setOpenTipModal(true);
      return;
    }

    // format
    const startTimestampFormat = moment(
      moment(filterTimestampStart).format(START_TIME_FORMAT),
    ).valueOf();
    const endTimestampFormat = moment(moment(filterTimestampEnd).format(END_TIME_FORMAT)).valueOf();

    setFilter({
      status: filterStatus,
      timeArray: timeIsNaN ? null : [startTimestampFormat, endTimestampFormat],
    });
    dispatch(setSkipCount(1));
    dispatch(setRecordsList([]));
    setIsShowFilterDrawer(false);
    requestRecordsList();
  }, [
    setFilter,
    filterStatus,
    filterTimestampStart,
    filterTimestampEnd,
    dispatch,
    requestRecordsList,
  ]);

  const handleOpenFilterDrawer = useCallback(() => {
    setFilterStatus(status);
    setFilterTimestampStart(timestamp?.[0] ? moment(timestamp[0]) : null);
    setFilterTimestampEnd(timestamp?.[1] ? moment(timestamp?.[1]) : null);

    setIsShowFilterDrawer(true);
  }, [status, timestamp]);

  return (
    <div className={clsx(styles['filter-wrapper'])}>
      <div className={styles['filter-item-wrapper']}>
        <FilterIcon className={styles['filter-icon']} onClick={handleOpenFilterDrawer} />
        {status !== TRecordsRequestStatus.ALL && (
          <div className={styles['filter-item']}>
            {status === TRecordsRequestStatus.Processing && TRecordsStatusI18n.Processing}
            {status === TRecordsRequestStatus.Succeed && TRecordsStatusI18n.Succeed}
            {status === TRecordsRequestStatus.Failed && TRecordsStatusI18n.Failed}
            <CloseSmall
              className={styles['filter-close-icon']}
              onClick={() => closeItem('status')}
            />
          </div>
        )}
        {isShowTimestamp() && (
          <div className={styles['filter-item']}>
            {(timestamp?.[0] && moment(timestamp[0]).format(DATE_FORMATE)) ||
              `${DEFAULT_NULL_VALUE}`}
            {' - '}
            {(timestamp?.[1] && moment(timestamp[1]).format(DATE_FORMATE)) ||
              `${DEFAULT_NULL_VALUE}`}
            <CloseSmall
              className={styles['filter-close-icon']}
              onClick={() => closeItem('timestamp')}
            />
          </div>
        )}
        {isShowReset && (
          <div className={clsx(styles['filter-reset'])} onClick={onReset}>
            Reset
          </div>
        )}
      </div>
      <CommonDrawer
        open={isShowFilterDrawer}
        height={'100%'}
        title={<div className={styles['filter-title']}>Filters</div>}
        id="historyFilterDrawer"
        className={styles['filter-drawer-wrapper']}
        destroyOnClose
        placement={'right'}
        footer={
          <div className={styles['drawer-button-wrapper']}>
            <CommonButton
              className={styles['cancel-button']}
              type={CommonButtonType.Secondary}
              onClick={handleResetFilter}>
              {'Reset'}
            </CommonButton>
            <CommonButton className={styles['ok-button']} onClick={() => handleApplyFilter()}>
              {'Apply'}
            </CommonButton>
          </div>
        }
        onClose={() => setIsShowFilterDrawer(!isShowFilterDrawer)}>
        <div className={styles['filter-drawer-content']}>
          <div className={styles['filter-drawer-label']}>Status</div>
          <Select
            size={'large'}
            value={filterStatus}
            className={clsx(styles['mobile-records-select-status'], styles['border-change'])}
            onChange={setFilterStatus}
            popupClassName={'drop-wrap'}
            options={[
              { value: TRecordsRequestStatus.ALL, label: 'All' },
              { value: TRecordsRequestStatus.Processing, label: TRecordsStatusI18n.Processing },
              { value: TRecordsRequestStatus.Succeed, label: TRecordsStatusI18n.Succeed },
              { value: TRecordsRequestStatus.Failed, label: TRecordsStatusI18n.Failed },
            ]}
          />
          <div className={styles['filter-drawer-label']}>Start time</div>
          <DatePicker
            inputReadOnly={true}
            size={'large'}
            allowClear={false}
            value={filterTimestampStart}
            className={clsx(styles['mobile-records-range-picker'])}
            format={DATE_FORMATE}
            onChange={setFilterTimestampStart}
            showTime={false}
            placeholder={'please choose the start time'}
          />
          <div className={styles['filter-drawer-label']}>End time</div>
          <DatePicker
            inputReadOnly={true}
            size={'large'}
            allowClear={false}
            value={filterTimestampEnd}
            className={clsx(styles['mobile-records-range-picker'])}
            format={DATE_FORMATE}
            onChange={setFilterTimestampEnd}
            showTime={false}
            placeholder={'please choose the end time'}
          />
        </div>
      </CommonDrawer>

      <SimpleTipModal
        open={openTipModal}
        getContainer="#historyFilterDrawer"
        content={'Please select another time!'}
        onOk={() => setOpenTipModal(false)}
      />
    </div>
  );
}
