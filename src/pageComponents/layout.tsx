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
import { useRouteParamType } from 'hooks/route';
import { useUpdateRecord } from 'hooks/updateRecord';
import Footer from 'components/Footer';
import { usePathname } from 'next/navigation';
import { useInitWallet } from 'hooks/wallet/useAelf';
import { TelegramPlatform } from 'utils/telegram';
import service from 'api/axios';
import { API_VERSION } from 'constants/misc';
import { useNoticeSocket } from 'hooks/notice';
// import VConsole from 'vconsole';
// import { SHOW_V_CONSOLE } from 'constants/index';

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
  const pathname = usePathname();
  useEffect((): any => {
    // if (SHOW_V_CONSOLE) new VConsole();
    // init service
    service.defaults.headers.common['version'] = API_VERSION;

    // resize listener
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
  const isTelegramPlatform = TelegramPlatform.isTelegramPlatform();

  useInitWallet();
  useRouteParamType();
  useUpdateRecord();
  useNoticeSocket();

  return (
    <AntdLayout
      id="etransferWebWrapper"
      className={clsx(
        'etransfer-web-wrapper',
        styles['layout-wrapper'],
        styles['layout-wrapper-weight'],
      )}>
      {isShowHeader && (!isPadPX || (isPadPX && pathname !== '/')) && <Header />}
      <div
        className={clsx(
          'flex-row',
          styles['layout-content-wrapper'],
          styles['layout-content-wrapper-with-header'],
        )}>
        {isShowSider && !isPadPX && <Sider />}
        <div
          className={
            pathname !== '/'
              ? clsx('etransfer-web-content', !isTelegramPlatform && 'etransfer-web-content-not-tg')
              : 'etransfer-web-notLogin'
          }>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </div>
      </div>
      {isShowFooter && !isMobilePX && <Footer />}
    </AntdLayout>
  );
};

export default Layout;
