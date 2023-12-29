'use client';
import Content from 'pageComponents/Content';
import NotConnectedWalletContent from 'pageComponents/NotConnectedWalletContent';
import { usePortkeyWalletState } from 'store/Provider/hooks'; //useLoading
import styles from './styles.module.scss';
import 'utils/firebase';

export default function Home() {
  const { isActive } = usePortkeyWalletState();

  return (
    <div className={styles['content-wrapper']}>
      {isActive ? <Content /> : <NotConnectedWalletContent />}
    </div>
  );
}
