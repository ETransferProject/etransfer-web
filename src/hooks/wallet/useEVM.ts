import { IGetEVMBalanceRequest, ISignMessageResult, WalletTypeEnum } from 'context/Wallet/types';
import { useCallback, useMemo, useState } from 'react';
import { getAuthPlainText } from 'utils/auth';
import { ethers } from 'ethers';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
  useSwitchChain,
  useWriteContract,
} from 'wagmi';
import { getBalance } from '@wagmi/core';
import { EVM_WALLET_ALLOWANCE } from 'constants/wallet/EVM';
import { AuthTokenSource } from 'types/api';
import { SendEVMTransactionParams } from 'types/wallet';
import { stringToHex } from 'utils/format';
import { getEVMChainInfo } from 'utils/wallet/EVM';
import { EVMProviderConfig } from 'provider/wallet/EVM';
import { SingleMessage } from '@etransfer/ui-react';
import { handleErrorMessage } from '@etransfer/utils';
import { USER_REJECT_CONNECT_WALLET_TIP } from 'constants/wallet';

export default function useEVM() {
  const { connectAsync, connectors } = useConnect();
  const { switchChainAsync } = useSwitchChain();
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

  const onGetBalance = useCallback(
    async ({ tokenContractAddress, network }: IGetEVMBalanceRequest) => {
      if (!accountInfo.address) return { value: '0' };

      const chain = getEVMChainInfo(network);
      if (!chain) return { value: '0' };
      const res = await getBalance(EVMProviderConfig, {
        address: accountInfo.address,
        chainId: chain.id,
        token: tokenContractAddress as `0x${string}`,
      });

      return { value: res.value.toString(), decimals: res.decimals };
    },
    [accountInfo.address],
  );

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
      const chain = getEVMChainInfo(network);
      if (!chain) return '';
      if (accountInfo.chainId !== chain.id && accountInfo.connector) {
        try {
          await switchChainAsync({ chainId: chain.id, connector: accountInfo.connector });
        } catch (error) {
          if (
            handleErrorMessage(error).includes('rejected') ||
            handleErrorMessage(error).includes('denied')
          )
            SingleMessage.error(handleErrorMessage(USER_REJECT_CONNECT_WALLET_TIP));
          throw error;
        }
      }
      const data = await writeContractAsync({
        chainId: chain.id,
        address: tokenContractAddress,
        functionName: 'transfer',
        abi: tokenAbi,
        args: [toAddress, ethers.parseUnits(amount, decimals)],
      });
      return data;
    },
    [accountInfo.chainId, accountInfo.connector, switchChainAsync, writeContractAsync],
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
      getBalance: onGetBalance,
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
    onGetBalance,
    sendTransaction,
    signMessage,
  ]);

  return evmContext;
}
