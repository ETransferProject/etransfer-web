'use client';
import { PortkeyProvider } from '@portkey/did-ui-react';
import {
  AelfReact,
  AppName,
  NETWORK_TYPE,
  SupportedELFChainId,
  WebLoginGraphqlUrl,
  WebLoginRequestDefaultsUrl,
} from 'constants/index';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const WebLoginProviderDynamic = dynamic(
  async () => {
    const webLogin = await import('aelf-web-login').then((module) => module);

    webLogin.setGlobalConfig({
      appName: AppName,
      chainId: SupportedELFChainId.AELF, // TODO
      networkType: 'MAIN',
      portkey: {
        graphQLUrl: WebLoginGraphqlUrl,
        requestDefaults: {
          baseURL: WebLoginRequestDefaultsUrl,
        },
      },
      aelfReact: {
        appName: AppName,
        nodes: AelfReact,
      },
      defaultRpcUrl: AelfReact.AELF.rpcUrl, // TODO
    });
    return webLogin.WebLoginProvider;
  },
  { ssr: false },
);

export default function Providers({ children }: { children: ReactNode }) {
  return (
    // TODO
    <PortkeyProvider networkType={NETWORK_TYPE}>
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
    </PortkeyProvider>
  );
}
