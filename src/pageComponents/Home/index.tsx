'use client';
import Content from 'pageComponents/Content';
import NotConnectedWalletContent from 'pageComponents/NotConnectedWalletContent';
import styles from './styles.module.scss';
import { useIsActive } from 'hooks/portkeyWallet';

export default function Home() {
  const isActive = useIsActive();

  return (
    <div className={styles['content-wrapper']}>
      {isActive ? <Content /> : <NotConnectedWalletContent />}
    </div>
  );
}
