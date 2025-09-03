'use client';
import '../utils/telegram-web-app';
import { WebLoginProvider } from '@aelf-web-login/wallet-adapter-react';
import { config, didConfig } from './webLoginV2Config';
import { did } from '@portkey/did';

export default function WebLoginV2Providers({ children }: { children: React.ReactNode }) {
  did.setConfig(didConfig);

  return <WebLoginProvider config={config}>{children}</WebLoginProvider>;
}

// import { ConfigProvider } from '@portkey/did-ui-react';
// ConfigProvider.setGlobalConfig(didConfig);
