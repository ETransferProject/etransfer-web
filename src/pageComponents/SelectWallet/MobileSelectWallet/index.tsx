import React, { useState } from 'react';
import clsx from 'clsx';
import { SmallWallet, LargeWallet } from 'assets/images';
import CommonDrawer from 'components/CommonDrawer';
import Address from '../Address';
import styles from './styles.module.scss';

export default function SelectWallet() {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  return (
    <>
      <div
        className={clsx('flex-none', 'flex-center', styles['wallet-container'])}
        onClick={() => {
          setIsDrawerOpen(true);
        }}>
        <SmallWallet className={'flex-none'} />
      </div>
      <CommonDrawer
        className={clsx(styles['drawer'], styles['drawer-weight'])}
        title={
          <div className={clsx('flex-center', styles['drawer-title-wrapper'])}>
            <LargeWallet />
            <span>Portkey Wallet</span>
          </div>
        }
        height="100%"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}>
        <Address />
      </CommonDrawer>
    </>
  );
}
