'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';

export default function TONProvider({ children }: { children: React.ReactNode }) {
  // ${window.location.origin}
  return (
    <TonConnectUIProvider manifestUrl="https://localhost:3000/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}
