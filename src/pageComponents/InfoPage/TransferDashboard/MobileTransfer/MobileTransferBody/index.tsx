import { useInfoDashboardState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { useCallback, useMemo } from 'react';
import { TTransferDashboardData } from 'types/infoDashboard';
import DynamicArrow from 'components/DynamicArrow';
import FromToChain from '../../ColumnComponents/FromToChain';
import FromToToken from '../../ColumnComponents/FromToToken';
import Amount from '../../ColumnComponents/Amount';
import Time from '../../ColumnComponents/Time';
import Wallet from '../../ColumnComponents/Wallet';

type TransferDashboardMobileItem = TTransferDashboardData & { isExpand?: boolean };

export default function MobileTransferBody() {
  const { tokens } = useInfoDashboardState();
  const tokenList = useMemo<TransferDashboardMobileItem[]>(() => {
    const list = JSON.parse(JSON.stringify(tokens));
    list.forEach((item: TransferDashboardMobileItem) => {
      item.isExpand = false;
    });
    return list;
  }, [tokens]);

  const switchExpand = useCallback((item: TransferDashboardMobileItem) => {
    item.isExpand = !item.isExpand;
  }, []);

  const renderAction = useCallback(
    (item: TransferDashboardMobileItem) => {
      return (
        <div className={styles['action']} onClick={() => switchExpand(item)}>
          {item.isExpand ? 'Fold' : 'Details'}
          <DynamicArrow isExpand={item.isExpand} className={styles['action-arrow']} />
        </div>
      );
    },
    [switchExpand],
  );

  const renderTransferCard = useCallback(
    (item: TransferDashboardMobileItem) => {
      return (
        <div className={styles['token-card-container']}>
          <div className="flex-row-between">
            <FromToToken
              fromSymbol={item.fromSymbol}
              fromIcon={''}
              toSymbol={item.toSymbol}
              toIcon={''}
            />
            <div>{item.status}</div>
          </div>
          <div>
            <div>From - To</div>
            <FromToChain fromChainId={item.fromChainId} toChainId={item.toChainId} />
          </div>
          <div>
            <div>Amount</div>
            <Amount amount={item.fromAmount} amountUsd={item.fromAmountUsd} />
          </div>

          <div>
            <div>Wallet</div>
            <Wallet address={item.fromAddress} chainId={item.fromChainId} />
          </div>

          <div>
            <div>Time</div>
            <Time time={String(item.createTime)} />
          </div>

          {renderAction(item)}
        </div>
      );
    },
    [renderAction],
  );

  return (
    <div className={styles['mobile-transfer-body']}>
      {tokenList?.map((token) => {
        return (
          <div key={`transferDashboard-mobile-${token.fromTxId}`}>{renderTransferCard(token)}</div>
        );
      })}
    </div>
  );
}
