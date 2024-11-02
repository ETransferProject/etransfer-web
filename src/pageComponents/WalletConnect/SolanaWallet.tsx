import { Button } from 'antd';
import { useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
export default function SolanaWallet() {
  const { connection } = useConnection();
  const { publicKey, connected, disconnect, select } = useWallet();

  const onConnectSolana = useCallback(
    (name: any) => {
      console.log('>>>>>> Solana onConnectSolana', '');
      select(name);
      // connect();
    },
    [select],
  );

  const onDisConnectSolana = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const onGetBalance = useCallback(async () => {
    if (publicKey) {
      const balance = await connection.getBalance(publicKey);
      const account = await connection.getAccountInfo(publicKey);
      console.log('>>>>>> Solana balance', balance, account);
    }
  }, [connection, publicKey]);

  return (
    <div>
      {!connected ? (
        <>
          {/* <WalletMultiButton />
          <WalletDisconnectButton /> */}
          <Button onClick={() => onConnectSolana('Phantom')}>Connect Phantom</Button>
          <Button onClick={() => onConnectSolana('Solflare')}>Connect Solflare</Button>
        </>
      ) : (
        <>
          <p>Current Address: {publicKey?.toString()}</p>
          <Button onClick={onDisConnectSolana}>DisConnect Solana</Button>
          <Button onClick={onGetBalance}>getBalance</Button>
        </>
      )}
    </div>
  );
}
