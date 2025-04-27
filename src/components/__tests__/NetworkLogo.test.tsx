import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NetworkLogo from '../NetworkLogo';
import { BlockchainNetworkType } from 'constants/network';

// Mock assets and styles
vi.mock('assets/images', () => ({
  Aelf: () => <div data-testid="aelf" />,
  Ethereum: () => <div data-testid="ethereum" />,
  Polygon: () => <div data-testid="polygon" />,
  Arbitrum: () => <div data-testid="arbitrum" />,
  Optimism: () => <div data-testid="optimism" />,
  Solana: () => <div data-testid="solana" />,
  Tron: () => <div data-testid="tron" />,
  Binance: () => <div data-testid="binance" />,
  Avax: () => <div data-testid="avax" />,
  AelfMedium: () => <div data-testid="aelfMedium" />,
  EthereumMedium: () => <div data-testid="ethereumMedium" />,
  ArbitrumMedium: () => <div data-testid="arbitrumMedium" />,
  AvaxMedium: () => <div data-testid="avaxMedium" />,
  BinanceMedium: () => <div data-testid="binanceMedium" />,
  OptimismMedium: () => <div data-testid="optimismMedium" />,
  PolygonMedium: () => <div data-testid="polygonMedium" />,
  SolanaMedium: () => <div data-testid="solanaMedium" />,
  TronMedium: () => <div data-testid="tronMedium" />,
  AelfBig: () => <div data-testid="aelfBig" />,
  EthereumBig: () => <div data-testid="ethereumBig" />,
  ArbitrumBig: () => <div data-testid="arbitrumBig" />,
  AvaxBig: () => <div data-testid="avaxBig" />,
  BinanceBig: () => <div data-testid="binanceBig" />,
  OptimismBig: () => <div data-testid="optimismBig" />,
  PolygonBig: () => <div data-testid="polygonBig" />,
  SolanaBig: () => <div data-testid="solanaBig" />,
  TronBig: () => <div data-testid="tronBig" />,
  tDVV: () => <div data-testid="tDVV" />,
  tDVVMedium: () => <div data-testid="tDVVMedium" />,
  tDVVBig: () => <div data-testid="tDVV" />,
  TonMedium: () => <div data-testid="tonMedium" />,
  Ton: () => <div data-testid="ton" />,
  TonBig: () => <div data-testid="tonBig" />,
  BaseMedium: () => <div data-testid="baseMedium" />,
  Base: () => <div data-testid="base" />,
  BaseBig: () => <div data-testid="baseBig" />,
}));

vi.mock('../NetworkLogo/styles.module.scss', () => ({
  default: {
    'network-big': 'network-big',
    'network-normal': 'network-normal',
    'network-small': 'network-small',
    network: 'network-default',
  },
}));

describe('NetworkLogo Component', () => {
  test('renders correct logo for known network', () => {
    render(<NetworkLogo network={BlockchainNetworkType.Ethereum} size="big" />);

    expect(screen.getByTestId('ethereumBig')).toBeInTheDocument();
  });

  test('renders first letter for unknown network', () => {
    render(<NetworkLogo network="UnknownNetwork" />);

    expect(screen.getByText('U')).toBeInTheDocument();
    expect(screen.getByText('U')).toHaveClass('network-default');
  });

  test('applies correct size classes', () => {
    const { rerender } = render(<NetworkLogo network={BlockchainNetworkType.BASE} size="small" />);
    expect(screen.getByTestId('base').parentElement).toHaveClass('network-small');

    rerender(<NetworkLogo network={BlockchainNetworkType.tDVV} size="normal" />);
    expect(screen.getByTestId('tDVVMedium').parentElement).toHaveClass('network-normal');
  });

  test('merges custom className', () => {
    render(<NetworkLogo network={BlockchainNetworkType.Arbitrum} className="custom-class" />);

    expect(screen.getByTestId('arbitrumBig').parentElement).toHaveClass('custom-class');
  });

  test('passes id prop correctly', () => {
    render(<NetworkLogo network={BlockchainNetworkType.TON} id="network-logo" />);

    expect(screen.getByTestId('tonBig').parentElement).toHaveAttribute('id', 'network-logo');
  });

  test('handles different network types', () => {
    const { rerender } = render(<NetworkLogo network={BlockchainNetworkType.tDVW} size="normal" />);
    expect(screen.getByTestId('tDVVMedium')).toBeInTheDocument();

    rerender(<NetworkLogo network={BlockchainNetworkType.Avax} />);
    expect(screen.getByTestId('avaxBig')).toBeInTheDocument();
  });
});
