import NetworkLogo, { TNetworkLogoSize } from 'components/NetworkLogo';
import styles from './styles.module.scss';

interface NetworkTotalVolumeProps {
  network: string;
  name: string;
  amount: string;
  symbol: string;
  size?: TNetworkLogoSize;
}
export default function NetworkTotalVolume({
  network,
  name,
  amount,
  symbol,
  size,
}: NetworkTotalVolumeProps) {
  return (
    <div className={styles['network-total-volume']}>
      <div className="flex-row-center">
        <NetworkLogo network={network} size={size} />
        <div className={styles['network-name']}>{name}</div>
      </div>
      <div className={styles['network-amount']}>{`${amount} ${symbol}`}</div>
    </div>
  );
}
