import { Button } from 'antd';
import { useCallback } from 'react';
import useEVM from 'hooks/wallet/useEVM';
import {
  EVM_TO_ADDRESS,
  EVM_TOKEN_ABI,
  EVM_USDT_CONTRACT_ADDRESS_SEPOLIA,
} from 'constants/wallet/EVM';

export default function EVMWallet() {
  const {
    account,
    isConnected,
    connectors,
    connect,
    disconnect,
    getAccountInfo,
    signMessage,
    sendTransaction,
  } = useEVM();

  const onConnectEVM = useCallback(
    async (index: number) => {
      await connect({ connector: connectors[index] });
    },
    [connect, connectors],
  );

  const onDisconnectEVM = useCallback(async () => {
    disconnect();
  }, [disconnect]);

  const onSignMessage = useCallback(async () => {
    try {
      const res = await signMessage();
      console.log('>>>>>> EVM onSignMessage res', res);
    } catch (error) {
      console.log('>>>>>> EVM onSignMessage error', error);
    }
  }, [signMessage]);

  const onSendTransaction = useCallback(async () => {
    try {
      const data = await sendTransaction({
        network: 'SETH',
        tokenContractAddress: EVM_USDT_CONTRACT_ADDRESS_SEPOLIA,
        toAddress: EVM_TO_ADDRESS,
        tokenAbi: EVM_TOKEN_ABI,
        amount: '0.02',
        decimals: 6,
      });
      console.log('>>>>>> EVM Send Transaction data', data);
    } catch (error) {
      console.log('>>>>>> EVM Send Transaction error', error);
    }
  }, [sendTransaction]);

  return (
    <div>
      {!isConnected ? (
        <>
          <Button onClick={() => onConnectEVM(0)}>MetaMask</Button>
          <Button onClick={() => onConnectEVM(1)}>Coinbase Wallet</Button>
          <Button onClick={() => onConnectEVM(2)}>WalletConnect</Button>
        </>
      ) : (
        <>
          <p>Current Address: {account}</p>
          <p>Connection Status: {getAccountInfo()?.status}</p>
          <Button onClick={onDisconnectEVM}>DisConnect</Button>
        </>
      )}
      <Button onClick={onSignMessage}>Sign Message</Button>
      <Button onClick={onSendTransaction}>Send Transaction</Button>
    </div>
  );
}
