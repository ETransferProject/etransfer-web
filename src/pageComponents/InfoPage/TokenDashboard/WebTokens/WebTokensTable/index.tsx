import { useInfoDashboardState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { Table } from 'antd';
import EmptyDataBox from 'pageComponents/EmptyDataBox';
import TokenBox from '../../ColumnComponents/TokenBox';
import AelfChain from '../../ColumnComponents/AelfChain';
import Networks from '../../ColumnComponents/Networks';
import Volume from '../../ColumnComponents/Volume';
import { TTokenDashboardItem, TTokenDashboardItemDetail } from 'types/infoDashboard';
import { ChainId } from '@portkey/types';
import DynamicArrow from 'components/DynamicArrow';
import Network from '../../ColumnComponents/Network';
import { useCallback, useMemo, useState } from 'react';
import { ZERO } from 'constants/calculate';

interface ExpandedTableData extends TTokenDashboardItemDetail {
  symbol: string;
}

const WebTokensTableExpandedColumns = [
  {
    title: 'empty',
    dataIndex: 'empty',
    key: 'empty',
    width: 256,
  },
  {
    title: 'Network',
    dataIndex: 'name',
    key: 'name',
    width: 170,
    showSorterTooltip: false,
    render: (name: string) => {
      return <Network network={name} size="normal" />;
    },
  },
  {
    title: 'Volume 24H',
    dataIndex: 'volume24H',
    key: 'volume24H',
    // width: 150,
    render: (volume24H: string, item: ExpandedTableData) => {
      return <Volume amount={volume24H} unit={item.symbol} />;
    },
  },
  {
    title: 'Volume 7D',
    dataIndex: 'volume7D',
    key: 'volume7D',
    // width: 150,
    render: (volume7D: string, item: ExpandedTableData) => {
      return <Volume amount={volume7D} unit={item.symbol} />;
    },
  },
  {
    title: 'Volume Total',
    dataIndex: 'volumeTotal',
    key: 'volumeTotal',
    // width: 178,
    render: (volumeTotal: string, item: ExpandedTableData) => {
      return <Volume amount={volumeTotal} unit={item.symbol} />;
    },
  },
  {
    title: 'empty',
    dataIndex: 'empty',
    key: 'empty',
    width: 20,
  },
];

export default function WebTokensTable() {
  const { tokens } = useInfoDashboardState();
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>();
  const [activeRowData, setActiveRowData] = useState<TTokenDashboardItem>();

  const handleExpanded = useCallback(
    (item: TTokenDashboardItem) => {
      setActiveRowData(item);
      if (expandedRowKeys?.includes(item.symbol)) {
        setExpandedRowKeys([]);
      } else {
        setExpandedRowKeys([item.symbol]);
      }
    },
    [expandedRowKeys],
  );

  const WebTokensTableColumns = useMemo(
    () => [
      {
        title: 'Token',
        dataIndex: 'symbol',
        key: 'symbol',
        width: 160,
        render: (symbol: string, item: TTokenDashboardItem) => {
          return <TokenBox symbol={symbol} icon={item.symbolIcon} />;
        },
      },
      {
        title: 'aelf Chain',
        dataIndex: 'aelfChain',
        key: 'aelfChain',
        width: 120,
        render: (aelfChain: ChainId[]) => {
          return <AelfChain list={aelfChain} />;
        },
      },
      {
        title: 'Multiple Networks',
        dataIndex: 'networks',
        key: 'networks',
        width: 170,
        render: (networks: string[]) => {
          return <Networks list={networks} />;
        },
      },
      {
        title: 'Volume 24H',
        dataIndex: 'volume24H',
        key: 'volume24H',
        // width: 150,
        showSorterTooltip: false,
        sorter: (a: { volume24H: string }, b: { volume24H: string }) =>
          ZERO.plus(a.volume24H).minus(b.volume24H).toNumber(),
        render: (volume24H: string, item: TTokenDashboardItem) => {
          return <Volume amount={volume24H} unit={item.symbol} amountUsd={item.volume24HUsd} />;
        },
      },
      {
        title: 'Volume 7D',
        dataIndex: 'volume7D',
        key: 'volume7D',
        // width: 150,
        showSorterTooltip: false,
        sorter: (a: { volume7D: string }, b: { volume7D: string }) =>
          ZERO.plus(a.volume7D).minus(b.volume7D).toNumber(),
        render: (volume7D: string, item: TTokenDashboardItem) => {
          return <Volume amount={volume7D} unit={item.symbol} amountUsd={item.volume7DUsd} />;
        },
      },
      {
        title: 'Volume Total',
        dataIndex: 'volumeTotal',
        key: 'volumeTotal',
        // width: 150,
        showSorterTooltip: false,
        sorter: (a: { volumeTotal: string }, b: { volumeTotal: string }) =>
          ZERO.plus(a.volumeTotal).minus(b.volumeTotal).toNumber(),
        render: (volumeTotal: string, item: TTokenDashboardItem) => {
          return <Volume amount={volumeTotal} unit={item.symbol} amountUsd={item.volumeTotalUsd} />;
        },
      },
      {
        title: '',
        dataIndex: 'expand',
        key: 'expand',
        width: 44,
        render: (_expand: any, item: TTokenDashboardItem) => {
          if (item.networks?.length > 1) {
            return (
              <div className={styles['expand-arrow']} onClick={() => handleExpanded(item)}>
                <DynamicArrow isExpand={expandedRowKeys?.includes(item.symbol)} />
              </div>
            );
          }
          return null;
        },
      },
    ],
    [expandedRowKeys, handleExpanded],
  );

  const handleExpandedTableData = (select?: TTokenDashboardItem): ExpandedTableData[] => {
    if (!select) return [];
    if (select.details?.length === 0) return [];

    const newList: ExpandedTableData[] = [];
    select.details?.forEach((item) => {
      newList.push({ symbol: select.symbol, ...item });
    });

    return newList;
  };

  const expandedRowRender = () => {
    return (
      <Table
        size={'large'}
        rowKey={'key'}
        scroll={{ x: 864 }}
        columns={WebTokensTableExpandedColumns}
        dataSource={handleExpandedTableData(activeRowData)}
        showHeader={false}
        pagination={false}
        className={styles['web-tokens-table-expand']}
      />
    );
  };

  return (
    <div className={styles['web-tokens-table']}>
      <Table
        size={'large'}
        rowKey={(row) => row.symbol}
        dataSource={tokens}
        columns={WebTokensTableColumns}
        scroll={{ x: 1020 }}
        expandable={{
          expandedRowRender,
          showExpandColumn: false,
          expandedRowKeys: expandedRowKeys,
        }}
        locale={{
          emptyText: <EmptyDataBox emptyText={'No tokens found'} />,
        }}
        pagination={false}
      />
    </div>
  );
}
