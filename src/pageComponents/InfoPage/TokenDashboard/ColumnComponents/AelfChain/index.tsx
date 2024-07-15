import styles from './styles.module.scss';
import { ChainId } from '@portkey/types';
import clsx from 'clsx';
import CommonTooltip from 'components/CommonTooltip';
import { useCommonState } from 'store/Provider/hooks';
import NetworkLogo, { TNetworkLogoSize } from 'components/NetworkLogo';
import { AelfChainNetwork } from 'constants/chain';

interface AelfChainProps {
  list: ChainId[];
  size?: TNetworkLogoSize;
  className?: string;
  iconClassName?: string;
}

export default function AelfChain({ list, size, className, iconClassName }: AelfChainProps) {
  const { isPadPX } = useCommonState();

  return (
    <div className={clsx('flex-row-center', styles['aelf-chain-container'], className)}>
      {list?.map((chainId, index) => {
        return (
          <div key={`AelfChain-${chainId}-${index}`}>
            <CommonTooltip
              title={AelfChainNetwork[chainId]}
              trigger={isPadPX ? '' : 'hover'}
              overlayClassName={styles['aelf-chain-tooltip']}>
              <div style={{ width: size, height: size }}>
                <NetworkLogo
                  className={clsx('flex-center', 'cursor-pointer', iconClassName)}
                  network={chainId}
                  size={size}
                />
              </div>
            </CommonTooltip>
          </div>
        );
      })}
    </div>
  );
}
