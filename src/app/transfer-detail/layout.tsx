'use client';
import Layout from 'pageComponents/layout';
import { useCommonState } from 'store/Provider/hooks';

const TransferDetailLayout = ({ children }: { children: React.ReactNode }) => {
  const { isPadPX } = useCommonState();

  return (
    <Layout isShowHeader={!isPadPX} isShowSider={!isPadPX} isShowFooter={!isPadPX}>
      {children}
    </Layout>
  );
};

export default TransferDetailLayout;
