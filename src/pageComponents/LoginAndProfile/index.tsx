import React from 'react';
import { useCommonState } from 'store/Provider/hooks';
import ConnectWalletButton from 'pageComponents/LoginAndProfile/ConnectWalletButton';
import MobileUserProfile from './MobileUserProfile';
import WebUserProfile from './WebUserProfile';
import { CommonButtonSize } from 'components/CommonButton';
import styles from './styles.module.scss';
import { useIsActive } from 'hooks/portkeyWallet';

export default function LoginAndProfileEntry() {
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
  return isMobilePX ? <MobileUserProfile /> : <WebUserProfile />;
}
