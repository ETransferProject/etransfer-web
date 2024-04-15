import React, { useState } from 'react';
import clsx from 'clsx';
import { UserProfile, ArrowUp, ArrowRight } from 'assets/images';
import CommonDrawer from 'components/CommonDrawer';
import LogoutButton from 'pageComponents/LogoutButton';
import Address from '../Address';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';

export default function SelectWallet() {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isShowAddress, setIsShowAddress] = useState<boolean>(false);
  const { isMobilePX } = useCommonState();

  const handleChangeAddress = () => {
    setIsShowAddress(!isShowAddress);
  };

  // TODO: link to assets
  const handleAssets = () => {
    console.log('handleAssets');
  };

  return (
    <>
      <div
        className={clsx(
          'flex-none',
          'flex-center',
          styles['wallet-container'],
          isMobilePX && styles['wallet-mobile'],
        )}
        onClick={() => {
          setIsDrawerOpen(true);
        }}>
        <UserProfile className={'flex-none'} />
      </div>
      <CommonDrawer
        className={clsx(styles['drawer'], styles['drawer-weight'])}
        title={
          <div className={styles['drawer-my-wrapper']}>
            <span className={styles['drawer-title-my']}>My</span>
          </div>
        }
        height="100%"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}>
        <div className={styles['user-wrapper']}>
          <div className={styles['top-wrapper']}>
            <div className={styles['assets-wrapper']} onClick={() => handleAssets()}>
              <span className={styles['assets']}>Assets</span>
              <ArrowRight />
            </div>
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
