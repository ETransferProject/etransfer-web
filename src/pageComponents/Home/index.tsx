'use client';

import styles from './styles.module.scss';
import Layout from 'pageComponents/layout';
import { useRouterPush } from 'hooks/route';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { SideMenuKey } from 'constants/home';
import { useCommonState } from 'store/Provider/hooks';
import { useEffectOnce } from 'react-use';

export default function Home() {
  const routerPush = useRouterPush();
  const searchParams = useSearchParams();
  const routeType = useMemo(() => searchParams.get('type') as SideMenuKey, [searchParams]);
  const { activeMenuKey } = useCommonState();
  useEffectOnce(() => {
    routerPush('/' + (routeType || activeMenuKey).toLocaleLowerCase());
  });

  return (
    <Layout isShowHeader={true}>
      <div className={styles['content-wrapper']} />
    </Layout>
  );
}
