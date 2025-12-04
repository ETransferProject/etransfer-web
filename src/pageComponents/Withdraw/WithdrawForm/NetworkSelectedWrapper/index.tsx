import { useMemo } from 'react';
import { useWithdrawNewState } from 'store/Provider/hooks';
import NetworkSelected from 'pageComponents/CrossChainTransferPage/CrossChainTransferForm/NetworkSelected';
import { TNetworkItem } from 'types/api';
import clsx from 'clsx';
import styles from './styles.module.scss';

const SelectSourceChain = 'Select Source Chain';
const SelectDestinationChain = 'Select Destination Chain';

export interface NetworkSelectedWrapperProps {
  className?: string;
  label?: string;
  cardType: 'From' | 'To';
  onSelectNetworkCallback?: (item: TNetworkItem) => Promise<void>;
}

export function NetworkSelectedWrapper({
  className,
  label,
  cardType,
  onSelectNetworkCallback,
}: NetworkSelectedWrapperProps) {
  const { fromNetwork, fromNetworkList, toNetwork, toNetworkList } = useWithdrawNewState();

  const selectedNetwork = useMemo(() => {
    return cardType === 'From' ? fromNetwork : toNetwork;
  }, [cardType, fromNetwork, toNetwork]);

  const selectedNetworkList = useMemo(() => {
    return cardType === 'From' ? fromNetworkList : toNetworkList;
  }, [cardType, fromNetworkList, toNetworkList]);

  return (
    <div className={clsx(styles['network-selected-wrapper'], className)}>
      <div className={styles['network-selected-label']}>{label || cardType}</div>
      <NetworkSelected
        className={styles['network-selected']}
        modalTitle={cardType === 'From' ? SelectSourceChain : SelectDestinationChain}
        selectCallback={onSelectNetworkCallback}
        selected={selectedNetwork}
        networkList={selectedNetworkList || []}
      />
    </div>
  );
}
