import { BlockchainNetworkType } from 'constants/network';
import { getEVMChainInfo } from 'utils/wallet/EVM';
import { describe, it, expect } from 'vitest';
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

vi.mock('wagmi/chains', () => ({
  arbitrum: { chainName: 'Arbitrum', id: 1 },
  avalanche: { chainName: 'Avalanche', id: 2 },
  base: { chainName: 'Base', id: 3 },
  bsc: { chainName: 'Binance Smart Chain', id: 4 },
  mainnet: { chainName: 'Ethereum Mainnet', id: 5 },
  optimism: { chainName: 'Optimism', id: 6 },
  polygon: { chainName: 'Polygon', id: 7 },
  sepolia: { chainName: 'Sepolia Testnet', id: 8 },
  bscTestnet: { chainName: 'Binance Smart Chain Testnet', id: 9 },
}));

describe('getEVMChainInfo', () => {
  it('should return chain information for Arbitrum', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.Arbitrum);
    expect(result).toEqual(arbitrum);
  });

  it('should return chain information for Avalanche', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.Avax);
    expect(result).toEqual(avalanche);
  });

  it('should return chain information for BASE', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.BASE);
    expect(result).toEqual(base);
  });

  it('should return chain information for Binance Smart Chain', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.Binance);
    expect(result).toEqual(bsc);
  });

  it('should return chain information for Ethereum Mainnet', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.Ethereum);
    expect(result).toEqual(mainnet);
  });

  it('should return chain information for Optimism', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.Optimism);
    expect(result).toEqual(optimism);
  });

  it('should return chain information for Polygon', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.Polygon);
    expect(result).toEqual(polygon);
  });

  it('should return chain information for Sepolia Testnet (SETH)', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.SETH);
    expect(result).toEqual(sepolia);
  });

  it('should return chain information for Binance Smart Chain Testnet', () => {
    const result = getEVMChainInfo(BlockchainNetworkType.TBinance);
    expect(result).toEqual(bscTestnet);
  });

  it('should return undefined for unknown network', () => {
    const result = getEVMChainInfo('UnknownNetwork');
    expect(result).toBeUndefined();
  });

  it('should return undefined for null, undefined, or empty string', () => {
    expect(getEVMChainInfo(null as unknown as string)).toBeUndefined();
    expect(getEVMChainInfo(undefined as unknown as string)).toBeUndefined();
    expect(getEVMChainInfo('')).toBeUndefined();
  });
});
