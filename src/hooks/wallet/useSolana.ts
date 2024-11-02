import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletTypeEnum } from 'context/Wallet/types';

export default function useSolana() {
  const { connection } = useConnection();
  const { publicKey, connected, disconnect, signTransaction, wallet } = useWallet();

  const solanaContext = useMemo(() => {
    return {
      isConnected: connected,
      walletType: WalletTypeEnum.SOL,
      account: publicKey?.toString(),
      accounts: [publicKey?.toString()],
      connector: wallet?.adapter,
      disconnect: disconnect,
      getAccountInfo: connection.getAccountInfo,
      getBalance: connection.getBalance,
      createRawTransaction: signTransaction,
    };
  }, [
    connected,
    connection.getAccountInfo,
    connection.getBalance,
    disconnect,
    publicKey,
    signTransaction,
    wallet?.adapter,
  ]);

  return solanaContext;
}
