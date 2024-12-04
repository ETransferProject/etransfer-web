import clsx from 'clsx';
import styles from './styles.module.scss';
import InfiniteScroll from 'react-infinite-scroll-component';
import EmptyDataBox from 'pageComponents/EmptyDataBox';
import { useCallback, useMemo } from 'react';
import DisplayImage from 'components/DisplayImage';
import { formatSymbolDisplay } from 'utils/format';
import NetworkLogo from 'components/NetworkLogo';
import StatusBox from '../StatusBox';
import ActionBox from '../ActionBox';

const NoDataText = '-- No Data --';

// TODO ts
export interface MyApplicationListProps {
  totalCount: number;
  applicationList: any[];
  onNextPage: (isRetry?: boolean) => Promise<void>;
}

export default function MyApplicationList({
  totalCount,
  applicationList,
  onNextPage,
}: MyApplicationListProps) {
  const hasMore = useMemo(
    () => applicationList.length < totalCount,
    [applicationList.length, totalCount],
  );
  const renderApplicationCard = useCallback((item: any) => {
    return (
      <div className={styles['application-card-container']}>
        <div className="flex-row-center gap-8">
          <DisplayImage width={20} height={20} name={item.name} src={item.icon} />
          <span className={clsx(styles['token-symbol'])}>{formatSymbolDisplay(item.symbol)}</span>
        </div>
        <div className={clsx(styles['row'], 'flex-row-center-between')}>
          <div className={styles['row-label']}>Chain</div>
          <div className="flex-row-center gap-8">
            <NetworkLogo network={item.network} size={'small'} />
            <span>{item.networkName}</span>
          </div>
        </div>
        <div className={clsx(styles['row'], 'flex-row-center-between')}>
          <div className={styles['row-label']}>Status</div>
          <StatusBox
            className={styles['status-box']}
            status={item.status}
            failReason={item.failReason}
          />
        </div>
        <div className={clsx(styles['row'], 'flex-row-center-between')}>
          <div className={styles['row-label']}>Action</div>
          <ActionBox status={item.status} coboReviewStatus={item.coboReviewStatus} />
        </div>
      </div>
    );
  }, []);

  return (
    <div className={styles['my-application-list']}>
      {applicationList?.length === 0 && <EmptyDataBox emptyText={'No application found'} />}

      {applicationList?.length > 0 && (
        <InfiniteScroll
          dataLength={applicationList.length}
          next={onNextPage}
          hasMore={hasMore}
          scrollableTarget={'etransferWebWrapper'}
          loader={
            <h4 className={clsx(styles['application-loader-message'])}>
              {hasMore ? ' Loading... ' : NoDataText}
            </h4>
          }
          endMessage={<p className={clsx(styles['application-end-message'])}>{NoDataText}</p>}>
          {applicationList?.map((item) => {
            return (
              <div key={`application-mobile-${item.fromTxId}`}>{renderApplicationCard(item)}</div>
            );
          })}
        </InfiniteScroll>
      )}
    </div>
  );
}
