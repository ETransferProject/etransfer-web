import styles from './styles.module.scss';
import { ChainId } from '@portkey/types';
import clsx from 'clsx';
import CommonTooltip from 'components/CommonTooltip';
import { useCommonState } from 'store/Provider/hooks';
import NetworkLogo, { TNetworkLogoSize } from 'components/NetworkLogo';

interface AelfChainProps {
  list: ChainId[];
  size?: TNetworkLogoSize;
  className?: string;
  iconClassName?: string;
}

export default function AelfChain({ list, size, className, iconClassName }: AelfChainProps) {
  const { isPadPX } = useCommonState();
  // const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  return (
    <div className={clsx('flex-row-center', styles['aelf-chain-container'], className)}>
      {list?.map((chainId) => {
        return (
          <CommonTooltip
            key={`AelfChain-${chainId}`}
            title={chainId}
            trigger={isPadPX ? '' : 'hover'}
            // open={isPadPX ? isTooltipOpen : undefined}
          >
            <NetworkLogo
              className={clsx('flex-center', 'cursor-pointer', iconClassName)}
              network={chainId}
              size={size}
            />
          </CommonTooltip>
        );
      })}
    </div>
  );
}
