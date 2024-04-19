import React from 'react';
import clsx from 'clsx';
import SelectWallet from 'pageComponents/SelectWallet';
import { useCommonState } from 'store/Provider/hooks';
import { Logo } from 'assets/images';
import styles from './styles.module.scss';
import { useIsActive } from 'hooks/portkeyWallet';
import { SideMenuKey } from 'constants/home';
import { useWebLogin, WalletType } from 'aelf-web-login';

export default function WebHeader() {
  const isActive = useIsActive();
  const { activeMenuKey } = useCommonState();
  const { walletType } = useWebLogin();
  // TODO: open assets
  const handleOpenAssets = () => {
    console.log('handleOpenAssets');
  };

  return (
    <div
      className={clsx(
        'flex-row-between',
        styles['header-container'],
        activeMenuKey === SideMenuKey.Records && styles['wide-header'],
      )}>
      <Logo />
      <div className={styles['right-wrapper']}>
        {isActive && walletType !== WalletType.discover && (
          <span className={styles['assets-wrapper']} onClick={() => handleOpenAssets()}>
            Assets
          </span>
        )}
        <SelectWallet />
      </div>
    </div>
  );
}
