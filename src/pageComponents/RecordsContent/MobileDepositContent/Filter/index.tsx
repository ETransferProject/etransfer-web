import { useState, useCallback } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { FilterIcon, CloseSmall } from 'assets/images';
import { useRecordsState, useAppDispatch } from 'store/Provider/hooks';
import { setType, setStatus, setTimestamp, setSkipCount } from 'store/reducers/records/slice';
import { RecordsRequestType, RecordsRequestStatus } from 'types/records';
import CommonDrawer from 'components/CommonDrawer';
import CommonButton, { CommonButtonType } from 'components/CommonButton';
import { Select, DatePicker } from 'antd';
import type { Moment } from 'moment';
import { RecordsContentParams } from 'types/api';

const dateFormat = 'YYYY-MM-DD';

export default function Filter({ requestRecordsList }: RecordsContentParams) {
  const dispatch = useAppDispatch();
  const { type, status, timestamp } = useRecordsState();
  const [isShowFilterDrawer, setIsShowFilterDrawer] = useState(false);
  const [filterType, setFilterType] = useState<RecordsRequestType>(RecordsRequestType.ALL);
  const [filterStatus, setFilterStatus] = useState<RecordsRequestStatus>(RecordsRequestStatus.ALL);
  const [filterTimestampStart, setFilterTimestampStart] = useState<Moment | null>(null);
  const [filterTimestampEnd, setFilterTimestampEnd] = useState<Moment | null>(null);

  const isShowReset = useCallback(() => {
    let isShow = false;
    if (type !== 0 || status !== 0 || timestamp) {
      isShow = true;
    }
    return isShow;
  }, [type, status, timestamp]);

  const isShowTimestamp = useCallback(() => {
    let isShow = false;
    if (timestamp && timestamp[0] && timestamp[0].valueOf()) {
      isShow = true;
    }
    if (timestamp && timestamp[1] && timestamp[1].valueOf()) {
      isShow = true;
    }
    return isShow;
  }, [timestamp]);

  const closeItem = useCallback(
    (clickType: string) => {
      switch (clickType) {
        case 'type':
          dispatch(setType(RecordsRequestType.ALL));
          break;
        case 'status':
          dispatch(setStatus(RecordsRequestStatus.ALL));
          break;
        case 'timestamp':
          dispatch(setTimestamp(null));
          break;
        default:
          break;
      }
      dispatch(setSkipCount(1));
      requestRecordsList();
    },
    [dispatch, requestRecordsList],
  );

  const handleReset = useCallback(() => {
    dispatch(setType(RecordsRequestType.ALL));
    dispatch(setStatus(RecordsRequestStatus.ALL));
    dispatch(setTimestamp(null));
    dispatch(setSkipCount(1));
    requestRecordsList();
  }, [dispatch, requestRecordsList]);

  const handleResetFilter = useCallback(() => {
    setFilterType(RecordsRequestType.ALL);
    setFilterStatus(RecordsRequestStatus.ALL);
    setFilterTimestampStart(null);
    setFilterTimestampEnd(null);
    dispatch(setSkipCount(1));
  }, [dispatch]);

  const handleApplyFilter = useCallback(() => {
    dispatch(setType(filterType));
    dispatch(setStatus(filterStatus));
    dispatch(setTimestamp([filterTimestampStart, filterTimestampEnd]));
    dispatch(setSkipCount(1));
    setIsShowFilterDrawer(false);
    requestRecordsList();
  }, [
    dispatch,
    filterType,
    filterStatus,
    filterTimestampStart,
    filterTimestampEnd,
    requestRecordsList,
  ]);

  const handleOpenFilterDrawer = useCallback(() => {
    handleResetFilter();
    setIsShowFilterDrawer(true);
  }, [handleResetFilter]);

  return (
    <div className={clsx(styles['filter-wrapper'])}>
      <div className={styles['filter-item-wrapper']}>
        <FilterIcon className={styles['filter-icon']} onClick={handleOpenFilterDrawer} />
        {type !== RecordsRequestType.ALL && (
          <div className={styles['filter-item']}>
            {type === RecordsRequestType.Deposits && 'Deposit'}
            {type === RecordsRequestType.Withdraws && 'Withdraw'}
            <CloseSmall className={styles['filter-close-icon']} onClick={() => closeItem('type')} />
          </div>
        )}
        {status !== RecordsRequestStatus.ALL && (
          <div className={styles['filter-item']}>
            {status === RecordsRequestStatus.Processing && 'Processing'}
            {status === RecordsRequestStatus.Succeed && 'Succeed'}
            {status === RecordsRequestStatus.Failed && 'Failed'}
            <CloseSmall
              className={styles['filter-close-icon']}
              onClick={() => closeItem('status')}
            />
          </div>
        )}
        {isShowTimestamp() && (
          <div className={styles['filter-item']}>
            {(timestamp &&
              timestamp[0] &&
              timestamp[0].format &&
              timestamp[0].format(dateFormat)) ||
              '-- '}
            {' - '}
            {(timestamp &&
              timestamp[1] &&
              timestamp[1].format &&
              timestamp[1].format(dateFormat)) ||
              ' --'}
            <CloseSmall
              className={styles['filter-close-icon']}
              onClick={() => closeItem('timestamp')}
            />
          </div>
        )}
        {isShowReset() && (
          <div className={clsx(styles['filter-reset'])} onClick={handleReset}>
            Reset
          </div>
        )}
      </div>
      <CommonDrawer
        open={isShowFilterDrawer}
        height={'100%'}
        title={<div className={styles['filter-title']}>Filters</div>}
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
          <div className={styles['filter-drawer-label']}>Methods</div>
          <Select
            size={'large'}
            value={filterType}
            className={clsx(styles['mobile-records-select-type'], styles['border-change'])}
            onChange={setFilterType}
            popupClassName={'drop-wrap'}
            options={[
              { value: RecordsRequestType.ALL, label: 'ALL Transfers' },
              { value: RecordsRequestType.Deposits, label: 'Deposits' },
              { value: RecordsRequestType.Withdraws, label: 'Withdraws' },
            ]}
          />
          <div className={styles['filter-drawer-label']}>Status</div>
          <Select
            size={'large'}
            value={filterStatus}
            className={clsx(styles['mobile-records-select-status'], styles['border-change'])}
            onChange={setFilterStatus}
            popupClassName={'drop-wrap'}
            options={[
              { value: RecordsRequestStatus.ALL, label: 'ALL Status' },
              { value: RecordsRequestStatus.Processing, label: 'Processing' },
              { value: RecordsRequestStatus.Succeed, label: 'Succeed' },
              { value: RecordsRequestStatus.Failed, label: 'Failed' },
            ]}
          />
          <div className={styles['filter-drawer-label']}>Start time</div>
          <DatePicker
            size={'large'}
            allowClear={false}
            value={filterTimestampStart}
            className={clsx(styles['mobile-records-range-picker'])}
            format={dateFormat}
            onChange={setFilterTimestampStart}
            showTime={false}
            placeholder={'please choose the start time'}
          />
          <div className={styles['filter-drawer-label']}>End time</div>
          <DatePicker
            size={'large'}
            allowClear={false}
            value={filterTimestampEnd}
            className={clsx(styles['mobile-records-range-picker'])}
            format={dateFormat}
            onChange={setFilterTimestampEnd}
            showTime={false}
            placeholder={'please choose the end time'}
          />
        </div>
      </CommonDrawer>
    </div>
  );
}
