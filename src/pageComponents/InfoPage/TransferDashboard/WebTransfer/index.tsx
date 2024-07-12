import Space from 'components/Space';
import WebTransferHeader from './WebTransferHeader';
import WebTransferTable, { WebTransferTableProps } from './WebTransferTable';
import { WebTransferDashboardProps } from '../types';
import { useCallback, useMemo, useState } from 'react';
import TransferDetail from 'pageComponents/InfoPage/TransferDetail';
import { TTransferDashboardData } from 'types/infoDashboard';
import { useInfoDashboardState } from 'store/Provider/hooks';
import { useEffectOnce } from 'react-use';
import myEvents from 'utils/myEvent';

export default function WebTransfer({
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
  handleTypeChange,
  handleFromTokenChange,
  handleFromChainChange,
  handleToTokenChange,
  handleToChainChange,
  // table
  totalCount,
  maxResultCount,
  skipPageCount,
  tableOnChange,
  handleResetFilter,
}: WebTransferDashboardProps & Omit<WebTransferTableProps, 'showDetail'>) {
  const { transferList } = useInfoDashboardState();
  const [isShowDetail, setIsShowDetail] = useState(false);
  const [detailData, setDetailData] = useState<TTransferDashboardData>(transferList[0]);

  const showDetail = useCallback((item: TTransferDashboardData) => {
    setIsShowDetail(true);
    setDetailData(item);
  }, []);

  const handleHideDetail = useCallback(() => {
    setIsShowDetail(false);
  }, []);

  useEffectOnce(() => {
    const { remove: removeHide } =
      myEvents.HideWebTransferDashboardDetailPage.addListener(handleHideDetail);

    return () => {
      removeHide();
    };
  });

  const renderWebPage = useMemo(() => {
    return (
      <div style={{ display: isShowDetail ? 'none' : 'block' }}>
        <WebTransferHeader
          fromTokenList={filterFromTokenList}
          fromChainList={filterFromChainList}
          toTokenList={filterToTokenList}
          toChainList={filterToChainList}
          handleTypeChange={handleTypeChange}
          handleFromTokenChange={handleFromTokenChange}
          handleFromChainChange={handleFromChainChange}
          handleToTokenChange={handleToTokenChange}
          handleToChainChange={handleToChainChange}
          type={filterType}
          fromToken={filterFromToken}
          fromChain={filterFromChain}
          toToken={filterToToken}
          toChain={filterToChain}
          handleResetFilter={handleResetFilter}
        />
        <Space direction={'vertical'} size={16} />
        <WebTransferTable
          totalCount={totalCount}
          maxResultCount={maxResultCount}
          skipPageCount={skipPageCount}
          tableOnChange={tableOnChange}
          showDetail={showDetail}
        />
      </div>
    );
  }, [
    filterFromChain,
    filterFromChainList,
    filterFromToken,
    filterFromTokenList,
    filterToChain,
    filterToChainList,
    filterToToken,
    filterToTokenList,
    filterType,
    handleFromChainChange,
    handleFromTokenChange,
    handleResetFilter,
    handleToChainChange,
    handleToTokenChange,
    handleTypeChange,
    isShowDetail,
    maxResultCount,
    showDetail,
    skipPageCount,
    tableOnChange,
    totalCount,
  ]);

  const renderWebDetail = useMemo(() => {
    return (
      <div style={{ display: isShowDetail ? 'block' : 'none' }}>
        <TransferDetail {...detailData} />
      </div>
    );
  }, [detailData, isShowDetail]);

  return (
    <div>
      {renderWebPage}
      {renderWebDetail}
    </div>
  );
}
