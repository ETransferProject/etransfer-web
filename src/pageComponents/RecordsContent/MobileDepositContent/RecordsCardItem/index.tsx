import styles from './styles.module.scss';
import clsx from 'clsx';
import { Divider } from 'antd';
import { RecordsListItem } from 'types/api';
import { recordsTableListType } from 'types/records';
import { useRecordsState, useAppDispatch } from 'store/Provider/hooks';
import FeeInfo from 'pageComponents/RecordsContent/FeeInfo';
import StatusBox from 'pageComponents/RecordsContent/StatusBox';
import ArrivalTimeBox from 'pageComponents/RecordsContent/ArrivalTimeBox';
import TokenBox from 'pageComponents/RecordsContent/TokenBox';
import AmountBox from 'pageComponents/RecordsContent/AmountBox';
import AddressBox from 'pageComponents/RecordsContent/AddressBox';
import { RecordsContentParams } from 'types/api';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebounceCallback } from 'hooks';
import { setSkipCount, setHasMore } from 'store/reducers/records/slice';

export default function RecordsCardItem({ requestRecordsList }: RecordsContentParams) {
  const dispatch = useAppDispatch();
  const { recordsList, hasMore, maxResultCount, totalCount, skipCount } = useRecordsState();

  const handleRecordListData = (recordsList: RecordsListItem[]) => {
    if (recordsList.length === 0) {
      return [];
    }

    const recordsTableList: recordsTableListType[] = [];

    recordsList.map((item) => {
      const { id, orderType, status, arrivalTime, fromTransfer, toTransfer } = item;
      recordsTableList.push({
        key: id,
        orderType,
        status,
        arrivalTime,
        symbol: fromTransfer.symbol,
        sendingAmount: fromTransfer.amount,
        receivingAmount: toTransfer.amount,
        fromNetwork: fromTransfer.network,
        fromAddress: fromTransfer.fromAddress,
        fromToAddress: fromTransfer.toAddress,
        fromChanId: fromTransfer.chainId,
        toNetwork: toTransfer.network,
        toFromAddress: toTransfer.fromAddress,
        toAddress: toTransfer.toAddress,
        toChanId: toTransfer.chainId,
        feeInfo: toTransfer.feeInfo,
      });
    });

    return recordsTableList;
  };

  const handleNextPage = useDebounceCallback(() => {
    if (hasMore && skipCount <= Math.ceil(totalCount / maxResultCount)) {
      dispatch(setSkipCount(skipCount + 1));
      requestRecordsList();
    } else {
      dispatch(setHasMore(false));
    }
  }, []);

  return (
    <div className={clsx(styles['records-scroll-container'])} id={'scrollableDiv'}>
      <InfiniteScroll
        dataLength={recordsList.length}
        next={handleNextPage}
        hasMore={skipCount <= Math.ceil(totalCount / maxResultCount)}
        scrollableTarget="scrollableDiv"
        loader={
          <h4 className={clsx(styles['records-loader-message'])}>
            {hasMore ? ' Loading... ' : '-- No Data --'}
          </h4>
        }
        endMessage={
          <p className={clsx(styles['records-end-message'])}>
            <b>-- No Data --</b>
          </p>
        }>
        {handleRecordListData(recordsList).map((recordItem: recordsTableListType) => {
          return (
            <div className={clsx(styles['records-card-item-wrapper'])} key={recordItem.key}>
              <div className={clsx(styles['records-card-item-header'])}>
                <StatusBox
                  status={recordItem.status}
                  address={recordItem.fromAddress}
                  network={recordItem.fromNetwork}
                  fromChanId={recordItem.fromChanId}
                  toChanId={recordItem.toChanId}
                  orderType={recordItem.orderType}
                />
                <span className={clsx(styles['records-card-item-order-type'])}>
                  {recordItem.orderType}
                </span>
              </div>
              <Divider />
              <div className={styles['records-card-item-line']}>
                <span className={styles['records-card-item-label']}>Arrival Time</span>
                <ArrivalTimeBox arrivalTime={recordItem.arrivalTime} status={recordItem.status} />
              </div>
              <div className={styles['records-card-item-line']}>
                <span className={styles['records-card-item-label']}>Token</span>
                <TokenBox symbol={recordItem.symbol} />
              </div>
              <div className={styles['records-card-item-line']}>
                <span className={styles['records-card-item-label']}>Sending Amount</span>
                <AmountBox amount={recordItem.sendingAmount} token={recordItem.symbol} />
              </div>
              <div className={styles['records-card-item-line']}>
                <span className={styles['records-card-item-label']}>Receiving Amount</span>
                <AmountBox amount={recordItem.receivingAmount} token={recordItem.symbol} />
              </div>
              <div className={styles['records-card-item-line']}>
                <span className={styles['records-card-item-label']}>From</span>
                <AddressBox
                  type={'From'}
                  fromAddress={recordItem.fromAddress}
                  toAddress={recordItem.toAddress}
                  network={recordItem.fromNetwork}
                  fromChanId={recordItem.fromChanId}
                  toChanId={recordItem.toChanId}
                  orderType={recordItem.orderType}
                  fromToAddress={recordItem.fromToAddress}
                  toFromAddress={recordItem.toFromAddress}
                />
              </div>
              <div className={styles['records-card-item-line']}>
                <span className={styles['records-card-item-label']}>To</span>
                <AddressBox
                  type={'To'}
                  fromAddress={recordItem.fromAddress}
                  toAddress={recordItem.toAddress}
                  network={recordItem.toNetwork}
                  fromChanId={recordItem.fromChanId}
                  toChanId={recordItem.toChanId}
                  orderType={recordItem.orderType}
                  fromToAddress={recordItem.fromToAddress}
                  toFromAddress={recordItem.toFromAddress}
                />
              </div>
              <div className={styles['records-card-item-Fee']}>
                <span className={styles['records-card-item-label']}>Transaction Fee</span>
                <FeeInfo
                  feeInfo={recordItem.feeInfo}
                  status={recordItem.status}
                  orderType={recordItem.orderType}
                />
              </div>
              <Divider className={styles['divider-style']} />
            </div>
          );
        })}
      </InfiniteScroll>
    </div>
  );
}