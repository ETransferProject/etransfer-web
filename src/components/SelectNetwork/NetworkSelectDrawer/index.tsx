import { DrawerProps } from 'antd';
import CommonDrawer from 'components/CommonDrawer';
import {
  NetworkSelectForMobile,
  TNetworkSelectProps,
} from 'components/SelectNetwork/NetworkSelect';
import { SELECT_CHAIN } from 'constants/misc';

export default function NetworkSelectDrawer({
  type,
  networkList,
  selectedNetwork,
  isDisabled,
  isShowLoading,
  onSelect,
  ...props
}: TNetworkSelectProps & DrawerProps) {
  return (
    <CommonDrawer
      destroyOnClose
      placement="bottom"
      title={SELECT_CHAIN}
      closable={true}
      height="88%"
      {...props}>
      <NetworkSelectForMobile
        networkList={networkList}
        selectedNetwork={selectedNetwork}
        onSelect={onSelect}
        type={type}
        isDisabled={isDisabled}
        isShowLoading={isShowLoading}
      />
    </CommonDrawer>
  );
}
