'use client';
import Layout from 'pageComponents/layout';

const InfoLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout isShowHeader={true} isShowSider={true} isShowFooter={true}>
      {children}
    </Layout>
  );
};

export default InfoLayout;
