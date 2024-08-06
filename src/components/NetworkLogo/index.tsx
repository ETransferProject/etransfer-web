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
  tDVV as TDVV,
  tDVVMedium as TDVVMedium,
  TonMedium,
  Ton,
} from 'assets/images';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { useMemo } from 'react';

export type TNetworkLogoSize = 'normal' | 'small';

const NetworkLogoMap: Record<string, Record<TNetworkLogoSize, any>> = {
  [BlockchainNetworkType.AELF]: {
    normal: <AelfMedium />,
    small: <Aelf />,
  },
  [BlockchainNetworkType.tDVV]: {
    normal: <TDVVMedium />,
    small: <TDVV />,
  },
  [BlockchainNetworkType.tDVW]: {
    normal: <TDVVMedium />,
    small: <TDVV />,
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
  [BlockchainNetworkType.Ton]: {
    normal: <TonMedium />,
    small: <Ton />,
  },
};

export default function NetworkLogo({
  id,
  network,
  className,
  size = 'normal',
}: {
  network: string;
  id?: string;
  className?: string;
  size?: TNetworkLogoSize;
}) {
  const renderNetworkLogo = useMemo(() => NetworkLogoMap?.[network]?.[size], [network, size]);
  return (
    <>
      {renderNetworkLogo ? (
        <div id={id} className={clsx(styles[`network-${size}`], className)}>
          {renderNetworkLogo}
        </div>
      ) : (
        // when not match network's type, display first character and uppercase
        <div id={id} className={clsx(styles['network'], styles[`network-${size}`], className)}>
          {network?.charAt(0).toUpperCase()}
        </div>
      )}
    </>
  );
}
