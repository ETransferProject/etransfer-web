import '@portkey/did-ui-react/dist/assets/index.css';
import 'aelf-web-login/dist/assets/index.css';
import 'styles/global.scss';

import Provider from 'provider';
import { BrandName } from 'constants/index';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: BrandName,
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
};

export default RootLayout;
