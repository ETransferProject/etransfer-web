'use client';
import Layout from 'pageComponents/layout';
import { useCommonState } from 'store/Provider/hooks';

const InfoLayout = ({ children }: { children: React.ReactNode }) => {
  const { isPadPX } = useCommonState();

  return (
    <Layout isShowHeader={true} isShowSider={true} isShowFooter={!isPadPX}>
      {children}
    </Layout>
  );
};

export default InfoLayout;
