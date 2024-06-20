import { useState, useCallback, useMemo } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { FilterIcon, CloseSmall } from 'assets/images';
import { useRecordsState, useAppDispatch } from 'store/Provider/hooks';
import { setSkipCount, setRecordsList } from 'store/reducers/records/slice';
import { TRecordsRequestType, TRecordsRequestStatus, TRecordsStatusI18n } from 'types/records';
import CommonDrawer from 'components/CommonDrawer';
import CommonButton, { CommonButtonType } from 'components/CommonButton';
import { Select, DatePicker } from 'antd';
import type { Moment } from 'moment';
import { BusinessType } from 'types/api';
import { TRecordsContentProps } from 'pageComponents/HistoryContent';
import { defaultNullValue } from 'constants/index';
import moment from 'moment';
import { useHistoryFilter } from 'hooks/history';
import SimpleTipModal from 'pageComponents/Modal/SimpleTipModal';
import { END_TIME_FORMAT, START_TIME_FORMAT } from 'constants/records';

const dateFormat = 'YYYY-MM-DD';

export default function Filter({ requestRecordsList, onReset }: TRecordsContentProps) {
  const dispatch = useAppDispatch();
  const { type, status, timestamp } = useRecordsState();
  const [isShowFilterDrawer, setIsShowFilterDrawer] = useState(false);
  const [filterType, setFilterType] = useState<TRecordsRequestType>(type);
  const [filterStatus, setFilterStatus] = useState<TRecordsRequestStatus>(status);
  const [filterTimestampStart, setFilterTimestampStart] = useState<Moment | null>(
    timestamp?.[0] ? moment(timestamp?.[0]) : null,
  );
  const [filterTimestampEnd, setFilterTimestampEnd] = useState<Moment | null>(
    timestamp?.[1] ? moment(timestamp?.[1]) : null,
  );

  const isShowReset = useMemo(() => {
    if (type !== 0 || status !== 0 || timestamp?.[0] || timestamp?.[1]) {
      return true;
    }
    return false;
  }, [type, status, timestamp]);

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

  const { setFilter, setMethodFilter, setStatusFilter, setTimestampFilter } = useHistoryFilter();
  const closeItem = useCallback(
    (clickType: string) => {
      switch (clickType) {
        case 'type':
          setMethodFilter(TRecordsRequestType.ALL);
          break;
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
    [dispatch, requestRecordsList, setMethodFilter, setStatusFilter, setTimestampFilter],
  );

  const handleResetFilter = useCallback(() => {
    setFilterType(TRecordsRequestType.ALL);
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
      method: filterType,
      status: filterStatus,
      timeArray: timeIsNaN ? null : [startTimestampFormat, endTimestampFormat],
    });
    dispatch(setSkipCount(1));
    dispatch(setRecordsList([]));
    setIsShowFilterDrawer(false);
    requestRecordsList();
  }, [
    setFilter,
    filterType,
    filterStatus,
    filterTimestampStart,
    filterTimestampEnd,
    dispatch,
    requestRecordsList,
  ]);

  const handleOpenFilterDrawer = useCallback(() => {
    setFilterType(type);
    setFilterStatus(status);
    setFilterTimestampStart(timestamp?.[0] ? moment(timestamp[0]) : null);
    setFilterTimestampEnd(timestamp?.[1] ? moment(timestamp?.[1]) : null);

    setIsShowFilterDrawer(true);
  }, [type, status, timestamp]);

  return (
    <div className={clsx(styles['filter-wrapper'])}>
      <div className={styles['filter-item-wrapper']}>
        <FilterIcon className={styles['filter-icon']} onClick={handleOpenFilterDrawer} />
        {type !== TRecordsRequestType.ALL && (
          <div className={styles['filter-item']}>
            {type === TRecordsRequestType.Deposits && BusinessType.Deposit}
            {type === TRecordsRequestType.Withdraws && BusinessType.Withdraw}
            <CloseSmall className={styles['filter-close-icon']} onClick={() => closeItem('type')} />
          </div>
        )}
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
            {(timestamp?.[0] && moment(timestamp[0]).format(dateFormat)) || `${defaultNullValue}`}
            {' - '}
            {(timestamp?.[1] && moment(timestamp[1]).format(dateFormat)) || `${defaultNullValue}`}
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
          <div className={styles['filter-drawer-label']}>Methods</div>
          <Select
            size={'large'}
            value={filterType}
            className={clsx(styles['mobile-records-select-type'], styles['border-change'])}
            onChange={setFilterType}
            popupClassName={'drop-wrap'}
            options={[
              { value: TRecordsRequestType.ALL, label: 'All' },
              { value: TRecordsRequestType.Deposits, label: BusinessType.Deposit },
              { value: TRecordsRequestType.Withdraws, label: BusinessType.Withdraw },
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
              { value: TRecordsRequestStatus.ALL, label: 'All' },
              { value: TRecordsRequestStatus.Processing, label: TRecordsStatusI18n.Processing },
              { value: TRecordsRequestStatus.Succeed, label: TRecordsStatusI18n.Succeed },
              { value: TRecordsRequestStatus.Failed, label: TRecordsStatusI18n.Failed },
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

      <SimpleTipModal
        open={openTipModal}
        getContainer="#historyFilterDrawer"
        content={'Please select another time!'}
        onOk={() => setOpenTipModal(false)}
      />
    </div>
  );
}
