import Layout from 'pageComponents/layout';

const DepositLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout isShowHeader={true} isShowSider={true}>
      {children}
    </Layout>
  );
};

export default DepositLayout;
