import React from 'react';
import { useCommonState } from 'store/Provider/hooks';
import ConnectWalletButton from 'components/Header/LoginAndProfile/ConnectWalletButton';
import MobileUserProfile from './MobileUserProfile';
import WebUserProfile from './WebUserProfile';
import { CommonButtonSize } from 'components/CommonButton';
import styles from './styles.module.scss';
import { usePathname } from 'next/navigation';

export default function LoginAndProfileEntry() {
  const { isPadPX } = useCommonState();
  const pathname = usePathname();

  if (pathname === '/') {
    return (
      <ConnectWalletButton
        className={styles['connect-wallet-button']}
        size={CommonButtonSize.Small}
      />
    );
  }

  return isPadPX ? <MobileUserProfile /> : <WebUserProfile />;
}
