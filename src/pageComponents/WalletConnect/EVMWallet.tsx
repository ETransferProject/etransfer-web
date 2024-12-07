import { Button } from 'antd';
import { useCallback } from 'react';
import useEVM from 'hooks/wallet/useEVM';
import {
  EVM_CREATE_TOKEN_ABI,
  EVM_CREATE_TOKEN_CONTRACT_ADDRESS,
  EVM_TOKEN_ABI,
} from 'constants/wallet/EVM';
import { BlockchainNetworkType } from 'constants/network';

const EVM_TO_ADDRESS = '0x08915f275100dfEc26f63624EEACdD41E4040CC0';
const EVM_USDT_CONTRACT_ADDRESS_SEPOLIA = '0x60eeCc4d19f65B9EaDe628F2711C543eD1cE6679';

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
    getBalance,
    createToken,
  } = useEVM();

  const onConnectEVM = useCallback(
    async (index: number) => {
      await connect({ connector: connectors[index] });
    },
    [connect, connectors],
  );

  const onGetBalance = useCallback(() => {
    getBalance({ tokenContractAddress: EVM_USDT_CONTRACT_ADDRESS_SEPOLIA, network: 'SETH' });
  }, [getBalance]);

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

  const onCreateToken = useCallback(async () => {
    try {
      const data = await createToken({
        network: BlockchainNetworkType.SETH,
        contractAddress: EVM_CREATE_TOKEN_CONTRACT_ADDRESS[BlockchainNetworkType.SETH],
        contractAbi: EVM_CREATE_TOKEN_ABI,
        name: 'Tether USD AU',
        symbol: 'USDT AU',
        initialSupply: 600,
      });
      console.log('>>>>>> EVM onCreateToken data', data);
      // test data txHash => 0x909b859dc9198f95364f662b2637e4f66d7c4569a2402b427f66c211df2f41c9
    } catch (error) {
      console.log('>>>>>> EVM onCreateToken error', error);
    }
  }, [createToken]);

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
      <Button onClick={onGetBalance}>get balance</Button>
      <Button onClick={onSignMessage}>Sign Message</Button>
      <Button onClick={onSendTransaction}>Send Transaction</Button>
      <Button onClick={onCreateToken}>Create Token</Button>
    </div>
  );
}
