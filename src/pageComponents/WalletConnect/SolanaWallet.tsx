import { Button } from 'antd';
import { useCallback } from 'react';
import useSolana from 'hooks/wallet/useSolana';
import { SOL_TO_ADDRESS, SOL_USDT_TOKEN_ADDRESS } from 'constants/wallet/Solana';

export default function SolanaWallet() {
  const { account, isConnected, connect, disconnect, getBalance, signMessage, sendTransaction } =
    useSolana();

  const onConnectSolana = useCallback(
    (name: any) => {
      console.log('>>>>>> Solana onConnectSolana', '');
      connect(name);
    },
    [connect],
  );

  const onDisConnectSolana = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const onGetBalance = useCallback(async () => {
    try {
      if (account) {
        const balance = await getBalance({ tokenContractAddress: SOL_USDT_TOKEN_ADDRESS });
        console.log('>>>>>> Solana balance', balance);
      }
    } catch (error) {
      console.log('>>>>>> SOL onGetBalance error', error);
    }
  }, [account, getBalance]);

  const onSignMessage = useCallback(async () => {
    try {
      const res = await signMessage();
      console.log('>>>>>> SOL onSignMessage res', res);
    } catch (error) {
      console.log('>>>>>> SOL onSignMessage error', error);
    }
  }, [signMessage]);

  const onSendTransaction = useCallback(async () => {
    try {
      const data = await sendTransaction({
        tokenContractAddress: SOL_USDT_TOKEN_ADDRESS,
        toAddress: SOL_TO_ADDRESS,
        amount: '0.03',
        decimals: 6,
      });
      console.log('>>>>>> SOL SendTransaction res', data);
    } catch (error) {
      console.log('>>>>>> SOL SendTransaction error', error);
    }
  }, [sendTransaction]);

  return (
    <div>
      {!isConnected ? (
        <>
          {/* <WalletMultiButton />
          <WalletDisconnectButton /> */}
          <Button onClick={() => onConnectSolana('Phantom')}>Connect Phantom</Button>
          <Button onClick={() => onConnectSolana('Solflare')}>Connect Solflare</Button>
        </>
      ) : (
        <>
          <p>Current Address: {account}</p>
          <Button onClick={onDisConnectSolana}>DisConnect</Button>
          <Button onClick={onGetBalance}>Get Balance</Button>
          <Button onClick={onSignMessage}>Sign Message</Button>
          <Button onClick={onSendTransaction}>Send Transaction</Button>
        </>
      )}
    </div>
  );
}
