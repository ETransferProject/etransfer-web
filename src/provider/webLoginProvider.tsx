'use client';
import {
  AelfReact,
  AppName,
  NETWORK_TYPE_V1,
  SupportedELFChainId,
  WebLoginGraphqlUrlV1,
  WebLoginGraphqlUrlV2,
  WebLoginRequestDefaultsUrlV2,
  connectUrl,
  NETWORK_NAME,
  NETWORK_TYPE_V2,
} from 'constants/index';
import { NetworkName } from 'constants/network';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { logoIcon } from 'constants/wallet';
// import { PortkeyVersion } from 'constants/wallet';
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
      chainId: SupportedELFChainId.AELF, // cms ??
      networkType: NETWORK_TYPE_V1,
      portkey: {
        graphQLUrl: WebLoginGraphqlUrlV1,
        requestDefaults: {
          baseURL: 'portkeyV1',
        },
      },
      onlyShowV2: true,
      portkeyV2: {
        useLocalStorage: true,
        graphQLUrl: WebLoginGraphqlUrlV2,
        networkType: NETWORK_TYPE_V2,
        connectUrl: connectUrl,
        requestDefaults: {
          baseURL: 'portkeyV2',
          timeout: NETWORK_NAME === NetworkName.testnet ? 300000 : 80000,
        },
        serviceUrl: WebLoginRequestDefaultsUrlV2,
      },
      aelfReact: {
        appName: AppName,
        nodes: AelfReact,
      },
      defaultRpcUrl: AelfReact.AELF.rpcUrl,
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
          autoShowUnlock: true,
          checkAccountInfoSync: true,
        }}
        commonConfig={{
          showClose: true,
          iconSrc: logoIcon,
        }}
        extraWallets={['discover']}
        discover={{
          autoRequestAccount: true,
          autoLogoutOnDisconnected: true,
          autoLogoutOnNetworkMismatch: true,
          autoLogoutOnAccountMismatch: true,
          autoLogoutOnChainMismatch: true,
          onPluginNotFound: (openStore) => {
            console.log('openStore:', openStore);
          },
        }}>
        {children}
      </WebLoginProviderDynamic>
    </WebLoginPortkeyProvider>
  );
}
