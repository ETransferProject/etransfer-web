import Space from 'components/Space';
import WebTransferHeader from './WebTransferHeader';
import WebTransferTable, { WebTransferTableProps } from './WebTransferTable';
import styles from './styles.module.scss';
import { ChainId } from '@portkey/types';

interface WebTransferFilterProps {
  filterFromTokenList: string[];
  filterFromChainList: ChainId[];
  filterToTokenList: string[];
  filterToChainList: ChainId[];
}

export default function WebTransfer({
  filterFromTokenList,
  filterFromChainList,
  filterToTokenList,
  filterToChainList,
  totalCount,
  maxResultCount,
  skipCount,
  tableOnChange,
}: WebTransferFilterProps & WebTransferTableProps) {
  return (
    <div className={styles['web-transfer']}>
      <WebTransferHeader
        fromTokenList={filterFromTokenList}
        fromChainList={filterFromChainList}
        toTokenList={filterToTokenList}
        toChainList={filterToChainList}
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
