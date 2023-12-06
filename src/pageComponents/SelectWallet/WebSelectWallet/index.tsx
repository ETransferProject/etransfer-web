import React from 'react';
import clsx from 'clsx';
import CommonDropdown from 'components/CommonDropdown';
import Wallet from 'assets/images/wallet.svg';
import Address from '../Address';
import styles from './styles.module.scss';

export default function SelectWallet() {
  return (
    <CommonDropdown
      menu={{ items: [] }}
      dropdownRender={() => (
        <div className={styles['dropdown']}>
          <Address />
        </div>
      )}>
      <Wallet className={clsx('flex-none', styles['wallet-icon'])} />
      <span className={styles['wallet-text']}>Portkey Wallet</span>
    </CommonDropdown>
  );
}
