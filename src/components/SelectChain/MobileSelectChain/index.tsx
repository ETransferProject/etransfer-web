import React, { useState } from 'react';
import clsx from 'clsx';
import CommonDrawer from 'components/CommonDrawer';
import DownSmallIcon from 'assets/images/downSmall.svg';
import { DeviceSelectChainProps } from '../types';
import styles from './styles.module.scss';

export default function MobileSelectChain({
  title,
  className,
  childrenClassName,
  menuItems,
  selectedItem,
  isBorder,
  onClick,
}: DeviceSelectChainProps & { title: string }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  return (
    <>
      <div
        className={clsx(
          'flex-row-center',
          styles['trigger-container'],
          isBorder && styles['trigger-container-border'],
          className,
        )}
        onClick={() => setIsDrawerOpen(true)}>
        <div className={clsx(styles['trigger-text'], childrenClassName)}>{selectedItem?.label}</div>
        <DownSmallIcon className={clsx('flex-none', styles['children-icon'])} />
      </div>
      <CommonDrawer title={title} open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
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
