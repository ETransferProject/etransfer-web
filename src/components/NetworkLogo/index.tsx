import { BlockchainNetworkType } from 'constants/network';
import {
  Aelf,
  Ethereum,
  Polygon,
  Arbitrum,
  Optimism,
  Solana,
  Tron,
  Binance,
  Avax,
} from 'assets/images';
import clsx from 'clsx';
import styles from './styles.module.scss';

export default function NetworkLogo({ network }: { network: string }) {
  switch (network) {
    case BlockchainNetworkType.AELF:
      return <Aelf />;
    case BlockchainNetworkType.Ethereum:
      return <Ethereum />;
    case BlockchainNetworkType.Polygon:
      return <Polygon />;
    case BlockchainNetworkType.Arbitrum:
      return <Arbitrum />;
    case BlockchainNetworkType.Optimism:
      return <Optimism />;
    case BlockchainNetworkType.Solana:
      return <Solana />;
    case BlockchainNetworkType.Tron:
      return <Tron />;
    case BlockchainNetworkType.Binance:
      return <Binance />;
    case BlockchainNetworkType.Avax:
      return <Avax />;
    default:
      // when not match network's type, display first character and uppercase
      return <div className={clsx(styles['network'])}>{network?.charAt(0).toUpperCase()}</div>;
  }
}
