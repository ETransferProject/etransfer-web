import { Table } from 'antd';
import clsx from 'clsx';
import DisplayImage from 'components/DisplayImage';
import EmptyDataBox from 'pageComponents/EmptyDataBox';
import { formatSymbolDisplay } from 'utils/format';
import styles from './styles.module.scss';
import NetworkLogo from 'components/NetworkLogo';
import StatusBox from '../StatusBox';
import ActionBox from '../ActionBox';
import { TMyApplicationItem } from 'types/api';

const MyApplicationTableColumns = [
  {
    title: 'Token',
    dataIndex: 'symbol',
    key: 'symbol',
    render: (symbol: string, item: TMyApplicationItem) => {
      const chainTokenInfo = item.otherChainTokenInfo.chainId
        ? item.otherChainTokenInfo
        : item?.chainTokenInfo?.[0];
      return (
        <div className="flex-row-center gap-8">
          <DisplayImage width={24} height={24} name={symbol} src={chainTokenInfo.icon} />
          <span className={clsx(styles['token-symbol'])}>{formatSymbolDisplay(symbol)}</span>
        </div>
      );
    },
  },
  {
    title: 'Chain',
    dataIndex: 'networkName',
    key: 'networkName',
    render: (_: any, item: TMyApplicationItem) => {
      const chainTokenInfo = item.otherChainTokenInfo.chainId
        ? item.otherChainTokenInfo
        : item?.chainTokenInfo?.[0];
      return (
        <div className="flex-row-center gap-8">
          <NetworkLogo network={chainTokenInfo.chainId} />
          <span>{chainTokenInfo.chainName}</span>
        </div>
      );
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: '112px',
    render: (_: any, item: TMyApplicationItem) => {
      const chainTokenInfo = item.otherChainTokenInfo.chainId
        ? item.otherChainTokenInfo
        : item?.chainTokenInfo?.[0];
      return <StatusBox status={chainTokenInfo.status} failReason={chainTokenInfo.failReason} />;
    },
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    render: (_: any, item: TMyApplicationItem) => {
      const chainTokenInfo = item.otherChainTokenInfo.chainId
        ? item.otherChainTokenInfo
        : item?.chainTokenInfo?.[0];
      return (
        <ActionBox
          status={chainTokenInfo.status}
          symbol={item.symbol}
          chainId={chainTokenInfo.chainId}
          id={item.id}
          rejectedTime={chainTokenInfo.rejectedTime}
        />
      );
    },
  },
];

export default function MyApplicationTable({
  applicationList,
  totalCount,
  maxResultCount,
  skipPageCount,
  tableOnChange,
}: {
  applicationList: TMyApplicationItem[];
  totalCount: number;
  maxResultCount: number;
  skipPageCount: number;
  tableOnChange: (page: number, pageSize: number) => void;
}) {
  return (
    <Table
      className={styles['my-application-table']}
      size={'large'}
      rowKey={(row) => row.symbol}
      dataSource={applicationList}
      columns={MyApplicationTableColumns}
      scroll={{ x: 670 }}
      locale={{
        emptyText: <EmptyDataBox emptyText={'No application found'} />,
      }}
      pagination={
        totalCount > maxResultCount
          ? {
              current: skipPageCount + 1,
              pageSize: maxResultCount,
              total: totalCount,
              onChange: tableOnChange,
            }
          : false
      }
    />
  );
}
