import { Button } from 'antd';
import { useCallback } from 'react';
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';

export default function TRONWallet() {
  const { address, wallet, connected, select, disconnect } = useWallet();

  const onDisConnectTRON = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return (
    <div>
      {connected ? (
        <>
          <p>Current Address: {address}</p>
          <p>Connection Status: {wallet?.state}</p>

          <Button onClick={onDisConnectTRON}>DisConnect TRON</Button>
        </>
      ) : (
        <>
          <Button onClick={() => select('TronLink')}>Select Wallet</Button>
        </>
      )}
    </div>
  );
}
