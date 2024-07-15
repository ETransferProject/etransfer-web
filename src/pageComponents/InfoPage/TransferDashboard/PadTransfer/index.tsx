import TransferDetail from 'pageComponents/InfoPage/TransferDetail';
import MobileTransferHeader from '../MobileTransfer/MobileTransferHeader';
import { useCallback, useState } from 'react';
import WebTransferTable, { WebTransferTableProps } from '../WebTransfer/WebTransferTable';
import Space from 'components/Space';
import { useInfoDashboardState } from 'store/Provider/hooks';
import { TTransferDashboardData } from 'types/infoDashboard';
import { MobileTransferDashboardProps } from '../types';
import styles from './styles.module.scss';
import CommonDrawer from 'components/CommonDrawer';

export default function PadTransfer({
  // filter
  filterFromTokenList,
  filterFromChainList,
  filterToTokenList,
  filterToChainList,
  filterType,
  filterFromToken,
  filterFromChain,
  filterToToken,
  filterToChain,

  // table
  totalCount,
  maxResultCount,
  skipPageCount,
  tableOnChange,

  handleResetFilter,
  handleApplyFilter,
}: MobileTransferDashboardProps & Omit<WebTransferTableProps, 'showDetail'>) {
  const { transferList } = useInfoDashboardState();
  const [isShowDetailDrawer, setIsShowDetailDrawer] = useState(false);
  const [detailData, setDetailData] = useState<TTransferDashboardData>(transferList[0]);

  const showDetail = useCallback((item: TTransferDashboardData) => {
    setIsShowDetailDrawer(true);
    setDetailData(item);
  }, []);

  return (
    <div>
      <MobileTransferHeader
        fromTokenList={filterFromTokenList}
        fromChainList={filterFromChainList}
        toTokenList={filterToTokenList}
        toChainList={filterToChainList}
        type={filterType}
        fromToken={filterFromToken}
        fromChain={filterFromChain}
        toToken={filterToToken}
        toChain={filterToChain}
        handleResetFilter={handleResetFilter}
        handleApplyFilter={handleApplyFilter}
      />
      <Space direction={'vertical'} size={16} />
      <WebTransferTable
        totalCount={totalCount}
        maxResultCount={maxResultCount}
        skipPageCount={skipPageCount}
        tableOnChange={tableOnChange}
        showDetail={showDetail}
      />

      <CommonDrawer
        open={isShowDetailDrawer}
        height={'100%'}
        title={<div className={styles['detail-title']}>Transfer Detail</div>}
        id="TransferDashboardDetailPadDrawer"
        className={styles['detail-drawer-wrapper']}
        destroyOnClose
        placement={'right'}
        onClose={() => setIsShowDetailDrawer(!isShowDetailDrawer)}>
        <TransferDetail {...detailData} />
      </CommonDrawer>
    </div>
  );
}
