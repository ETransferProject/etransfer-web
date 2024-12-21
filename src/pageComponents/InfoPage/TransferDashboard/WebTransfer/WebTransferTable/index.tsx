import { useAppDispatch, useInfoDashboardState } from 'store/Provider/hooks';
import { Table } from 'antd';
import EmptyDataBox from 'components/EmptyDataBox';
import { TTransferDashboardData } from 'types/infoDashboard';
import FromToToken from '../../ColumnComponents/FromToToken';
import FromToChain from '../../ColumnComponents/FromToChain';
import Amount from '../../ColumnComponents/Amount';
import WalletAddress from '../../ColumnComponents/WalletAddress';
import Time from '../../ColumnComponents/Time';
import { BusinessType } from 'types/api';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import myEvents from 'utils/myEvent';
import { setSelectedTransfer } from 'store/reducers/infoDashboard/slice';
import { InfoBusinessTypeLabel } from 'constants/infoDashboard';

const WebTransferTableColumns = [
  {
    title: 'Token',
    dataIndex: 'fromSymbol',
    key: 'fromSymbol',
    render: (fromSymbol: string, item: TTransferDashboardData) => {
      return <FromToToken fromSymbol={fromSymbol} toSymbol={item.toSymbol} />;
    },
  },
  {
    title: 'Type',
    dataIndex: 'orderType',
    key: 'orderType',
    render: (orderType: BusinessType, item: TTransferDashboardData) => {
      const _orderType = item?.secondOrderType
        ? item?.secondOrderType
        : orderType === BusinessType.Withdraw
        ? InfoBusinessTypeLabel.Withdraw
        : orderType;
      return <div>{_orderType}</div>;
    },
  },
  {
    title: 'From - To',
    dataIndex: 'fromChainId',
    key: 'fromChainId',
    render: (fromChainId: TChainId, item: TTransferDashboardData) => {
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
  skipPageCount: number;
  tableOnChange: (page: number, pageSize: number) => void;
}

export default function WebTransferTable({
  totalCount,
  maxResultCount,
  skipPageCount,
  tableOnChange,
}: WebTransferTableProps) {
  const { transferList } = useInfoDashboardState();
  const dispatch = useAppDispatch();

  return (
    <Table
      size={'large'}
      rowKey={'key'}
      dataSource={transferList}
      columns={WebTransferTableColumns}
      scroll={{ x: 1020 }}
      locale={{
        emptyText: <EmptyDataBox emptyText={'No transfer found'} />,
      }}
      onRow={(item) => {
        return {
          onClick: () => {
            dispatch(setSelectedTransfer(item));
            myEvents.ShowWebTransferDashboardDetailPage.emit();
          },
        };
      }}
      pagination={
        totalCount > maxResultCount
          ? {
              current: skipPageCount + 1,
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
  );
}
