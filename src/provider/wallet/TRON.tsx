import { WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
import { useCallback } from 'react';

export default function TRONProvider({ children }: { children: React.ReactNode }) {
  const onError = useCallback((error: Error) => {
    console.log('>>>>>> TRONProvider error', error);
  }, []);

  return (
    <WalletProvider
      onError={onError}
      adapters={[new TronLinkAdapter()]}
      // disableAutoConnectOnLoad={true}
    >
      {children}
    </WalletProvider>
  );
}
