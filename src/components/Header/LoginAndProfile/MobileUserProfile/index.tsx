import React, { useState } from 'react';
import clsx from 'clsx';
import { User, ArrowUp, ArrowRight } from 'assets/images';
import CommonDrawer from 'components/CommonDrawer';
import LogoutButton from 'components/Header/LoginAndProfile/LogoutButton';
import Address from '../Address';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';
import { useRouter } from 'next/navigation';
import { useIsActive } from 'hooks/portkeyWallet';
import { useWebLogin, WalletType } from 'aelf-web-login';

export default function MobileUserProfile() {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isShowAddress, setIsShowAddress] = useState<boolean>(true);
  const { isPadPX } = useCommonState();
  const router = useRouter();
  const isActive = useIsActive();
  const { walletType } = useWebLogin();

  const handleChangeAddress = () => {
    setIsShowAddress(!isShowAddress);
  };

  const handleAssets = () => {
    router.push('/assets');
    setIsDrawerOpen(false);
  };

  return (
    <>
      <div
        className={clsx(
          'flex-none',
          'flex-center',
          styles['wallet-container'],
          isPadPX && styles['wallet-mobile'],
        )}
        onClick={() => {
          setIsDrawerOpen(true);
        }}>
        <User className={'flex-none'} />
      </div>
      <CommonDrawer
        className={clsx(styles['wallet-drawer'], styles['wallet-drawer-weight'])}
        title={
          <div className={styles['drawer-my-wrapper']}>
            <span className={styles['drawer-title-my']}>My</span>
          </div>
        }
        height="100%"
        zIndex={301}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}>
        <div className={styles['user-wrapper']}>
          <div className={styles['top-wrapper']}>
            {isActive && walletType === WalletType.portkey && (
              <div className={styles['assets-wrapper']} onClick={() => handleAssets()}>
                <span className={styles['assets']}>Assets</span>
                <ArrowRight />
              </div>
            )}
            <div
              className={clsx(
                styles['address-wrapper'],
                isShowAddress && styles['address-showAddress'],
              )}
              onClick={() => handleChangeAddress()}>
              <span className={styles['address']}>My Address</span>
              {isShowAddress ? <ArrowUp /> : <ArrowRight />}
            </div>
            {isShowAddress && (
              <div className={styles['address-content']}>
                <Address hideBorder={true} />
              </div>
            )}
          </div>
          <div className={styles['button-wrapper']}>
            <LogoutButton />
          </div>
        </div>
      </CommonDrawer>
    </>
  );
}
