import { Button } from 'antd';
import { useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

import useEVM from 'hooks/wallet/useEVM';

export default function EVMWallet() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const accountInfo = useAccount();
  const { testTransitionRaw, account, isConnected } = useEVM();

  const onConnectEVM = useCallback(
    (index: number) => {
      connect({ connector: connectors[index] });
    },
    [connect, connectors],
  );

  const onDisconnectEVM = async () => {
    disconnect();
  };

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
    </div>
  );
}
