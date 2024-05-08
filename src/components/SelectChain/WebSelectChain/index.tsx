import React from 'react';
import CommonDropdown from 'components/CommonDropdown';
import { DeviceSelectChainProps } from '../types';
import styles from './styles.module.scss';

export default function WebSelectChain({
  className,
  childrenClassName,
  menuItems,
  selectedItem,
  isBorder,
  suffix,
  hideDownArrow,
  onClick,
}: DeviceSelectChainProps) {
  return (
    <CommonDropdown
      className={className}
      childrenClassName={childrenClassName}
      overlayClassName={styles['chain-dropdown']}
      isBorder={isBorder}
      menu={{
        items: menuItems,
        selectedKeys: [selectedItem?.key],
      }}
      handleMenuClick={(item) => {
        onClick?.(menuItems.find((chain) => chain?.key === item?.key) || menuItems[0]);
      }}
      suffix={suffix}
      hideDownArrow={hideDownArrow}>
      <div className={styles['trigger-text']}>{selectedItem?.label}</div>
    </CommonDropdown>
  );
}
