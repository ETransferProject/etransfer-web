import { TonConnectButton } from '@tonconnect/ui-react';
import { Button } from 'antd';
import { useCallback } from 'react';
import useTON from 'hooks/wallet/useTON';
import { TON_TO_ADDRESS, TON_USDT_CONTRACT_ADDRESS } from 'constants/wallet/TON';

export default function TONWallet() {
  const { connect, disconnect, getBalance, sendTransaction } = useTON();

  const onConnectTON = useCallback(async () => {
    connect('tonkeeper');
  }, [connect]);

  const onDisConnectTON = useCallback(async () => {
    disconnect();
  }, [disconnect]);

  const onGetBalance = useCallback(async () => {
    try {
      const res = await getBalance({ tokenContractAddress: TON_USDT_CONTRACT_ADDRESS });
      console.log('>>>>>> TON getBalance res', res);
    } catch (error) {
      console.log('>>>>>> TON getBalance error', error);
    }
  }, [getBalance]);

  const onSendTransaction = useCallback(async () => {
    try {
      const res = await sendTransaction({
        tokenContractAddress: TON_USDT_CONTRACT_ADDRESS,
        toAddress: TON_TO_ADDRESS,
        decimals: 6,
        orderId: '',
        amount: 0.01,
      });
      console.log('>>>>>> TON sendTransaction res', res);
    } catch (error) {
      console.log('>>>>>> TON sendTransaction error', error);
    }
  }, [sendTransaction]);

  return (
    <div>
      <Button onClick={onConnectTON}>Connect</Button>
      <TonConnectButton />
      <Button onClick={onDisConnectTON}>DisConnect</Button>
      <Button onClick={onGetBalance}>Get Balance</Button>
      <Button onClick={onSendTransaction}>Send Transaction</Button>
    </div>
  );
}
