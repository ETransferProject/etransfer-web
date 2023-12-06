import React, { useCallback } from 'react';
import { useCommonState } from 'store/Provider/hooks';
import { usePortkeyWalletState } from 'store/Provider/hooks';
import ConnectWalletButton from 'pageComponents/ConnectWalletButton';
import MobileSelectWallet from './MobileSelectWallet';
import WebSelectWallet from './WebSelectWallet';
import { CommonButtonSize } from 'components/CommonButton';
import styles from './styles.module.scss';
import { usePortkeyProvider } from 'hooks/usePortkeyProvider';

export default function SelectWallet() {
  const { isActive } = usePortkeyWalletState();
  const { isMobilePX } = useCommonState();
  const { activate } = usePortkeyProvider();
  const connectWallet = useCallback(async () => {
    await activate();
  }, [activate]);

  if (!isActive) {
    return (
      <ConnectWalletButton
        className={styles['connect-wallet-button']}
        size={CommonButtonSize.Small}
        onClick={connectWallet}
      />
    );
  }
  return isMobilePX ? <MobileSelectWallet /> : <WebSelectWallet />;
}
