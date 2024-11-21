import React from 'react';
import clsx from 'clsx';
import { useCommonState } from 'store/Provider/hooks';
import SelectMenu from 'components/Header/SelectMenu';
import LoginAndProfileEntry from 'components/Header/LoginAndProfile';
import styles from './styles.module.scss';
import { SideMenuKey } from 'constants/home';

export default function MobileHeader() {
  const { activeMenuKey } = useCommonState();

  return (
    <div className={clsx('flex-row-center-between', styles['header-wrapper'])}>
      <SelectMenu />
      <span className={clsx('text-center', styles['header-text'])}>
        {activeMenuKey === SideMenuKey.Withdraw && 'Withdraw Assets'}
        {activeMenuKey === SideMenuKey.History && 'History'}
        {activeMenuKey === SideMenuKey.Info && 'Info'}
      </span>
      <LoginAndProfileEntry />
    </div>
  );
}
