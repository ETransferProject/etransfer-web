'use client';
import { ConfigProvider } from 'antd';
import StoreProvider from 'store/Provider/StoreProvider';
import 'utils/firebase';
import dynamic from 'next/dynamic';
import CircleLoading from 'components/CircleLoading';
const Loading = dynamic(() => import('components/Loading'), { ssr: false });
const WebLoginProviderDynamic = dynamic(
  async () => {
    const WalletProvider = await import('./webLoginV2Provider').then((module) => module);
    return WalletProvider;
  },
  {
    ssr: false,
    loading: () => (
      <div className="row-center pre-loading">
        <CircleLoading />
      </div>
    ),
  },
);

export default function RootProviders({ children }: { children?: React.ReactNode }) {
  return (
    <ConfigProvider autoInsertSpaceInButton={false}>
      <StoreProvider>
        <WebLoginProviderDynamic>
          <Loading />
          {children}
        </WebLoginProviderDynamic>
      </StoreProvider>
    </ConfigProvider>
  );
}
