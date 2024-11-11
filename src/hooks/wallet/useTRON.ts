import { useCallback, useMemo } from 'react';
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';
import { WalletTypeEnum } from 'context/Wallet/types';
import { getAuthPlainTextOrigin } from 'utils/auth';

export default function useTRON() {
  const { address, wallet, connected, select, disconnect, signMessage } = useWallet();

  const getBalance = useCallback(
    async ({ tokenContractAddress }: { tokenContractAddress: string }) => {
      if (!window.tronLink || !address) return {};

      const tronWeb = window.tronLink.tronWeb;
      const contract = await tronWeb.contract().at(tokenContractAddress);

      const balanceInSun = await contract.balanceOf(address).call();
      const balanceInUSDT = tronWeb.fromSun(balanceInSun);
      console.log('>>>>>> TRON balance', balanceInUSDT);
      return {
        value: balanceInUSDT,
        decimals: 6, // TODO
      };
    },
    [address],
  );

  const getSignMessage = useCallback(async () => {
    if (!signMessage) return '';

    const plainTextOrigin = getAuthPlainTextOrigin();
    const res = await signMessage(plainTextOrigin);

    return res;
  }, [signMessage]);

  const sendTransaction = useCallback(
    async ({
      tokenContractAddress,
      toAddress,
      amount,
    }: {
      tokenContractAddress: string;
      toAddress: string;
      amount: number; // unit is SUN，1 TRX = 1,000,000 SUN
    }) => {
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
      isConnected: connected,
      walletType: WalletTypeEnum.TRON,
      account: address,
      accounts: [address],
      connector: wallet?.adapter,
      connect: select,
      disconnect: disconnect,
      getBalance,
      signMessage: getSignMessage,
      sendTransaction,
    };
  }, [
    address,
    connected,
    disconnect,
    getBalance,
    getSignMessage,
    select,
    sendTransaction,
    wallet?.adapter,
  ]);

  return tronContext;
}
