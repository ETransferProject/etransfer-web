import { ChainId } from '@portkey/types';
import styles from './styles.module.scss';
import { BlockchainNetworkType } from 'constants/network';
import { useMemo } from 'react';
import NetworkLogo from 'components/NetworkLogo';
import { AllSupportedELFChainId } from 'constants/chain';
import { ChainNamePrefix } from 'constants/index';
import clsx from 'clsx';

export default function FromOrToChain({
  network,
  chainId,
}: {
  network: string;
  chainId?: ChainId;
}) {
  const renderNetworkLogo = useMemo(() => {
    const currentNetwork = network === BlockchainNetworkType.AELF ? chainId : network;
    return <NetworkLogo network={currentNetwork || ''} size="small" />;
  }, [chainId, network]);

  const renderNetworkName = useMemo(() => {
    const currentNetworkName =
      network === BlockchainNetworkType.AELF
        ? chainId === AllSupportedELFChainId.AELF
          ? `${ChainNamePrefix.MainChain} ${chainId}`
          : `${ChainNamePrefix.SideChain} ${chainId}`
        : network;
    return <span>{currentNetworkName}</span>;
  }, [chainId, network]);

  return (
    <div className={clsx('flex-row-center', styles['from-or-to-chain'])}>
      {renderNetworkLogo}
      {renderNetworkName}
    </div>
  );
}
