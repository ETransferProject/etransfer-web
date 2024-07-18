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
    dataIndex: 'empty1',
    key: 'empty1',
    width: 160,
  },
  {
    title: 'empty',
    dataIndex: 'empty2',
    key: 'empty2',
    width: 120,
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
    width: 190,
    render: (volume24H: string, item: ExpandedTableData) => {
      return <Volume amount={volume24H} unit={item.symbol} />;
    },
  },
  {
    title: 'Volume 7D',
    dataIndex: 'volume7D',
    key: 'volume7D',
    width: 190,
    render: (volume7D: string, item: ExpandedTableData) => {
      return <Volume amount={volume7D} unit={item.symbol} />;
    },
  },
  {
    title: 'Volume Total',
    dataIndex: 'volumeTotal',
    key: 'volumeTotal',
    width: 190,
    render: (volumeTotal: string, item: ExpandedTableData) => {
      return <Volume amount={volumeTotal} unit={item.symbol} />;
    },
  },
  {
    title: '',
    dataIndex: 'empty3',
    key: 'empty3',
    width: 44,
    render: () => {
      return (
        <div className={styles['expand-arrow']} style={{ visibility: 'hidden' }}>
          <DynamicArrow />
        </div>
      );
    },
  },
];

export default function WebTokensTable() {
  const { tokens } = useInfoDashboardState();
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>();
  const [activeRowData, setActiveRowData] = useState<string>();

  const handleExpanded = useCallback(
    (item: TTokenDashboardItem) => {
      setActiveRowData(item.symbol);
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
        dataIndex: 'volume24HUsd',
        key: 'volume24HUsd',
        width: 190,
        showSorterTooltip: false,
        sorter: (a: { volume24HUsd: string }, b: { volume24HUsd: string }) =>
          ZERO.plus(a.volume24HUsd).minus(b.volume24HUsd).toNumber(),
        render: (volume24HUsd: string, item: TTokenDashboardItem) => {
          return <Volume amount={item.volume24H} unit={item.symbol} amountUsd={volume24HUsd} />;
        },
      },
      {
        title: 'Volume 7D',
        dataIndex: 'volume7DUsd',
        key: 'volume7DUsd',
        width: 190,
        showSorterTooltip: false,
        sorter: (a: { volume7DUsd: string }, b: { volume7DUsd: string }) =>
          ZERO.plus(a.volume7DUsd).minus(b.volume7DUsd).toNumber(),
        render: (volume7DUsd: string, item: TTokenDashboardItem) => {
          return <Volume amount={item.volume7D} unit={item.symbol} amountUsd={volume7DUsd} />;
        },
      },
      {
        title: 'Volume Total',
        dataIndex: 'volumeTotalUsd',
        key: 'volumeTotalUsd',
        width: 190,
        showSorterTooltip: false,
        sorter: (a: { volumeTotalUsd: string }, b: { volumeTotalUsd: string }) =>
          ZERO.plus(a.volumeTotalUsd).minus(b.volumeTotalUsd).toNumber(),
        render: (volumeTotalUsd: string, item: TTokenDashboardItem) => {
          return <Volume amount={item.volumeTotal} unit={item.symbol} amountUsd={volumeTotalUsd} />;
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

  const handleExpandedTableData = (selectSymbol?: string): ExpandedTableData[] => {
    if (!selectSymbol) return [];

    const selectedToken = tokens?.find((item) => item.symbol === selectSymbol);
    if (!selectedToken) return [];

    if (selectedToken.details?.length === 0) return [];

    const newList: ExpandedTableData[] = [];
    selectedToken.details?.forEach((item) => {
      newList.push({ symbol: selectedToken.symbol, ...item });
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
