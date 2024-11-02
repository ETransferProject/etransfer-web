import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { WalletTypeEnum } from 'context/Wallet/types';
import { useMemo } from 'react';

export default function useTON() {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const address = useMemo(() => wallet?.account.address, [wallet?.account.address]);

  const tonContext = useMemo(() => {
    return {
      isConnected: tonConnectUI.connected,
      walletType: WalletTypeEnum.TON,
      chain: tonConnectUI.account?.chain,
      account: address,
      accounts: [address],
      connector: tonConnectUI.connector,
      provider: wallet?.provider,
      disconnect: tonConnectUI.disconnect,
      getAccountInfo: () => tonConnectUI.account,
    };
  }, [
    address,
    tonConnectUI.account,
    tonConnectUI.connected,
    tonConnectUI.connector,
    tonConnectUI.disconnect,
    wallet?.provider,
  ]);

  return tonContext;
}
