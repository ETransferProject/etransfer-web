import { DrawerProps } from 'antd';
import CommonDrawer from 'components/CommonDrawer';
import { NetworkSelectForMobile, NetworkSelectProps } from 'pageComponents/NetworkSelect';

export default function NetworkSelectDrawer({
  type,
  networkList,
  selectedNetwork,
  isDisabled,
  onSelect,
  ...props
}: NetworkSelectProps & DrawerProps) {
  return (
    <CommonDrawer
      destroyOnClose
      placement="bottom"
      title="Select Network"
      closable={true}
      height="88%"
      {...props}>
      <NetworkSelectForMobile
        networkList={networkList}
        selectedNetwork={selectedNetwork}
        onSelect={onSelect}
        type={type}
        isDisabled={isDisabled}
      />
    </CommonDrawer>
  );
}
