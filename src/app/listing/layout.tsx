'use client';
import Layout from 'pageComponents/layout';

const ListingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout isShowHeader isShowSider={false} isShowFooter={true} isFullWidth>
      {children}
    </Layout>
  );
};

export default ListingLayout;
