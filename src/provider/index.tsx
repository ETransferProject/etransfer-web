'use client';
import { ConfigProvider } from 'antd';
import '@portkey/did-ui-react/dist/assets/index.css';
import StoreProvider from 'store/Provider/StoreProvider';
import WebLoginProvider from './webLoginProvider';
import 'utils/firebase';
import dynamic from 'next/dynamic';
const Loading = dynamic(() => import('components/Loading'), { ssr: false });

export default function RootProviders({ children }: { children?: React.ReactNode }) {
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
