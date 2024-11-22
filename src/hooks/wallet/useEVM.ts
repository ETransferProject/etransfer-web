import { ISignMessageResult, WalletTypeEnum } from 'context/Wallet/types';
import { useCallback, useMemo, useState } from 'react';
import { getAuthPlainText } from 'utils/auth';
import { ethers } from 'ethers';
import { useAccount, useConnect, useDisconnect, useSignMessage, useWriteContract } from 'wagmi';
import { EVM_WALLET_ALLOWANCE } from 'constants/wallet/EVM';
import { AuthTokenSource } from 'types/api';
import { SendEVMTransactionParams } from 'types/wallet';
import { stringToHex } from 'utils/format';
import { getEVMChainInfo } from 'utils/wallet/EVM';

export default function useEVM() {
  const { connectAsync, connectors } = useConnect();
  const { writeContractAsync } = useWriteContract();
  const { disconnect } = useDisconnect();
  const accountInfo = useAccount();

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

  const signMessage = useCallback<() => Promise<ISignMessageResult>>(async () => {
    const plainText = getAuthPlainText();
    const res = await signMessageAsync({
      message: plainText.plainTextOrigin,
    });
    console.log('>>>>>> EVM onSignMessage res', res);
    return {
      plainTextOrigin: plainText.plainTextOrigin,
      plainTextHex: plainText.plainTextHex,
      signature: stringToHex(res),
      publicKey: stringToHex(accountInfo.address || ''),
      sourceType: AuthTokenSource.EVM,
    };
  }, [accountInfo.address, signMessageAsync]);

  const sendTransaction = useCallback(
    async ({
      network,
      tokenContractAddress,
      toAddress,
      tokenAbi,
      amount,
      decimals,
    }: SendEVMTransactionParams) => {
      // if (!accountInfo.address) {
      //   await connectAsync({ chainId: sepolia.id, connector: metaMask() });
      // }
      const chain = getEVMChainInfo(network);
      if (!chain) return '';

      const data = await writeContractAsync({
        chainId: chain.id, // sepolia.id, // TODO
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
      provider: accountInfo.connector?.getProvider,
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
