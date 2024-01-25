'use client';
import { PortkeyProvider as PortkeyProviderV1 } from '@portkey-v1/did-ui-react';
import { PortkeyProvider as PortkeyProviderV2 } from '@portkey/did-ui-react';
import {
  AelfReact,
  AppName,
  NETWORK_TYPE_V1,
  NETWORK_TYPE_V2,
  PortkeyVersion,
  SupportedELFChainId,
  WebLoginGraphqlUrl,
  WebLoginRequestDefaultsUrl,
} from 'constants/index';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { usePortkeyWalletState } from 'store/Provider/hooks';
const InitProviderV1 = dynamic(() => import('./initProviderV1'), { ssr: false });
const InitProviderV2 = dynamic(() => import('./initProviderV2'), { ssr: false });

const WebLoginProviderDynamic = dynamic(
  async () => {
    const webLogin = await import('aelf-web-login').then((module) => module);

    webLogin.setGlobalConfig({
      appName: AppName,
      chainId: SupportedELFChainId.AELF,
      networkType: 'MAIN',
      portkey: {
        graphQLUrl: `${WebLoginGraphqlUrl}/v1`,
        requestDefaults: {
          baseURL: `${WebLoginRequestDefaultsUrl}/v1`,
        },
      },
      portkeyV2: {
        graphQLUrl: `${WebLoginGraphqlUrl}/v2`,
        networkType: 'MAINNET',
        requestDefaults: {
          baseURL: `${WebLoginRequestDefaultsUrl}/v2`,
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
  const { currentVersion } = usePortkeyWalletState();

  if (currentVersion === PortkeyVersion.v1) {
    return (
      <PortkeyProviderV1 networkType={NETWORK_TYPE_V1}>
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
          <InitProviderV1 />
          {children}
        </WebLoginProviderDynamic>
      </PortkeyProviderV1>
    );
  }
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
        <InitProviderV2 />
        {children}
      </WebLoginProviderDynamic>
    </PortkeyProviderV2>
  );
}
