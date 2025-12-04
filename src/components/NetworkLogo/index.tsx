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
  AelfBig,
  EthereumBig,
  ArbitrumBig,
  AvaxBig,
  BinanceBig,
  OptimismBig,
  PolygonBig,
  SolanaBig,
  TronBig,
  tDVV as TDVV,
  tDVVMedium as TDVVMedium,
  tDVVBig as TDVVBig,
  TonMedium,
  Ton,
  TonBig,
  BaseMedium,
  Base,
  BaseBig,
} from 'assets/images';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { useMemo } from 'react';

export type TNetworkLogoSize = 'normal' | 'small' | 'big';

const NetworkLogoMap: Record<string, Record<TNetworkLogoSize, any>> = {
  [BlockchainNetworkType.AELF]: {
    big: <AelfBig />,
    normal: <AelfMedium />,
    small: <Aelf />,
  },
  [BlockchainNetworkType.tDVV]: {
    big: <TDVVBig />,
    normal: <TDVVMedium />,
    small: <TDVV />,
  },
  [BlockchainNetworkType.tDVW]: {
    big: <TDVVBig />,
    normal: <TDVVMedium />,
    small: <TDVV />,
  },
  [BlockchainNetworkType.Arbitrum]: {
    big: <ArbitrumBig />,
    normal: <ArbitrumMedium />,
    small: <Arbitrum />,
  },
  [BlockchainNetworkType.Avax]: {
    big: <AvaxBig />,
    normal: <AvaxMedium />,
    small: <Avax />,
  },
  [BlockchainNetworkType.Binance]: {
    big: <BinanceBig />,
    normal: <BinanceMedium />,
    small: <Binance />,
  },
  [BlockchainNetworkType.Ethereum]: {
    big: <EthereumBig />,
    normal: <EthereumMedium />,
    small: <Ethereum />,
  },
  [BlockchainNetworkType.Optimism]: {
    big: <OptimismBig />,
    normal: <OptimismMedium />,
    small: <Optimism />,
  },
  [BlockchainNetworkType.Polygon]: {
    big: <PolygonBig />,
    normal: <PolygonMedium />,
    small: <Polygon />,
  },
  [BlockchainNetworkType.Solana]: {
    big: <SolanaBig />,
    normal: <SolanaMedium />,
    small: <Solana />,
  },
  [BlockchainNetworkType.Tron]: {
    big: <TronBig />,
    normal: <TronMedium />,
    small: <Tron />,
  },
  [BlockchainNetworkType.TON]: {
    big: <TonBig />,
    normal: <TonMedium />,
    small: <Ton />,
  },
  [BlockchainNetworkType.BASE]: {
    big: <BaseBig />,
    normal: <BaseMedium />,
    small: <Base />,
  },
};

export default function NetworkLogo({
  id,
  network,
  className,
  size = 'big',
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
