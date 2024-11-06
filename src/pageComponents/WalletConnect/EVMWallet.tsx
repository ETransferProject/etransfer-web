import { Button } from 'antd';
import { useCallback } from 'react';
import { useAccount, useConnect, useWriteContract, useDisconnect } from 'wagmi';
import { sepolia } from 'viem/chains';
import useEVM from 'hooks/wallet/useEVM';
import { ethers } from 'ethers';
import { metaMask } from 'wagmi/connectors';

const EVM_TO_ADDRESS = '0x08915f275100dfEc26f63624EEACdD41E4040CC0';
// const USDT_CONTRACT_ADDRESS_MAINNET = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const USDT_CONTRACT_ADDRESS_SEPOLIA = '0x60eeCc4d19f65B9EaDe628F2711C543eD1cE6679';
// const ELF_CONTRACT_ADDRESS = '0x8add57b8ad6c291bc3e3fff89f767fca08e0e7ab';
const USDT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [], // { internalType: 'bool', name: '', type: 'bool' }
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export default function EVMWallet() {
  const { connect, connectAsync, connectors } = useConnect();
  const { writeContractAsync } = useWriteContract();
  const { disconnect } = useDisconnect();
  const accountInfo = useAccount();
  const { testTransitionRaw, account, isConnected } = useEVM();

  const onConnectEVM = useCallback(
    (index: number) => {
      connect({ connector: connectors[index] });
    },
    [connect, connectors],
  );

  const onDisconnectEVM = useCallback(async () => {
    disconnect();
  }, [disconnect]);

  const onSendTransition = useCallback(async () => {
    try {
      if (!account) {
        await connectAsync({ chainId: sepolia.id, connector: metaMask() });
      }
      const data = await writeContractAsync({
        chainId: sepolia.id,
        address: USDT_CONTRACT_ADDRESS_SEPOLIA,
        functionName: 'transfer',
        abi: USDT_ABI,
        args: [EVM_TO_ADDRESS, ethers.parseUnits('0.002', 6)],
      });
      console.log('>>>>>> EVM Send Transaction data', data);
    } catch (error) {
      console.log('>>>>>> EVM error', error);
    }
  }, [account, connectAsync, writeContractAsync]);

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
          <p>Connection Status: {accountInfo.status}</p>
          <Button onClick={onDisconnectEVM}>DisConnect EVM</Button>
          <Button onClick={testTransitionRaw}>transaction raw</Button>
        </>
      )}
      <Button onClick={onSendTransition}>Send Transaction</Button>
    </div>
  );
}
