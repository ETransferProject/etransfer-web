import { SingleMessage } from '@etransfer/ui-react';
import { WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
import {
  WalletDisconnectedError,
  WalletError,
  WalletConnectionError,
} from '@tronweb3/tronwallet-abstract-adapter';
import { useCallback } from 'react';
import { handleErrorMessage } from '@etransfer/utils';

export default function TRONProvider({ children }: { children: React.ReactNode }) {
  const onError = useCallback((error: WalletError) => {
    console.log('>>>>>> TRONProvider error', error);
    if (error instanceof WalletConnectionError) {
      SingleMessage.error(handleErrorMessage(error));
    } else if (error instanceof WalletDisconnectedError) {
      SingleMessage.error(handleErrorMessage(error));
    }
  }, []);

  return (
    <WalletProvider
      adapters={[new TronLinkAdapter()]}
      autoConnect={false}
      disableAutoConnectOnLoad={true}
      onError={onError}>
      {children}
    </WalletProvider>
  );
}
