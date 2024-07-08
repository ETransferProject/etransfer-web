import { MobileTransferDashboardProps } from '../types';
import MobileTransferBody from './MobileTransferBody';
import MobileTransferHeader from './MobileTransferHeader';
import styles from './styles.module.scss';

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
  handleResetFilter,
  handleApplyFilter,
}: MobileTransferDashboardProps) {
  return (
    <div className={styles['mobile-transfer']}>
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
      <MobileTransferBody />
    </div>
  );
}
