import { DrawerProps } from 'antd';
import CommonDrawer from 'components/CommonDrawer';
import { TokenSelectForMobile, TokenSelectProps } from 'components/SelectToken/TokenSelect';
import { SideMenuKey } from 'constants/home';

export default function NetworkSelectDrawer({
  type,
  tokenList,
  selectedToken,
  isDisabled,
  isShowLoading,
  onSelect,
  ...props
}: TokenSelectProps & DrawerProps) {
  return (
    <CommonDrawer
      destroyOnClose
      placement="bottom"
      title={type === SideMenuKey.Withdraw ? 'Withdraw Assets' : 'Deposit Assets'}
      closable={true}
      height="88%"
      {...props}
      bodyStyle={{
        padding: 0,
      }}>
      <TokenSelectForMobile
        tokenList={tokenList}
        selectedToken={selectedToken}
        onSelect={onSelect}
        type={type}
        isDisabled={isDisabled}
        isShowLoading={isShowLoading}
        open={props.open}
      />
    </CommonDrawer>
  );
}
