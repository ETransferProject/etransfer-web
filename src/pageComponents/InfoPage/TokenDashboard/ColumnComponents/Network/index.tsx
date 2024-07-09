import NetworkLogo, { TNetworkLogoSize } from 'components/NetworkLogo';
import styles from './styles.module.scss';
import clsx from 'clsx';

interface NetworkProps {
  network: string;
  name?: string;
  size?: TNetworkLogoSize;
}
export default function Network({ network, name, size }: NetworkProps) {
  return (
    <div className={clsx('flex-row-center', styles['network-container'])}>
      <NetworkLogo network={network} size={size} />
      <div className={styles['network-name']}>{name || network}</div>
    </div>
  );
}
