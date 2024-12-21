'use client';
import Layout from 'pageComponents/layout';

const MyApplicationsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout isShowHeader={true} isShowSider={false} isShowFooter={true} isFullWidth={true}>
      {children}
    </Layout>
  );
};

export default MyApplicationsLayout;
