'use client';
import { PortkeyProvider } from 'aelf-web-login';
import {
  AelfReact,
  AppName,
  SupportedELFChainId,
  WebLoginGraphqlUrlV1,
  WebLoginGraphqlUrlV2,
  WebLoginRequestDefaultsUrlV2,
  connectUrl,
} from 'constants/index';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { logoIcon } from 'constants/wallet';
// import { PortkeyVersion } from 'constants/wallet';

const WebLoginProviderDynamic = dynamic(
  async () => {
    const webLogin = await import('aelf-web-login').then((module) => module);

    webLogin.setGlobalConfig({
      appName: AppName,
      chainId: SupportedELFChainId.AELF,
      networkType: 'TESTNET',
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
        networkType: 'TESTNET',
        connectUrl: connectUrl,
        requestDefaults: {
          baseURL: 'portkeyV2',
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
    <PortkeyProvider networkType="TESTNET" networkTypeV2="TESTNET" theme="dark">
      <WebLoginProviderDynamic
        nightElf={{
          useMultiChain: true,
          connectEagerly: true,
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
        extraWallets={['discover', 'elf']}
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
    </PortkeyProvider>
  );
}
