import styles from './styles.module.scss';
import clsx from 'clsx';
import { useRecordsState, useAppDispatch } from 'store/Provider/hooks';
import { Table } from 'antd';
import { TRecordsListItem } from 'types/api';
import { TRecordsBodyProps } from 'pageComponents/HistoryContent';
import { TFeeInfoType, TRecordsTableListType } from 'types/records';
import { setSkipCount, setMaxResultCount } from 'store/reducers/records/slice';
import FeeInfo from 'pageComponents/HistoryContent/FeeInfo';
import EmptyDataBox from 'pageComponents/EmptyDataBox';
import StatusBox from 'pageComponents/HistoryContent/StatusBox';
import ArrivalTimeBox from 'pageComponents/HistoryContent/ArrivalTimeBox';
import AmountBox from 'pageComponents/HistoryContent/AmountBox';
import FromAndToBox from 'pageComponents/HistoryContent/FromAndToBox';

const columns = [
  {
    title: 'Transaction',
    dataIndex: 'status',
    key: 'status',
    render: (status: string, record: TRecordsTableListType) => {
      return (
        <StatusBox
          status={status}
          address={record.fromAddress}
          network={record.fromNetwork}
          fromChainId={record.fromChainId}
          toChainId={record.toChainId}
          orderType={record.orderType}
        />
      );
    },
  },
  {
    title: 'Arrival Time',
    dataIndex: 'arrivalTime',
    key: 'arrivalTime',
    render: (arrivalTime: number, record: TRecordsTableListType) => {
      return <ArrivalTimeBox arrivalTime={arrivalTime} status={record.status} />;
    },
  },
  {
    title: 'Method',
    dataIndex: 'orderType',
    key: 'orderType',
    render: (orderType: string) => {
      return <div className={styles['order-type']}>{orderType}</div>;
    },
  },
  {
    title: 'Amount Sent',
    dataIndex: 'sendingAmount',
    key: 'sendingAmount',
    render: (sendingAmount: string, record: TRecordsTableListType) => {
      return <AmountBox amount={sendingAmount} token={record.symbol} />;
    },
  },
  {
    title: 'Amount Received',
    dataIndex: 'receivingAmount',
    key: 'receivingAmount',
    render: (receivingAmount: string, record: TRecordsTableListType) => {
      return (
        <AmountBox
          amount={receivingAmount}
          token={record.toSymbol}
          status={record.status}
          fromToken={record.symbol}
        />
      );
    },
  },
  {
    title: 'From',
    dataIndex: 'fromAddress',
    key: 'fromAddress',
    render: (fromAddress: string, record: TRecordsTableListType) => {
      return (
        <FromAndToBox
          type="From"
          fromAddress={fromAddress}
          toAddress={record.toAddress}
          network={record.fromNetwork}
          fromChainId={record.fromChainId}
          toChainId={record.toChainId}
          orderType={record.orderType}
          orderStatus={record.status}
          txHashLabel="Tx Hash"
          txHash={record.fromTxId}
        />
      );
    },
  },
  {
    title: 'To',
    dataIndex: 'toAddress',
    key: 'toAddress',
    render: (toAddress: string, record: TRecordsTableListType) => {
      return (
        <FromAndToBox
          type="To"
          fromAddress={record.fromAddress}
          toAddress={toAddress}
          network={record.toNetwork}
          fromChainId={record.fromChainId}
          toChainId={record.toChainId}
          orderType={record.orderType}
          orderStatus={record.status}
          txHashLabel="Tx Hash"
          txHash={record.toTxId}
        />
      );
    },
  },
  {
    title: 'Transaction Fee',
    dataIndex: 'feeInfo',
    key: 'feeInfo',
    render: (feeInfo: TFeeInfoType[], record: TRecordsTableListType) => {
      return <FeeInfo feeInfo={feeInfo} status={record.status} orderType={record.orderType} />;
    },
  },
];

export default function WebRecordsTable({ requestRecordsList }: TRecordsBodyProps) {
  const { recordsList, totalCount, skipCount, maxResultCount } = useRecordsState();
  const dispatch = useAppDispatch();

  const handleRecordListData = (recordsList: TRecordsListItem[]) => {
    if (recordsList.length === 0) {
      return;
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

  const tableOnChange = (page: number, pageSize: number) => {
    if (page !== skipCount) {
      dispatch(setSkipCount(page));
    }
    if (maxResultCount !== pageSize) {
      // pageSize change and skipCount need init 1
      dispatch(setSkipCount(1));
      dispatch(setMaxResultCount(pageSize));
    }
    requestRecordsList();
  };

  return (
    <div className={clsx(styles['web-records-table-wrapper'])}>
      <Table
        size={'large'}
        rowKey={'key'}
        dataSource={handleRecordListData(recordsList)}
        columns={columns}
        scroll={{ x: 1020 }}
        locale={{
          emptyText: <EmptyDataBox emptyText={'No records found'} />,
        }}
        pagination={
          totalCount > maxResultCount
            ? {
                current: skipCount,
                pageSize: maxResultCount,
                total: totalCount,
                onChange: tableOnChange,
                showQuickJumper: true,
                showSizeChanger: true,
                showTitle: true,
                pageSizeOptions: ['10', '20', '50'],
              }
            : false
        }
      />
    </div>
  );
}
