import React from 'react';
import CommonDropdown from 'components/CommonDropdown';
import { CHAIN_LIST } from 'constants/index';
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
        onClick?.(CHAIN_LIST.find((chain) => chain?.key === item?.key) || CHAIN_LIST[0]);
      }}>
      <div className={styles['trigger-text']}>{selectedItem?.label}</div>
    </CommonDropdown>
  );
}
