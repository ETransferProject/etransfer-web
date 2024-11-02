'use client';

// import Layout from 'pageComponents/layout';
import EVMProvider from 'provider/wallet/EVM';
import SolanaProvider from 'provider/wallet/Solana';
import TONProvider from 'provider/wallet/TON';
import TRONProvider from 'provider/wallet/TRON';

const TestLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // <Layout isShowHeader={true} isShowSider={true} isShowFooter={true}>
    <EVMProvider>
      <SolanaProvider>
        <TONProvider>
          <TRONProvider>{children}</TRONProvider>
        </TONProvider>
      </SolanaProvider>
    </EVMProvider>
    // </Layout>
  );
};

export default TestLayout;
