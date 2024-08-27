import styles from './styles.module.scss';
import clsx from 'clsx';
import { Divider } from 'antd';
import { BusinessType, TRecordsListItem } from 'types/api';
import { TRecordsTableListType } from 'types/records';
import { useRecordsState, useAppDispatch } from 'store/Provider/hooks';
import FeeInfo from 'pageComponents/HistoryContent/FeeInfo';
import StatusBox from 'pageComponents/HistoryContent/StatusBox';
import ArrivalTimeBox from 'pageComponents/HistoryContent/ArrivalTimeBox';
import AmountBox from 'pageComponents/HistoryContent/AmountBox';
import AddressBox from 'pageComponents/HistoryContent/AddressBox';
import { TRecordsBodyProps } from 'pageComponents/HistoryContent';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebounceCallback } from 'hooks/debounce';
import { setSkipCount, setHasMore } from 'store/reducers/records/slice';
import TxHashBox from 'pageComponents/HistoryContent/TxHashBox';
import { InfoBusinessTypeLabel } from 'constants/infoDashboard';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

const NoDataText = '-- No Data --';

export default function HistoryCardItem({ requestRecordsList }: TRecordsBodyProps) {
  const dispatch = useAppDispatch();
  const { recordsList, hasMore, maxResultCount, totalCount, skipCount } = useRecordsState();

  const handleRecordListData = (recordsList: TRecordsListItem[]) => {
    if (recordsList.length === 0) {
      return [];
    }

    const recordsTableList: TRecordsTableListType[] = [];

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
        fromChainId: fromTransfer.chainId,
        fromTxId: fromTransfer.txId,
        toSymbol: toTransfer.symbol,
        toNetwork: toTransfer.network,
        toFromAddress: toTransfer.fromAddress,
        toAddress: toTransfer.toAddress,
        toChainId: toTransfer.chainId,
        toTxId: toTransfer.txId,
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

  const router = useRouter();
  const handleClick = useCallback(
    (id: string) => {
      router.push(`/transfer-detail?id=${id}`);
    },
    [router],
  );

  return (
    <div className={clsx(styles['records-scroll-container'])} id={'scrollableDiv'}>
      <InfiniteScroll
        dataLength={recordsList.length}
        next={handleNextPage}
        hasMore={skipCount <= Math.ceil(totalCount / maxResultCount)}
        scrollableTarget="scrollableDiv"
        loader={
          <h4 className={clsx(styles['records-loader-message'])}>
            {hasMore ? ' Loading... ' : NoDataText}
          </h4>
        }
        endMessage={
          <p className={clsx(styles['records-end-message'])}>
            <b>{NoDataText}</b>
          </p>
        }>
        {handleRecordListData(recordsList).map((recordItem: TRecordsTableListType) => {
          return (
            <div
              className={clsx(styles['records-card-item-wrapper'])}
              key={recordItem.key}
              onClick={() => handleClick(recordItem.key)}>
              <div className={clsx(styles['records-card-item-header'])}>
                <StatusBox
                  status={recordItem.status}
                  address={recordItem.fromAddress}
                  network={recordItem.fromNetwork}
                  fromChainId={recordItem.fromChainId}
                  toChainId={recordItem.toChainId}
                  orderType={recordItem.orderType}
                />
                <span className={clsx(styles['records-card-item-order-type'])}>
                  {recordItem.orderType === BusinessType.Withdraw
                    ? InfoBusinessTypeLabel.Withdraw
                    : recordItem.orderType}
                </span>
              </div>
              <Divider />
              <div className={styles['records-card-item-line']}>
                <span className={styles['records-card-item-label']}>Arrival Time</span>
                <ArrivalTimeBox arrivalTime={recordItem.arrivalTime} status={recordItem.status} />
              </div>
              <div className={styles['records-card-item-line']}>
                <span className={styles['records-card-item-label']}>Amount Sent</span>
                <AmountBox amount={recordItem.sendingAmount} token={recordItem.symbol} />
              </div>
              <div className={styles['records-card-item-line']}>
                <span className={styles['records-card-item-label']}>Amount Received</span>
                <AmountBox
                  amount={recordItem.receivingAmount}
                  token={recordItem.toSymbol}
                  fromToken={recordItem.symbol}
                  status={recordItem.status}
                />
              </div>
              <div className={styles['records-card-item-line']}>
                <span className={styles['records-card-item-label']}>From</span>
                <AddressBox
                  type={'From'}
                  fromAddress={recordItem.fromAddress}
                  toAddress={recordItem.toAddress}
                  network={recordItem.fromNetwork}
                  fromChainId={recordItem.fromChainId}
                  toChainId={recordItem.toChainId}
                />
              </div>
              <div className={styles['records-card-item-line']}>
                <span className={styles['records-card-item-label']}>From Hash</span>
                <TxHashBox
                  isShowIcon={false}
                  type="From"
                  orderType={recordItem.orderType}
                  orderStatus={recordItem.status}
                  chainId={recordItem.fromChainId}
                  txHash={recordItem.fromTxId}
                  network={recordItem.fromNetwork}
                />
              </div>
              <div className={styles['records-card-item-line']}>
                <span className={styles['records-card-item-label']}>To</span>
                <AddressBox
                  type={'To'}
                  fromAddress={recordItem.fromAddress}
                  toAddress={recordItem.toAddress}
                  network={recordItem.toNetwork}
                  fromChainId={recordItem.fromChainId}
                  toChainId={recordItem.toChainId}
                />
              </div>
              <div className={styles['records-card-item-line']}>
                <span className={styles['records-card-item-label']}>To Hash</span>
                <TxHashBox
                  isShowIcon={false}
                  type="To"
                  orderType={recordItem.orderType}
                  orderStatus={recordItem.status}
                  chainId={recordItem.toChainId}
                  txHash={recordItem.toTxId}
                  network={recordItem.toNetwork}
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
