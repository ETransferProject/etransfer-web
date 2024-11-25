import { useCallback, useEffect, useMemo } from 'react';
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';
import { IGetBalanceRequest, ISignMessageResult, WalletTypeEnum } from 'context/Wallet/types';
import { getAuthPlainText } from 'utils/auth';
import { AuthTokenSource } from 'types/api';
import { stringToHex } from 'utils/format';
import { SendTRONTransactionParams } from 'types/wallet';

export default function useTRON() {
  const {
    address,
    wallet,
    wallets,
    connected,
    connect,
    select,
    disconnect,
    signMessage,
    connecting,
  } = useWallet();

  useEffect(() => {
    const _wallet = wallets.find((item) => item.adapter.name === 'TronLink');
    if (!_wallet) return;
    select(_wallet.adapter.name);
  }, [address, select, wallets]);

  const onConnect = useCallback(async () => {
    await connect();
  }, [connect]);

  const getBalance = useCallback(
    async ({ tokenContractAddress }: IGetBalanceRequest) => {
      if (!window.tronLink || !address) return {};

      const tronWeb = window.tronLink.tronWeb;
      const contract = await tronWeb.contract().at(tokenContractAddress);

      const balanceInSun = await contract.balanceOf(address).call();
      const balanceFromSun = tronWeb.fromSun(balanceInSun);
      console.log('>>>>>> TRON balance', balanceFromSun);
      return {
        value: balanceFromSun,
        decimals: '',
      };
    },
    [address],
  );

  const getSignMessage = useCallback<() => Promise<ISignMessageResult>>(async () => {
    if (!signMessage) throw new Error('No signature method found, please reconnect your wallet');

    const plainText = getAuthPlainText();
    const res = await signMessage(plainText.plainTextOrigin);

    return {
      plainTextOrigin: plainText.plainTextOrigin,
      plainTextHex: plainText.plainTextHex,
      signature: stringToHex(res),
      publicKey: stringToHex(address || ''),
      sourceType: AuthTokenSource.TRON,
    };
  }, [address, signMessage]);

  const sendTransaction = useCallback(
    async ({ tokenContractAddress, toAddress, amount }: SendTRONTransactionParams) => {
      if (typeof window == undefined || !window.tronLink) return '';

      const tronWeb = window.tronLink.tronWeb;
      const contract = await tronWeb.contract().at(tokenContractAddress);
      const tx = await contract.transfer(toAddress, tronWeb.toSun(amount)).send();
      // send({ feeLimit: 10000000 })

      // const tx = await tronWeb.trx.sendTransaction(TRON_TO_ADDRESS, amount);
      return tx;
    },
    [],
  );

  const tronContext = useMemo(() => {
    return {
      isConnecting: connecting,
      isConnected: connected,
      walletType: WalletTypeEnum.TRON,
      account: address,
      accounts: [address],
      connector: wallet?.adapter,
      connect: onConnect,
      disconnect: disconnect,
      getBalance,
      signMessage: getSignMessage,
      sendTransaction,
    };
  }, [
    address,
    connected,
    connecting,
    disconnect,
    getBalance,
    getSignMessage,
    onConnect,
    sendTransaction,
    wallet?.adapter,
  ]);

  return tronContext;
}
