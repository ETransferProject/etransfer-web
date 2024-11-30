'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';

export default function TONProvider({ children }: { children: React.ReactNode }) {
  const domain = typeof window != undefined ? window.location.origin : '';

  return (
    <TonConnectUIProvider manifestUrl={`${domain}/tonconnect-manifest.json`}>
      {children}
    </TonConnectUIProvider>
  );
}
