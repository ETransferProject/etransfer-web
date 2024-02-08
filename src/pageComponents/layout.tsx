'use client';
import React, { useEffect, Suspense } from 'react';
import { Layout as AntdLayout } from 'antd';
import Header from 'components/Header';
import Sider from 'components/Sider';
import Loading from 'components/Loading';
import { devices } from '@portkey/utils';
import { setIsMobile, setIsMobilePX } from 'store/reducers/common/slice';
import { store } from 'store/Provider/store';
import { useCommonState } from 'store/Provider/hooks';
import { MOBILE_PX } from 'constants/media';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { useIsActive } from 'hooks/portkeyWallet';

const Layout = ({ children }: { children: React.ReactNode }) => {
  useEffect((): any => {
    if (typeof window !== 'undefined') {
      const resize = () => {
        const mobileType = devices.isMobile();
        const isMobileDevice =
          mobileType.apple.phone ||
          mobileType.android.phone ||
          mobileType.apple.tablet ||
          mobileType.android.tablet;
        store.dispatch(setIsMobile(isMobileDevice));
        const isMobilePX = window.innerWidth <= MOBILE_PX;
        store.dispatch(setIsMobilePX(isMobilePX));
      };
      resize();
      window.addEventListener('resize', resize);
      return () => {
        window.removeEventListener('resize', resize);
      };
    }
  }, []);
  const { isMobilePX } = useCommonState();
  const isActive = useIsActive();
  return (
    <AntdLayout
      className={clsx(
        'etransfer-web-wrapper',
        styles['layout-wrapper'],
        styles['layout-wrapper-weight'],
      )}>
      <Header />
      <AntdLayout
        className={clsx(styles['layout-content-wrapper'], {
          [styles['layout-content-wrapper-with-header']]: isActive || !isMobilePX,
        })}>
        {!isMobilePX && isActive && <Sider />}
        <AntdLayout.Content className={`etransfer-web-content`}>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </AntdLayout.Content>
      </AntdLayout>
    </AntdLayout>
  );
};

export default Layout;
