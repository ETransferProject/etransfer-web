import { Table } from 'antd';
import clsx from 'clsx';
import DisplayImage from 'components/DisplayImage';
import EmptyDataBox from 'components/EmptyDataBox';
import { formatSymbolDisplay } from 'utils/format';
import styles from './styles.module.scss';
import NetworkLogo from 'components/NetworkLogo';
import StatusBox from '../StatusBox';
import ActionBox from '../ActionBox';
import { TMyApplicationItem } from 'types/api';
import { getApplicationDisplayInfo } from '../utils';
import { NO_APPLICATION } from 'constants/listing';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import { useMemo } from 'react';

export default function MyApplicationTable({
  applicationList,
  totalCount,
  maxResultCount,
  skipPageCount,
  tableOnChange,
  onResetList,
}: {
  applicationList: TMyApplicationItem[];
  totalCount: number;
  maxResultCount: number;
  skipPageCount: number;
  tableOnChange: (page: number, pageSize: number) => void;
  onResetList?: () => Promise<void>;
}) {
  const MyApplicationTableColumns = useMemo(() => {
    return [
      {
        title: 'Token',
        dataIndex: 'symbol',
        key: 'symbol',
        render: (symbol: string, item: TMyApplicationItem) => {
          const { chainTokenInfo } = getApplicationDisplayInfo(item);
          return (
            <div className="flex-row-center gap-8">
              <DisplayImage width={24} height={24} name={symbol} src={chainTokenInfo?.icon || ''} />
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
          const { chainTokenInfo } = getApplicationDisplayInfo(item);
          return chainTokenInfo?.chainId ? (
            <div className="flex-row-center gap-8">
              <NetworkLogo network={chainTokenInfo?.chainId} />
              <span>{chainTokenInfo?.chainName}</span>
            </div>
          ) : (
            DEFAULT_NULL_VALUE
          );
        },
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: '112px',
        render: (_: any, item: TMyApplicationItem) => {
          const { chainTokenInfo, failReason } = getApplicationDisplayInfo(item);
          return chainTokenInfo?.status ? (
            <StatusBox status={chainTokenInfo?.status} failReason={failReason} />
          ) : (
            DEFAULT_NULL_VALUE
          );
        },
      },
      {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        render: (_: any, item: TMyApplicationItem) => {
          const { chainTokenInfo, aelfChainIds, otherChainId, failTime } =
            getApplicationDisplayInfo(item);
          return chainTokenInfo?.status &&
            chainTokenInfo?.icon &&
            chainTokenInfo.chainId &&
            chainTokenInfo.chainName ? (
            <ActionBox
              status={chainTokenInfo.status}
              symbol={item.symbol}
              tokenIcon={chainTokenInfo.icon}
              aelfChainIds={aelfChainIds}
              otherChainId={otherChainId}
              chainName={chainTokenInfo.chainName}
              id={item.id}
              rejectedTime={failTime}
              resetList={onResetList}
            />
          ) : (
            DEFAULT_NULL_VALUE
          );
        },
      },
    ];
  }, [onResetList]);

  return (
    <Table
      className={styles['my-application-table']}
      size={'large'}
      rowKey={'id'}
      dataSource={applicationList}
      columns={MyApplicationTableColumns}
      scroll={{ x: 670 }}
      locale={{
        emptyText: <EmptyDataBox emptyText={NO_APPLICATION} />,
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
