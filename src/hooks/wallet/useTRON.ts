import { useMemo } from 'react';
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';
import { WalletTypeEnum } from 'context/Wallet/types';
export default function useTRON() {
  const walletInfo = useWallet();

  const tronContext = useMemo(() => {
    return {
      isConnected: walletInfo.connected,
      walletType: WalletTypeEnum.TRON,
      chain: walletInfo.wallet?.adapter.connected,
      account: walletInfo.address,
      accounts: [walletInfo.address],
      connector: walletInfo.wallet?.adapter,
      disconnect: walletInfo.disconnect,
      createRawTransaction: walletInfo.signTransaction,
    };
  }, [
    walletInfo.address,
    walletInfo.connected,
    walletInfo.disconnect,
    walletInfo.signTransaction,
    walletInfo.wallet?.adapter,
  ]);

  return tronContext;
}
