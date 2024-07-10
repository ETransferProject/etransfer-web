import { useInfoDashboardState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { Table } from 'antd';
import EmptyDataBox from 'pageComponents/EmptyDataBox';
import { TTransferDashboardData } from 'types/infoDashboard';
import FromToToken from '../../ColumnComponents/FromToToken';
import FromToChain from '../../ColumnComponents/FromToChain';
import Amount from '../../ColumnComponents/Amount';
import WalletAddress from '../../ColumnComponents/WalletAddress';
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
    dataIndex: 'orderType',
    key: 'orderType',
    render: (orderType: BusinessType) => {
      return <div>{orderType}</div>;
    },
  },
  {
    title: 'From - To',
    dataIndex: 'fromChainId',
    key: 'fromChainId',
    render: (fromChainId: ChainId, item: TTransferDashboardData) => {
      return (
        <FromToChain
          fromNetwork={item.fromNetwork}
          fromChainId={fromChainId}
          toNetwork={item.toNetwork}
          toChainId={item.toChainId}
        />
      );
    },
  },
  {
    title: 'Amount',
    dataIndex: 'fromAmount',
    key: 'fromAmount',
    render: (fromAmount: string, item: TTransferDashboardData) => {
      return <Amount amount={fromAmount} amountUsd={item.fromAmountUsd} />;
    },
  },
  {
    title: 'Wallet',
    dataIndex: 'fromAddress',
    key: 'fromAddress',
    render: (fromAddress: string, item: TTransferDashboardData) => {
      return (
        <WalletAddress
          address={fromAddress}
          chainId={item.fromChainId}
          network={item.fromNetwork}
        />
      );
    },
  },
  {
    title: 'Time',
    dataIndex: 'createTime',
    key: 'createTime',
    align: 'right' as any,
    render: (createTime: number) => {
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
                current: skipCount + 1,
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
