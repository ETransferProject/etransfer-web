'use client';

import NotConnectedWalletContent from 'pageComponents/Home/NotConnectedWalletContent';
import styles from './styles.module.scss';
import { useIsActive } from 'hooks/portkeyWallet';

export default function Home() {
  const isActive = useIsActive();
  return (
    <div className={styles['content-wrapper']}>{!isActive && <NotConnectedWalletContent />}</div>
  );
}
