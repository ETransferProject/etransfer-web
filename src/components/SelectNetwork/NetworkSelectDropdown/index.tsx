import clsx from 'clsx';
import styles from './styles.module.scss';
import { NetworkSelectForWeb, TNetworkSelectProps } from 'components/SelectNetwork/NetworkSelect';
import { SideMenuKey } from 'constants/home';

interface NetworkSelectDropdownProps extends TNetworkSelectProps {
  isFormItemStyle?: boolean;
  type: SideMenuKey;
  open: boolean;
  onClose: () => void;
}

export default function NetworkSelectDropdown({
  className,
  isFormItemStyle,
  type,
  open = false,
  networkList,
  selectedNetwork,
  isDisabled,
  isShowLoading,
  onSelect,
  onClose,
}: NetworkSelectDropdownProps) {
  return (
    <div className={clsx(styles['network-select-dropdown'])}>
      <div
        className={clsx(
          styles['network-select-dropdown-mask'],
          open ? styles['network-select-dropdown-show'] : styles['network-select-dropdown-hidden'],
        )}
        onClick={onClose}></div>
      <div
        className={clsx(
          styles['network-select-dropdown'],
          { [styles['network-select-dropdown-form-item']]: isFormItemStyle },
          open ? styles['network-select-dropdown-show'] : styles['network-select-dropdown-hidden'],
          className,
        )}>
        <NetworkSelectForWeb
          type={type}
          networkList={networkList}
          selectedNetwork={selectedNetwork}
          onSelect={onSelect}
          isDisabled={isDisabled}
          isShowLoading={isShowLoading}
        />
      </div>
    </div>
  );
}
