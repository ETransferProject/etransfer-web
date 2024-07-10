import Space from 'components/Space';
import WebTransferHeader from './WebTransferHeader';
import WebTransferTable, { WebTransferTableProps } from './WebTransferTable';
import styles from './styles.module.scss';
import { WebTransferDashboardProps } from '../types';

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
  skipCount,
  tableOnChange,
  handleResetFilter,
}: WebTransferDashboardProps & WebTransferTableProps) {
  return (
    <div className={styles['web-transfer']}>
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
        skipCount={skipCount}
        tableOnChange={tableOnChange}
      />
    </div>
  );
}
