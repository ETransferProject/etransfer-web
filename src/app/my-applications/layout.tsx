'use client';
import Layout from 'pageComponents/layout';
import { useCommonState } from 'store/Provider/hooks';

const MyApplicationsLayout = ({ children }: { children: React.ReactNode }) => {
  const { isPadPX } = useCommonState();

  return (
    <Layout isShowHeader={true} isShowSider={false} isShowFooter={!isPadPX} isFullWidth={true}>
      {children}
    </Layout>
  );
};

export default MyApplicationsLayout;
