'use client';

import NotConnectedWalletContent from 'pageComponents/Home/NotConnectedWalletContent';
import styles from './styles.module.scss';
import Layout from 'pageComponents/layout';

export default function Home() {
  return (
    <Layout isShowHeader={true}>
      <div className={styles['content-wrapper']}>
        <NotConnectedWalletContent />
      </div>
    </Layout>
  );
}
