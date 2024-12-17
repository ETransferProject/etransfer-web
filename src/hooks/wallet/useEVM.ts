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
import { getBalance, getTransactionReceipt } from '@wagmi/core';
import {
  EVM_CONTRACT_FUNCTION_NAME,
  EVM_CREATE_TOKEN_ABI,
  EVM_TOKEN_ABI,
  EVM_WALLET_ALLOWANCE,
  MOBILE_EVM_WALLET_ALLOWANCE,
  PORTKEY_EVM_WALLET_ALLOWANCE,
  TELEGRAM_EVM_WALLET_ALLOWANCE,
} from 'constants/wallet/EVM';
import { AuthTokenSource } from 'types/api';
import {
  CreateTokenOnEVMParams,
  GetTransactionOnEVM,
  SendEVMTransactionParams,
} from 'types/wallet';
import { stringToHex } from 'utils/format';
import { getEVMChainInfo } from 'utils/wallet/EVM';
import { EVMProviderConfig } from 'provider/wallet/EVM';
import { TelegramPlatform } from 'utils/telegram';
import { isPortkey } from 'utils/portkey';
import { isMobileDevices } from 'utils/isMobile';
import { SingleMessage } from '@etransfer/ui-react';
import { handleErrorMessage } from '@etransfer/utils';
import { USER_REJECT_CONNECT_WALLET_TIP } from 'constants/wallet';

export default function useEVM() {
  const { connectAsync, connectors } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { disconnectAsync } = useDisconnect();
  const accountInfo = useAccount();

  const [isConnected, setIsConnected] = useState(false);

  const evmWalletAllowance = useMemo(() => {
    if (TelegramPlatform.isTelegramPlatform()) {
      return TELEGRAM_EVM_WALLET_ALLOWANCE;
    }
    if (isPortkey()) {
      return PORTKEY_EVM_WALLET_ALLOWANCE;
    }
    if (isMobileDevices()) {
      return MOBILE_EVM_WALLET_ALLOWANCE;
    }
    return EVM_WALLET_ALLOWANCE;
  }, []);

  connectors.map(async (item) => {
    const isAuth = await item.isAuthorized();
    setIsConnected(true);
    if (
      accountInfo?.connector?.id &&
      evmWalletAllowance.includes(accountInfo.connector.id) &&
      isAuth
    ) {
      setIsConnected(true);
    }
  });

  const { signMessageAsync } = useSignMessage();

  const onGetBalance = useCallback(
    async ({ tokenContractAddress, network, tokenSymbol }: IGetEVMBalanceRequest) => {
      if (!accountInfo.address) return { value: '0' };
      const chain = getEVMChainInfo(network);
      if (!chain) return { value: '0' };
      const params: any = {
        address: accountInfo.address,
        chainId: chain.id,
      };
      if (tokenContractAddress && tokenSymbol !== 'ETH') {
        params.token = tokenContractAddress as `0x${string}`;
      }
      const res = await getBalance(EVMProviderConfig, params);
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

  const getCurrentChainInfo = useCallback(
    async (targetNetwork: string) => {
      const chain = getEVMChainInfo(targetNetwork);
      if (!chain) return;
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
      return chain;
    },
    [accountInfo.chainId, accountInfo.connector, switchChainAsync],
  );

  const sendTransaction = useCallback(
    async ({
      network,
      tokenContractAddress,
      toAddress,
      tokenAbi = EVM_TOKEN_ABI,
      amount,
      decimals,
    }: SendEVMTransactionParams) => {
      const chain = await getCurrentChainInfo(network);
      if (!chain) return '';
      const data = await writeContractAsync({
        chainId: chain.id,
        address: tokenContractAddress,
        functionName: EVM_CONTRACT_FUNCTION_NAME.transfer,
        abi: tokenAbi,
        args: [toAddress, ethers.parseUnits(amount, decimals)],
      });
      return data;
    },
    [getCurrentChainInfo, writeContractAsync],
  );

  const createToken = useCallback(
    async ({
      network,
      contractAddress,
      contractAbi = EVM_CREATE_TOKEN_ABI,
      name,
      symbol,
      initialSupply,
    }: CreateTokenOnEVMParams) => {
      const chain = await getCurrentChainInfo(network);
      if (!chain) return '';

      const data = await writeContractAsync({
        chainId: chain.id,
        address: contractAddress,
        functionName: EVM_CONTRACT_FUNCTION_NAME.createToken,
        abi: contractAbi,
        args: [name, symbol, initialSupply],
      });
      return data;
    },
    [getCurrentChainInfo, writeContractAsync],
  );

  const onCheckTransaction = useCallback(
    async ({ txHash, network }: GetTransactionOnEVM) => {
      const chain = await getCurrentChainInfo(network);
      if (!chain) return;

      const res = await getTransactionReceipt(EVMProviderConfig, {
        hash: txHash,
        chainId: chain.id,
      });
      return res;
    },
    [getCurrentChainInfo],
  );

  const evmContext = useMemo(() => {
    return {
      isConnected:
        isConnected &&
        accountInfo.connector &&
        accountInfo?.connector?.id &&
        evmWalletAllowance.includes(accountInfo.connector.id),
      walletType: WalletTypeEnum.EVM,
      provider: accountInfo.connector?.getProvider,
      account: accountInfo.address,
      accounts: accountInfo.addresses,
      connector: accountInfo.connector,
      connectors,
      getBalance: onGetBalance,
      connect: connectAsync,
      disconnect: disconnectAsync,
      getAccountInfo: () => accountInfo,
      signMessage,
      sendTransaction,
      createToken,
      getTransactionReceipt: onCheckTransaction,
      getCurrentChainInfo,
    };
  }, [
    isConnected,
    accountInfo,
    evmWalletAllowance,
    connectors,
    onGetBalance,
    connectAsync,
    disconnectAsync,
    signMessage,
    sendTransaction,
    createToken,
    onCheckTransaction,
    getCurrentChainInfo,
  ]);

  return evmContext;
}
