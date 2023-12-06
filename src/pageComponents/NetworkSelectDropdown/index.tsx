import clsx from 'clsx';
import styles from './styles.module.scss';
import { NetworkSelectForWeb, NetworkSelectProps } from 'pageComponents/NetworkSelect';
import { SideMenuKey } from 'constants/home';

interface NetworkSelectDropdownProps extends NetworkSelectProps {
  isFormItemStyle?: boolean;
  type: SideMenuKey;
  open: boolean;
  onClose: () => void;
}

export default function NetworkSelectDropdown({
  isFormItemStyle,
  type,
  open = false,
  networkList,
  selectedNetwork,
  onSelect,
  onClose,
}: NetworkSelectDropdownProps) {
  return (
    <div className={styles['network-select-dropdown']}>
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
        )}>
        <NetworkSelectForWeb
          type={type}
          networkList={networkList}
          selectedNetwork={selectedNetwork}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}
