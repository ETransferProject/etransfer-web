import { DrawerProps } from 'antd';
import CommonDrawer from 'components/CommonDrawer';
import { TokenSelectForMobile, TokenSelectProps } from 'components/SelectToken/TokenSelect';

export default function NetworkSelectDrawer({
  listClassName,
  itemClassName,
  title,
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
      title={title}
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
        chainId={chainId}
        isDisabled={isDisabled}
        isShowLoading={isShowLoading}
        isShowBalance={isShowBalance}
        open={props.open}
      />
    </CommonDrawer>
  );
}
