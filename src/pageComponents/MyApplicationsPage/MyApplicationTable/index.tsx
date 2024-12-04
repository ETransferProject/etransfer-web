import { Table } from 'antd';
import clsx from 'clsx';
import DisplayImage from 'components/DisplayImage';
import EmptyDataBox from 'pageComponents/EmptyDataBox';
import { formatSymbolDisplay } from 'utils/format';
import styles from './styles.module.scss';
import NetworkLogo from 'components/NetworkLogo';
import StatusBox from '../StatusBox';
import ActionBox from '../ActionBox';

// TODO any
const MyApplicationTableColumns = [
  {
    title: 'Token',
    dataIndex: 'symbol',
    key: 'symbol',
    render: (symbol: string, item: any) => {
      return (
        <div className="flex-row-center gap-8">
          <DisplayImage width={24} height={24} name={item.name} src={item.icon} />
          <span className={clsx(styles['token-symbol'])}>{formatSymbolDisplay(symbol)}</span>
        </div>
      );
    },
  },
  {
    title: 'Chain',
    dataIndex: 'networkName',
    key: 'networkName',
    render: (networkName: string, item: any) => {
      return (
        <div className="flex-row-center gap-8">
          <NetworkLogo network={item.network} />
          <span>{networkName}</span>
        </div>
      );
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: '112px',
    render: (status: string, item: any) => {
      return <StatusBox status={status} failReason={item.failReason} />;
    },
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    render: (_: any, item: any) => {
      return <ActionBox status={item.status} coboReviewStatus={item.coboReviewStatus} />;
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
  applicationList: any[];
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
