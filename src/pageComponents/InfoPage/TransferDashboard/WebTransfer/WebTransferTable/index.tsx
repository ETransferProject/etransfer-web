import { useInfoDashboardState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { Table } from 'antd';
import EmptyDataBox from 'pageComponents/EmptyDataBox';
import { TTransferDashboardData } from 'types/infoDashboard';
import FromToToken from '../../ColumnComponents/FromToToken';
import FromToChain from '../../ColumnComponents/FromToChain';
import Amount from '../../ColumnComponents/Amount';
import Wallet from '../../ColumnComponents/Wallet';
import Time from '../../ColumnComponents/Time';
import { BusinessType } from 'types/api';
import { ChainId } from '@portkey/types';

const WebTransferTableColumns = [
  {
    title: 'Token',
    dataIndex: 'fromSymbol',
    key: 'fromSymbol',
    render: (fromSymbol: string, item: TTransferDashboardData) => {
      return (
        <FromToToken fromSymbol={fromSymbol} fromIcon={''} toSymbol={item.toSymbol} toIcon={''} />
      );
    },
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: (type: BusinessType) => {
      return <div>{type}</div>;
    },
  },
  {
    title: 'From - To',
    dataIndex: 'fromToChain',
    key: 'fromToChain',
    render: (fromChainId: ChainId, item: TTransferDashboardData) => {
      return <FromToChain fromChainId={fromChainId} toChainId={item.toChainId} />;
    },
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    render: (fromAmountUsd: string, item: TTransferDashboardData) => {
      return <Amount amount={fromAmountUsd} amountUsd={item.fromAmountUsd} />;
    },
  },
  {
    title: 'Wallet',
    dataIndex: 'fromAddress',
    key: 'fromAddress',
    render: (fromAddress: string, item: TTransferDashboardData) => {
      return <Wallet address={fromAddress} chainId={item.fromChainId} />;
    },
  },
  {
    title: 'Time',
    dataIndex: 'createTime',
    key: 'createTime',
    render: (createTime: string) => {
      return <Time time={createTime} />;
    },
  },
];

export interface WebTransferTableProps {
  totalCount: number;
  maxResultCount: number;
  skipCount: number;
  tableOnChange: (page: number, pageSize: number) => void;
}

export default function WebTransferTable({
  totalCount,
  maxResultCount,
  skipCount,
  tableOnChange,
}: WebTransferTableProps) {
  const { transferList } = useInfoDashboardState();

  const handleTransferData = (list: TTransferDashboardData[]) => {
    if (list.length === 0) {
      return;
    }

    return list;
  };

  return (
    <div className={styles['web-transfer-table']}>
      <Table
        size={'large'}
        rowKey={'key'}
        dataSource={handleTransferData(transferList)}
        columns={WebTransferTableColumns}
        scroll={{ x: 1020 }}
        locale={{
          emptyText: <EmptyDataBox emptyText={'No transfer found'} />,
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
