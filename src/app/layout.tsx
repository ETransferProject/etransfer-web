import 'antd/dist/antd.min.css';
import 'styles/global.scss';
import '@etransfer/ui-react/dist/assets/index.css';

import Provider from 'provider';
import { BRAND_NAME } from 'constants/index';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: BRAND_NAME,
};

export const viewport: Viewport = {
  width: 'device-width',
  height: 'device-height',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body id="etransfer-root">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
};

export default RootLayout;
