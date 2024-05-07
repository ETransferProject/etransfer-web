import React from 'react';
import clsx from 'clsx';
import LoginAndProfileEntry from 'components/Header/LoginAndProfile';
import { useCommonState } from 'store/Provider/hooks';
import { Logo } from 'assets/images';
import styles from './styles.module.scss';
import { useIsActive } from 'hooks/portkeyWallet';
import { SideMenuKey } from 'constants/home';
import { useWebLogin, WalletType } from 'aelf-web-login';
import { useRouter } from 'next/navigation';

export default function WebHeader() {
  const isActive = useIsActive();
  const { activeMenuKey } = useCommonState();
  const { walletType } = useWebLogin();
  const router = useRouter();

  const handleOpenAssets = () => {
    router.push('/assets');
  };

  return (
    <div
      className={clsx(
        'flex-row-between',
        styles['header-container'],
        activeMenuKey === SideMenuKey.History && styles['wide-header'],
      )}>
      <Logo />
      <div className={styles['right-wrapper']}>
        {isActive && walletType === WalletType.portkey && (
          <span className={styles['assets-wrapper']} onClick={() => handleOpenAssets()}>
            Assets
          </span>
        )}
        <LoginAndProfileEntry />
      </div>
    </div>
  );
}
