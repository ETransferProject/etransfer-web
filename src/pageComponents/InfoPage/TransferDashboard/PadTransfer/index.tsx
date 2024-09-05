import MobileTransferHeader from '../MobileTransfer/MobileTransferHeader';
import WebTransferTable, { WebTransferTableProps } from '../WebTransfer/WebTransferTable';
import CommonSpace from 'components/CommonSpace';
import { MobileTransferDashboardProps } from '../types';

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
}: MobileTransferDashboardProps & WebTransferTableProps) {
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
      <CommonSpace direction={'vertical'} size={16} />
      <WebTransferTable
        totalCount={totalCount}
        maxResultCount={maxResultCount}
        skipPageCount={skipPageCount}
        tableOnChange={tableOnChange}
      />
    </div>
  );
}
