'use client';
import React, { useEffect, Suspense } from 'react';
import { Layout as AntdLayout } from 'antd';
import Header from 'components/Header';
import Sider from 'components/Sider';
import Loading from 'components/Loading';
import { devices } from '@portkey/utils';
import { setIsMobile, setIsMobilePX, setIsPadPX } from 'store/reducers/common/slice';
import { store } from 'store/Provider/store';
import { useCommonState } from 'store/Provider/hooks';
import { MOBILE_PX, PAD_PX } from 'constants/media';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { useIsActive } from 'hooks/portkeyWallet';
import { useRouteParamType } from 'hooks/route';
import { useUpdateRecord } from 'hooks/updateRecord';
import Footer from 'components/Footer';

const Layout = ({
  children,
  isShowHeader = false,
  isShowSider = false,
  isShowFooter = false,
}: {
  children: React.ReactNode;
  isShowHeader?: boolean;
  isShowSider?: boolean;
  isShowFooter?: boolean;
}) => {
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

        const isPadPX = window.innerWidth <= PAD_PX;
        store.dispatch(setIsPadPX(isPadPX));
      };
      resize();
      window.addEventListener('resize', resize);
      return () => {
        window.removeEventListener('resize', resize);
      };
    }
  }, []);
  const { isPadPX, isMobilePX } = useCommonState();
  const isActive = useIsActive();

  useRouteParamType();
  useUpdateRecord();

  return (
    <AntdLayout
      className={clsx(
        'etransfer-web-wrapper',
        styles['layout-wrapper'],
        styles['layout-wrapper-weight'],
      )}>
      {isShowHeader && <Header />}
      <div
        className={clsx('flex-row', styles['layout-content-wrapper'], {
          [styles['layout-content-wrapper-with-header']]: isActive || !isPadPX,
        })}>
        {isShowSider && !isPadPX && <Sider />}
        <div className={'etransfer-web-content'}>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </div>
      </div>
      {isShowFooter && !isMobilePX && <Footer />}
      {/* {isShowFooter && !isMobilePX && (
        <AntdLayout.Footer className={styles['layout-footer']}>
          <Footer />
        </AntdLayout.Footer>
      )} */}
    </AntdLayout>
  );
};

export default Layout;
