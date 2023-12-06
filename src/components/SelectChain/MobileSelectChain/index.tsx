import React, { useState } from 'react';
import clsx from 'clsx';
import CommonDrawer from 'components/CommonDrawer';
import SmallDownIcon from 'assets/images/smallDown.svg';
import { CommonSelectChainProps } from '../types';
import styles from './styles.module.scss';

export default function MobileSelectChain({
  menuItems,
  selectedItem,
  onClick,
}: CommonSelectChainProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  return (
    <>
      <div
        className={clsx('flex-row-center', styles['trigger-container'])}
        onClick={() => setIsDrawerOpen(true)}>
        <div className={styles['trigger-text']}>{selectedItem?.label}</div>
        <SmallDownIcon className={clsx('flex-none', styles['children-icon'])} />
      </div>
      <CommonDrawer title="Deposit to" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <div className={clsx('flex-column', styles['drawer-content'])}>
          {menuItems?.map((item) => (
            <div
              key={item.key}
              className={clsx(styles['drawer-item'], {
                [styles['drawer-item-selected']]: item.key === selectedItem?.key,
              })}
              onClick={() => {
                onClick?.(item);
                setIsDrawerOpen(false);
              }}>
              {item.label}
            </div>
          ))}
        </div>
      </CommonDrawer>
    </>
  );
}
