import { useInfoDashboardState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { useCallback, useMemo, useState } from 'react';
import TokenBox from '../../ColumnComponents/TokenBox';
import Networks from '../../ColumnComponents/Networks';
import { TTokenDashboardItem } from 'types/infoDashboard';
import NetworkTotalVolume from '../../ColumnComponents/NetworkTotalVolume';
import DynamicArrow from 'components/DynamicArrow';
import CommonSpace from 'components/CommonSpace';
import clsx from 'clsx';
import { formatSymbolDisplay } from 'utils/format';

export default function MobileTokensBody() {
  const { tokens } = useInfoDashboardState();
  const tokenList = useMemo<TTokenDashboardItem[]>(() => {
    return JSON.parse(JSON.stringify(tokens));
  }, [tokens]);

  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>();

  const switchExpand = useCallback(
    (item: TTokenDashboardItem) => {
      if (expandedRowKeys?.includes(item.symbol)) {
        setExpandedRowKeys([]);
      } else {
        setExpandedRowKeys([item.symbol]);
      }
    },
    [expandedRowKeys],
  );

  const renderTokensDetail = useCallback((item: TTokenDashboardItem) => {
    return (
      <div className={styles['tokens-detail']}>
        {item.details.map((detail) => {
          return (
            <NetworkTotalVolume
              key={`mobile-token-network-detail-${detail.name}`}
              network={detail.name}
              name={detail.name}
              amount={detail.volumeTotal}
              symbol={item.symbol}
            />
          );
        })}
      </div>
    );
  }, []);

  const renderAction = useCallback(
    (item: TTokenDashboardItem) => {
      return (
        <div className={clsx('row-center', styles['action'])} onClick={() => switchExpand(item)}>
          {expandedRowKeys?.includes(item.symbol) ? 'Fold' : 'Details'}
          <DynamicArrow
            isExpand={expandedRowKeys?.includes(item.symbol)}
            className={styles['action-arrow']}
            size="Small"
          />
        </div>
      );
    },
    [expandedRowKeys, switchExpand],
  );

  const renderTokenCard = useCallback(
    (item: TTokenDashboardItem) => {
      return (
        <div className={styles['token-card-container']}>
          <div className="flex-row-between">
            <div className="flex-row-center flex-shrink-0 flex-1">
              <TokenBox
                size={20}
                symbol={item.symbol}
                icon={item.symbolIcon}
                className={clsx('flex-1', styles['token-wrapper'])}
              />
            </div>

            <div className="flex-row-center">
              <Networks list={item.networks} size="small" className={styles['chain-wrapper']} />
            </div>
          </div>
          <CommonSpace direction={'vertical'} size={12} />
          <div className="flex-row-between">
            <div>Total Volume</div>
            <div>{`${item.volumeTotal} ${formatSymbolDisplay(item.symbol)}`}</div>
          </div>
          {expandedRowKeys?.includes(item.symbol) && renderTokensDetail(item)}
          {renderAction(item)}
        </div>
      );
    },
    [expandedRowKeys, renderAction, renderTokensDetail],
  );

  return (
    <div className={styles['mobile-tokens-body']}>
      {tokenList?.map((token) => {
        return (
          <div
            className={styles['mobile-tokens-body-card']}
            key={`tokensDashboard-mobile-${token.symbol}`}>
            {renderTokenCard(token)}
          </div>
        );
      })}
    </div>
  );
}
