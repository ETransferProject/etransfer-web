import Layout from 'pageComponents/layout';

const WithdrawLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout isShowHeader={true} isShowSider={true} isShowFooter={true}>
      {children}
    </Layout>
  );
};

export default WithdrawLayout;
