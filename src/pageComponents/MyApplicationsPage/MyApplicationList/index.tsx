import clsx from 'clsx';
import styles from './styles.module.scss';
import InfiniteScroll from 'react-infinite-scroll-component';
import EmptyDataBox from 'components/EmptyDataBox';
import { useCallback, useMemo } from 'react';
import DisplayImage from 'components/DisplayImage';
import { formatSymbolDisplay } from 'utils/format';
import NetworkLogo from 'components/NetworkLogo';
import StatusBox from '../StatusBox';
import ActionBox from '../ActionBox';
import { TMyApplicationItem } from 'types/api';
import { getApplicationDisplayInfo } from '../utils';
import { NO_APPLICATION } from 'constants/listing';
import { LOADING_TEXT } from 'constants/misc';
import { DEFAULT_NULL_VALUE } from 'constants/index';
import { Divider } from 'antd';

const NoDataText = '-- No Data --';

export interface MyApplicationListProps {
  totalCount: number;
  applicationList: TMyApplicationItem[];
  onNextPage: (isRetry?: boolean) => Promise<void>;
  onResetList?: () => Promise<void>;
}

export default function MyApplicationList({
  totalCount,
  applicationList,
  onNextPage,
  onResetList,
}: MyApplicationListProps) {
  const hasMore = useMemo(
    () => applicationList.length < totalCount,
    [applicationList.length, totalCount],
  );
  const renderApplicationCard = useCallback(
    (item: TMyApplicationItem) => {
      const { chainTokenInfo, aelfChainIds, otherChainId, failReason, failTime } =
        getApplicationDisplayInfo(item);

      return (
        <>
          <div className={styles['application-card-container']}>
            <div className="flex-row-center gap-8">
              <DisplayImage
                width={20}
                height={20}
                name={item.symbol}
                src={chainTokenInfo?.icon || ''}
              />
              <span className={clsx(styles['token-symbol'])}>
                {formatSymbolDisplay(item.symbol)}
              </span>
            </div>
            <div className={clsx(styles['row'], 'flex-row-center-between')}>
              <div className={styles['row-label']}>Chain</div>
              {chainTokenInfo?.chainId ? (
                <div className="flex-row-center gap-8">
                  <NetworkLogo network={chainTokenInfo.chainId} size={'small'} />
                  <span>{chainTokenInfo.chainName}</span>
                </div>
              ) : (
                DEFAULT_NULL_VALUE
              )}
            </div>
            <div className={clsx(styles['row'], 'flex-row-center-between')}>
              <div className={styles['row-label']}>Status</div>
              {chainTokenInfo?.status ? (
                <StatusBox
                  className={styles['status-box']}
                  status={chainTokenInfo?.status}
                  failReason={failReason}
                />
              ) : (
                DEFAULT_NULL_VALUE
              )}
            </div>
            <div className={clsx(styles['row'], 'flex-row-center-between')}>
              <div className={styles['row-label']}>Action</div>
              {chainTokenInfo?.icon &&
              chainTokenInfo?.chainId &&
              chainTokenInfo?.chainName &&
              chainTokenInfo?.status ? (
                <ActionBox
                  symbol={item.symbol}
                  tokenIcon={chainTokenInfo?.icon}
                  aelfChainIds={aelfChainIds}
                  otherChainId={otherChainId}
                  chainName={chainTokenInfo?.chainName}
                  id={item.id}
                  status={chainTokenInfo?.status}
                  rejectedTime={failTime}
                  resetList={onResetList}
                />
              ) : (
                DEFAULT_NULL_VALUE
              )}
            </div>
          </div>
          <Divider className={styles['divider-style']} />
        </>
      );
    },
    [onResetList],
  );

  return (
    <div className={styles['my-application-list']}>
      {applicationList?.length === 0 && <EmptyDataBox emptyText={NO_APPLICATION} />}

      {applicationList?.length > 0 && (
        <InfiniteScroll
          dataLength={applicationList.length}
          next={onNextPage}
          hasMore={hasMore}
          scrollableTarget={'etransferWebWrapper'}
          loader={
            <h4 className={clsx(styles['application-loader-message'])}>
              {hasMore ? LOADING_TEXT : NoDataText}
            </h4>
          }
          endMessage={<p className={clsx(styles['application-end-message'])}>{NoDataText}</p>}>
          {applicationList?.map((item) => {
            return <div key={`application-mobile-${item.id}`}>{renderApplicationCard(item)}</div>;
          })}
        </InfiniteScroll>
      )}
    </div>
  );
}
