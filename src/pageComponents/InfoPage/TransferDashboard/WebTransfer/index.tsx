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
        fromToken={0}
        fromChain={0}
        toToken={0}
        toChain={0}
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
