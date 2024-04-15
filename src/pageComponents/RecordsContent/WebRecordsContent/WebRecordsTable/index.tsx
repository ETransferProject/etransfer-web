import styles from './styles.module.scss';
import clsx from 'clsx';
import { useRecordsState, useAppDispatch } from 'store/Provider/hooks';
import { Table } from 'antd';
import { RecordsListItem, RecordsContentParams } from 'types/api';
import { feeInfoType, recordsTableListType } from 'types/records';
import { setSkipCount, setMaxResultCount } from 'store/reducers/records/slice';
import FeeInfo from 'pageComponents/RecordsContent/FeeInfo';
import EmptyDataBox from 'pageComponents/RecordsContent/EmptyDataBox';
import StatusBox from 'pageComponents/RecordsContent/StatusBox';
import ArrivalTimeBox from 'pageComponents/RecordsContent/ArrivalTimeBox';
import TokenBox from 'pageComponents/RecordsContent/TokenBox';
import AmountBox from 'pageComponents/RecordsContent/AmountBox';
import AddressBox from 'pageComponents/RecordsContent/AddressBox';

const columns = [
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      return <StatusBox status={status} />;
    },
  },
  {
    title: 'Arrival Time',
    dataIndex: 'arrivalTime',
    key: 'arrivalTime',
    render: (arrivalTime: number, record: recordsTableListType) => {
      return <ArrivalTimeBox arrivalTime={arrivalTime} status={record.status} />;
    },
  },
  {
    title: 'Method',
    dataIndex: 'orderType',
    key: 'orderType',
  },
  {
    title: 'Token',
    dataIndex: 'symbol',
    key: 'symbol',
    render: (symbol: string) => {
      return <TokenBox symbol={symbol} />;
    },
  },
  {
    title: 'Sending Amount',
    dataIndex: 'sendingAmount',
    key: 'sendingAmount',
    render: (sendingAmount: string, record: recordsTableListType) => {
      return <AmountBox amount={sendingAmount} token={record.symbol} />;
    },
  },
  {
    title: 'Receiving Amount',
    dataIndex: 'receivingAmount',
    key: 'receivingAmount',
    render: (receivingAmount: string, record: recordsTableListType) => {
      return <AmountBox amount={receivingAmount} token={record.symbol} />;
    },
  },
  {
    title: 'From',
    dataIndex: 'fromAddress',
    key: 'fromAddress',
    render: (fromAddress: string, record: recordsTableListType) => {
      return (
        <AddressBox
          address={fromAddress}
          network={record.fromNetwork}
          fromChanId={record.fromChanId}
          toChanId={record.toChanId}
          orderType={record.orderType}
        />
      );
    },
  },
  {
    title: 'To',
    dataIndex: 'toAddress',
    key: 'toAddress',
    render: (toAddress: string, record: recordsTableListType) => {
      return (
        <AddressBox
          address={toAddress}
          network={record.toNetwork}
          fromChanId={record.fromChanId}
          toChanId={record.toChanId}
          orderType={record.orderType}
        />
      );
    },
  },
  {
    title: 'Transaction Fee',
    dataIndex: 'feeInfo',
    key: 'feeInfo',
    render: (feeInfo: feeInfoType[], record: recordsTableListType) => {
      return <FeeInfo feeInfo={feeInfo} status={record.status} />;
    },
  },
];

export default function WebRecordsTable({ requestRecordsList }: RecordsContentParams) {
  const { recordsList, totalCount, skipCount, maxResultCount } = useRecordsState();
  const dispatch = useAppDispatch();

  const handleRecordListData = (recordsList: RecordsListItem[]) => {
    if (recordsList.length === 0) {
      return;
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
        fromChanId: fromTransfer.chainId,
        toNetwork: toTransfer.network,
        toAddress: toTransfer.toAddress,
        toChanId: toTransfer.chainId,
        feeInfo: toTransfer.feeInfo,
      });
    });

    return recordsTableList;
  };

  const tableOnChange = (page: number, pageSize: number) => {
    dispatch(setSkipCount(page));
    dispatch(setMaxResultCount(pageSize));
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
          emptyText: <EmptyDataBox emptyText={'No record found'} />,
        }}
        pagination={{
          current: skipCount,
          pageSize: maxResultCount,
          total: totalCount,
          onChange: tableOnChange,
          showQuickJumper: true,
          showSizeChanger: true,
          showTitle: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
      />
    </div>
  );
}
