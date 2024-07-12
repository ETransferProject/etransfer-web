'use client';
import {
  AelfReact,
  AppName,
  NETWORK_TYPE_V1,
  WebLoginConnectUrlV2,
  WebLoginGraphqlUrlV1,
  WebLoginGraphqlUrlV2,
  WebLoginRequestDefaultsUrlV2,
  NETWORK_TYPE_V2,
  WebLoginServiceUrlV1,
  WebLoginServiceUrlV2,
  SupportedChainId,
} from 'constants/index';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { EtransferLogoIconBase64 } from 'constants/wallet';
import CircleLoading from 'components/CircleLoading';

const WalletProviderDynamic = dynamic(
  async () => {
    const WalletProvider = await import('./walletProvider').then((module) => module);
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

const WebLoginPortkeyProvider = dynamic(
  async () => {
    const { PortkeyProvider } = await import('aelf-web-login').then((module) => module);
    return PortkeyProvider;
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

const WebLoginProviderDynamic = dynamic(
  async () => {
    const webLogin = await import('aelf-web-login').then((module) => module);

    webLogin.setGlobalConfig({
      appName: AppName,
      chainId: SupportedChainId.sideChain,
      networkType: NETWORK_TYPE_V1,
      portkey: {
        useLocalStorage: true,
        graphQLUrl: WebLoginGraphqlUrlV1,
        requestDefaults: {
          baseURL: WebLoginServiceUrlV1,
        },
      },
      onlyShowV2: true,
      portkeyV2: {
        useLocalStorage: true,
        graphQLUrl: WebLoginGraphqlUrlV2,
        networkType: NETWORK_TYPE_V2,
        connectUrl: WebLoginConnectUrlV2,
        requestDefaults: {
          baseURL: WebLoginServiceUrlV2,
          timeout: 20000, // NETWORK_NAME === NetworkName.testnet ? 300000 : 80000
        },
        serviceUrl: WebLoginRequestDefaultsUrlV2,
      },
      aelfReact: {
        appName: AppName,
        nodes: AelfReact,
      },
      defaultRpcUrl: AelfReact[SupportedChainId.sideChain].rpcUrl,
    });
    return webLogin.WebLoginProvider;
  },
  { ssr: false },
);

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WebLoginPortkeyProvider networkType={NETWORK_TYPE_V1} networkTypeV2={NETWORK_TYPE_V2}>
      <WebLoginProviderDynamic
        nightElf={{
          useMultiChain: true,
          connectEagerly: true,
        }}
        portkey={{
          design: 'SocialDesign',
          autoShowUnlock: false,
          checkAccountInfoSync: true,
        }}
        commonConfig={{
          showClose: true,
          iconSrc: EtransferLogoIconBase64,
          title: 'Log In to ETransfer',
        }}
        extraWallets={['discover', 'elf']}
        discover={{
          autoRequestAccount: true,
          autoLogoutOnDisconnected: true,
          autoLogoutOnNetworkMismatch: true,
          autoLogoutOnAccountMismatch: true,
          autoLogoutOnChainMismatch: true,
        }}>
        <WalletProviderDynamic>{children}</WalletProviderDynamic>
      </WebLoginProviderDynamic>
    </WebLoginPortkeyProvider>
  );
}
