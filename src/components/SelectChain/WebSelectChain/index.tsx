import React from 'react';
import CommonDropdown from 'components/CommonDropdown';
import { CommonSelectChainProps } from '../types';
import styles from './styles.module.scss';

export default function WebSelectChain({
  menuItems,
  selectedItem,
  onClick,
}: CommonSelectChainProps) {
  return (
    <CommonDropdown
      overlayClassName={styles['chain-dropdown']}
      menu={{
        items: menuItems,
        selectedKeys: [selectedItem?.key],
      }}
      handleMenuClick={(item) => {
        onClick?.(menuItems.find((chain) => chain?.key === item?.key) || menuItems[0]);
      }}>
      <div className={styles['trigger-text']}>{selectedItem?.label}</div>
    </CommonDropdown>
  );
}
