import React from 'react';
import { useCommonState } from 'store/Provider/hooks';
import ConnectWalletButton from 'pageComponents/ConnectWalletButton';
import MobileSelectWallet from './MobileSelectWallet';
import WebSelectWallet from './WebSelectWallet';
import { CommonButtonSize } from 'components/CommonButton';
import styles from './styles.module.scss';
import { useIsActive } from 'hooks/portkeyWallet';

export default function SelectWallet() {
  const isActive = useIsActive();
  const { isMobilePX } = useCommonState();

  if (!isActive) {
    return (
      <ConnectWalletButton
        className={styles['connect-wallet-button']}
        size={CommonButtonSize.Small}
      />
    );
  }
  return isMobilePX ? <MobileSelectWallet /> : <WebSelectWallet />;
}
