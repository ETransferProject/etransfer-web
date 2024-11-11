import { WalletTypeEnum } from 'context/Wallet/types';
import { useCallback, useMemo, useState } from 'react';
import { getAuthPlainTextOrigin } from 'utils/auth';
import { ethers } from 'ethers';
import { sepolia } from 'viem/chains';
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useSignMessage,
  useWriteContract,
} from 'wagmi';
import { EVM_USDT_CONTRACT_ADDRESS_SEPOLIA, EVM_WALLET_ALLOWANCE } from 'constants/wallet/EVM';
import { Abi } from 'viem';

export default function useEVM() {
  const { connectAsync, connectors } = useConnect();
  const { writeContractAsync } = useWriteContract();
  const { disconnect } = useDisconnect();
  const accountInfo = useAccount();
  const { data, isSuccess } = useBalance({
    address: accountInfo.address,
    token: EVM_USDT_CONTRACT_ADDRESS_SEPOLIA, // token contract address
  });
  console.log('>>>>>> EVM balance result', isSuccess, data);

  const [isConnected, setIsConnected] = useState(false);
  connectors.map(async (item) => {
    const isAuth = await item.isAuthorized();
    setIsConnected(true);
    if (
      accountInfo?.connector?.id &&
      EVM_WALLET_ALLOWANCE.includes(accountInfo.connector.id) &&
      isAuth
    ) {
      setIsConnected(true);
    }
  });

  const { signMessageAsync } = useSignMessage();

  const signMessage = useCallback(async () => {
    const plainTextOrigin = getAuthPlainTextOrigin();
    const res = await signMessageAsync({
      message: plainTextOrigin,
    });
    console.log('>>>>>> EVM onSignMessage res', res);
    return res;
  }, [signMessageAsync]);

  const sendTransaction = useCallback(
    async ({
      tokenContractAddress,
      toAddress,
      tokenAbi,
      amount,
      decimals,
    }: {
      tokenContractAddress: `0x${string}`;
      toAddress: string;
      tokenAbi: Abi | unknown[];
      amount: string;
      decimals: number;
    }) => {
      // if (!accountInfo.address) {
      //   await connectAsync({ chainId: sepolia.id, connector: metaMask() });
      // }
      const data = await writeContractAsync({
        chainId: sepolia.id, // TODO
        address: tokenContractAddress,
        functionName: 'transfer',
        abi: tokenAbi,
        args: [toAddress, ethers.parseUnits(amount, decimals)],
      });
      return data;
    },
    [writeContractAsync],
  );

  const evmContext = useMemo(() => {
    return {
      isConnected:
        isConnected &&
        accountInfo.connector &&
        accountInfo?.connector?.id &&
        EVM_WALLET_ALLOWANCE.includes(accountInfo.connector.id),
      walletType: WalletTypeEnum.EVM,
      provider: accountInfo.connector?.getProvider(),
      account: accountInfo.address,
      accounts: accountInfo.addresses,
      connector: accountInfo.connector,
      connectors,
      connect: connectAsync,
      disconnect: disconnect,
      getAccountInfo: () => accountInfo,
      signMessage,
      sendTransaction,
    };
  }, [
    accountInfo,
    connectAsync,
    connectors,
    disconnect,
    isConnected,
    sendTransaction,
    signMessage,
  ]);

  return evmContext;
}
