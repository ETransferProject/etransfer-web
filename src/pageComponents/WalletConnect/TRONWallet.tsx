import { Button } from 'antd';
import { useCallback } from 'react';
import useTRON from 'hooks/wallet/useTRON';

const TRON_TO_ADDRESS = 'TWMND3GoXuJkuLBvHAjChgSGoB8yqiZDkj';
const TRON_USDT_CONTRACT_ADDRESS_TRC20 = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // 'TXYZ9Kxg8AFhA4TvnYFZgDmdxyTtbpaK8Y'; // USDT contractAddress (TRC20)

export default function TRONWallet() {
  const { account, isConnected, connect, disconnect, getBalance, signMessage, sendTransaction } =
    useTRON();

  const onDisConnectTRON = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const onGetBalance = useCallback(async () => {
    try {
      const balance = await getBalance({ tokenContractAddress: TRON_USDT_CONTRACT_ADDRESS_TRC20 });
      console.log('>>>>>> TRON balance', balance);
    } catch (error) {
      console.log('>>>>>> TRON error', error);
    }
  }, [getBalance]);

  const onSignMessage = useCallback(async () => {
    try {
      const res = await signMessage();
      console.log('>>>>>> TRON onSignMessage res', res);
    } catch (error) {
      console.log('>>>>>> TRON onSignMessage error', error);
    }
  }, [signMessage]);

  const onSendTransaction = useCallback(async () => {
    try {
      const tx = await sendTransaction({
        tokenContractAddress: TRON_USDT_CONTRACT_ADDRESS_TRC20,
        toAddress: TRON_TO_ADDRESS,
        amount: 0.1,
      });

      console.log('>>>>>> TRON tx', tx);
    } catch (error) {
      console.log('>>>>>> TRON error', error);
    }
  }, [sendTransaction]);

  return (
    <div>
      {isConnected ? (
        <>
          <p>Current Address: {account}</p>
          {/* <p>Connection Status: {wallet?.state}</p> */}

          <Button onClick={onDisConnectTRON}>DisConnect</Button>
          <Button onClick={onGetBalance}>Get Balance</Button>
          <Button onClick={onSignMessage}>Sign Message</Button>
          <Button onClick={onSendTransaction}>Send Transaction</Button>
        </>
      ) : (
        <>
          <Button onClick={connect}>Select Wallet</Button>
        </>
      )}
    </div>
  );
}
