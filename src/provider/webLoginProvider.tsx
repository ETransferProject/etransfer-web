'use client';
import { PortkeyProvider as PortkeyProviderV2 } from '@portkey/did-ui-react';
import {
  AelfReact,
  AppName,
  NETWORK_TYPE_V2,
  SupportedELFChainId,
  WebLoginGraphqlUrlV1,
  WebLoginGraphqlUrlV2,
  WebLoginRequestDefaultsUrlV1,
  WebLoginRequestDefaultsUrlV2,
} from 'constants/index';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const WebLoginProviderDynamic = dynamic(
  async () => {
    const webLogin = await import('aelf-web-login').then((module) => module);

    webLogin.setGlobalConfig({
      appName: AppName,
      chainId: SupportedELFChainId.AELF,
      networkType: 'MAIN',
      portkey: {
        graphQLUrl: WebLoginGraphqlUrlV1,
        requestDefaults: {
          baseURL: WebLoginRequestDefaultsUrlV1,
        },
      },
      portkeyV2: {
        graphQLUrl: WebLoginGraphqlUrlV2,
        networkType: 'MAINNET',
        requestDefaults: {
          baseURL: WebLoginRequestDefaultsUrlV2,
        },
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
    <PortkeyProviderV2 networkType={NETWORK_TYPE_V2}>
      <WebLoginProviderDynamic
        nightElf={{
          connectEagerly: false,
        }}
        portkey={{
          autoShowUnlock: true,
          checkAccountInfoSync: true,
        }}
        discover={{
          autoRequestAccount: true,
          autoLogoutOnDisconnected: true,
          autoLogoutOnNetworkMismatch: true,
          autoLogoutOnAccountMismatch: true,
          autoLogoutOnChainMismatch: true,
          onPluginNotFound: (openStore) => {
            console.log('openStore:', openStore);
          },
        }}
        extraWallets={['discover']}>
        {children}
      </WebLoginProviderDynamic>
    </PortkeyProviderV2>
  );
}
