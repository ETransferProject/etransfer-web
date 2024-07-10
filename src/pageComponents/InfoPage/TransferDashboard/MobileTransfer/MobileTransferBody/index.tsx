import { useInfoDashboardState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { useCallback, useMemo } from 'react';
import { TTransferDashboardData } from 'types/infoDashboard';
import DynamicArrow from 'components/DynamicArrow';
import FromToChain from '../../ColumnComponents/FromToChain';
import FromToToken from '../../ColumnComponents/FromToToken';
import Amount from '../../ColumnComponents/Amount';
import Time from '../../ColumnComponents/Time';
import WalletAddress from '../../ColumnComponents/WalletAddress';
import clsx from 'clsx';

type TransferDashboardMobileItem = TTransferDashboardData & { isExpand?: boolean };

export default function MobileTransferBody() {
  const { transferList: transfers } = useInfoDashboardState();
  const transferList = useMemo<TransferDashboardMobileItem[]>(() => {
    return JSON.parse(JSON.stringify(transfers));
  }, [transfers]);

  const switchExpand = useCallback((item: TransferDashboardMobileItem) => {
    console.log(item);
  }, []);

  const renderAction = useCallback(
    (item: TransferDashboardMobileItem) => {
      return (
        <div className={clsx('row-center', styles['action'])} onClick={() => switchExpand(item)}>
          {'Details'}
          <DynamicArrow className={styles['action-arrow']} />
        </div>
      );
    },
    [switchExpand],
  );

  const renderTransferCard = useCallback(
    (item: TransferDashboardMobileItem) => {
      return (
        <div className={styles['transfer-card-container']}>
          <div
            className={clsx(
              'flex-row-between',
              styles['transfer-card-row'],
              styles['transfer-card-token'],
              'flex-row-between',
            )}>
            <FromToToken
              fromSymbol={item.fromSymbol}
              fromIcon={''}
              toSymbol={item.toSymbol}
              toIcon={''}
            />
            <div className={styles['transfer-card-type']}>{item.orderType}</div>
          </div>
          <div className={clsx('flex-row-between', styles['transfer-card-row'])}>
            <div>From - To</div>
            <FromToChain
              fromNetwork={item.fromNetwork}
              fromChainId={item.fromChainId}
              toNetwork={item.toNetwork}
              toChainId={item.toChainId}
            />
          </div>
          <div className={clsx('flex-row-between', styles['transfer-card-row'])}>
            <div>Amount</div>
            <Amount amount={item.fromAmount} amountUsd={item.fromAmountUsd} />
          </div>

          <div className={clsx('flex-row-between', styles['transfer-card-row'])}>
            <div>Wallet</div>
            <WalletAddress
              className={styles['transfer-card-wallet-address']}
              address={item.fromAddress}
              chainId={item.fromChainId}
              network={item.fromNetwork}
            />
          </div>

          <div className={clsx('flex-row-between', styles['transfer-card-row'])}>
            <div>Time</div>

            <Time time={item.createTime} />
          </div>

          {renderAction(item)}
        </div>
      );
    },
    [renderAction],
  );

  return (
    <div className={styles['mobile-transfer-body']}>
      {transferList?.map((item) => {
        return (
          <div key={`transferDashboard-mobile-${item.fromTxId}`}>{renderTransferCard(item)}</div>
        );
      })}
    </div>
  );
}
