import React from 'react';
import CommonDropdown from 'components/CommonDropdown';
import { DeviceSelectChainProps } from '../types';
import styles from './styles.module.scss';
import clsx from 'clsx';

export default function WebSelectChain({
  className,
  childrenClassName,
  overlayClassName,
  menuItems,
  selectedItem,
  isBorder,
  suffixArrowSize,
  hideDownArrow,
  onClick,
  getContainer,
}: DeviceSelectChainProps) {
  return (
    <CommonDropdown
      getContainer={getContainer}
      className={className}
      childrenClassName={childrenClassName}
      overlayClassName={clsx(styles['chain-dropdown'], overlayClassName)}
      isBorder={isBorder}
      menu={{
        items: menuItems,
        selectedKeys: [selectedItem?.key],
      }}
      handleMenuClick={(item) => {
        onClick?.(menuItems.find((chain) => chain?.key === item?.key) || menuItems[0]);
      }}
      suffixArrowSize={suffixArrowSize}
      hideDownArrow={hideDownArrow}>
      <div className={styles['trigger-text']}>{selectedItem?.label}</div>
    </CommonDropdown>
  );
}
