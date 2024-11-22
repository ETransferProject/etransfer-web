import { BlockchainNetworkType } from 'constants/network';
import {
  arbitrum,
  avalanche,
  base,
  bsc,
  bscTestnet,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

export const getEVMChainInfo = (network: string) => {
  switch (network) {
    case BlockchainNetworkType.Arbitrum:
      return arbitrum;

    case BlockchainNetworkType.Avax:
      return avalanche;
    case BlockchainNetworkType.BASE:
      return base;
    case BlockchainNetworkType.Binance:
      return bsc;
    case BlockchainNetworkType.Ethereum:
      return mainnet;
    case BlockchainNetworkType.Optimism:
      return optimism;
    case BlockchainNetworkType.Polygon:
      return polygon;
    case BlockchainNetworkType.SETH:
      return sepolia;
    case BlockchainNetworkType.TBinance:
      return bscTestnet;

    default:
      return undefined;
  }
};
