'use client';
import { ConfigProvider } from 'antd';
// import { useEffect, useRef } from 'react';
// import { initLanguage, useLanguage } from 'i18n';
import '@portkey/did-ui-react/dist/assets/index.css';
// import { prefixCls } from 'constants/index';
import StoreProvider from 'store/Provider/StoreProvider';
import WebLoginProvider from './webLoginProvider';
// import Loading from 'components/Loading';
import dynamic from 'next/dynamic';
const Loading = dynamic(() => import('components/Loading'), { ssr: false });
// import { ANTD_LOCAL } from 'i18n/config';

// let childrenNode: any = undefined;

// ConfigProvider.config({
//   prefixCls,
// });

export default function RootProviders({ children }: { children?: React.ReactNode }) {
  // const { language } = useLanguage();
  // const initRef = useRef<boolean>(false);

  // useEffect(() => {
  //   if (typeof window !== 'undefined' && typeof window !== 'undefined' && !initRef.current) {
  //     initLanguage(localStorage);
  //     initRef.current = true;
  //   }
  // }, []);

  // if (childrenNode === undefined) childrenNode = children;

  // useEffect(() => {
  //   const bodyRootWrapper = typeof document !== 'undefined' ? document.body : undefined;
  //   if (!bodyRootWrapper) return;
  //   let preLanguageWrapper: string | null = null;
  //   bodyRootWrapper.classList.forEach((item) => {
  //     if (item.includes('-language-wrapper')) {
  //       preLanguageWrapper = item;
  //     }
  //   });
  //   preLanguageWrapper && bodyRootWrapper.classList.remove(preLanguageWrapper);
  //   bodyRootWrapper.classList.add(`${language}-language-wrapper`);
  // }, [language]);

  // TODO prefixCls={prefixCls}
  return (
    <ConfigProvider autoInsertSpaceInButton={false}>
      <StoreProvider>
        <WebLoginProvider>
          <Loading />
          {children}
        </WebLoginProvider>
      </StoreProvider>
    </ConfigProvider>
  );
}
