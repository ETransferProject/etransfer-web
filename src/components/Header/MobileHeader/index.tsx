import React from 'react';
import clsx from 'clsx';
import { useCommonState } from 'store/Provider/hooks';
import SelectMenu from 'components/Header/SelectMenu';
import SelectWallet from 'pageComponents/SelectWallet';
import styles from './styles.module.scss';
import { SideMenuKey } from 'constants/home';
import { useIsActive } from 'hooks/portkeyWallet';

export default function MobileHeader() {
  const { activeMenuKey } = useCommonState();
  const isActive = useIsActive();

  if (!isActive) {
    return null;
  }
  return (
    <div className={clsx('flex-center', styles['header-wrapper'])}>
      <SelectMenu />
      <span className={clsx('flex-1', 'text-center', styles['header-text'])}>
        {activeMenuKey === SideMenuKey.Deposit && 'Deposit Assets'}
        {activeMenuKey === SideMenuKey.Withdraw && 'Withdraw Assets'}
        {activeMenuKey === SideMenuKey.Records && 'History'}
      </span>
      <SelectWallet />
    </div>
  );
}
