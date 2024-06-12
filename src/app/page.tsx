'use client';

import HomeContent from 'pageComponents/Home';
import Layout from 'pageComponents/layout';

export default function Home() {
  return (
    <Layout isShowHeader={true}>
      <HomeContent />
    </Layout>
  );
}
