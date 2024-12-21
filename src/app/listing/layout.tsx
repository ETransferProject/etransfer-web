'use client';
import Layout from 'pageComponents/layout';
import { useCommonState } from 'store/Provider/hooks';

const ListingLayout = ({ children }: { children: React.ReactNode }) => {
  const { isPadPX } = useCommonState();

  return (
    <Layout isShowHeader isShowSider={false} isShowFooter={!isPadPX} isFullWidth>
      {children}
    </Layout>
  );
};

export default ListingLayout;
