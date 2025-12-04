'use client';
import { ConfigProvider } from 'antd';
import StoreProvider from 'store/Provider/StoreProvider';
import 'utils/firebase';
import dynamic from 'next/dynamic';
import CircleLoading from 'components/CircleLoading';
// import EVMProvider from './wallet/EVM';
// import SolanaProvider from './wallet/Solana';
// import TONProvider from './wallet/TON';
// import TRONProvider from './wallet/TRON';
// import WalletProvider from 'context/Wallet';

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

const EVMProviderDynamic = dynamic(
  async () => {
    const WalletProvider = await import('./wallet/EVM').then((module) => module);
    return WalletProvider;
  },
  {
    ssr: false,
  },
);

const SolanaProviderDynamic = dynamic(
  async () => {
    const WalletProvider = await import('./wallet/Solana').then((module) => module);
    return WalletProvider;
  },
  {
    ssr: false,
  },
);

const TONProviderDynamic = dynamic(
  async () => {
    const WalletProvider = await import('./wallet/TON').then((module) => module);
    return WalletProvider;
  },
  {
    ssr: false,
  },
);

const TRONProviderDynamic = dynamic(
  async () => {
    const WalletProvider = await import('./wallet/TRON').then((module) => module);
    return WalletProvider;
  },
  {
    ssr: false,
  },
);

const WalletProviderDynamic = dynamic(
  async () => {
    const WalletProvider = await import('context/Wallet').then((module) => module);
    return WalletProvider;
  },
  {
    ssr: false,
  },
);

export default function RootProviders({ children }: { children?: React.ReactNode }) {
  return (
    <ConfigProvider autoInsertSpaceInButton={false}>
      <StoreProvider>
        <WebLoginProviderDynamic>
          <EVMProviderDynamic>
            <SolanaProviderDynamic>
              <TONProviderDynamic>
                <TRONProviderDynamic>
                  <WalletProviderDynamic>
                    <Loading />
                    {children}
                  </WalletProviderDynamic>
                </TRONProviderDynamic>
              </TONProviderDynamic>
            </SolanaProviderDynamic>
          </EVMProviderDynamic>
        </WebLoginProviderDynamic>
      </StoreProvider>
    </ConfigProvider>
  );
}
