'use client';
import Layout from 'pageComponents/layout';
import { useCommonState } from 'store/Provider/hooks';

const ListingLayout = ({ children }: { children: React.ReactNode }) => {
  const { isPadPX } = useCommonState();

  return (
    <Layout isShowHeader={true} isShowSider={false} isShowFooter={!isPadPX}>
      {children}
    </Layout>
  );
};

export default ListingLayout;
