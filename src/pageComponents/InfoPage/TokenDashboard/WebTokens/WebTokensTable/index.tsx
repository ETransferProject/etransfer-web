import { useInfoDashboardState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { Table } from 'antd';
import EmptyDataBox from 'pageComponents/EmptyDataBox';
import TokenBox from '../../ColumnComponents/TokenBox';
import AelfChain from '../../ColumnComponents/AelfChain';
import Networks from '../../ColumnComponents/Networks';
import Volume from '../../ColumnComponents/Volume';
import { TTokenDashboardItem } from 'types/infoDashboard';
import { ChainId } from '@portkey/types';

const WebTokensTableColumns = [
  {
    title: 'Token',
    dataIndex: 'symbol',
    key: 'symbol',
    render: (symbol: string, item: TTokenDashboardItem) => {
      return <TokenBox symbol={symbol} icon={item.symbolIcon} />;
    },
  },
  {
    title: 'aelf Chain',
    dataIndex: 'aelfChain',
    key: 'aelfChain',
    render: (aelfChain: ChainId[]) => {
      return <AelfChain list={aelfChain} />;
    },
  },
  {
    title: 'Multiple Networks',
    dataIndex: 'networks',
    key: 'networks',
    render: (networks: string[]) => {
      return <Networks list={networks} />;
    },
  },
  {
    title: 'Volume 24H',
    dataIndex: 'volume24H',
    key: 'volume24H',
    render: (volume24H: string, item: TTokenDashboardItem) => {
      return <Volume count={volume24H} unit={item.symbol} />;
    },
  },
  {
    title: 'Volume 7D',
    dataIndex: 'volume7D',
    key: 'volume7D',
    render: (volume7D: string, item: TTokenDashboardItem) => {
      return <Volume count={volume7D} unit={item.symbol} />;
    },
  },
  {
    title: 'Volume Total',
    dataIndex: 'volumeTotal',
    key: 'volumeTotal',
    render: (volumeTotal: string, item: TTokenDashboardItem) => {
      return <Volume count={volumeTotal} unit={item.symbol} />;
    },
  },
];

export default function WebTokensTable() {
  const { tokens } = useInfoDashboardState();

  const handleTokensData = (list: TTokenDashboardItem[]) => {
    if (list.length === 0) {
      return;
    }

    return list;
  };

  return (
    <div className={styles['web-tokens-table']}>
      <Table
        size={'large'}
        rowKey={'key'}
        dataSource={handleTokensData(tokens)}
        columns={WebTokensTableColumns}
        scroll={{ x: 1020 }}
        locale={{
          emptyText: <EmptyDataBox emptyText={'No tokens found'} />,
        }}
      />
    </div>
  );
}
