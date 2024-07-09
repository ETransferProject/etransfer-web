import { ToArrow } from 'assets/images';
import NetworkLogo from 'components/NetworkLogo';
import Space from 'components/Space';
import { BlockchainNetworkType } from 'constants/network';
import { useMemo } from 'react';

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
  const currentFrom = useMemo(() => {
    return fromNetwork === BlockchainNetworkType.AELF ? fromChainId : fromNetwork;
  }, [fromChainId, fromNetwork]);

  const currentTo = useMemo(() => {
    return toNetwork === BlockchainNetworkType.AELF ? toChainId : toNetwork;
  }, [toChainId, toNetwork]);

  return (
    <div>
      <NetworkLogo network={currentFrom || ''} />
      <Space direction={'horizontal'} size={6} />
      <ToArrow />
      <Space direction={'horizontal'} size={6} />
      <NetworkLogo network={currentTo || ''} />
    </div>
  );
}
