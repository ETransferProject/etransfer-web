import React from 'react';
import MobileHeader from './MobileHeader';
import WebHeader from './WebHeader';
import { useCommonState } from 'store/Provider/hooks';
import styles from './styles.module.scss';

export default function Header() {
  const { isPadPX } = useCommonState();
  return (
    <div className={styles['header-wrapper']}>{isPadPX ? <MobileHeader /> : <WebHeader />}</div>
  );
}
