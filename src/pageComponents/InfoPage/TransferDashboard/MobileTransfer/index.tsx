import { MobileTransferDashboardProps } from '../types';
import MobileTransferBody, { MobileTransferTableProps } from './MobileTransferBody';
import MobileTransferHeader from './MobileTransferHeader';

export default function MobileTransfer({
  filterFromTokenList,
  filterFromChainList,
  filterToTokenList,
  filterToChainList,
  filterType,
  filterFromToken,
  filterFromChain,
  filterToToken,
  filterToChain,
  totalCount,
  handleNextPage,
  handleResetFilter,
  handleApplyFilter,
}: MobileTransferDashboardProps & MobileTransferTableProps) {
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
      <MobileTransferBody totalCount={totalCount} handleNextPage={handleNextPage} />
    </div>
  );
}
