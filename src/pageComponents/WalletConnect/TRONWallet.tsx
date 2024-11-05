import { Button } from 'antd';
import { useCallback } from 'react';
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';

const TRON_COBO_ADDRESS = 'TQjkrizqkRAGBUC1rGWsrSHi13d8KKoh1E';

const USDT_CONTRACT_ADDRESS_TRC20 = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // 'TXYZ9Kxg8AFhA4TvnYFZgDmdxyTtbpaK8Y'; // USDT contractAddress (TRC20)

export default function TRONWallet() {
  const { address, wallet, connected, select, disconnect } = useWallet();

  const onDisConnectTRON = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const onCreateRawTransaction = useCallback(async () => {
    // const transaction = {
    //   to: TRON_COBO_ADDRESS,
    //   amount: 0.001,
    //   visible: true,
    //   txID: '',
    //   raw_data: '',
    //   raw_data_hex: '',
    // };
    // await signTransaction(transaction);
  }, []);

  const onSendTransaction = useCallback(async () => {
    try {
      if (window.tronLink) {
        const tronWeb = window.tronLink.tronWeb;
        const amount = 0.1; // unit is SUN，1 TRX = 1,000,000 SUN
        const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS_TRC20);
        const tx = await contract.transfer(TRON_COBO_ADDRESS, tronWeb.toSun(amount)).send();
        // send({ feeLimit: 10000000 })

        // const tx = await tronWeb.trx.sendTransaction(TRON_COBO_ADDRESS, amount);

        console.log('>>>>>> TRON tx', tx);
      }
    } catch (error) {
      console.log('>>>>>> TRON error', error);
    }
  }, []);

  return (
    <div>
      {connected ? (
        <>
          <p>Current Address: {address}</p>
          <p>Connection Status: {wallet?.state}</p>

          <Button onClick={onDisConnectTRON}>DisConnect TRON</Button>
          <Button onClick={onCreateRawTransaction}>Raw Transaction</Button>
          <Button onClick={onSendTransaction}>Send Transaction</Button>
        </>
      ) : (
        <>
          <Button onClick={() => select('TronLink')}>Select Wallet</Button>
        </>
      )}
    </div>
  );
}
