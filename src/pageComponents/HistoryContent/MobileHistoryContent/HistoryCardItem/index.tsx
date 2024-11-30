import styles from './styles.module.scss';
import clsx from 'clsx';
import { Divider } from 'antd';
import { TRecordsListItem } from 'types/api';
import { TRecordsRequestType, TRecordsTableListType } from 'types/records';
import { useRecordsState, useAppDispatch } from 'store/Provider/hooks';
import FeeInfo from 'pageComponents/HistoryContent/FeeInfo';
import StatusBox from 'pageComponents/HistoryContent/StatusBox';
import ArrivalTimeBox from 'pageComponents/HistoryContent/ArrivalTimeBox';
import AmountBox from 'pageComponents/HistoryContent/AmountBox';
import AddressBox from 'pageComponents/HistoryContent/AddressBox';
import TokenBox from 'pageComponents/HistoryContent/TokenBox';
import { TRecordsBodyProps } from 'pageComponents/HistoryContent';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebounceCallback } from 'hooks/debounce';
import { setSkipCount, setHasMore } from 'store/reducers/records/slice';
import TxHashBox from 'pageComponents/HistoryContent/TxHashBox';
import { Fragment, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { COBO_CUSTODY } from 'constants/misc';
import CreateTimeBox from 'pageComponents/HistoryContent/CreateTimeBox';

const NoDataText = '-- No Data --';

export default function HistoryCardItem({ requestRecordsList }: TRecordsBodyProps) {
  const dispatch = useAppDispatch();
  const { type, recordsList, hasMore, maxResultCount, totalCount, skipCount } = useRecordsState();

  const handleRecordListData = (recordsList: TRecordsListItem[]) => {
    if (recordsList.length === 0) {
      return [];
    }

    const recordsTableList: TRecordsTableListType[] = [];

    recordsList.map((item) => {
      const { id, orderType, status, arrivalTime, createTime, fromTransfer, toTransfer } = item;
      recordsTableList.push({
        key: id,
        orderType,
        status,
        arrivalTime,
        createTime,
        symbol: fromTransfer.symbol,
        icon: fromTransfer.icon,
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
            <Fragment key={recordItem.key}>
              <div
                className={clsx(styles['records-card-item-wrapper'])}
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
                  {type === TRecordsRequestType.Transfer ? (
                    <CreateTimeBox createTime={recordItem.createTime} />
                  ) : (
                    <ArrivalTimeBox
                      arrivalTime={recordItem.arrivalTime}
                      status={recordItem.status}
                    />
                  )}
                </div>
                <Divider />
                {type === TRecordsRequestType.Transfer && (
                  <div className={styles['records-card-item-line']}>
                    <span className={styles['records-card-item-label']}>Token</span>
                    <TokenBox icon={recordItem.icon} symbol={recordItem.symbol} />
                  </div>
                )}
                <div className={styles['records-card-item-line']}>
                  <span className={styles['records-card-item-label']}>Sending Amount</span>
                  <AmountBox amount={recordItem.sendingAmount} token={recordItem.symbol} />
                </div>
                <div className={styles['records-card-item-line']}>
                  <span className={styles['records-card-item-label']}>Receiving Amount</span>
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
                    isCoboHash={
                      recordItem.fromAddress === COBO_CUSTODY ||
                      recordItem.fromToAddress === COBO_CUSTODY
                    }
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
                    isCoboHash={
                      recordItem.toAddress === COBO_CUSTODY ||
                      recordItem.toFromAddress === COBO_CUSTODY
                    }
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
              </div>
              <Divider className={styles['divider-style']} />
            </Fragment>
          );
        })}
      </InfiniteScroll>
    </div>
  );
}
