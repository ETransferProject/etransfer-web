import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { Button } from 'antd';
import { useCallback } from 'react';

export default function TONWallet() {
  const [tonConnectUI] = useTonConnectUI();

  const onConnectTON = useCallback(() => {
    tonConnectUI.openSingleWalletModal('tonwallet');
  }, [tonConnectUI]);
  const onDisConnectTON = useCallback(() => {
    tonConnectUI.disconnect();
  }, [tonConnectUI]);

  return (
    <div>
      <Button onClick={onConnectTON}>Connect TON</Button>
      <TonConnectButton />
      <Button onClick={onDisConnectTON}>DisConnect TON</Button>
    </div>
  );
}
