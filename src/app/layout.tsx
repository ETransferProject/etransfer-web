import 'styles/global.scss';
import '@etransfer/ui-react/dist/assets/index.css';

import Provider from 'provider';
import { BRAND_NAME } from 'constants/index';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: BRAND_NAME,
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
