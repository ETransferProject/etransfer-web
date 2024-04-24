'use client';
import {
  AelfReact,
  AppName,
  NETWORK_TYPE_V1,
  WebLoginConnectUrlV2,
  WebLoginGraphqlUrlV1,
  WebLoginGraphqlUrlV2,
  WebLoginRequestDefaultsUrlV2,
  NETWORK_NAME,
  NETWORK_TYPE_V2,
  WebLoginServiceUrlV1,
  WebLoginServiceUrlV2,
  SupportedChainId,
} from 'constants/index';
import { NetworkName } from 'constants/network';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

import { LogoIconBase64 } from 'constants/wallet';

const WalletProviderDynamic = dynamic(
  async () => {
    const WalletProvider = await import('./walletProvider').then((module) => module);
    return WalletProvider;
  },
  { ssr: false },
);

const WebLoginPortkeyProvider = dynamic(
  async () => {
    const { PortkeyProvider } = await import('aelf-web-login').then((module) => module);
    return PortkeyProvider;
  },
  { ssr: false },
);

const WebLoginProviderDynamic = dynamic(
  async () => {
    const webLogin = await import('aelf-web-login').then((module) => module);

    webLogin.setGlobalConfig({
      appName: AppName,
      chainId: SupportedChainId.sideChain,
      networkType: NETWORK_TYPE_V1,
      portkey: {
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
          timeout: NETWORK_NAME === NetworkName.testnet ? 300000 : 80000,
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
    <WebLoginPortkeyProvider
      networkType={NETWORK_TYPE_V1}
      networkTypeV2={NETWORK_TYPE_V2}
      theme="dark">
      <WebLoginProviderDynamic
        nightElf={{
          useMultiChain: false,
          connectEagerly: false,
        }}
        portkey={{
          design: 'SocialDesign',
          autoShowUnlock: false,
          checkAccountInfoSync: true,
        }}
        commonConfig={{
          showClose: true,
          iconSrc: LogoIconBase64,
          title: 'Log In to ETransfer',
        }}
        extraWallets={['discover']}
        discover={{
          autoRequestAccount: true,
          autoLogoutOnDisconnected: true,
          autoLogoutOnNetworkMismatch: true,
          autoLogoutOnAccountMismatch: true,
          autoLogoutOnChainMismatch: true,
          // onPluginNotFound: (openStore) => {
          //   console.log('openStore:', openStore);
          // },
        }}>
        <WalletProviderDynamic>{children}</WalletProviderDynamic>
      </WebLoginProviderDynamic>
    </WebLoginPortkeyProvider>
  );
}
