'use client';

import { http, createConfig, WagmiProvider } from 'wagmi';
import { bscTestnet, mainnet, sepolia } from 'wagmi/chains';
import { metaMask, coinbaseWallet, walletConnect } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export const config = createConfig({
  chains: [mainnet, sepolia, bscTestnet],
  connectors: [
    metaMask(),
    coinbaseWallet(),
    walletConnect({ projectId: '3fbb6bba6f1de962d911bb5b5c9dba88' }), // TODO
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [bscTestnet.id]: http(),
  },
  ssr: true,
  // transports: {
  //   [mainnet.id]: http('https://eth-mainnet.token.im'),
  //   [sepolia.id]: http('https://sepolia.infura.io/v3/fce90b852ec6426eb706bc1a6dcd35a6'),
  //   [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545'),
  // },
});

export default function EVMProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
