import { DrawerProps } from 'antd';
import CommonDrawer from 'components/CommonDrawer';
import { TokenSelectForMobile, TokenSelectProps } from 'components/SelectToken/TokenSelect';
import { SideMenuKey } from 'constants/home';

export default function NetworkSelectDrawer({
  listClassName,
  itemClassName,
  type,
  chainId,
  tokenList,
  selectedToken,
  isDisabled,
  isShowLoading,
  isShowBalance,
  onSelect,
  ...props
}: TokenSelectProps & DrawerProps & { listClassName?: string }) {
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
        className={listClassName}
        itemClassName={itemClassName}
        tokenList={tokenList}
        selectedToken={selectedToken}
        onSelect={onSelect}
        type={type}
        chainId={chainId}
        isDisabled={isDisabled}
        isShowLoading={isShowLoading}
        isShowBalance={isShowBalance}
        open={props.open}
      />
    </CommonDrawer>
  );
}
