'use client';

import { http, createConfig, WagmiProvider } from 'wagmi';
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
import { metaMask, coinbaseWallet, walletConnect } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BRAND_NAME } from 'constants/index';
import { ETRANSFER_LOGO } from 'constants/misc';
import { EVM_MAINNET_RPC } from 'constants/wallet/EVM';

export const queryClient = new QueryClient();

const WalletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';

export const EVMProviderConfig = createConfig({
  chains: [mainnet, bsc, base, polygon, avalanche, arbitrum, optimism, sepolia, bscTestnet],
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: BRAND_NAME,
      appLogoUrl: ETRANSFER_LOGO,
      reloadOnDisconnect: false,
    }),
    walletConnect({ projectId: WalletConnectProjectId }),
  ],
  transports: {
    [mainnet.id]: http(EVM_MAINNET_RPC),
    [bsc.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
    [avalanche.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [sepolia.id]: http(),
    [bscTestnet.id]: http(),
  },
});

export default function EVMProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={EVMProviderConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
