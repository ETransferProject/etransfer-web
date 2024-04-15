import React from 'react';
import clsx from 'clsx';
import CommonDropdown from 'components/CommonDropdown';
import LogoutButton from 'pageComponents/LogoutButton';
import { UserProfile } from 'assets/images';
import Address from '../Address';
import styles from './styles.module.scss';

export default function SelectWallet() {
  return (
    <CommonDropdown
      menu={{ items: [] }}
      dropdownRender={() => (
        <div className={styles['dropdown']}>
          <Address hideBorder={false} />
          <div className={styles['button-wrapper']}>
            <LogoutButton />
          </div>
        </div>
      )}
      hideDownArrow={true}>
      <UserProfile className={clsx('flex-none', styles['wallet-icon'])} />
      <span className={styles['wallet-text']}>My</span>
    </CommonDropdown>
  );
}
