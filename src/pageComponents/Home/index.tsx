'use client';

import NotConnectedWalletContent from 'pageComponents/Home/NotConnectedWalletContent';
import styles from './styles.module.scss';
import { useIsActive } from 'hooks/portkeyWallet';
import Layout from 'pageComponents/layout';

export default function Home() {
  const isActive = useIsActive();
  return (
    <Layout isShowHeader={true}>
      <div className={styles['content-wrapper']}>{!isActive && <NotConnectedWalletContent />}</div>
    </Layout>
  );
}
