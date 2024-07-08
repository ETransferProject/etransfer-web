import { useInfoDashboardState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { useCallback, useMemo } from 'react';
import TokenBox from '../../ColumnComponents/TokenBox';
import AelfChain from '../../ColumnComponents/AelfChain';
import Networks from '../../ColumnComponents/Networks';
import { TTokenDashboardItem } from 'types/infoDashboard';
import NetworkTotalVolume from '../../ColumnComponents/NetworkTotalVolume';
import DynamicArrow from 'components/DynamicArrow';

type TokensDashboardMobileItem = TTokenDashboardItem & { isExpand?: boolean };

export default function MobileTokensBody() {
  const { tokens } = useInfoDashboardState();
  const tokenList = useMemo<TokensDashboardMobileItem[]>(() => {
    const list = JSON.parse(JSON.stringify(tokens));
    list.forEach((item: TokensDashboardMobileItem) => {
      item.isExpand = false;
    });
    return list;
  }, [tokens]);

  const switchExpand = useCallback((item: TokensDashboardMobileItem) => {
    item.isExpand = !item.isExpand;
  }, []);

  const renderTokensDetail = useCallback((item: TokensDashboardMobileItem) => {
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
    (item: TokensDashboardMobileItem) => {
      return (
        <div className={styles['action']} onClick={() => switchExpand(item)}>
          {item.isExpand ? 'Fold' : 'Details'}
          <DynamicArrow isExpand={item.isExpand} className={styles['action-arrow']} />
        </div>
      );
    },
    [switchExpand],
  );

  const renderTokenCard = useCallback(
    (item: TokensDashboardMobileItem) => {
      return (
        <div className={styles['token-card-container']}>
          <div className="flex-row-between">
            <TokenBox symbol={item.symbol} icon={item.symbolIcon} />
            <div>
              <AelfChain list={item.aelfChain} />
              <div className={styles['chain-network-divider']} />
              <Networks list={item.networks} size="small" />
            </div>
          </div>
          <div className="flex-row-between">
            <div>Total Volume</div>
            <div>{`${item.volumeTotal} ${item.symbol}`}</div>
          </div>
          {item.isExpand && renderTokensDetail(item)}
          {renderAction(item)}
        </div>
      );
    },
    [renderAction, renderTokensDetail],
  );

  return (
    <div className={styles['mobile-tokens-body']}>
      {tokenList?.map((token) => {
        return <div key={`tokensDashboard-mobile-${token.symbol}`}>{renderTokenCard(token)}</div>;
      })}
    </div>
  );
}
