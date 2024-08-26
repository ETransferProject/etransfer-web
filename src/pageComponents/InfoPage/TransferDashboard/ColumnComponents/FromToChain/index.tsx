import { ToArrow } from 'assets/images';
import CommonTooltip from 'components/CommonTooltip';
import NetworkLogo from 'components/NetworkLogo';
import CommonSpace from 'components/CommonSpace';
import { BlockchainNetworkType } from 'constants/network';
import { useCallback, useMemo } from 'react';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { AelfChainNetwork, AllSupportedELFChainId } from 'constants/chain';

export interface FromToChainProps {
  fromNetwork: string;
  fromChainId?: string;
  toNetwork: string;
  toChainId?: string;
}

export default function FromToChain({
  fromNetwork,
  fromChainId,
  toNetwork,
  toChainId,
}: FromToChainProps) {
  const { isPadPX } = useCommonState();
  const currentFrom = useMemo(() => {
    return fromNetwork === BlockchainNetworkType.AELF ? fromChainId : fromNetwork;
  }, [fromChainId, fromNetwork]);

  const currentTo = useMemo(() => {
    return toNetwork === BlockchainNetworkType.AELF ? toChainId : toNetwork;
  }, [toChainId, toNetwork]);

  const formatTip = useCallback((network?: string) => {
    switch (network) {
      case AllSupportedELFChainId.AELF:
        return AelfChainNetwork.AELF;

      case AllSupportedELFChainId.tDVV:
        return AelfChainNetwork.tDVV;
      case AllSupportedELFChainId.tDVW:
        return AelfChainNetwork.tDVW;

      default:
        return network;
    }
  }, []);

  return (
    <div className="flex-row-center">
      <CommonTooltip
        title={formatTip(currentFrom)}
        trigger={isPadPX ? '' : 'hover'}
        overlayClassName={styles['aelf-chain-tooltip']}>
        <div className={styles['logo-container']}>
          <NetworkLogo network={currentFrom || ''} />
        </div>
      </CommonTooltip>

      <CommonSpace direction={'horizontal'} size={6} />
      <ToArrow />
      <CommonSpace direction={'horizontal'} size={6} />

      <CommonTooltip
        title={formatTip(currentTo)}
        trigger={isPadPX ? '' : 'hover'}
        overlayClassName={styles['aelf-chain-tooltip']}>
        <div className={styles['logo-container']}>
          <NetworkLogo network={currentTo || ''} />
        </div>
      </CommonTooltip>
    </div>
  );
}
