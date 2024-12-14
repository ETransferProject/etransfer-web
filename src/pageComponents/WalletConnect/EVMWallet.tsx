import { Button, Input } from 'antd';
import { useCallback, useState } from 'react';
import useEVM from 'hooks/wallet/useEVM';
import { CONNECT_EVM_LIST_CONFIG, EVM_CREATE_TOKEN_CONTRACT_ADDRESS } from 'constants/wallet/EVM';
import { BlockchainNetworkType } from 'constants/network';
import CommonSpace from 'components/CommonSpace';

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
    getTransactionReceipt,
  } = useEVM();

  const onConnectEVM = useCallback(
    async (id: string) => {
      const connector = connectors.find((item) => item.id === id);
      if (!connector) return;

      await connect({ connector: connector });
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
        amount: '0.02',
        decimals: 6,
      });
      console.log('>>>>>> EVM Send Transaction data', data);
    } catch (error) {
      console.log('>>>>>> EVM Send Transaction error', error);
    }
  }, [sendTransaction]);

  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [initialSupply, setInitialSupply] = useState('');
  const onCreateToken = useCallback(async () => {
    try {
      const data = await createToken({
        network: BlockchainNetworkType.SETH,
        contractAddress: EVM_CREATE_TOKEN_CONTRACT_ADDRESS[BlockchainNetworkType.SETH],
        name: tokenName,
        symbol: tokenSymbol,
        initialSupply: Number(initialSupply),
      });
      console.log('>>>>>> EVM onCreateToken data', data);
      // test data txHash => 0x909b859dc9198f95364f662b2637e4f66d7c4569a2402b427f66c211df2f41c9
    } catch (error) {
      console.log('>>>>>> EVM onCreateToken error', error);
    }
  }, [createToken]);

  const onGetTransactionResult = useCallback(async () => {
    try {
      const data = await getTransactionReceipt({
        txHash: '0x909b859dc9198f95364f662b2637e4f66d7c4569a2402b427f66c211df2f41c9',
      });
      // isSuccess: data.status === 'success'
      console.log('>>>>>> EVM onGetTransactionResult data', data);
    } catch (error) {
      console.log('>>>>>> EVM onGetTransactionResult error', error);
    }
  }, [getTransactionReceipt]);

  return (
    <div>
      {!isConnected ? (
        CONNECT_EVM_LIST_CONFIG.list?.map((item) => {
          return (
            <Button key={'EVM_WALLET_' + item.key} onClick={() => onConnectEVM(item.key)}>
              {item.name}
            </Button>
          );
        })
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
      <Button onClick={onGetTransactionResult}>Get Transaction Result</Button>
      <hr style={{ marginTop: 20, marginBottom: 20 }} />
      <Input
        placeholder={'Enter token name'}
        value={tokenName}
        onChange={(e) => setTokenName(e.target.value)}
      />
      <CommonSpace direction="vertical" size={8} />
      <Input
        placeholder={'Enter token symbol'}
        value={tokenSymbol}
        onChange={(e) => setTokenSymbol(e.target.value)}
      />
      <CommonSpace direction="vertical" size={8} />
      <Input
        placeholder={'Enter initial supply'}
        value={initialSupply}
        onChange={(e) => setInitialSupply(e.target.value)}
      />
      <CommonSpace direction="vertical" size={8} />
      <Button onClick={onCreateToken} disabled={!tokenName && !tokenSymbol && !initialSupply}>
        Create Token
      </Button>
      <hr style={{ marginTop: 20, marginBottom: 20 }} />
    </div>
  );
}
