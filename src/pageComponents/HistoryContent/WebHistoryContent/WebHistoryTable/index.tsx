import styles from './styles.module.scss';
import clsx from 'clsx';
import { useRecordsState, useAppDispatch } from 'store/Provider/hooks';
import { Table } from 'antd';
import { TRecordsListItem } from 'types/api';
import { TRecordsBodyProps } from 'pageComponents/HistoryContent';
import { TFeeInfoType, TRecordsRequestType, TRecordsTableListType } from 'types/records';
import { setSkipCount, setMaxResultCount } from 'store/reducers/records/slice';
import FeeInfo from 'pageComponents/HistoryContent/FeeInfo';
import EmptyDataBox from 'components/EmptyDataBox';
import StatusBox from 'pageComponents/HistoryContent/StatusBox';
import ArrivalTimeBox from 'pageComponents/HistoryContent/ArrivalTimeBox';
import CreateTimeBox from 'pageComponents/HistoryContent/CreateTimeBox';
import AmountBox from 'pageComponents/HistoryContent/AmountBox';
import TokenBox from 'pageComponents/HistoryContent/TokenBox';
import FromAndToBox from 'pageComponents/HistoryContent/FromAndToBox';
import { useCheckHasConnectedWallet } from 'hooks/wallet';
import { LOGIN_TO_VIEW_HISTORY, NO_HISTORY_FOUND } from 'constants/records';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { COBO_CUSTODY } from 'constants/misc';

export default function WebRecordsTable({ requestRecordsList }: TRecordsBodyProps) {
  const { type, recordsList, totalCount, skipCount, maxResultCount } = useRecordsState();
  const dispatch = useAppDispatch();
  const { hasConnected } = useCheckHasConnectedWallet();

  const handleRecordListData = (recordsList: TRecordsListItem[]) => {
    if (recordsList.length === 0) {
      return;
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

  const router = useRouter();
  const handleClick = useCallback(
    (id: string) => {
      router.push(`/transfer-detail?id=${id}`);
    },
    [router],
  );

  const columns = useMemo(() => {
    const result = [
      {
        title: 'Status',
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
      type === TRecordsRequestType.Transfer
        ? {
            title: 'Create Time',
            dataIndex: 'createTime',
            key: 'createTime',
            render: (createTime: number) => {
              return <CreateTimeBox createTime={createTime} />;
            },
          }
        : {
            title: 'Arrival Time',
            dataIndex: 'arrivalTime',
            key: 'arrivalTime',
            render: (arrivalTime: number, record: TRecordsTableListType) => {
              return <ArrivalTimeBox arrivalTime={arrivalTime} status={record.status} />;
            },
          },
      type === TRecordsRequestType.Transfer && {
        title: 'Token',
        dataIndex: 'symbol',
        key: 'symbol',
        render: (symbol: string, record: TRecordsTableListType) => {
          return <TokenBox icon={record.icon} symbol={symbol} />;
        },
      },
      {
        title: 'Sending Amount',
        dataIndex: 'sendingAmount',
        key: 'sendingAmount',
        render: (sendingAmount: string, record: TRecordsTableListType) => {
          return <AmountBox amount={sendingAmount} token={record.symbol} />;
        },
      },
      {
        title: 'Receiving Amount',
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
              isCoboHash={
                record.fromAddress === COBO_CUSTODY || record.fromToAddress === COBO_CUSTODY
              }
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
              isCoboHash={
                record.toAddress === COBO_CUSTODY || record.toFromAddress === COBO_CUSTODY
              }
            />
          );
        },
      },
      {
        title: 'Fee',
        dataIndex: 'feeInfo',
        key: 'feeInfo',
        render: (feeInfo: TFeeInfoType[], record: TRecordsTableListType) => {
          return <FeeInfo feeInfo={feeInfo} status={record.status} />;
        },
      },
    ];
    return result.filter((item) => !!item);
  }, [type]);

  return (
    <div className={clsx(styles['web-records-table-wrapper'])}>
      <Table
        size={'large'}
        rowKey={'key'}
        rowClassName={styles['web-records-table-row']}
        onRow={(record) => {
          return {
            onClick: () => handleClick(record.key),
          };
        }}
        dataSource={handleRecordListData(recordsList)}
        columns={columns}
        scroll={{ x: 1020 }}
        locale={{
          emptyText: (
            <EmptyDataBox emptyText={hasConnected ? NO_HISTORY_FOUND : LOGIN_TO_VIEW_HISTORY} />
          ),
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
