import React from 'react';
import clsx from 'clsx';
import SelectWallet from 'pageComponents/SelectWallet';
import { Logo } from 'assets/images';
import styles from './styles.module.scss';

export default function WebHeader() {
  return (
    <div className={clsx('flex-row-between', styles['header-container'])}>
      <Logo />
      <SelectWallet />
    </div>
  );
}
