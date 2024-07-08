import { ToArrow } from 'assets/images';
import NetworkLogo from 'components/NetworkLogo';
import Space from 'components/Space';
import TokenBox from 'pageComponents/InfoPage/TokenDashboard/ColumnComponents/TokenBox';

export interface FromToChainProps {
  fromChainId: string;
  toChainId: string;
}

export default function FromToChain({ fromChainId, toChainId }: FromToChainProps) {
  return (
    <div>
      <NetworkLogo network={fromChainId} />
      <Space direction={'horizontal'} size={6} />
      <ToArrow />
      <Space direction={'horizontal'} size={6} />
      <NetworkLogo network={toChainId} />
    </div>
  );
}
