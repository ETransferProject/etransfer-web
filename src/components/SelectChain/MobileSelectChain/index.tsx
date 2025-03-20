import React, { useState } from 'react';
import clsx from 'clsx';
import CommonDrawer from 'components/CommonDrawer';
import DynamicArrow from 'components/DynamicArrow';
import { DeviceSelectChainProps } from '../types';
import styles from './styles.module.scss';
import NetworkLogo from 'components/NetworkLogo';
import { CHAIN_NAME_ENUM } from 'constants/index';

export default function MobileSelectChain({
  title,
  className,
  childrenClassName,
  menuItems,
  selectedItem,
  isBorder = true,
  onClick,
}: Omit<DeviceSelectChainProps, 'getContainer'> & { title: string }) {
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
        <div className={clsx(styles['trigger-text'], childrenClassName)}>
          {selectedItem?.label.includes('AELF')
            ? CHAIN_NAME_ENUM.MainChain
            : selectedItem?.label.includes('SideChain')
            ? CHAIN_NAME_ENUM.SideChain
            : selectedItem?.label}
        </div>
        <DynamicArrow isExpand={isDrawerOpen} size="Small" className={styles['children-icon']} />
      </div>
      <CommonDrawer title={title} open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <div className={clsx('flex-column', styles['drawer-content'])}>
          {menuItems?.map((item) => (
            <div
              key={item.key}
              className={clsx('flex-row-center', styles['drawer-item'], {
                [styles['drawer-item-selected']]: item.key === selectedItem?.key,
              })}
              onClick={() => {
                onClick?.(item);
                setIsDrawerOpen(false);
              }}>
              <NetworkLogo network={item.key} size="big" />
              {item.label}
            </div>
          ))}
        </div>
      </CommonDrawer>
    </>
  );
}
