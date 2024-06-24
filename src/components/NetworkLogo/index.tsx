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
  AelfMedium,
  EthereumMedium,
  ArbitrumMedium,
  AvaxMedium,
  BinanceMedium,
  OptimismMedium,
  PolygonMedium,
  SolanaMedium,
  TronMedium,
} from 'assets/images';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { useMemo } from 'react';

type TNetworkLogoSize = 'normal' | 'small';

const NetworkLogoMap: Record<string, Record<TNetworkLogoSize, any>> = {
  [BlockchainNetworkType.AELF]: {
    normal: <AelfMedium />,
    small: <Aelf />,
  },
  [BlockchainNetworkType.Arbitrum]: {
    normal: <ArbitrumMedium />,
    small: <Arbitrum />,
  },
  [BlockchainNetworkType.Avax]: {
    normal: <AvaxMedium />,
    small: <Avax />,
  },
  [BlockchainNetworkType.Binance]: {
    normal: <BinanceMedium />,
    small: <Binance />,
  },
  [BlockchainNetworkType.Ethereum]: {
    normal: <EthereumMedium />,
    small: <Ethereum />,
  },
  [BlockchainNetworkType.Optimism]: {
    normal: <OptimismMedium />,
    small: <Optimism />,
  },
  [BlockchainNetworkType.Polygon]: {
    normal: <PolygonMedium />,
    small: <Polygon />,
  },
  [BlockchainNetworkType.Solana]: {
    normal: <SolanaMedium />,
    small: <Solana />,
  },
  [BlockchainNetworkType.Tron]: {
    normal: <TronMedium />,
    small: <Tron />,
  },
};

export default function NetworkLogo({
  network,
  className,
  size = 'normal',
}: {
  network: string;
  className?: string;
  size?: TNetworkLogoSize;
}) {
  const renderNetworkLogo = useMemo(() => NetworkLogoMap?.[network]?.[size], [network, size]);
  return (
    <>
      {<div className={className}>{renderNetworkLogo}</div> || (
        // when not match network's type, display first character and uppercase
        <div className={clsx(styles['network'], className)}>{network?.charAt(0).toUpperCase()}</div>
      )}
    </>
  );
}
