import styles from './styles.module.scss';
import { ChainId } from '@portkey/types';
import clsx from 'clsx';
import CommonTooltip from 'components/CommonTooltip';
import { useCommonState } from 'store/Provider/hooks';
import NetworkLogo from 'components/NetworkLogo';

interface AelfChainProps {
  list: ChainId[];
  className?: string;
  iconClassName?: string;
}

export default function AelfChain({ list, className, iconClassName }: AelfChainProps) {
  const { isPadPX } = useCommonState();
  // const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  return (
    <div className={clsx('row-center', styles['aelf-chain-container'], className)}>
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
            />
          </CommonTooltip>
        );
      })}
    </div>
  );
}
