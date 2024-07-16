import React, { useCallback } from 'react';
import clsx from 'clsx';
import LoginAndProfileEntry from 'components/Header/LoginAndProfile';
import { Logo } from 'assets/images';
import styles from './styles.module.scss';
import { useRouter } from 'next/navigation';
import { ETRANSFER_WEBSITE_URL } from 'constants/index';
import { useIsPortkeyLogin } from 'hooks/wallet';

export default function WebHeader() {
  const router = useRouter();
  const isPortkeyLogin = useIsPortkeyLogin();

  const handleOpenAssets = () => {
    router.push('/assets');
  };

  const goWebsite = useCallback(() => {
    window.open(ETRANSFER_WEBSITE_URL, '_self');
  }, []);

  return (
    <div className={clsx('flex-row-between', styles['header-container'])}>
      <div className={styles['header-logo']} onClick={goWebsite}>
        <Logo />
      </div>

      <div className={styles['right-wrapper']}>
        {isPortkeyLogin && (
          <span className={styles['assets-wrapper']} onClick={() => handleOpenAssets()}>
            Assets
          </span>
        )}
        <LoginAndProfileEntry />
      </div>
    </div>
  );
}
