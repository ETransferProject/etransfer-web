'use client';
import '../utils/telegram-web-app';
import { WebLoginProvider, init } from '@aelf-web-login/wallet-adapter-react';
import { config } from './webLoginV2Config';

export default function WebLoginV2Providers({ children }: { children: React.ReactNode }) {
  const bridgeAPI = init(config); // upper config

  return <WebLoginProvider bridgeAPI={bridgeAPI}>{children}</WebLoginProvider>;
}
