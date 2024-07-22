import React from 'react';
import clsx from 'clsx';
import LoginAndProfileEntry from 'components/Header/LoginAndProfile';
import { Logo } from 'assets/images';
import styles from './styles.module.scss';
import { useIsActive } from 'hooks/portkeyWallet';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { useRouter } from 'next/navigation';

export default function WebHeader() {
  const isActive = useIsActive();
  const { walletType } = useConnectWallet();
  const router = useRouter();

  const handleOpenAssets = () => {
    router.push('/assets');
  };

  return (
    <div className={clsx('flex-row-between', styles['header-container'])}>
      <Logo />
      <div className={styles['right-wrapper']}>
        {isActive && walletType === WalletTypeEnum.aa && (
          <span className={styles['assets-wrapper']} onClick={() => handleOpenAssets()}>
            Assets
          </span>
        )}
        <LoginAndProfileEntry />
      </div>
    </div>
  );
}
